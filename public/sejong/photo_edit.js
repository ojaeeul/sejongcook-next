const API_BASE = '/api/sejong';
let currentMember = null;
let cropper = null;
let faceModelsLoaded = false;

document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const memberId = urlParams.get('id');

    if (!memberId) {
        document.getElementById('errorCard').style.display = 'block';
        return;
    }

    // Load AI models
    loadFaceModels();

    // Fetch member data
    try {
        const res = await fetch(`${API_BASE}/members?t=` + Date.now());
        const members = await res.json();
        currentMember = members.find(m => String(m.id) === String(memberId));

        if (!currentMember) {
            document.getElementById('errorCard').style.display = 'block';
            return;
        }

        // Show auth info
        document.getElementById('memberName').innerText = currentMember.name;
        document.getElementById('memberCourse').innerText = currentMember.course || '과목 없음';
        
        if (currentMember.photo) {
            document.getElementById('currentPhoto').src = currentMember.photo;
            document.getElementById('currentPhoto').style.display = 'block';
            document.getElementById('noPhotoIcon').style.display = 'none';
            document.getElementById('editCurrentBtn').style.display = 'flex';
        } else {
            document.getElementById('currentPhoto').style.display = 'none';
            document.getElementById('noPhotoIcon').style.display = 'flex';
            document.getElementById('editCurrentBtn').style.display = 'none';
        }

        document.getElementById('userInfoCard').style.display = 'block';

    } catch (e) {
        console.error(e);
        alert("데이터를 불러오는 중 오류가 발생했습니다.");
    }
});

window.editCurrentPhoto = function() {
    if (currentMember && currentMember.photo) {
        openCropper(currentMember.photo);
    }
};

// Load Face API Models
async function loadFaceModels() {
    try {
        await Promise.all([
            faceapi.nets.tinyFaceDetector.loadFromUri('https://cdn.jsdelivr.net/gh/vladmandic/face-api/model/'),
            faceapi.nets.faceLandmark68Net.loadFromUri('https://cdn.jsdelivr.net/gh/vladmandic/face-api/model/'),
            faceapi.nets.faceRecognitionNet.loadFromUri('https://cdn.jsdelivr.net/gh/vladmandic/face-api/model/')
        ]);
        faceModelsLoaded = true;
        console.log("Face models loaded");
    } catch (e) {
        console.error("Model load error", e);
        alert("얼굴 인식 엔진 로드 실패. 앱을 다시 실행해주세요.");
    }
}

// Handle File Select
document.getElementById('fileInput').addEventListener('change', function(e) {
    if (e.target.files && e.target.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            openCropper(e.target.result);
        };
        reader.readAsDataURL(e.target.files[0]);
    }
});

function openCropper(imageSrc) {
    const imageToCrop = document.getElementById('imageToCrop');
    imageToCrop.src = imageSrc;
    document.getElementById('cropperModal').style.display = 'flex';

    if (cropper) {
        cropper.destroy();
    }

    cropper = new Cropper(imageToCrop, {
        aspectRatio: 1, // 1:1 ratio for circle
        viewMode: 1,
        dragMode: 'move',
        autoCropArea: 0.8,
        restore: false,
        guides: false,
        center: false,
        highlight: false,
        cropBoxMovable: false,
        cropBoxResizable: false,
        toggleDragModeOnDblclick: false,
    });
}

function closeCropper() {
    document.getElementById('cropperModal').style.display = 'none';
    document.getElementById('fileInput').value = '';
    if (cropper) cropper.destroy();
}

let currentFilter = 'none';

window.applyFilter = function(filterStr, btnElement) {
    currentFilter = filterStr;
    const cropperImage = document.querySelector('.cropper-view-box img');
    if (cropperImage) {
        cropperImage.style.filter = filterStr;
    }
    
    // Highlight selected button
    document.querySelectorAll('.preset-btn').forEach(btn => {
        btn.style.background = '#1e293b';
        btn.style.borderColor = '#334155';
        btn.style.color = '#cbd5e1';
    });
    if (btnElement) {
        btnElement.style.background = '#3b82f6';
        btnElement.style.borderColor = '#60a5fa';
        btnElement.style.color = 'white';
    }
};

function renderPresets() {
    const createBtn = (containerId, label, filterStr) => {
        const btn = document.createElement('button');
        btn.className = 'preset-btn';
        btn.style.cssText = 'padding:6px 12px; font-size:0.8rem; border-radius:6px; border:1px solid #334155; background:#1e293b; color:#cbd5e1; cursor:pointer; white-space:nowrap; transition:all 0.2s;';
        btn.innerText = label;
        btn.onclick = () => applyFilter(filterStr, btn);
        document.getElementById(containerId).appendChild(btn);
    };

    // 1. 뽀샵 (10)
    for (let i = 1; i <= 10; i++) {
        const b = 100 + (i * 3);
        const c = 100 + (i * 2);
        const blur = i * 0.15;
        createBtn('presetBoshop', `뽀샵 ${i}단계`, `brightness(${b}%) contrast(${c}%) blur(${blur}px)`);
    }

    // 2. 밝기 (10)
    for (let i = 1; i <= 10; i++) {
        createBtn('presetBrightness', `밝기 +${i}`, `brightness(${100 + (i * 5)}%)`);
    }

    // 3. 애니 (10)
    for (let i = 1; i <= 10; i++) {
        const s = 100 + (i * 15);
        const c = 100 + (i * 10);
        createBtn('presetAnime', `애니 ${i}단계`, `saturate(${s}%) contrast(${c}%)`);
    }

    // 4. 수채화 (20)
    for (let i = 1; i <= 20; i++) {
        const blur = 0.5 + (i * 0.1);
        const s = 120 + (i * 5);
        const b = 105 + (i * 1);
        createBtn('presetWatercolor', `수채화 ${i}`, `blur(${blur}px) saturate(${s}%) brightness(${b}%)`);
    }

    // 5. 머리 보정 (10)
    for (let i = 1; i <= 10; i++) {
        const deg = i * 36;
        createBtn('presetHair', `헤어톤 ${i}`, `hue-rotate(${deg}deg) saturate(150%)`);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    renderPresets();
});

window.showFortune = function() {
    if (!currentMember) return;
    const name = currentMember.name;
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

async function cropAndSave() {
    if (!cropper) return;
    if (!faceModelsLoaded) {
        alert("얼굴 인식 엔진이 아직 로드되지 않았습니다. 잠시만 기다려주세요.");
        return;
    }

    showLoading("얼굴 분석 중...");

    try {
        // Get cropped canvas
        const rawCanvas = cropper.getCroppedCanvas({
            width: 400,
            height: 400
        });
        
        // Apply filter to a new canvas if needed
        const canvas = document.createElement('canvas');
        canvas.width = 400;
        canvas.height = 400;
        const ctx = canvas.getContext('2d');
        
        if (currentFilter !== 'none') {
            ctx.filter = currentFilter;
        }
        ctx.drawImage(rawCanvas, 0, 0);

        const croppedDataUrl = canvas.toDataURL('image/jpeg', 0.8);

        // Analyze face with face-api.js
        const img = new Image();
        img.src = croppedDataUrl;
        await new Promise(r => img.onload = r);

        const detection = await faceapi.detectSingleFace(img, new faceapi.TinyFaceDetectorOptions())
            .withFaceLandmarks()
            .withFaceDescriptor();

        if (!detection) {
            hideLoading();
            alert("⚠️ 사진에서 얼굴을 찾을 수 없습니다. 정면 얼굴이 잘 보이는 밝은 사진을 사용해 주세요.");
            return;
        }

        // Save to Server
        currentMember.photo = croppedDataUrl;
        currentMember.faceDescriptor = Array.from(detection.descriptor);

        showLoading("저장 중...");

        const res = await fetch(`${API_BASE}/members`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(currentMember)
        });

        if (!res.ok) throw new Error("저장 실패");

        // Success
        hideLoading();
        closeCropper();
        document.getElementById('currentPhoto').src = croppedDataUrl;
        document.getElementById('currentPhoto').style.display = 'block';
        document.getElementById('noPhotoIcon').style.display = 'none';
        alert("🎉 사진이 성공적으로 등록되었습니다!");

    } catch (e) {
        console.error(e);
        hideLoading();
        alert("오류가 발생했습니다: " + e.message);
    }
}

function showLoading(text) {
    document.getElementById('loadingText').innerText = text;
    document.getElementById('loadingOverlay').style.display = 'flex';
}

function hideLoading() {
    document.getElementById('loadingOverlay').style.display = 'none';
}
