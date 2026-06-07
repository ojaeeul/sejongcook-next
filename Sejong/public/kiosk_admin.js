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
async function loadFaceModels() {
    if (modelsLoaded || modelsLoading) return;
    modelsLoading = true;
    
    try {
        const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/';
        try { await faceapi.tf.setBackend('webgl'); } catch (e) { console.log('WebGL fallback'); }

        await Promise.all([
            faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
            faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
            faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
        ]);
        modelsLoaded = true;
        console.log("Face API Models loaded.");
    } catch (e) {
        console.error("Face API load error:", e);
    }
}

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
        alert("AI 얼굴 인식 엔진을 아직 불러오고 있습니다. 잠시 후 다시 시도해주세요.");
        return;
    }
    
    const member = adminMembers.find(m => String(m.id) === String(memberId));
    if (!member) return;
    
    const img = new Image();
    img.src = src;
    img.onload = async () => {
        alert("사진에서 얼굴을 분석 중입니다... 잠시만 기다려주세요.");
        
        try {
            const detection = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor();
            
            if (!detection) {
                alert("사진에서 얼굴을 명확히 인식할 수 없습니다. 정면이 잘 보이는 사진으로 다시 시도해주세요.");
                return;
            }
            
            // Scale down
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
    modal.style.display = 'flex';
    
    try {
        webcamStream = await navigator.mediaDevices.getUserMedia({ video: true });
        video.srcObject = webcamStream;
    } catch (e) {
        alert("카메라에 접근할 수 없거나 권한이 없습니다.");
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
    const isVoiceEnabled = localStorage.getItem('kiosk_voice_enabled') === 'true';
    const sensitivity = localStorage.getItem('kiosk_sensitivity') || '0.65';
    
    const toggleEl = document.getElementById('voiceToggle');
    const sensEl = document.getElementById('sensitivitySelect');
    
    if (toggleEl) toggleEl.checked = isVoiceEnabled;
    if (sensEl) sensEl.value = sensitivity;
}

function saveSettings() {
    const toggleEl = document.getElementById('voiceToggle');
    const sensEl = document.getElementById('sensitivitySelect');
    const camEl = document.getElementById('cameraSelect');
    
    if (toggleEl) localStorage.setItem('kiosk_voice_enabled', toggleEl.checked);
    if (sensEl) localStorage.setItem('kiosk_sensitivity', sensEl.value);
    if (camEl && camEl.value) localStorage.setItem('kiosk_camera_id', camEl.value);
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
                const tempStream = await navigator.mediaDevices.getUserMedia({ video: true });
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
