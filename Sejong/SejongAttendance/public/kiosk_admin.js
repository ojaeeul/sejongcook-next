// API Base
function getFetchUrl(endpoint, isPost = false) {
    const url = `/api/sejong/${endpoint}`;
    return isPost ? url : url + (url.includes('?') ? '&' : '?') + `t=${Date.now()}`;
}

let adminMembers = [];
let todayAttendance = [];
let modelsLoaded = false;
let modelsLoading = false;

document.addEventListener('DOMContentLoaded', () => {
    switchTab('members');
    loadSettings();
    populateCameraList();
    loadFaceModels(); // Load models in background for manual upload
    fetchMembers();
});

// ---------------------------------------------------------
// Tab Logic
// ---------------------------------------------------------
function switchTab(tabId) {
    document.getElementById('tabMembers').classList.remove('active');
    document.getElementById('tabSettings').classList.remove('active');
    document.getElementById('tabBtnMembers').classList.remove('active');
    document.getElementById('tabBtnSettings').classList.remove('active');

    if (tabId === 'members') {
        document.getElementById('tabMembers').classList.add('active');
        document.getElementById('tabBtnMembers').classList.add('active');
    } else {
        document.getElementById('tabSettings').classList.add('active');
        document.getElementById('tabBtnSettings').classList.add('active');
    }
}

// ---------------------------------------------------------
// Data Fetch & Render
// ---------------------------------------------------------
async function fetchMembers() {
    const listEl = document.getElementById('memberList');
    listEl.innerHTML = '<div style="text-align:center; padding:40px; color:#94a3b8;">데이터를 불러오는 중입니다...</div>';
    
    try {
        const res = await fetch(getFetchUrl('members'));
        const rawMembers = await res.json();
        adminMembers = Array.isArray(rawMembers) ? rawMembers.filter(m => !['delete', 'trash', 'hold', 'completed'].includes(m.status)) : [];
        
        const attRes = await fetch(getFetchUrl('attendance'));
        const rawAtt = await attRes.json();
        
        // Use local timezone date (KST)
        const today = new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().split('T')[0];
        todayAttendance = Array.isArray(rawAtt) ? rawAtt.filter(a => a.date === today && a.status !== 'unchecked') : [];
        
        renderList();
    } catch(e) {
        listEl.innerHTML = '<div style="color:red; text-align:center; padding:40px;">데이터 로딩에 실패했습니다. 관리자에게 문의하세요.</div>';
    }
}

function renderList() {
    const listEl = document.getElementById('memberList');
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    listEl.innerHTML = '';
    
    const filtered = adminMembers.filter(m => {
        return (m.name || '').toLowerCase().includes(searchTerm) || (m.phone || '').includes(searchTerm);
    });
    
    if (filtered.length === 0) {
        listEl.innerHTML = '<div style="text-align:center; padding:40px; color:#64748b;">검색 결과가 없습니다.</div>';
        return;
    }
    
    filtered.forEach(m => {
        const hasFace = !!(m.faceDescriptor && m.faceDescriptor.length > 0);
        const item = document.createElement('div');
        item.className = 'member-item';
        
        
        const isAttended = todayAttendance.some(a => String(a.memberId) === String(m.id));
        const attBadge = isAttended 
            ? `<div style="margin-top:5px;"><span style="display:inline-flex; align-items:center; gap:4px; padding: 3px 8px; border-radius: 4px; background: #dcfce7; color: #166534; font-size: 0.85rem; font-weight: bold;"><span class="material-icons" style="font-size:14px;">login</span> 로그인 (출석완료)</span></div>`
            : `<div style="margin-top:5px;"><span style="display:inline-flex; align-items:center; gap:4px; padding: 3px 8px; border-radius: 4px; background: #f1f5f9; color: #64748b; font-size: 0.85rem; font-weight: bold;"><span class="material-icons" style="font-size:14px;">logout</span> 로그아웃 (출석 전)</span></div>`;
        
        const forceActionBtn = isAttended
            ? `<button class="btn" style="background:#fef2f2; color:#ef4444; border:1px solid #fca5a5;" onclick="forceLogout('${m.id}', '${m.course}')"><span class="material-icons" style="font-size:18px;">logout</span> 강제 로그아웃</button>`
            : `<button class="btn" style="background:#f0fdf4; color:#16a34a; border:1px solid #86efac;" onclick="forceLogin('${m.id}', '${m.course}')"><span class="material-icons" style="font-size:18px;">login</span> 강제 로그인</button>`;
        const photoPreview = hasFace && m.photo ? `<img src="${m.photo}" style="width: 60px; height: 60px; border-radius: 50%; object-fit: cover; border: 2px solid #3b82f6; flex-shrink: 0; cursor: pointer;" onclick="previewLargePhoto('${m.photo}', '${m.name}', '${m.id}')">` : `<div style="width: 60px; height: 60px; border-radius: 50%; background: #e2e8f0; display: flex; align-items: center; justify-content: center; flex-shrink: 0; cursor: pointer;" onclick="previewLargePhoto('', '${m.name}', '${m.id}')"><span class="material-icons" style="color:#94a3b8; font-size: 32px;">person</span></div>`;

        const infoHtml = `
            <div style="display: flex; gap: 15px; align-items: center;">
                ${photoPreview}
                <div>
                    <div style="font-weight:700; font-size:1.15rem; color:#0f172a; margin-bottom:4px;">
                        ${m.name} <span style="font-size:0.95rem; color:#64748b; font-weight:400;">(${m.phone || '번호없음'})</span>
                    </div>
                    <div style="font-size:0.9rem; color:#475569; margin-bottom:4px;">${m.course || '과목 없음'}</div>
                    <div style="font-weight:700; font-size: 0.9rem; ${hasFace ? 'color:#059669;' : 'color:#94a3b8;'}">
                        ${hasFace ? '<span class="material-icons" style="vertical-align:middle; font-size:16px;">check_circle</span> 등록 완료' : '<span class="material-icons" style="vertical-align:middle; font-size:16px;">cancel</span> 사진 미등록'}
                    </div>
                    ${attBadge}
                </div>
            </div>
        `;
        
        const actionHtml = hasFace ? `
            <div style="display: flex; gap: 8px; flex-wrap: wrap; justify-content: flex-end; margin-top: 10px;">
                <button class="btn btn-danger" onclick="deleteFace('${m.id}')">
                    <span class="material-icons" style="font-size:18px;">delete_sweep</span> 개인 사진 초기화
                </button>
                ${forceActionBtn}
            </div>
        ` : `
            <div style="display: flex; gap: 8px; flex-wrap: wrap; justify-content: flex-end; margin-top: 10px;">
                <button class="btn btn-primary" onclick="openWebcamCapture('${m.id}')" style="background:#3b82f6;">
                    <span class="material-icons" style="font-size:18px;">photo_camera</span> AI 얼굴 촬영
                </button>
                <label class="btn btn-primary" style="cursor:pointer; background:#10b981; border-color:#059669;">
                    <span class="material-icons" style="font-size:18px;">add_photo_alternate</span> AI찍기(파일업로드)
                    <input type="file" accept="image/*" style="display:none;" onchange="manualFaceUpload(event, '${m.id}')">
                </label>
            
                ${forceActionBtn}
            </div>
        `;
        
        item.innerHTML = infoHtml + actionHtml;
        listEl.appendChild(item);
    });
}

function filterList() {
    renderList();
}

// ---------------------------------------------------------
// Face Data Management (Server side)
// ---------------------------------------------------------
function previewLargePhoto(photoUrl, name, memberId) {
    const editUrl = `${window.location.origin}/sejong/photo_edit.html?id=${memberId}`;
    
    const modalHtml = `
        <div id="photoPreviewModal" style="position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.85); display:flex; justify-content:center; align-items:center; z-index:10000; flex-direction: column;">
            <div style="background: white; padding: 30px; border-radius: 16px; text-align: center; width: 90%; max-width: 400px; display: flex; flex-direction: column; align-items: center; box-shadow: 0 10px 25px rgba(0,0,0,0.5);">
                <h3 style="margin-top: 0; margin-bottom: 20px; color: #0f172a; font-size: 1.4rem;">${name}님의 얼굴</h3>
                
                ${photoUrl ? `<img src="${photoUrl}" style="width: 200px; height: 200px; border-radius: 50%; border: 4px solid #3b82f6; object-fit: cover; margin-bottom: 25px; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">` : `<div style="width: 200px; height: 200px; border-radius: 50%; background: #e2e8f0; display: flex; align-items: center; justify-content: center; margin: 0 auto 25px auto; border: 4px solid #cbd5e1;"><span class="material-icons" style="color:#94a3b8; font-size: 80px;">person</span></div>`}
                
                <button class="btn btn-success" onclick="copyToClipboard('${editUrl}')" style="width: 100%; padding: 12px; margin-bottom: 10px; font-size: 1rem; display: flex; align-items: center; justify-content: center; gap: 8px; background: #10b981; color: white; border: none; border-radius: 8px; font-weight: bold; cursor: pointer;">
                    <span class="material-icons">content_copy</span> 개인 사진 수정 링크 복사
                </button>
                
                <button class="btn btn-secondary" onclick="document.getElementById('photoPreviewModal').remove()" style="width: 100%; padding: 12px; font-size: 1rem; background: #e2e8f0; color: #475569; border: none; border-radius: 8px; font-weight: bold; cursor: pointer;">닫기</button>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        alert("링크가 복사되었습니다! 카카오톡이나 문자로 전송해 주세요.\\n\\n" + text);
    }).catch(err => {
        alert("복사 실패. 직접 아래 링크를 복사하세요:\\n" + text);
    });
}

async function deleteFace(memberId) {
    if (!confirm('해당 수강생의 얼굴 데이터를 정말 삭제하시겠습니까?')) return;
    
    const member = adminMembers.find(m => String(m.id) === String(memberId));
    if (!member) return;
    
    member.photo = null;
    member.faceDescriptor = null;
    
    try {
        await fetch(getFetchUrl('members', true), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(member)
        });
        alert(`${member.name}님의 얼굴 데이터가 삭제되었습니다.`);
        fetchMembers(); // 새로고침 보장
    } catch(e) {
        alert('삭제 처리 중 오류가 발생했습니다.');
    }
}

async function initializeAllFaces() {
    if (!confirm('⚠️ 모든 수강생의 얼굴 데이터(사진 포함)를 완전히 삭제합니다. 진행하시겠습니까?')) return;
    if (!confirm('정말 진행합니까? 복구할 수 없습니다.')) return;
    
    const registeredMembers = adminMembers.filter(m => m.faceDescriptor && m.faceDescriptor.length > 0);
    
    if (registeredMembers.length === 0) {
        alert('삭제할 얼굴 데이터가 없습니다.');
        return;
    }
    
    let successCount = 0;
    
    for (const member of registeredMembers) {
        member.photo = null;
        member.faceDescriptor = null;
        try {
            await fetch(getFetchUrl('members', true), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(member)
            });
            successCount++;
        } catch(e) {
            console.error('Failed to initialize member', member.name, e);
        }
    }
    
    alert(`총 ${successCount}명의 얼굴 데이터가 초기화되었습니다.`);
    fetchMembers();
}

// ---------------------------------------------------------
// Face AI & Manual Upload
// ---------------------------------------------------------
let modelsPromise = null;

function loadFaceModels() {
    if (modelsLoaded) return Promise.resolve();
    if (!modelsPromise) {
        modelsPromise = (async () => {
            try {
                const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/';
                try { 
                    await Promise.race([
                        faceapi.tf.setBackend("webgl"),
                        new Promise((_, r) => setTimeout(() => r("timeout"), 3000))
                    ]);
                } catch (e) { console.log("WebGL fallback"); }

                await Promise.all([
                    faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
                    faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
                    faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
                ]);
                modelsLoaded = true;
                console.log("Face API Models loaded.");
            } catch (e) {
                console.error("Face API load error:", e);
                modelsPromise = null; // 실패시 다시 시도할 수 있게 초기화
                throw e;
            }
        })();
    }
    return modelsPromise;
}

window.toggleTtsModeUI = function() {
    const mode = document.getElementById('ttsModeSelect') ? document.getElementById('ttsModeSelect').value : 'browser';
    
    const browserUI = document.getElementById('ttsModeBrowserUI');
    const mp3UI = document.getElementById('ttsModeMp3UI');
    const apiUI = document.getElementById('ttsModeApiUI');
    
    if (browserUI) browserUI.style.display = (mode === 'browser') ? 'block' : 'none';
    if (mp3UI) mp3UI.style.display = (mode === 'mp3') ? 'block' : 'none';
    if (apiUI) apiUI.style.display = (mode === 'api') ? 'block' : 'none';
};

window.toggleFailModeUI = function() {
    const failMode = document.getElementById('ttsFailModeSelect') ? document.getElementById('ttsFailModeSelect').value : 'tts';
    const ttsUI = document.getElementById('failModeTTSUI');
    const mechUI = document.getElementById('failModeMechUI');
    if (ttsUI) ttsUI.style.display = (failMode === 'tts') ? 'block' : 'none';
    if (mechUI) mechUI.style.display = (failMode === 'mech') ? 'block' : 'none';
};

window.playMechSound = function(type) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const now = ctx.currentTime;
    
    const playOsc = (oscType, freq, time, dur, vol, volEnd=0) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = oscType;
        
        if (Array.isArray(freq)) {
            osc.frequency.setValueAtTime(freq[0], time);
            osc.frequency.exponentialRampToValueAtTime(freq[1], time + dur);
        } else {
            osc.frequency.setValueAtTime(freq, time);
        }
        
        gain.gain.setValueAtTime(vol, time);
        gain.gain.linearRampToValueAtTime(volEnd, time + dur);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(time);
        osc.stop(time + dur);
    };

    switch(String(type)) {
        case '1': playOsc('sine', 800, now, 0.1, 1); break;
        case '2': playOsc('sawtooth', 150, now, 0.5, 0.5); break;
        case '3': 
            playOsc('square', 600, now, 0.1, 0.5);
            playOsc('square', 600, now+0.15, 0.1, 0.5);
            break;
        case '4': playOsc('sine', [800, 200], now, 0.4, 1); break;
        case '5': 
            playOsc('sine', 659.25, now, 0.15, 0.5);
            playOsc('sine', 622.25, now+0.15, 0.15, 0.5);
            playOsc('sine', 587.33, now+0.3, 0.15, 0.5);
            playOsc('sine', 554.37, now+0.45, 0.4, 0.5);
            break;
        case '6': playOsc('triangle', [100, 40], now, 0.2, 1); break;
        case '7': playOsc('sawtooth', [2000, 100], now, 0.3, 0.5); break;
        case '8': 
            playOsc('square', 800, now, 0.08, 0.5);
            playOsc('square', 800, now+0.12, 0.08, 0.5);
            playOsc('square', 800, now+0.24, 0.15, 0.5);
            break;
        case '9': 
            playOsc('square', 300, now, 0.15, 0.3);
            playOsc('square', 250, now+0.15, 0.15, 0.3);
            playOsc('square', 200, now+0.3, 0.4, 0.3);
            break;
        case '10': 
            playOsc('square', [4000, 100], now, 0.2, 0.2);
            playOsc('sawtooth', [3000, 50], now+0.05, 0.2, 0.2);
            break;
        case '11': playOsc('sine', 80, now, 0.6, 1); break;
        case '12': 
            playOsc('square', 1000, now, 0.05, 0.3);
            playOsc('sawtooth', 200, now+0.05, 0.05, 0.3);
            playOsc('square', 1500, now+0.1, 0.05, 0.3);
            playOsc('sine', 100, now+0.15, 0.05, 0.3);
            break;
        case '13': 
            playOsc('sine', 1200, now, 0.5, 0.5);
            playOsc('sine', 2400, now, 0.3, 0.2);
            break;
        case '14': 
            playOsc('sine', [400, 800], now, 0.3, 0.5, 0.5);
            playOsc('sine', [800, 400], now+0.3, 0.3, 0.5, 0);
            break;
        case '15': 
            playOsc('sawtooth', 150, now, 0.1, 0.5);
            playOsc('sawtooth', 100, now+0.1, 0.2, 0.5);
            break;
    }
};

window.playTTSSample = function() {
    const mode = document.getElementById('ttsModeSelect') ? document.getElementById('ttsModeSelect').value : 'browser';
    
    if (mode === 'browser') {
        const ttsInput = document.getElementById('ttsTemplateInput');
        const template = ttsInput ? ttsInput.value : '{name}님 등원 완료되었습니다.';
        const text = template.replace(/{name}/g, '홍길동');
        
        if (!window.speechSynthesis) return;
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
    } else if (mode === 'mp3') {
        const mp3Index = document.getElementById('ttsMp3Select') ? document.getElementById('ttsMp3Select').value : '1';
        // mp3 파일은 /audio/voice_1.mp3 형태로 있다고 가정. 아직 없으면 소리 안날 수 있음.
        const audio = new Audio(`/audio/voice_${mp3Index}.mp3`);
        audio.play().catch(e => {
            alert(`안내: 해당 성우의 녹음 파일(/audio/voice_${mp3Index}.mp3)이 서버에 아직 없습니다.\n\n💡 직접 문구를 쓰고 20가지 다양한 목소리로 들어보시려면 위의 [1. 브라우저 기본 TTS] 모드를 선택해주세요!`);
            console.error('Audio play error:', e);
            
            // Fallback for preview
            if (window.speechSynthesis) {
                const fallbackTexts = {
                    '1': '출석이 완료되었습니다', '2': '오늘도 환영합니다!', '3': '등원 확인되었습니다',
                    '4': '좋은 하루 보내세요!', '5': '안녕! 출석 체크 완료!', '6': '삐빅- 출석 확인되었습니다',
                    '7': '허허, 잘 왔구나', '8': '출석 되었습니다.', '9': '출석 등록 완료! 화이팅!', '10': '띵동댕동'
                };
                const utterance = new SpeechSynthesisUtterance(fallbackTexts[mp3Index] || '출석 완료');
                utterance.lang = 'ko-KR';
                window.speechSynthesis.speak(utterance);
            }
        });
    } else if (mode === 'api') {
        const ttsInput = document.getElementById('ttsApiTemplate');
        const template = ttsInput ? ttsInput.value : '{name}님 등원 완료되었습니다.';
        const text = template.replace(/{name}/g, '홍길동');
        
        // API 연동 전이므로 구글 번역기 TTS 또는 브라우저 기본 TTS로 미리듣기 제공
        try {
            const url = 'https://translate.google.com/translate_tts?ie=UTF-8&tl=ko&client=tw-ob&q=' + encodeURIComponent(text);
            const audio = new Audio(url);
            audio.play().catch(e => {
                if (window.speechSynthesis) {
                    const utterance = new SpeechSynthesisUtterance(text);
                    utterance.lang = 'ko-KR';
                    window.speechSynthesis.speak(utterance);
                }
            });
        } catch(err) {
            if (window.speechSynthesis) {
                const utterance = new SpeechSynthesisUtterance(text);
                utterance.lang = 'ko-KR';
                window.speechSynthesis.speak(utterance);
            }
        }
    }
};

window.playTTSSampleFail = function() {
    try {
        const text = document.getElementById('ttsFailTemplateInput').value;
        if (!text || !window.speechSynthesis) return;
        
        window.speechSynthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'ko-KR';
        
        const style = document.getElementById('ttsStyleSelect') ? document.getElementById('ttsStyleSelect').value : '1';
        let pitch = 1.0, rate = 1.0;
        switch(style) {
            case '1': pitch = 1.0; rate = 1.0; break;
            case '2': pitch = 1.2; rate = 1.1; break;
            case '3': pitch = 0.9; rate = 0.9; break;
            case '4': pitch = 1.3; rate = 1.3; break;
            case '5': pitch = 0.7; rate = 0.8; break;
            case '6': pitch = 1.8; rate = 1.1; break;
            case '7': pitch = 2.0; rate = 1.4; break;
            case '8': pitch = 0.5; rate = 0.8; break;
            case '9': pitch = 1.0; rate = 0.9; break;
            case '10': pitch = 1.1; rate = 1.05; break;
            case '11': pitch = 1.4; rate = 1.5; break;
            case '12': pitch = 1.1; rate = 0.85; break;
            case '13': pitch = 0.6; rate = 0.75; break;
            case '14': pitch = 0.8; rate = 1.1; break;
            case '15': pitch = 1.5; rate = 1.2; break;
            case '16': pitch = 1.05; rate = 1.1; break;
            case '17': pitch = 0.5; rate = 0.6; break;
            case '18': pitch = 1.2; rate = 0.9; break;
            case '19': pitch = 0.3; rate = 1.4; break;
            case '20': pitch = 1.6; rate = 1.1; break;
        }
        
        utterance.pitch = pitch;
        utterance.rate = rate;
        
        const voices = window.speechSynthesis.getVoices();
        const koVoice = voices.find(v => v.lang.includes('ko') || v.lang.includes('KO'));
        if (koVoice) utterance.voice = koVoice;

        window.speechSynthesis.speak(utterance);
    } catch(err) {
        console.error("TTS Fail Preview Error:", err);
        if (window.speechSynthesis) {
            const text = document.getElementById('ttsFailTemplateInput') ? document.getElementById('ttsFailTemplateInput').value : "미등록 얼굴입니다";
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'ko-KR';
            window.speechSynthesis.speak(utterance);
        }
    }
};

window.manualFaceUpload = async function(event, memberId) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
        processFaceImage(e.target.result, memberId);
    };
    reader.readAsDataURL(file);
};

async function processFaceImage(src, memberId) {
    if (!modelsLoaded) {
        document.getElementById("memberList").innerHTML = "<div style=\"text-align:center; padding:50px; font-weight:bold; color:#f59e0b; font-size:1.2rem;\">AI 엔진을 최초 1회 로딩 중입니다.<br>잠시만 기다려주세요... (10~20초 소요)</div>";
        try {
            await loadFaceModels();
        } catch(e) {
            alert("AI 얼굴 인식 엔진 로딩에 실패했습니다. 인터넷 연결을 확인하고 새로고침 후 다시 시도해주세요.");
            return;
        }
    }
    
    const member = adminMembers.find(m => String(m.id) === String(memberId));
    if (!member) return;
    
    const img = new Image();
    img.src = src;
    img.onload = async () => {
        // 먼저 캔버스에 이미지를 작게 리사이징합니다. (모바일 고해상도 사진 처리 중 메모리 부족 방지)
        const tempCanvas = document.getElementById('hiddenCanvas');
        const ctx = tempCanvas.getContext('2d');
        const MAX_WIDTH = 640;
        const MAX_HEIGHT = 480;
        let width = img.width;
        let height = img.height;

        if (width > height) {
            if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; }
        } else {
            if (height > MAX_HEIGHT) { width *= MAX_HEIGHT / height; height = MAX_HEIGHT; }
        }
        tempCanvas.width = width;
        tempCanvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        document.getElementById("memberList").innerHTML = "<div style=\"text-align:center; padding:50px; font-weight:bold; color:#3b82f6; font-size:1.2rem;\">사진에서 얼굴을 분석 중입니다... 잠시만 기다려주세요.</div>";
        await new Promise(r => setTimeout(r, 100)); // UI 업데이트 대기
        
        try {
            // 원본 이미지 대신 작게 줄인 캔버스에서 얼굴을 찾습니다. 훨씬 빠르고 안정적입니다.
            const detection = await faceapi.detectSingleFace(tempCanvas).withFaceLandmarks().withFaceDescriptor();
            
            if (!detection) {
                alert("사진에서 얼굴을 명확히 인식할 수 없습니다. 밝은 곳에서 정면이 잘 보이는 사진으로 다시 시도해주세요.");
                return;
            }
            
            const photoDataUrl = tempCanvas.toDataURL('image/jpeg', 0.7);

            member.photo = photoDataUrl;
            member.faceDescriptor = Array.from(detection.descriptor);
            
            const response = await fetch(getFetchUrl('members', true), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(member)
            });
            
            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || 'Server returned an error');
            }
            
            alert(`${member.name}님의 사진 등록이 완료되었습니다.`);
            renderList();
        } catch(error) {
            console.error("Registration error:", error);
            alert(`사진 등록 중 오류가 발생했습니다: ${error.message}`);
        }
    };
}

let currentWebcamMemberId = null;
let webcamStream = null;

window.openWebcamCapture = async function(memberId) {
    currentWebcamMemberId = memberId;
    const modal = document.getElementById('webcamModal');
    const video = document.getElementById('webcamVideo');
    if (!modal || !video) {
        alert("웹캠 모달이 없습니다.");
        return;
    }

    // iOS/Mobile 디바이스 감지 (HTTPS라도 iOS Safari에서 getUserMedia보다 파일 입력 팝업이 더 안정적임)
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

    if (isIOS || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        // 모바일(HTTP) 환경에서는 보안상 카메라 스트리밍 지원 안됨 -> 네이티브 카메라 앱 띄우기로 우회!
        let fallbackInput = document.getElementById('mobileCameraInput');
        if (!fallbackInput) {
            fallbackInput = document.createElement('input');
            fallbackInput.id = 'mobileCameraInput';
            fallbackInput.type = 'file';
            fallbackInput.accept = 'image/*';
            fallbackInput.capture = 'user'; // 전면 카메라 직접 호출
            fallbackInput.style.display = 'none';
            document.body.appendChild(fallbackInput);
        }
        
        fallbackInput.onchange = (event) => {
            if(event.target.files && event.target.files.length > 0) {
                window.manualFaceUpload(event, memberId);
            }
            // iOS에서 바로 remove하면 cancel 되므로 요소는 재사용 목적으로 살려둡니다.
            fallbackInput.value = ''; // 초기화
        };
        
        fallbackInput.click();
        return;
    }

    modal.style.display = 'flex';
    
    try {
        webcamStream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } } 
        });
        video.srcObject = webcamStream;
    } catch (e) {
        alert("카메라에 접근할 수 없거나 권한이 없습니다.\n핸드폰인 경우 초록색 [AI찍기] 버튼을 사용해주세요!");
        closeWebcamModal();
    }
};

window.closeWebcamModal = function() {
    const modal = document.getElementById('webcamModal');
    if (modal) modal.style.display = 'none';
    if (webcamStream) {
        webcamStream.getTracks().forEach(t => t.stop());
        webcamStream = null;
    }
    currentWebcamMemberId = null;
};

window.captureWebcam = async function() {
    if (!currentWebcamMemberId) return;
    const video = document.getElementById('webcamVideo');
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = video.videoWidth;
    tempCanvas.height = video.videoHeight;
    tempCanvas.getContext('2d').drawImage(video, 0, 0);
    
    const dataUrl = tempCanvas.toDataURL('image/jpeg');
    
    closeWebcamModal();
    processFaceImage(dataUrl, currentWebcamMemberId);
};

// Fun Functions
window.autoCorrectFace = function(memberId) {
    const member = adminMembers.find(m => String(m.id) === String(memberId));
    alert(`✨ 뾰로롱! AI가 ${member ? member.name : ''}님의 얼굴을 V라인으로 깎고 눈을 1.5배 크게 보정했습니다! (매우 자연스러움)`);
};

window.animeFace = function(memberId) {
    const member = adminMembers.find(m => String(m.id) === String(memberId));
    alert(`🌸 마법소녀/소년 변신! ${member ? member.name : ''}님이 일본 애니메이션 주인공(먼치킨)으로 등록되었습니다. (요리 실력 +999 증가)`);
};

window.faceReading = function(memberId) {
    const member = adminMembers.find(m => String(m.id) === String(memberId));
    const name = member ? member.name : '수강생';
    
    if (typeof window.getFortuneReading === 'function') {
        alert(window.getFortuneReading(name));
    } else {
        const script = document.createElement('script');
        script.src = '/sejong/fortune_data.js?v=' + Date.now();
        script.onload = () => {
            alert(window.getFortuneReading(name));
        };
        document.head.appendChild(script);
    }
};

// ---------------------------------------------------------
// Device Settings (Local Storage)
// ---------------------------------------------------------
function loadSettings() {
    const isVoiceEnabled = localStorage.getItem('kiosk_voice_enabled') !== 'false'; // default true
    const sensitivity = localStorage.getItem('kiosk_sensitivity') || '0.45';
    
    const ttsMode = localStorage.getItem('kiosk_tts_mode') || 'browser';
    
    const ttsTemplate = localStorage.getItem('kiosk_tts_template') || '{name}님 등원 완료되었습니다.';
    const ttsInput = document.getElementById('ttsTemplateInput');
    if (ttsInput) ttsInput.value = ttsTemplate;

    const ttsFailTemplate = localStorage.getItem('kiosk_tts_fail_template') || '미등록 얼굴입니다.';
    const ttsFailInput = document.getElementById('ttsFailTemplateInput');
    if (ttsFailInput) ttsFailInput.value = ttsFailTemplate;

    const invalidDayMsg = localStorage.getItem('kiosk_invalid_day_msg') || '{days}요일에 수강이 가능합니다.';
    const invalidDayInput = document.getElementById('ttsInvalidDayMsg');
    if (invalidDayInput) invalidDayInput.value = invalidDayMsg;

    const invalidTimeMsg = localStorage.getItem('kiosk_invalid_time_msg') || '{time}에 로그인 해야 합니다.';
    const invalidTimeInput = document.getElementById('ttsInvalidTimeMsg');
    if (invalidTimeInput) invalidTimeInput.value = invalidTimeMsg;

    // Individual Voice Toggles
    const successVoiceEnabled = localStorage.getItem('kiosk_success_voice_enabled') !== 'false'; // default true
    const failVoiceEnabled = localStorage.getItem('kiosk_fail_voice_enabled') !== 'false'; // default true
    const invalidDayVoiceEnabled = localStorage.getItem('kiosk_invalid_day_voice_enabled') !== 'false'; // default true
    const invalidTimeVoiceEnabled = localStorage.getItem('kiosk_invalid_time_voice_enabled') !== 'false'; // default true
    
    if (document.getElementById('ttsSuccessVoiceEnabled')) document.getElementById('ttsSuccessVoiceEnabled').checked = successVoiceEnabled;
    if (document.getElementById('ttsFailVoiceEnabled')) document.getElementById('ttsFailVoiceEnabled').checked = failVoiceEnabled;
    if (document.getElementById('ttsInvalidDayVoiceEnabled')) document.getElementById('ttsInvalidDayVoiceEnabled').checked = invalidDayVoiceEnabled;
    if (document.getElementById('ttsInvalidTimeVoiceEnabled')) document.getElementById('ttsInvalidTimeVoiceEnabled').checked = invalidTimeVoiceEnabled;

    const failMode = localStorage.getItem('kiosk_tts_fail_mode') || 'tts';
    const failModeSelect = document.getElementById('ttsFailModeSelect');
    if (failModeSelect) failModeSelect.value = failMode;

    const mechFailType = localStorage.getItem('kiosk_mech_fail_type') || '1';
    const mechFailSelect = document.getElementById('ttsFailMechSelect');
    if (mechFailSelect) mechFailSelect.value = mechFailType;

    const ttsStyle = localStorage.getItem('kiosk_tts_style') || '1';
    
    const ttsMp3 = localStorage.getItem('kiosk_tts_mp3') || '1';
    
    const ttsApiKey = localStorage.getItem('kiosk_tts_api_key') || '';
    const ttsApiSecret = localStorage.getItem('kiosk_tts_api_secret') || '';
    const ttsApiVoice = localStorage.getItem('kiosk_tts_api_voice') || 'nara';
    const ttsApiTemplate = localStorage.getItem('kiosk_tts_api_template') || '{name}님 등원 완료되었습니다.';
    
    const toggleEl = document.getElementById('voiceToggle');
    const sensEl = document.getElementById('sensitivitySelect');
    
    const ttsModeEl = document.getElementById('ttsModeSelect');
    const ttsStyleEl = document.getElementById('ttsStyleSelect');
    const ttsMp3El = document.getElementById('ttsMp3Select');
    const ttsApiKeyEl = document.getElementById('ttsApiKey');
    const ttsApiSecretEl = document.getElementById('ttsApiSecret');
    const ttsApiVoiceEl = document.getElementById('ttsApiVoice');
    const ttsApiTemplateEl = document.getElementById('ttsApiTemplate');
    
    if (toggleEl) toggleEl.checked = isVoiceEnabled;
    if (sensEl) sensEl.value = sensitivity;
    
    if (ttsModeEl) ttsModeEl.value = ttsMode;
    if (ttsStyleEl) ttsStyleEl.value = ttsStyle;
    if (ttsMp3El) ttsMp3El.value = ttsMp3;
    if (ttsApiKeyEl) ttsApiKeyEl.value = ttsApiKey;
    if (ttsApiSecretEl) ttsApiSecretEl.value = ttsApiSecret;
    if (ttsApiVoiceEl) ttsApiVoiceEl.value = ttsApiVoice;
    if (ttsApiTemplateEl) ttsApiTemplateEl.value = ttsApiTemplate;
    
    if (window.toggleTtsModeUI) window.toggleTtsModeUI();
    if (window.toggleFailModeUI) window.toggleFailModeUI();
}

function saveSettings() {
    const toggleEl = document.getElementById('voiceToggle');
    const sensEl = document.getElementById('sensitivitySelect');
    const camEl = document.getElementById('cameraSelect');
    
    const ttsModeEl = document.getElementById('ttsModeSelect');
    const ttsInput = document.getElementById('ttsTemplateInput');
    const ttsFailInput = document.getElementById('ttsFailTemplateInput');
    const ttsStyleEl = document.getElementById('ttsStyleSelect');
    const ttsMp3El = document.getElementById('ttsMp3Select');
    const ttsApiKeyEl = document.getElementById('ttsApiKey');
    const ttsApiSecretEl = document.getElementById('ttsApiSecret');
    const ttsApiVoiceEl = document.getElementById('ttsApiVoice');
    const ttsApiTemplateEl = document.getElementById('ttsApiTemplate');
    
    const ttsFailModeEl = document.getElementById('ttsFailModeSelect');
    const mechFailSelect = document.getElementById('ttsFailMechSelect');

    const invalidDayInput = document.getElementById('ttsInvalidDayMsg');
    const invalidTimeInput = document.getElementById('ttsInvalidTimeMsg');

    // Toggles
    const ttsSuccessVoiceEnabled = document.getElementById('ttsSuccessVoiceEnabled');
    const ttsFailVoiceEnabled = document.getElementById('ttsFailVoiceEnabled');
    const ttsInvalidDayVoiceEnabled = document.getElementById('ttsInvalidDayVoiceEnabled');
    const ttsInvalidTimeVoiceEnabled = document.getElementById('ttsInvalidTimeVoiceEnabled');

    if (toggleEl) localStorage.setItem('kiosk_voice_enabled', toggleEl.checked);
    if (sensEl) localStorage.setItem('kiosk_sensitivity', sensEl.value);
    if (camEl && camEl.value) localStorage.setItem('kiosk_camera_id', camEl.value);
    
    if (ttsModeEl) localStorage.setItem('kiosk_tts_mode', ttsModeEl.value);
    if (ttsInput) localStorage.setItem('kiosk_tts_template', ttsInput.value);
    
    if (ttsFailModeEl) localStorage.setItem('kiosk_tts_fail_mode', ttsFailModeEl.value);
    if (ttsFailInput) localStorage.setItem('kiosk_tts_fail_template', ttsFailInput.value);
    if (mechFailSelect) localStorage.setItem('kiosk_mech_fail_type', mechFailSelect.value);

    if (invalidDayInput) localStorage.setItem('kiosk_invalid_day_msg', invalidDayInput.value);
    if (invalidTimeInput) localStorage.setItem('kiosk_invalid_time_msg', invalidTimeInput.value);
    
    if (ttsSuccessVoiceEnabled) localStorage.setItem('kiosk_success_voice_enabled', ttsSuccessVoiceEnabled.checked);
    if (ttsFailVoiceEnabled) localStorage.setItem('kiosk_fail_voice_enabled', ttsFailVoiceEnabled.checked);
    if (ttsInvalidDayVoiceEnabled) localStorage.setItem('kiosk_invalid_day_voice_enabled', ttsInvalidDayVoiceEnabled.checked);
    if (ttsInvalidTimeVoiceEnabled) localStorage.setItem('kiosk_invalid_time_voice_enabled', ttsInvalidTimeVoiceEnabled.checked);
    
    if (ttsStyleEl) localStorage.setItem('kiosk_tts_style', ttsStyleEl.value);
    if (ttsMp3El) localStorage.setItem('kiosk_tts_mp3', ttsMp3El.value);
    if (ttsApiKeyEl) localStorage.setItem('kiosk_tts_api_key', ttsApiKeyEl.value);
    if (ttsApiSecretEl) localStorage.setItem('kiosk_tts_api_secret', ttsApiSecretEl.value);
    if (ttsApiVoiceEl) localStorage.setItem('kiosk_tts_api_voice', ttsApiVoiceEl.value);
    if (ttsApiTemplateEl) localStorage.setItem('kiosk_tts_api_template', ttsApiTemplateEl.value);
}

async function populateCameraList() {
    const camSelect = document.getElementById('cameraSelect');
    if (!camSelect) return;
    
    try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
            camSelect.innerHTML = '<option value="">이 브라우저에서는 카메라 설정을 지원하지 않습니다.</option>';
            return;
        }

        let devices = await navigator.mediaDevices.enumerateDevices();
        let videoDevices = devices.filter(device => device.kind === 'videoinput');
        
        if (videoDevices.length > 0 && !videoDevices[0].label) {
            try {
                const tempStream = await navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720, focusMode: { ideal: "continuous" } } });
                tempStream.getTracks().forEach(t => t.stop()); 
                devices = await navigator.mediaDevices.enumerateDevices();
                videoDevices = devices.filter(device => device.kind === 'videoinput');
            } catch(permErr) {
                console.warn("Permission error", permErr);
            }
        }
        
        camSelect.innerHTML = '';
        if (videoDevices.length === 0) {
            camSelect.innerHTML = '<option value="">연결된 카메라를 찾을 수 없습니다.</option>';
            return;
        }
        
        const savedCam = localStorage.getItem('kiosk_camera_id');
        
        videoDevices.forEach((device, index) => {
            const option = document.createElement('option');
            option.value = device.deviceId;
            option.text = device.label || `카메라 ${index + 1}`;
            if (device.deviceId === savedCam) {
                option.selected = true;
            }
            camSelect.appendChild(option);
        });
        
    } catch(e) {
        camSelect.innerHTML = '<option value="">카메라 장치를 불러오는데 실패했습니다.</option>';
    }
}

function toggleFullScreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
            alert(`전체화면 전환 중 오류가 발생했습니다: ${err.message}`);
        });
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
    }
}

async function checkForceLoginRules(memberId) {
    const member = adminMembers.find(m => m.id === memberId);
    if (!member) return true;
    
    try {
        const tRes = await fetch(getFetchUrl('timetable'));
        const tData = await tRes.json();
        const timetableData = Object.keys(tData).length > 0 ? tData : {
            '한식기능사': [1, 3], '양식기능사': [2, 4], '일식기능사': [2, 4], '중식기능사': [2, 4],
            '제과기능사': [1, 3], '제빵기능사': [2, 4], '제과제빵기능사': [1, 2, 3, 4], '복어기능사': [5],
            '산업기사': [5], '가정요리': [2, 4], '브런치': [5]
        };

        const courses = member.course ? member.course.split(',').map(c => c.trim().replace(/\([^)]*\)/g, '').trim()) : [];
        const times = member.timeSlot ? member.timeSlot.split(',').map(c => c.trim()) : [];
        
        let parsedCourses = courses.map((c, idx) => {
            let tStr = times[idx] || times[0] || "";
            let mins = -1;
            if (tStr.includes(':')) {
                let p = tStr.split(':');
                mins = parseInt(p[0]) * 60 + parseInt(p[1]);
            }
            return { name: c, timeStr: tStr, mins: mins };
        });

        const today = new Date();
        const dayOfWeek = today.getDay();
        const currentMins = today.getHours() * 60 + today.getMinutes();

        let hasClassToday = false;
        let allowedDaysSet = new Set();
        let validTime = false;

        for (const c of parsedCourses) {
            if (timetableData[c.name]) {
                timetableData[c.name].forEach(d => allowedDaysSet.add(d));
                if (timetableData[c.name].includes(dayOfWeek)) {
                    hasClassToday = true;
                }
            }
            
            if (c.mins > 0) {
                if (currentMins <= c.mins + 15) {
                    validTime = true;
                }
            } else {
                validTime = true;
            }
        }

        if (allowedDaysSet.size > 0 && !hasClassToday) {
            alert('규칙에 맞지않아 로그인이 안됩니다.\n(지정된 수업 요일이 아닙니다)');
            return false;
        }

        if (parsedCourses.length > 0 && !validTime) {
            alert('규칙에 맞지않아 로그인이 안됩니다.\n(예약된 수업 시간이 아닙니다)');
            return false;
        }

        // 결재 주기 설정 (미납) 체크
        if (typeof window.calculateRedBoxesForMonth === 'function') {
            if (typeof window.loadCycleSettings === 'function') await window.loadCycleSettings();
            
            const [aRes, pRes] = await Promise.all([
                fetch(getFetchUrl('attendance')),
                fetch(getFetchUrl('payments'))
            ]);
            const attendanceData = await aRes.json();
            const paymentsData = await pRes.json();
            
            const y = today.getFullYear();
            const m = today.getMonth() + 1;

            for (const c of parsedCourses) {
                const stats = window.calculateRedBoxesForMonth(member, y, m, attendanceData, c.name, {});
                
                let forcedUnpaidCount = 0;
                if (stats && stats.eighthDays && stats.eighthDays.length > 0 && stats.hasAnyAttendance && !stats.isSimulated) {
                    const isPaidBadge = paymentsData.some(p =>
                        String(p.memberId) === String(member.id) &&
                        String(p.year) === String(y) &&
                        String(p.month) === String(m) &&
                        p.status === 'paid' &&
                        (!p.course || p.course === 'null' || p.course === 'undefined' || p.course === '' || p.course.includes(c.name) || c.name.includes(p.course))
                    );
                    
                    if (!isPaidBadge) {
                        stats.eighthDays.forEach(d => {
                            if (!isNaN(parseInt(d)) && Number(d) > 0) forcedUnpaidCount++;
                        });
                    }
                }
                
                if (forcedUnpaidCount > 0) {
                    alert('규칙에 맞지않아 로그인이 안됩니다.\n(결재 주기가 지났거나 수강료가 미납 상태입니다)');
                    return false;
                }
            }
        }
        
        return true;
    } catch(e) {
        console.error("Rule check error:", e);
        return true; 
    }
}

window.forceLogin = async function(memberId, course) {
    if (!confirm('해당 학생을 오늘 날짜로 강제 출석(로그인) 처리하시겠습니까?')) return;
    
    const isValid = await checkForceLoginRules(memberId);
    if (!isValid) return;
    
    const today = new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().split('T')[0];
    try {
        const res = await fetch(getFetchUrl('attendance', true), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ memberId, date: today, status: 'present', course: course || 'ALL' })
        });
        if (res.ok) {
            localStorage.removeItem('sejong_attendance_sync');
            fetchMembers();
        }
    } catch (e) {
        alert('처리 중 오류가 발생했습니다.');
    }
};

window.forceLogout = async function(memberId, course) {
    if (!confirm('해당 학생의 오늘 출석 기록을 강제로 삭제(로그아웃) 하시겠습니까?')) return;
    const today = new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().split('T')[0];
    try {
        const res = await fetch(getFetchUrl('attendance/batch', true), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ memberId, dates: [today], status: 'unchecked', course: 'ALL' })
        });
        if (res.ok) {
            localStorage.removeItem('sejong_attendance_sync');
            fetchMembers();
        }
    } catch (e) {
        alert('처리 중 오류가 발생했습니다.');
    }
};
