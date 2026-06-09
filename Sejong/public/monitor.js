// Main Configuration

function getFetchUrl(endpoint, isPost = false) {
    const url = `/api/sejong/${endpoint}`;
    return isPost ? url : url + (url.includes('?') ? '&' : '?') + `t=${Date.now()}`;
}

const API_BASE = '/api/sejong';
let currentInput = "";
let stream = null;
let currentMode = 'home';

const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const shutter = document.getElementById('shutterEffect');
const statusMsg = document.getElementById('statusMsg');
const inputDisplay = document.getElementById('inputDisplay');

// DOM Sections
const homeScreen = document.getElementById('homeScreen');
const workspace = document.getElementById('workspace');

// Keypad UI elements
const inputWrapper = document.getElementById('inputWrapper');
const keypadGrid = document.getElementById('keypadGrid');
const faceOnlyPanel = document.getElementById('faceOnlyPanel');

// Titles
const mainTitle = document.getElementById('mainTitle');
const mainSub = document.getElementById('mainSub');
const mainSubmitBtn = document.getElementById('mainSubmitBtn');
const faceSubmitBtn = document.getElementById('faceSubmitBtn');
const mirrorSection = document.getElementById('mirrorSection');

// ---------------------------------------------------------
// Navigation Logic
// ---------------------------------------------------------

function switchMode(mode) {
    currentMode = mode;
    clearNum();
    if (statusMsg) statusMsg.textContent = "";

    if (mode === 'home') {
        if (homeScreen) homeScreen.style.display = 'flex';
        if (workspace) workspace.style.display = 'none';
        stopCamera();
    } else {
        if (homeScreen) homeScreen.style.display = 'none';
        if (workspace) {
            workspace.style.display = 'flex';
            workspace.className = 'mode-' + mode;
        }

        if (mode === 'number') {
            setupUI("번호 출석", "휴대폰 뒷번호 8자리를 입력하세요", true, false, false);
            if (mirrorSection) mirrorSection.style.opacity = '0.2';
            stopCamera();
        }
        else if (mode === 'face_only') {
            setupUI("얼굴 출석", "카메라를 바라보고 아래 버튼을 누르세요", false, true, true);
            if (mirrorSection) mirrorSection.style.opacity = '1';
            startCamera();
            loadFaceModels(); // Preload ML
        }
        else if (mode === 'register') {
            setupUI("신규 얼굴 등록", "번호 입력 후 얼굴을 촬영하세요", true, false, true);
            if (mirrorSection) mirrorSection.style.opacity = '1';
            if (faceSubmitBtn) faceSubmitBtn.style.display = 'block';
            if (mainSubmitBtn) mainSubmitBtn.style.display = 'none';
            startCamera();
            loadFaceModels(); // Preload ML
        }
    }
}

let modelsLoaded = false;
let modelsLoading = false;

async function loadFaceModels() {
    if (modelsLoaded || modelsLoading) return;
    modelsLoading = true;
    showStatus("AI 얼굴 인식 엔진 준비 중...", "#3b82f6");

    try {
        const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/';
        try { await faceapi.tf.setBackend('webgl'); } catch (e) { console.log('WebGL backend not supported, fallback to default'); }

        await Promise.all([
            faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
            faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
            faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
        ]);
        modelsLoaded = true;
        showStatus("AI 인식 준비 완료", "#059669");
        setTimeout(() => showStatus("", ""), 1500);
    } catch (e) {
        showStatus("AI 엔진 로드 실패. 관리자에게 문의하세요.", "red");
        console.error("Face API load error:", e);
    } finally {
        modelsLoading = false;
    }
}

function setupUI(title, sub, showKeypad, showFacePanel, showMirror) {
    if (mainTitle) mainTitle.textContent = title;
    if (mainSub) mainSub.textContent = sub;

    if (inputWrapper) inputWrapper.style.display = showKeypad ? 'block' : 'none';
    if (keypadGrid) keypadGrid.style.display = showKeypad ? 'grid' : 'none';
    if (faceOnlyPanel) faceOnlyPanel.style.display = showFacePanel ? 'block' : 'none';

    if (mainSubmitBtn) mainSubmitBtn.style.display = (currentMode === 'number') ? 'block' : 'none';
    if (faceSubmitBtn) faceSubmitBtn.style.display = (currentMode === 'register') ? 'block' : 'none';
}

// ---------------------------------------------------------
// Attendance Logic
// ---------------------------------------------------------

async function submitAttendance() {
    if (currentInput.length !== 8) {
        showStatus("번호 8자리를 입력해주세요.", "red");
        return;
    }
    if (mainSubmitBtn) { mainSubmitBtn.disabled = true; mainSubmitBtn.textContent = "처리중..."; mainSubmitBtn.style.opacity = "0.7"; }
    showStatus("출석 처리 중입니다...", "#3b82f6");
    await processAttendance(currentInput);
    if (mainSubmitBtn) { mainSubmitBtn.disabled = false; mainSubmitBtn.textContent = "출석"; mainSubmitBtn.style.opacity = "1"; }
}

async function recognizeAndAttend() {
    if (!modelsLoaded) {
        showStatus("AI 엔진 모델 로딩 중입니다. 잠시 후 10초 뒤 시도해주세요.", "orange");
        return;
    }

    const btn = document.querySelector('#faceOnlyPanel button');
    if (btn) {
        btn.disabled = true;
        btn.textContent = "AI 분석 대기중...";
        btn.style.opacity = "0.7";
    }

    showStatus("얼굴 특징을 분석 중입니다. 가만히 바라봐주세요...", "#3b82f6");
    if (shutter) shutter.style.opacity = '1';
    setTimeout(() => { if (shutter) shutter.style.opacity = '0'; }, 150);

    // Give browser time to paint the UI text updates before heavy ML block
    await new Promise(r => setTimeout(r, 10));

    try {
        const [detection, res] = await Promise.all([
            faceapi.detectSingleFace(video).withFaceLandmarks().withFaceDescriptor(),
            fetch(getFetchUrl('members') + '&t=' + Date.now())
        ]);

        if (!detection) {
            showStatus("얼굴이 감지되지 않았습니다. 밝은 곳에서 시도하세요.", "red");
            return;
        }

        const rawMembers = await res.json();
        const members = Array.isArray(rawMembers) ? rawMembers.filter(m => !['delete', 'trash', 'hold', 'completed'].includes(m.status)) : [];

        showStatus("매칭되는 회원을 찾는 중...", "#059669");

        let bestMatch = null;
        let smallestDistance = parseFloat(localStorage.getItem('kiosk_sensitivity')) || 0.65; // Dynamic confidence threshold

        const captureData = capturePrettyFrame();

        for (const m of members) {
            if (m.faceDescriptor) {
                const desc = new Float32Array(m.faceDescriptor);
                const distance = faceapi.euclideanDistance(detection.descriptor, desc);
                if (distance < smallestDistance) {
                    smallestDistance = distance;
                    bestMatch = m;
                }
            }
        }

        if (bestMatch) {
            const phoneStr = bestMatch.phone.replace(/-/g, '');
            const phone8 = phoneStr.length >= 8 ? phoneStr.slice(-8) : phoneStr;
            await processAttendance(phone8, captureData);
        } else {
            showStatus("등록된 얼굴을 찾을 수 없습니다. 신규 등록을 이용해보세요.", "red");
        }
    } catch (e) {
        showStatus("인식 시스템 오류!", "red");
        console.error(e);
    } finally {
        if (btn) { btn.disabled = false; btn.textContent = "얼굴로 출석하기"; btn.style.opacity = "1"; }
    }
}

function capturePrettyFrame() {
    const context = canvas.getContext('2d');
    const vW = video.videoWidth || 1280;
    const vH = video.videoHeight || 720;
    const cW = canvas.width || 640;
    const cH = canvas.height || 480;
    const vRatio = vW / vH;
    const cRatio = cW / cH;
    let sW, sH, sX = 0, sY = 0;
    
    // 비율 왜곡 방지 (찌그러짐 방지 - 가운데 크롭)
    if (vRatio > cRatio) {
        sH = vH;
        sW = vH * cRatio;
        sX = (vW - sW) / 2;
    } else {
        sW = vW;
        sH = vW / cRatio;
        sY = (vH - sH) / 2;
    }
    
    // 뷰티 필터 (뽀샤시 효과: 밝기+15%, 대비+5%, 채도+15%)
    context.filter = 'brightness(1.15) contrast(1.05) saturate(1.15)';
    
    // 좌우 반전 (거울 모드로 찍히도록)
    context.save();
    context.scale(-1, 1);
    context.translate(-cW, 0);
    
    context.drawImage(video, sX, sY, sW, sH, 0, 0, cW, cH);
    context.restore();
    
    return canvas.toDataURL('image/jpeg', 0.85); // 고화질
}

async function capturePhoto() {
    if (currentInput.length !== 8) {
        showStatus("먼저 뒷번호 8자리를 입력해주세요.", "red");
        return;
    }

    if (!modelsLoaded) {
        showStatus("AI 엔진 대기중... 10초 뒤 다시 시도해주세요.", "orange");
        return;
    }

    if (faceSubmitBtn) {
        faceSubmitBtn.disabled = true;
        faceSubmitBtn.innerHTML = "AI 분석 대기중...<br>잠시 대기!";
        faceSubmitBtn.style.background = "#94a3b8";
    }

    showStatus("사진 촬영 및 얼굴 특징을 추출 중입니다...", "#3b82f6");
    if (shutter) shutter.style.opacity = '1';
    setTimeout(() => { if (shutter) shutter.style.opacity = '0'; }, 150);

    // Yield for UI paint
    await new Promise(r => setTimeout(r, 10));

    try {
        const photoDataUrl = capturePrettyFrame();

        const [res, detection] = await Promise.all([
            fetch(getFetchUrl('members') + '&t=' + Date.now()),
            faceapi.detectSingleFace(video).withFaceLandmarks().withFaceDescriptor()
        ]);

        const rawMembers = await res.json();
        const members = Array.isArray(rawMembers) ? rawMembers.filter(m => !['delete', 'trash', 'hold', 'completed'].includes(m.status)) : [];
        const member = members.find(m => m.phone && m.phone.replace(/-/g, '').endsWith(currentInput));

        if (!member) {
            showStatus("뒷번호 8자리와 일치하는 수강생 대장 회원이 없습니다.", "red");
            return;
        }

        if (!detection) {
            showStatus("얼굴이 명확히 인식되지 않았습니다. 밝은 곳에서 시도해주세요.", "red");
            return;
        }

        showStatus("신규 얼굴 데이터를 서버에 등록 중입니다...", "#059669");

        member.photo = photoDataUrl;
        member.faceDescriptor = Array.from(detection.descriptor); // Store for euclidean comparison

        await fetch(getFetchUrl('members', true), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(member)
        });

        showStatus("얼굴 등록 완료! 자동으로 출석 체크를 진행합니다...", "#059669");
        await processAttendance(member, photoDataUrl);
    } catch (e) {
        console.error('Registration Error:', e);
        showStatus(`저장 오류! (${e.message || '통신 실패'})`, "red");
    } finally {
        if (faceSubmitBtn) {
            faceSubmitBtn.disabled = false;
            faceSubmitBtn.innerHTML = "얼굴 촬영<br>및 출석";
            faceSubmitBtn.style.background = "#059669";
        }
    }
}

function determineAttendanceStatus(member) {
    if (!member || !member.timeSlot) return 'present';

    const now = new Date();
    const currentMins = now.getHours() * 60 + now.getMinutes();

    const slots = member.timeSlot.split(',').map(s => {
        const parts = s.trim().split(':');
        if (parts.length < 2) return -1;
        return parseInt(parts[0]) * 60 + parseInt(parts[1]);
    }).filter(m => m !== -1);

    if (slots.length === 0) return 'present';

    for (const slotMins of slots) {
        // Valid attendance window: 120 mins before to 120 mins after the slot
        if (currentMins >= (slotMins - 120) && currentMins <= (slotMins + 120)) {
            if (currentMins >= slotMins + 5) {
                return 'late';
            }
            const h = Math.floor(slotMins / 60);
            if (h === 10) return '10';
            if (h === 12) return '12';
            if (h === 14 || h === 2) return '2';
            if (h === 17 || h === 5) return '5';
            if (h === 19 || h === 7) return '7';
            return 'present';
        }
    }
    return 'invalid_time';
}

let timetableData = {
    '한식기능사': [1, 3],
    '양식기능사': [2, 4],
    '일식기능사': [2, 4],
    '중식기능사': [2, 4],
    '제과기능사': [1, 3],
    '제빵기능사': [2, 4],
    '제과제빵기능사': [1, 2, 3, 4],
    '복어기능사': [5],
    '산업기사': [5],
    '가정요리': [2, 4],
    '브런치': [5]
};

async function checkTimetableAllowed(member) {
    if (!member || !member.course) return true;
    
    try {
        const res = await fetch(getFetchUrl('timetable') + '&t=' + Date.now());
        if (res.ok) {
            const apiData = await res.json();
            if (apiData && Object.keys(apiData).length > 0) {
                timetableData = { ...timetableData, ...apiData };
            }
        }
    } catch (e) {
        console.error("Timetable fetch failed", e);
    }
    
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0(Sun) ~ 6(Sat)
    
    const courses = member.course.split(',').map(c => c.trim().replace(/\([^)]*\)/g, '').trim());
    
    let hasClassToday = false;
    let foundTimetableEntry = false;
    
    for (const cName of courses) {
        if (timetableData[cName]) {
            foundTimetableEntry = true;
            if (timetableData[cName].includes(dayOfWeek)) {
                hasClassToday = true;
                break;
            }
        } else if (timetableData[cName.replace(/\s/g, '')]) {
             foundTimetableEntry = true;
             if (timetableData[cName.replace(/\s/g, '')].includes(dayOfWeek)) {
                hasClassToday = true;
                break;
             }
        }
    }
    
    if (foundTimetableEntry && !hasClassToday) {
        return false;
    }
    return true;
}

async function processAttendance(inputNumOrObj, overridePhoto = null) {
    try {
        let member = null;
        if (typeof inputNumOrObj === 'object' && inputNumOrObj !== null) {
            member = inputNumOrObj;
        } else {
            const res = await fetch(getFetchUrl('members') + '&t=' + Date.now());
            const rawMembers = await res.json();
            const members = Array.isArray(rawMembers) ? rawMembers.filter(m => !['delete', 'trash', 'hold', 'completed'].includes(m.status)) : [];
            member = members.find(m => m.phone && m.phone.replace(/-/g, '').endsWith(inputNumOrObj));
        }

        if (!member) {
            showStatus("등록되지 않은 번호입니다.", "red");
            return;
        }

        // --- NEW: Check if already logged in today ---
        const todayStrForCheck = new Date().toISOString().split('T')[0];
        try {
            const attRes = await fetch(getFetchUrl(`attendance?date=${todayStrForCheck}`));
            if (attRes.ok) {
                const attData = await attRes.json();
                const alreadyCheckedIn = attData.some(row => row.memberId === member.id && row.status !== 'unchecked');
                if (alreadyCheckedIn) {
                    const msg = "이미 로그인되어 있습니다.";
                    showStatus(msg, "orange");
                    if (localStorage.getItem('kiosk_voice_enabled') !== 'false' && window.speakTTS) {
                        speakTTS(msg, 'browser');
                    }
                    setTimeout(() => switchMode('home'), 2500);
                    return;
                }
            }
        } catch(e) {
            console.error("Duplicate check failed", e);
        }
        // ---------------------------------------------
        
        // --- NEW: Check if today is a valid class day ---
        const isAllowed = await checkTimetableAllowed(member);
        if (!isAllowed) {
            const msg = "오늘은 수강 요일이 아닙니다.";
            showStatus(msg, "red");
            if (localStorage.getItem('kiosk_voice_enabled') !== 'false' && window.speakTTS) {
                speakTTS(msg, 'browser');
            }
            return; // Reject attendance
        }
        // ------------------------------------------------

        const today = new Date().toISOString().split('T')[0];
        const status = determineAttendanceStatus(member);

        if (status === 'invalid_time') {
            const msg = "현재는 예약된 수강 시간이 아닙니다.";
            showStatus(msg, "red");
            if (localStorage.getItem('kiosk_voice_enabled') !== 'false' && window.speakTTS) {
                speakTTS(msg, 'browser');
            }
            return; // Reject attendance
        }

        const postRes = await fetch(getFetchUrl('attendance', true), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ memberId: member.id, date: today, status: status, course: member.course })
        });

        if (postRes.ok) {
            showStatus(`${member.name}님, 등원 완료!`, "#3b82f6");
            showFaceOverlay(overridePhoto || member.photo, member.name);
            
            // Play login success sound
            if (window.playLoginSound) window.playLoginSound();

            // TTS Voice Feedback
            if (localStorage.getItem('kiosk_voice_enabled') !== 'false') {
                const mode = localStorage.getItem('kiosk_tts_mode') || 'browser';
                let ttsMsg = '';
                if (mode === 'browser') {
                    const template = localStorage.getItem('kiosk_tts_template') || '{name}님 등원 완료되었습니다.';
                    ttsMsg = template.replace(/{name}/g, member.name);
                } else if (mode === 'api') {
                    const template = localStorage.getItem('kiosk_tts_api_template') || '{name}님 등원 완료되었습니다.';
                    ttsMsg = template.replace(/{name}/g, member.name);
                } else if (mode === 'mp3') {
                    ttsMsg = '__MP3_SUCCESS__';
                }
                if (window.speakTTS) speakTTS(ttsMsg, mode);
            }
            
            setTimeout(() => switchMode('home'), 2500);
        }
    } catch (e) {
        showStatus("통신 장애!", "red");
    }
}

function addNum(num) {
    if (currentInput.length < 8) {
        currentInput += num;
        updateDisplay();
        if (currentInput.length === 8 && currentMode === 'number') {
            submitAttendance();
        }
    }
}
function clearNum() { currentInput = ""; updateDisplay(); }
function updateDisplay() { if (inputDisplay) inputDisplay.textContent = currentInput; }

async function startCamera() {
    try {
        const cameraId = localStorage.getItem('kiosk_camera_id');
        const constraints = { video: { width: 1280, height: 720, focusMode: { ideal: "continuous" } } };
        
        if (cameraId) {
            constraints.video.deviceId = { exact: cameraId };
        }
        
        stream = await navigator.mediaDevices.getUserMedia(constraints);
        if (video) video.srcObject = stream;
    } catch (e) {
        console.error("Camera Error:", e);
        // Fallback if specific camera fails
        try {
            stream = await navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720, focusMode: { ideal: "continuous" } } });
            if (video) video.srcObject = stream;
        } catch(e2) {
            showStatus("카메라 에러", "red");
        }
    }
}

function stopCamera() {
    if (stream) stream.getTracks().forEach(t => t.stop());
    if (video) video.srcObject = null;
}

function showFaceOverlay(url, name) {
    if (!url) return;
    const overlay = document.createElement('div');
    overlay.style = "position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 320px; height: 320px; border-radius: 50%; border: 10px solid #4ade80; box-shadow: 0 0 100px rgba(74, 222, 128, 0.6); background: url(" + url + ") center/cover; z-index: 100; animation: popIn 0.5s;";
    const label = document.createElement('div');
    label.style = "position: absolute; bottom: -60px; left: 50%; transform: translateX(-50%); color: white; font-size: 2rem; font-weight: 900; white-space: nowrap; text-shadow: 0 4px 10px rgba(0,0,0,0.8);";
    label.textContent = name + "님 반가워요!";
    overlay.appendChild(label);
    const frame = document.querySelector('.camera-frame');
    if (frame) frame.appendChild(overlay);
    setTimeout(() => { if (overlay) overlay.remove(); }, 2500);
}

function showStatus(msg, color) { if (statusMsg) { statusMsg.textContent = msg; statusMsg.style.color = color; } }

function updateKioskTime() {
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0];
    const dateStr = now.getFullYear() + '. ' + String(now.getMonth() + 1).padStart(2, '0') + '. ' + String(now.getDate()).padStart(2, '0');
    if (document.getElementById('homeTime')) document.getElementById('homeTime').textContent = timeStr;
    if (document.getElementById('homeDate')) document.getElementById('homeDate').textContent = dateStr;
}

// Launch
setInterval(updateKioskTime, 1000);
updateKioskTime();
document.addEventListener('DOMContentLoaded', () => { switchMode('home'); });



window.speakTTS = function(text, forceMode = null) {
    const mode = forceMode || localStorage.getItem('kiosk_tts_mode') || 'browser';
    
    if (mode === 'mp3' && text === '__MP3_SUCCESS__') {
        const mp3Index = localStorage.getItem('kiosk_tts_mp3') || '1';
        const audio = new Audio(`/audio/voice_${mp3Index}.mp3`);
        audio.play().catch(e => console.error("MP3 Play Error:", e));
        return;
    }

    if (mode === 'api' && text !== '__MP3_SUCCESS__') {
        // TODO: Call cloud API backend when implemented
        console.log("Cloud TTS API Mode - text to synthesize:", text);
    }

    // Fallback or explicit browser mode
    if (!window.speechSynthesis) return;
    
    // Stop any currently playing audio
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ko-KR';
    
    const style = localStorage.getItem('kiosk_tts_style') || '1';
    let pitch = 1.0, rate = 1.0;
    switch(style) {
        case '1': pitch = 1.0; rate = 1.0; break;
        case '2': pitch = 1.2; rate = 1.1; break;
        case '3': pitch = 0.9; rate = 0.9; break;
        case '4': pitch = 1.3; rate = 1.3; break;
        case '5': pitch = 0.7; rate = 0.8; break;
        case '6': pitch = 1.8; rate = 1.1; break;
        case '7': pitch = 2.0; rate = 1.5; break;
        case '8': pitch = 0.5; rate = 0.85; break;
        case '9': pitch = 0.1; rate = 0.9; break;
        case '10': pitch = 1.1; rate = 0.95; break;
        case '11': pitch = 1.5; rate = 1.6; break;
        case '12': pitch = 1.6; rate = 0.7; break;
        case '13': pitch = 0.4; rate = 0.7; break;
        case '14': pitch = 0.8; rate = 1.2; break;
        case '15': pitch = 1.4; rate = 1.2; break;
        case '16': pitch = 1.0; rate = 1.15; break;
        case '17': pitch = 0.6; rate = 0.6; break;
        case '18': pitch = 1.1; rate = 0.8; break;
        case '19': pitch = 0.2; rate = 1.4; break;
        case '20': pitch = 1.7; rate = 1.2; break;
    }
    utterance.pitch = pitch;
    utterance.rate = rate;
    
    const voices = window.speechSynthesis.getVoices();
    const koVoice = voices.find(v => v.lang.includes('ko'));
    if (koVoice) utterance.voice = koVoice;
    
    window.speechSynthesis.speak(utterance);
};

window.playLoginSound = function() {
    const type = localStorage.getItem('kiosk_sound_type') || 'dingdong';
    if (type === 'none') return;
    
    if (type === 'custom') {
        const customData = localStorage.getItem('kiosk_custom_sound');
        if (customData) {
            const audio = new Audio(customData);
            audio.play().catch(e => console.log("Custom audio play blocked", e));
        }
        return;
    }
    
    try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        
        function playNote(freq, startTime, duration, vol=0.3, wave='sine') {
            const oscillator = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();
            oscillator.connect(gainNode);
            gainNode.connect(audioCtx.destination);
            
            oscillator.type = wave;
            oscillator.frequency.value = freq;
            
            gainNode.gain.setValueAtTime(0, startTime);
            gainNode.gain.linearRampToValueAtTime(vol, startTime + 0.05);
            gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
            
            oscillator.start(startTime);
            oscillator.stop(startTime + duration);
        }

        const now = audioCtx.currentTime;
        if (type === 'dingdong') {
            playNote(659.25, now, 0.4); playNote(523.25, now + 0.3, 0.6); 
        } else if (type === 'chime') {
            playNote(523.25, now, 0.2); playNote(659.25, now + 0.1, 0.2); playNote(783.99, now + 0.2, 0.2); playNote(1046.50, now + 0.3, 0.5);
        } else if (type === 'beep') {
            playNote(1046.50, now, 0.15);
        } else if (type === 'mario') {
            playNote(987.77, now, 0.1, 0.2, 'square'); playNote(1318.51, now + 0.1, 0.4, 0.2, 'square');
        } else if (type === 'arcade1') {
            for(let i=0; i<5; i++) playNote(400 + i*100, now + i*0.05, 0.1, 0.2, 'square');
        } else if (type === 'arcade2') {
            playNote(300, now, 0.1, 0.2, 'sawtooth'); playNote(600, now+0.1, 0.2, 0.2, 'sawtooth');
        } else if (type === 'magic') {
            [523, 659, 783, 1046, 1318].forEach((f, i) => playNote(f, now + i*0.05, 0.3, 0.1, 'sine'));
        } else if (type === 'level_up') {
            playNote(523, now, 0.15); playNote(659, now+0.15, 0.15); playNote(783, now+0.3, 0.15); playNote(1046, now+0.45, 0.4);
        } else if (type === 'bell1') {
            playNote(880, now, 0.8, 0.4, 'sine');
        } else if (type === 'bell2') {
            playNote(880, now, 0.2, 0.3, 'sine'); playNote(880, now+0.25, 0.6, 0.3, 'sine');
        } else if (type === 'sci_fi') {
            playNote(2000, now, 0.05, 0.1, 'square'); playNote(2200, now+0.1, 0.05, 0.1, 'square'); playNote(2400, now+0.2, 0.1, 0.1, 'square');
        } else if (type === 'future_click') {
            playNote(3000, now, 0.02, 0.1, 'triangle');
        } else if (type === 'bubble') {
            const osc = audioCtx.createOscillator(); const gn = audioCtx.createGain();
            osc.connect(gn); gn.connect(audioCtx.destination);
            osc.frequency.setValueAtTime(200, now); osc.frequency.exponentialRampToValueAtTime(800, now+0.1);
            gn.gain.setValueAtTime(0.3, now); gn.gain.exponentialRampToValueAtTime(0.01, now+0.1);
            osc.start(now); osc.stop(now+0.1);
        } else if (type === 'laser') {
            const osc = audioCtx.createOscillator(); const gn = audioCtx.createGain();
            osc.connect(gn); gn.connect(audioCtx.destination); osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(1200, now); osc.frequency.exponentialRampToValueAtTime(100, now+0.2);
            gn.gain.setValueAtTime(0.2, now); gn.gain.exponentialRampToValueAtTime(0.01, now+0.2);
            osc.start(now); osc.stop(now+0.2);
        } else if (type === 'fanfare') {
            playNote(523, now, 0.1, 0.2, 'square'); playNote(523, now+0.15, 0.1, 0.2, 'square'); playNote(523, now+0.3, 0.1, 0.2, 'square'); playNote(880, now+0.45, 0.6, 0.2, 'square');
        } else if (type === 'drum_kick') {
            const osc = audioCtx.createOscillator(); const gn = audioCtx.createGain();
            osc.connect(gn); gn.connect(audioCtx.destination);
            osc.frequency.setValueAtTime(150, now); osc.frequency.exponentialRampToValueAtTime(0.01, now+0.2);
            gn.gain.setValueAtTime(0.5, now); gn.gain.exponentialRampToValueAtTime(0.01, now+0.2);
            osc.start(now); osc.stop(now+0.2);
        } else if (type === 'robot') {
            [400,300,500,200].forEach((f,i) => playNote(f, now+i*0.1, 0.1, 0.2, 'sawtooth'));
        } else if (type === 'bird') {
            const osc = audioCtx.createOscillator(); const gn = audioCtx.createGain();
            osc.connect(gn); gn.connect(audioCtx.destination);
            osc.frequency.setValueAtTime(2000, now); osc.frequency.linearRampToValueAtTime(3000, now+0.05); osc.frequency.linearRampToValueAtTime(2000, now+0.1);
            gn.gain.setValueAtTime(0, now); gn.gain.linearRampToValueAtTime(0.2, now+0.05); gn.gain.linearRampToValueAtTime(0, now+0.1);
            osc.start(now); osc.stop(now+0.1);
        } else if (type === 'coin2') {
            playNote(1200, now, 0.05, 0.2, 'square'); playNote(1600, now+0.05, 0.3, 0.2, 'square');
        } else if (type === 'trill') {
            for(let i=0; i<8; i++) playNote(i%2===0?800:1000, now+i*0.05, 0.05, 0.2);
        } else if (type === 'soft_pop') {
            playNote(400, now, 0.05, 0.1);
        } else if (type === 'warm_pad') {
            playNote(300, now, 1.0, 0.15, 'triangle'); playNote(380, now, 1.0, 0.15, 'triangle'); playNote(450, now, 1.0, 0.15, 'triangle');
        } else if (type === 'xylophone') {
            playNote(800, now, 0.1, 0.4, 'triangle');
        } else if (type === 'success2') {
            playNote(440, now, 0.15); playNote(554, now+0.15, 0.15); playNote(659, now+0.3, 0.4);
        }
    } catch(e) {
        console.log("Audio not supported or blocked");
    }
};
