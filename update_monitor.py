import re
import os

html_file = '/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/SejongAttendance/public/monitor.html'
js_file = '/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/SejongAttendance/public/monitor.js'

# --- 1. UPDATE monitor.html ---
with open(html_file, 'r', encoding='utf-8') as f:
    html_content = f.read()

# Make CSS rules apply to register_camera mode as well
html_content = html_content.replace('#workspace.mode-face_only', '#workspace.mode-face_only, #workspace.mode-register_camera')

# Change button
html_content = html_content.replace('onclick="capturePhoto()">얼굴 촬영<br>및 출석</button>', 'onclick="startFaceScan()">얼굴 스캔<br>시작</button>')

with open(html_file, 'w', encoding='utf-8') as f:
    f.write(html_content)


# --- 2. UPDATE monitor.js ---
with open(js_file, 'r', encoding='utf-8') as f:
    js_content = f.read()

# Add mode to switchMode
switch_mode_old = """        else if (mode === 'register') {
            setupUI("신규 얼굴 등록", "번호 입력 후 얼굴을 촬영하세요", true, false, true);
            if (mirrorSection) mirrorSection.style.opacity = '1';
            if (faceSubmitBtn) faceSubmitBtn.style.display = 'block';
            if (mainSubmitBtn) mainSubmitBtn.style.display = 'none';
            startCamera();
            loadFaceModels(); // Preload ML
        }"""
switch_mode_new = """        else if (mode === 'register') {
            setupUI("신규 얼굴 등록", "번호 8자리 입력 후 스캔 시작을 누르세요", true, false, true);
            if (mirrorSection) mirrorSection.style.opacity = '1';
            if (faceSubmitBtn) faceSubmitBtn.style.display = 'block';
            if (mainSubmitBtn) mainSubmitBtn.style.display = 'none';
            startCamera();
            loadFaceModels(); // Preload ML
        }
        else if (mode === 'register_camera') {
            setupUI("얼굴 정밀 스캔", "카메라를 응시하세요. 100+ 다중 초점이 분석합니다.", false, true, true);
            if (mirrorSection) mirrorSection.style.opacity = '1';
            startCamera();
            startAutoRegistrationLoop();
        }"""
js_content = js_content.replace(switch_mode_old, switch_mode_new)

# Stop the loop when going to home
home_mode_old = """    if (mode === 'home') {
        workspace.className = '';
        if (homeScreen) homeScreen.style.display = 'flex';
        if (workspace) workspace.style.display = 'none';
        stopCamera();
        stopAutoDetectionLoop();
    }"""
home_mode_new = """    if (mode === 'home') {
        workspace.className = '';
        if (homeScreen) homeScreen.style.display = 'flex';
        if (workspace) workspace.style.display = 'none';
        stopCamera();
        stopAutoDetectionLoop();
        stopAutoRegistrationLoop();
    }"""
js_content = js_content.replace(home_mode_old, home_mode_new)

# Add new functions
new_functions = """
// ---------------------------------------------------------
// Auto Registration Logic
// ---------------------------------------------------------
let autoRegistrationLoopId = null;
let registerProgress = 0;
let isRegistering = false;

async function startFaceScan() {
    if (currentInput.length !== 8) {
        showStatus("먼저 뒷번호 8자리를 입력해주세요.", "red");
        return;
    }
    if (!modelsLoaded) {
        showStatus("AI 엔진 대기중... 잠시 후 다시 시도해주세요.", "orange");
        return;
    }
    switchMode('register_camera');
}

function stopAutoRegistrationLoop() {
    if (autoRegistrationLoopId) {
        cancelAnimationFrame(autoRegistrationLoopId);
        autoRegistrationLoopId = null;
    }
    registerProgress = 0;
    isRegistering = false;
    clearCanvas();
}

function drawHyperFocusUI(detection) {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (!detection) return;

    // Rescale to canvas
    const dims = faceapi.matchDimensions(canvas, video, true);
    const resized = faceapi.resizeResults(detection, dims);

    const landmarks = resized.landmarks.positions;
    
    // Draw cyberpunk 100+ crosshairs
    ctx.strokeStyle = "rgba(74, 222, 128, 0.4)";
    ctx.lineWidth = 1;

    // Connect some landmarks to create a mesh
    ctx.beginPath();
    for (let i = 0; i < landmarks.length - 1; i++) {
        ctx.moveTo(landmarks[i].x, landmarks[i].y);
        ctx.lineTo(landmarks[i+1].x, landmarks[i+1].y);
    }
    ctx.stroke();

    // Draw crosshairs on every landmark point + some random offsets
    ctx.strokeStyle = "#4ade80"; // Bright green
    landmarks.forEach(pt => {
        const x = pt.x;
        const y = pt.y;
        
        ctx.beginPath();
        ctx.moveTo(x - 5, y);
        ctx.lineTo(x + 5, y);
        ctx.moveTo(x, y - 5);
        ctx.lineTo(x, y + 5);
        ctx.stroke();
    });

    // Add extra scanning lines across the bounding box
    const box = resized.detection.box;
    ctx.strokeStyle = "rgba(74, 222, 128, 0.7)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.rect(box.x, box.y, box.width, box.height);
    ctx.stroke();
    
    // Scanning laser
    const time = Date.now();
    const scanY = box.y + ((time / 10) % box.height);
    ctx.strokeStyle = "#22c55e";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(box.x, scanY);
    ctx.lineTo(box.x + box.width, scanY);
    ctx.stroke();

    // Progress bar at the bottom of the box
    ctx.fillStyle = "rgba(0,0,0,0.5)";
    ctx.fillRect(box.x, box.y + box.height + 10, box.width, 10);
    ctx.fillStyle = "#4ade80";
    ctx.fillRect(box.x, box.y + box.height + 10, box.width * (registerProgress / 30), 10);
    
    ctx.fillStyle = "#4ade80";
    ctx.font = "16px 'Inter', sans-serif";
    ctx.fillText("AI 스캔 진행률: " + Math.round((registerProgress / 30) * 100) + "%", box.x, box.y + box.height + 40);
}

async function autoRegisterFace() {
    isRegistering = true;
    showStatus("사진 촬영 및 얼굴 특징 추출 완료! 등록 중입니다...", "#3b82f6");
    
    // Shutter effect
    if (shutter) shutter.style.opacity = '1';
    setTimeout(() => { if (shutter) shutter.style.opacity = '0'; }, 150);

    try {
        const photoDataUrl = capturePrettyFrame();
        
        // Final detection for descriptor
        const [res, detection] = await Promise.all([
            fetch(getFetchUrl('members') + '&t=' + Date.now()),
            faceapi.detectSingleFace(video).withFaceLandmarks().withFaceDescriptor()
        ]);

        const rawMembers = await res.json();
        const members = Array.isArray(rawMembers) ? rawMembers.filter(m => !['delete', 'trash', 'hold', 'completed'].includes(m.status)) : [];
        const member = members.find(m => m.phone && m.phone.replace(/-/g, '').endsWith(currentInput));

        if (!member) {
            showStatus("뒷번호 8자리와 일치하는 수강생 대장 회원이 없습니다.", "red");
            setTimeout(() => switchMode('home'), 3000);
            return;
        }

        if (!detection) {
            showStatus("얼굴이 명확히 인식되지 않았습니다. 다시 시도해주세요.", "red");
            isRegistering = false;
            registerProgress = 0;
            return;
        }

        showStatus("신규 얼굴 데이터를 서버에 등록 중입니다...", "#059669");

        member.photo = photoDataUrl;
        member.faceDescriptor = Array.from(detection.descriptor);

        await fetch(getFetchUrl('members', true), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(member)
        });

        // 🟢 사용자 피드백 반영: 출석 처리는 하지 않음. 순수 등록만 완료!
        showStatus("얼굴 등록 완료! 출석 메뉴에서 별도로 출석해주세요.", "#059669");
        showFaceOverlay(photoDataUrl, member.name);
        
        setTimeout(() => switchMode('home'), 3500);
    } catch (e) {
        console.error('Registration Error:', e);
        showStatus(`저장 오류! (${e.message || '통신 실패'})`, "red");
        setTimeout(() => switchMode('home'), 3000);
    }
}

async function startAutoRegistrationLoop() {
    if (video.paused || video.ended || currentMode !== 'register_camera' || isRegistering) {
        autoRegistrationLoopId = requestAnimationFrame(startAutoRegistrationLoop);
        return;
    }

    try {
        const detection = await faceapi.detectSingleFace(video, new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.5 })).withFaceLandmarks();
        
        drawHyperFocusUI(detection);

        if (detection) {
            registerProgress++;
            if (registerProgress >= 30) { // ~2 seconds of stable detection
                stopAutoRegistrationLoop(); // Stop loop
                await autoRegisterFace();
                return;
            }
        } else {
            // Decay progress if face lost
            if (registerProgress > 0) registerProgress--;
        }
    } catch (e) {
        console.error("Auto registration loop error:", e);
    }

    if (currentMode === 'register_camera' && !isRegistering) {
        autoRegistrationLoopId = requestAnimationFrame(startAutoRegistrationLoop);
    }
}

// Ensure clearCanvas is available
function clearCanvas() {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}
"""

js_content = js_content + "\n" + new_functions

with open(js_file, 'w', encoding='utf-8') as f:
    f.write(js_content)
