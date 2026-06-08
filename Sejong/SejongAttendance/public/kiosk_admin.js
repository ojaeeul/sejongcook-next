// API Base
function getFetchUrl(endpoint, isPost = false) {
    const url = `/api/sejong/${endpoint}`;
    return isPost ? url : url + (url.includes('?') ? '&' : '?') + `t=${Date.now()}`;
}

let adminMembers = [];
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
        
        const infoHtml = `
            <div>
                <div style="font-weight:700; font-size:1.15rem; color:#0f172a; margin-bottom:4px;">
                    ${m.name} <span style="font-size:0.95rem; color:#64748b; font-weight:400;">(${m.phone || '번호없음'})</span>
                </div>
                <div style="font-size:0.9rem; color:#475569; margin-bottom:4px;">${m.course || '과목 없음'}</div>
                <div style="font-weight:700; font-size: 0.9rem; ${hasFace ? 'color:#059669;' : 'color:#94a3b8;'}">
                    ${hasFace ? '<span class="material-icons" style="vertical-align:middle; font-size:16px;">check_circle</span> 등록 완료' : '<span class="material-icons" style="vertical-align:middle; font-size:16px;">cancel</span> 사진 미등록'}
                </div>
            </div>
        `;
        
        const actionHtml = hasFace ? `
            <div style="display: flex; gap: 8px; flex-wrap: wrap; justify-content: flex-end; margin-top: 10px;">
                <button class="btn btn-danger" onclick="deleteFace('${m.id}')">
                    <span class="material-icons" style="font-size:18px;">delete_sweep</span> 개인 사진 초기화
                </button>
                <button class="btn btn-primary" onclick="autoCorrectFace('${m.id}')">
                    <span class="material-icons" style="font-size:18px;">face_retouching_natural</span> 얼굴자동보정
                </button>
                <button class="btn" style="background:#f43f5e; color:white;" onclick="animeFace('${m.id}')">
                    <span class="material-icons" style="font-size:18px;">auto_awesome</span> 애니로등록해줘
                </button>
                <button class="btn" style="background:#8b5cf6; color:white;" onclick="faceReading('${m.id}')">
                    <span class="material-icons" style="font-size:18px;">psychology</span> AI 관상보기
                </button>
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
            
            await fetch(getFetchUrl('members', true), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(member)
            });
            
            alert(`${member.name}님의 사진 등록이 완료되었습니다.`);
            renderList();
        } catch(error) {
            console.error("Registration error:", error);
            alert("사진 분석 중 오류가 발생했습니다.");
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
    const readings = [
        `[AI 관상 분석] ${name}님은 요리에 천부적인 재능이 있는 관상입니다! 미래의 미슐랭 3스타 셰프가 될 상이네요.`,
        `[AI 관상 분석] ${name}님은 칼질을 할 때 손목 스냅이 예술일 관상입니다. 재료들이 알아서 썰리겠어요.`,
        `[AI 관상 분석] ${name}님은 미각이 아주 예민하여 간을 기가 막히게 맞출 관상입니다. 장금이가 울고 가겠네요.`,
        `[AI 관상 분석] ${name}님은 수업에 절대 지각하지 않을 아주 성실하고 모범적인 관상입니다!`,
        `[AI 관상 분석] ${name}님은 계량스푼 없이도 1g의 오차 없이 소금을 뿌리는 '절대 손맛'을 가진 관상입니다.`
    ];
    const r = readings[Math.floor(Math.random() * readings.length)];
    alert(r);
};

// ---------------------------------------------------------
// Device Settings (Local Storage)
// ---------------------------------------------------------
function loadSettings() {
    const isVoiceEnabled = localStorage.getItem('kiosk_voice_enabled') !== 'false'; // default true
    const sensitivity = localStorage.getItem('kiosk_sensitivity') || '0.65';
    
    const ttsMode = localStorage.getItem('kiosk_tts_mode') || 'browser';
    
    const ttsTemplate = localStorage.getItem('kiosk_tts_template') || '{name}님 등원 완료되었습니다.';
    const ttsStyle = localStorage.getItem('kiosk_tts_style') || '1';
    
    const ttsMp3 = localStorage.getItem('kiosk_tts_mp3') || '1';
    
    const ttsApiKey = localStorage.getItem('kiosk_tts_api_key') || '';
    const ttsApiSecret = localStorage.getItem('kiosk_tts_api_secret') || '';
    const ttsApiVoice = localStorage.getItem('kiosk_tts_api_voice') || 'nara';
    const ttsApiTemplate = localStorage.getItem('kiosk_tts_api_template') || '{name}님 등원 완료되었습니다.';
    
    const toggleEl = document.getElementById('voiceToggle');
    const sensEl = document.getElementById('sensitivitySelect');
    
    const ttsModeEl = document.getElementById('ttsModeSelect');
    const ttsInput = document.getElementById('ttsTemplateInput');
    const ttsStyleEl = document.getElementById('ttsStyleSelect');
    const ttsMp3El = document.getElementById('ttsMp3Select');
    const ttsApiKeyEl = document.getElementById('ttsApiKey');
    const ttsApiSecretEl = document.getElementById('ttsApiSecret');
    const ttsApiVoiceEl = document.getElementById('ttsApiVoice');
    const ttsApiTemplateEl = document.getElementById('ttsApiTemplate');
    
    if (toggleEl) toggleEl.checked = isVoiceEnabled;
    if (sensEl) sensEl.value = sensitivity;
    
    if (ttsModeEl) ttsModeEl.value = ttsMode;
    if (ttsInput) ttsInput.value = ttsTemplate;
    if (ttsStyleEl) ttsStyleEl.value = ttsStyle;
    if (ttsMp3El) ttsMp3El.value = ttsMp3;
    if (ttsApiKeyEl) ttsApiKeyEl.value = ttsApiKey;
    if (ttsApiSecretEl) ttsApiSecretEl.value = ttsApiSecret;
    if (ttsApiVoiceEl) ttsApiVoiceEl.value = ttsApiVoice;
    if (ttsApiTemplateEl) ttsApiTemplateEl.value = ttsApiTemplate;
    
    if (window.toggleTtsModeUI) window.toggleTtsModeUI();
}

function saveSettings() {
    const toggleEl = document.getElementById('voiceToggle');
    const sensEl = document.getElementById('sensitivitySelect');
    const camEl = document.getElementById('cameraSelect');
    
    const ttsModeEl = document.getElementById('ttsModeSelect');
    const ttsInput = document.getElementById('ttsTemplateInput');
    const ttsStyleEl = document.getElementById('ttsStyleSelect');
    const ttsMp3El = document.getElementById('ttsMp3Select');
    const ttsApiKeyEl = document.getElementById('ttsApiKey');
    const ttsApiSecretEl = document.getElementById('ttsApiSecret');
    const ttsApiVoiceEl = document.getElementById('ttsApiVoice');
    const ttsApiTemplateEl = document.getElementById('ttsApiTemplate');
    
    if (toggleEl) localStorage.setItem('kiosk_voice_enabled', toggleEl.checked);
    if (sensEl) localStorage.setItem('kiosk_sensitivity', sensEl.value);
    if (camEl && camEl.value) localStorage.setItem('kiosk_camera_id', camEl.value);
    
    if (ttsModeEl) localStorage.setItem('kiosk_tts_mode', ttsModeEl.value);
    if (ttsInput) localStorage.setItem('kiosk_tts_template', ttsInput.value);
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
}
