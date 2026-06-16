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

let originalCanvas = null;
let currentFilteredCanvas = null;
let currentFaceData = null;

window.confirmCrop = function() {
    if (!cropper) return;
    
    // Get cropped area (400x400)
    originalCanvas = cropper.getCroppedCanvas({ width: 400, height: 400 });
    
    // Hide cropper, show edit modal
    document.getElementById('cropperModal').style.display = 'none';
    document.getElementById('editModal').style.display = 'flex';
    
    initEditor();
};

window.backToCrop = function() {
    document.getElementById('editModal').style.display = 'none';
    document.getElementById('cropperModal').style.display = 'flex';
};

async function initEditor() {
    const editCanvas = document.getElementById('editCanvas');
    const ctx = editCanvas.getContext('2d');
    editCanvas.width = 400;
    editCanvas.height = 400;
    ctx.drawImage(originalCanvas, 0, 0);
    currentFilteredCanvas = cloneCanvas(originalCanvas);
    
    document.getElementById('faceLoadingIndicator').style.display = 'block';

    if (!faceModelsLoaded) {
        await loadFaceModels();
    }

    // Detect face
    const imgUrl = originalCanvas.toDataURL('image/jpeg');
    const img = new Image();
    img.src = imgUrl;
    await new Promise(r => img.onload = r);

    const detection = await faceapi.detectSingleFace(img, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor();

    document.getElementById('faceLoadingIndicator').style.display = 'none';

    if (!detection) {
        alert("⚠️ 사진에서 얼굴을 찾지 못했습니다. 가발 합성 기능이 제한될 수 있습니다.");
    } else {
        currentFaceData = detection;
    }

    switchTab('basic');
}

// -----------------------------------------
// Filters & Canvas Manipulation
// -----------------------------------------
function cloneCanvas(oldCanvas) {
    const newCanvas = document.createElement('canvas');
    newCanvas.width = oldCanvas.width;
    newCanvas.height = oldCanvas.height;
    const context = newCanvas.getContext('2d');
    context.drawImage(oldCanvas, 0, 0);
    return newCanvas;
}

const FilterEngine = {
    applyBasic: function(baseCanvas, type, amount) {
        const c = cloneCanvas(baseCanvas);
        const ctx = c.getContext('2d');
        if (type === 'bw') {
            ctx.filter = 'grayscale(100%) contrast(1.2)';
        } else if (type === 'bright') {
            ctx.filter = `brightness(${100 + (amount * 10)}%)`;
        }
        ctx.clearRect(0, 0, c.width, c.height);
        ctx.drawImage(baseCanvas, 0, 0);
        return c;
    },
    
    applyBeauty: function(baseCanvas, intensity) {
        // Skin smoothing via Screen Blend + Blur
        const c = cloneCanvas(baseCanvas);
        const ctx = c.getContext('2d');
        const blurAmount = intensity * 1.5;
        const opacity = intensity * 0.15;
        
        ctx.globalAlpha = opacity;
        ctx.globalCompositeOperation = 'screen';
        ctx.filter = `blur(${blurAmount}px) saturate(1.2) brightness(1.1)`;
        ctx.drawImage(baseCanvas, 0, 0);
        
        // Reset
        ctx.globalAlpha = 1.0;
        ctx.globalCompositeOperation = 'source-over';
        ctx.filter = 'none';
        return c;
    },
    
    applyArt: function(baseCanvas, type, level) {
        const c = cloneCanvas(baseCanvas);
        const ctx = c.getContext('2d');
        
        if (type === 'anime') {
            // High saturation, contrast, then posterize
            ctx.filter = `saturate(${150 + level*20}%) contrast(${110 + level*5}%)`;
            ctx.clearRect(0, 0, c.width, c.height);
            ctx.drawImage(baseCanvas, 0, 0);
            
            const imgData = ctx.getImageData(0, 0, c.width, c.height);
            const data = imgData.data;
            const factor = 255 / (6 - level*0.2); // Posterize factor
            for (let i = 0; i < data.length; i += 4) {
                data[i] = Math.round(data[i] / factor) * factor;
                data[i+1] = Math.round(data[i+1] / factor) * factor;
                data[i+2] = Math.round(data[i+2] / factor) * factor;
            }
            ctx.putImageData(imgData, 0, 0);
        } else if (type === 'watercolor') {
            // Edges blur, color boost
            ctx.filter = `blur(${level*0.5}px) saturate(${130 + level*10}%) brightness(1.1)`;
            ctx.clearRect(0, 0, c.width, c.height);
            ctx.drawImage(baseCanvas, 0, 0);
            // Simulate color bleed
            ctx.globalAlpha = 0.5;
            ctx.globalCompositeOperation = 'multiply';
            ctx.drawImage(baseCanvas, 2, 2);
            ctx.globalAlpha = 1.0;
            ctx.globalCompositeOperation = 'source-over';
        }
        return c;
    },
    
    applyHair: function(baseCanvas, faceData, hairIndex, gender) {
        const c = cloneCanvas(baseCanvas);
        if (!faceData) return c; // Fallback if no face
        
        const ctx = c.getContext('2d');
        const landmarks = faceData.landmarks;
        const jawline = landmarks.getJawOutline();
        
        // Calculate head box
        const minX = Math.min(...jawline.map(p => p.x));
        const maxX = Math.max(...jawline.map(p => p.x));
        const minY = Math.min(...jawline.map(p => p.y)); // jaw doesn't cover top of head
        
        const faceWidth = maxX - minX;
        const faceCenter = { x: minX + faceWidth / 2, y: minY };
        
        // Render simple vector wig using paths (Mockup for high quality SVGs)
        // In reality, drawing complex paths
        ctx.save();
        ctx.translate(faceCenter.x, faceCenter.y - (faceWidth * 0.4));
        
        // Simple but clean vector paths for hair representations
        const hairWidth = faceWidth * 1.3;
        const hairHeight = faceWidth * 1.2;
        
        ctx.fillStyle = (hairIndex % 2 === 0) ? '#1a1110' : '#4a2c11';
        ctx.beginPath();
        
        if (gender === 'M') {
            // Male hair shapes
            if (hairIndex === 1) { ctx.ellipse(0, 0, hairWidth/2, hairHeight/2.5, 0, Math.PI, 0); }
            else if (hairIndex === 2) { ctx.rect(-hairWidth/2, -hairHeight/2, hairWidth, hairHeight*0.6); }
            else { ctx.ellipse(0, -10, hairWidth/2.2, hairHeight/2.2, 0, Math.PI, 0); }
        } else {
            // Female hair shapes
            if (hairIndex === 1) { ctx.ellipse(0, hairHeight/4, hairWidth/2, hairHeight/1.5, 0, 0, Math.PI*2); }
            else if (hairIndex === 2) { ctx.ellipse(0, 0, hairWidth/2, hairHeight/2, 0, Math.PI, 0); ctx.fillRect(-hairWidth/2, 0, hairWidth, hairHeight); }
            else { ctx.ellipse(0, 0, hairWidth/1.8, hairHeight/1.8, 0, 0, Math.PI*2); }
        }
        
        ctx.fill();
        ctx.restore();
        
        return c;
    }
};

// -----------------------------------------
// UI Thumbnail Generation
// -----------------------------------------
let currentTab = 'basic';
const thumbnailCache = {};

window.switchTab = async function(tabId) {
    currentTab = tabId;
    document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
    document.querySelector(`.filter-tab[data-tab="${tabId}"]`).classList.add('active');
    
    const container = document.getElementById('filterThumbnails');
    container.innerHTML = '<div style="color:#94a3b8; padding-top:20px;">썸네일 생성 중...</div>';
    
    // Tiny canvas for fast preview
    const thumbBase = document.createElement('canvas');
    thumbBase.width = 100;
    thumbBase.height = 100;
    const tctx = thumbBase.getContext('2d');
    tctx.drawImage(originalCanvas, 0, 0, 100, 100);
    
    // Downscale face data for thumbnails
    let thumbFaceData = null;
    if (currentFaceData) {
        thumbFaceData = {
            landmarks: {
                getJawOutline: () => currentFaceData.landmarks.getJawOutline().map(p => ({x: p.x/4, y: p.y/4}))
            }
        };
    }
    
    const configs = [];
    if (tabId === 'basic') {
        configs.push({ id: 'none', label: '원본', filter: () => cloneCanvas(thumbBase), apply: () => originalCanvas });
        configs.push({ id: 'bw', label: '흑백', filter: () => FilterEngine.applyBasic(thumbBase, 'bw'), apply: () => FilterEngine.applyBasic(originalCanvas, 'bw') });
        for(let i=1; i<=5; i++) {
            configs.push({ id: `br${i}`, label: `밝기 +${i}`, filter: () => FilterEngine.applyBasic(thumbBase, 'bright', i), apply: () => FilterEngine.applyBasic(originalCanvas, 'bright', i) });
        }
    } else if (tabId === 'beauty') {
        for(let i=1; i<=8; i++) {
            configs.push({ id: `be${i}`, label: `뽀샵 ${i}`, filter: () => FilterEngine.applyBeauty(thumbBase, i), apply: () => FilterEngine.applyBeauty(originalCanvas, i) });
        }
    } else if (tabId === 'art') {
        for(let i=1; i<=4; i++) {
            configs.push({ id: `an${i}`, label: `애니 ${i}`, filter: () => FilterEngine.applyArt(thumbBase, 'anime', i), apply: () => FilterEngine.applyArt(originalCanvas, 'anime', i) });
            configs.push({ id: `wc${i}`, label: `수채화 ${i}`, filter: () => FilterEngine.applyArt(thumbBase, 'watercolor', i), apply: () => FilterEngine.applyArt(originalCanvas, 'watercolor', i) });
        }
    } else if (tabId === 'hair') {
        for(let i=1; i<=3; i++) {
            configs.push({ id: `hm${i}`, label: `남성가발 ${i}`, filter: () => FilterEngine.applyHair(thumbBase, thumbFaceData, i, 'M'), apply: () => FilterEngine.applyHair(originalCanvas, currentFaceData, i, 'M') });
            configs.push({ id: `hf${i}`, label: `여성가발 ${i}`, filter: () => FilterEngine.applyHair(thumbBase, thumbFaceData, i, 'F'), apply: () => FilterEngine.applyHair(originalCanvas, currentFaceData, i, 'F') });
        }
    }

    container.innerHTML = '';
    
    // Render configs to DOM
    for (const conf of configs) {
        if (!thumbnailCache[conf.id]) {
            // Process async to not block UI
            await new Promise(r => setTimeout(r, 10)); 
            const resC = conf.filter();
            thumbnailCache[conf.id] = resC.toDataURL('image/jpeg', 0.6);
        }
        
        const div = document.createElement('div');
        div.style.cssText = 'min-width: 70px; display:flex; flex-direction:column; align-items:center; cursor:pointer; gap:5px;';
        div.onclick = () => {
            // Reset active style
            document.querySelectorAll('.thumb-img').forEach(el => el.style.borderColor = 'transparent');
            div.querySelector('.thumb-img').style.borderColor = '#3b82f6';
            
            // Apply full resolution
            showLoading("필터 적용 중...");
            setTimeout(() => {
                currentFilteredCanvas = conf.apply();
                const ectx = document.getElementById('editCanvas').getContext('2d');
                ectx.clearRect(0, 0, 400, 400);
                ectx.drawImage(currentFilteredCanvas, 0, 0);
                hideLoading();
            }, 50);
        };
        
        const img = document.createElement('div');
        img.className = 'thumb-img';
        img.style.cssText = `width: 60px; height: 60px; border-radius: 12px; background-image: url(${thumbnailCache[conf.id]}); background-size: cover; border: 3px solid transparent; transition: all 0.2s;`;
        
        const lbl = document.createElement('span');
        lbl.style.cssText = 'font-size: 0.75rem; color: #cbd5e1; font-weight: 500;';
        lbl.innerText = conf.label;
        
        div.appendChild(img);
        div.appendChild(lbl);
        container.appendChild(div);
    }
};

window.applyAdvancedFilter = function(type) {
    if (type === 'none') {
        currentFilteredCanvas = cloneCanvas(originalCanvas);
        const ectx = document.getElementById('editCanvas').getContext('2d');
        ectx.clearRect(0, 0, 400, 400);
        ectx.drawImage(currentFilteredCanvas, 0, 0);
        document.querySelectorAll('.thumb-img').forEach(el => el.style.borderColor = 'transparent');
    }
};

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

async function saveFinal() {
    if (!currentFilteredCanvas) return;
    
    showLoading("저장 중...");
    
    try {
        const finalDataUrl = currentFilteredCanvas.toDataURL('image/jpeg', 0.85);
        
        currentMember.photo = finalDataUrl;
        if (currentFaceData) {
            currentMember.faceDescriptor = Array.from(currentFaceData.descriptor);
        }

        const res = await fetch(`${API_BASE}/members`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(currentMember)
        });

        if (!res.ok) throw new Error("저장 실패");

        hideLoading();
        document.getElementById('editModal').style.display = 'none';
        document.getElementById('currentPhoto').src = finalDataUrl;
        document.getElementById('currentPhoto').style.display = 'block';
        document.getElementById('noPhotoIcon').style.display = 'none';
        alert("🎉 보정된 사진이 성공적으로 등록되었습니다!");

    } catch (e) {
        console.error(e);
        hideLoading();
        alert("오류가 발생했습니다: " + e.message);
    }
}

function showLoading(text) {
    const el = document.getElementById('loadingText');
    if(el) el.innerText = text;
    document.getElementById('loadingOverlay').style.display = 'flex';
}

function hideLoading() {
    document.getElementById('loadingOverlay').style.display = 'none';
}
