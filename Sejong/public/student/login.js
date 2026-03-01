// Main Configuration
const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:8000/api'
    : 'https://thin-bags-listen.loca.lt/api';
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
        if (workspace) workspace.style.display = 'flex';

        if (mode === 'number') {
            setupUI("번호 출석", "휴대폰 뒷번호 8자리를 입력하세요", true, false, false);
            if (mirrorSection) mirrorSection.style.opacity = '0.2';
            stopCamera();
        }
        else if (mode === 'face_only') {
            setupUI("얼굴 출석", "카메라를 바라보고 아래 버튼을 누르세요", false, true, true);
            if (mirrorSection) mirrorSection.style.opacity = '1';
            startCamera();
        }
        else if (mode === 'register') {
            setupUI("신규 얼굴 등록", "번호 입력 후 얼굴을 촬영하세요", true, false, true);
            if (mirrorSection) mirrorSection.style.opacity = '1';
            if (faceSubmitBtn) faceSubmitBtn.style.display = 'block';
            if (mainSubmitBtn) mainSubmitBtn.style.display = 'none';
            startCamera();
        }
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
    await processAttendance(currentInput);
}

async function recognizeAndAttend() {
    showStatus("얼굴을 인식하는 중입니다...", "#94a3b8");
    if (shutter) shutter.style.opacity = '1';
    setTimeout(() => { if (shutter) shutter.style.opacity = '0'; }, 150);

    try {
        const context = canvas.getContext('2d');
        context.drawImage(video, 0, 0, 640, 480);
        const captureData = canvas.toDataURL('image/jpeg', 0.5);

        const res = await fetch(`${API_BASE}/members?t=` + Date.now());
        const members = await res.json();

        // In a real app we'd compare base64 here. 
        // For this kiosk, we'll suggest using Registration if they aren't recognized.
        showStatus("매칭되는 회원을 찾는 중...", "#059669");

        // This is where real Face API logic would go.
        // For now, we'll inform them this requires an advanced matching library.
        setTimeout(() => {
            showStatus("인식 실패: 얼굴을 먼저 등록하거나 번호로 등록해주세요.", "orange");
        }, 1500);
    } catch (e) {
        showStatus("인식 시스템 오류!", "red");
    }
}

async function capturePhoto() {
    if (currentInput.length !== 8) {
        showStatus("먼저 번호 8자리를 입력해주세요.", "red");
        return;
    }

    showStatus("사진 촬영 및 등록 중...", "#4ade80");
    if (shutter) shutter.style.opacity = '1';
    setTimeout(() => { if (shutter) shutter.style.opacity = '0'; }, 150);

    try {
        const context = canvas.getContext('2d');
        context.drawImage(video, 0, 0, 640, 480);
        const photoDataUrl = canvas.toDataURL('image/jpeg', 0.7);

        const res = await fetch(`${API_BASE}/members?t=` + Date.now());
        const members = await res.json();
        const member = members.find(m => m.phone && m.phone.replace(/-/g, '').endsWith(currentInput));

        if (!member) {
            showStatus("일치하는 회원이 없습니다.", "red");
            return;
        }

        member.photo = photoDataUrl;
        await fetch(`${API_BASE}/members`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(member)
        });

        await processAttendance(currentInput, photoDataUrl);
    } catch (e) {
        showStatus("저장 오류!", "red");
    }
}

async function processAttendance(inputNum, overridePhoto = null) {
    try {
        const res = await fetch(`${API_BASE}/members?t=` + Date.now());
        const members = await res.json();
        const member = members.find(m => m.phone && m.phone.replace(/-/g, '').endsWith(inputNum));

        if (!member) {
            showStatus("등록되지 않은 번호입니다.", "red");
            return;
        }

        const today = new Date().toISOString().split('T')[0];
        const postRes = await fetch(`${API_BASE}/attendance`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ memberId: member.id, date: today, status: 'present' })
        });

        if (postRes.ok) {
            showStatus(`${member.name}님, 등원 완료!`, "#3b82f6");
            showFaceOverlay(overridePhoto || member.photo, member.name);
            setTimeout(() => switchMode('home'), 2500);
        }
    } catch (e) {
        showStatus("통신 장애!", "red");
    }
}

function addNum(num) { if (currentInput.length < 8) { currentInput += num; updateDisplay(); } }
function clearNum() { currentInput = ""; updateDisplay(); }
function updateDisplay() { if (inputDisplay) inputDisplay.textContent = currentInput; }

async function startCamera() {
    try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720 } });
        if (video) video.srcObject = stream;
    } catch (e) { showStatus("카메라 에러", "red"); }
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
