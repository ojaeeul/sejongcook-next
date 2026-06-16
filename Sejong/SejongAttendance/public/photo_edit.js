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
    _fastBoxBlur: function(imgData, radius) {
        const w = imgData.width;
        const h = imgData.height;
        const data = imgData.data;
        const tData = new Uint8ClampedArray(data.length);
        const passes = 2;
        for(let p=0; p<passes; p++) {
            for (let y = 0; y < h; y++) {
                for (let x = 0; x < w; x++) {
                    let r=0, g=0, b=0, a=0, c=0;
                    for (let k = -radius; k <= radius; k++) {
                        let cx = x + k;
                        if (cx >= 0 && cx < w) {
                            let i = (y * w + cx) * 4;
                            r += data[i]; g += data[i+1]; b += data[i+2]; a += data[i+3];
                            c++;
                        }
                    }
                    let i = (y * w + x) * 4;
                    tData[i] = r/c; tData[i+1] = g/c; tData[i+2] = b/c; tData[i+3] = a/c;
                }
            }
            for (let x = 0; x < w; x++) {
                for (let y = 0; y < h; y++) {
                    let r=0, g=0, b=0, a=0, c=0;
                    for (let k = -radius; k <= radius; k++) {
                        let cy = y + k;
                        if (cy >= 0 && cy < h) {
                            let i = (cy * w + x) * 4;
                            r += tData[i]; g += tData[i+1]; b += tData[i+2]; a += tData[i+3];
                            c++;
                        }
                    }
                    let i = (y * w + x) * 4;
                    data[i] = r/c; data[i+1] = g/c; data[i+2] = b/c; data[i+3] = a/c;
                }
            }
        }
    },
    
    applyBasic: async function(baseCanvas, type, amount) {
        const c = cloneCanvas(baseCanvas);
        const ctx = c.getContext('2d');
        const imgData = ctx.getImageData(0, 0, c.width, c.height);
        const data = imgData.data;
        
        if (type === 'bw') {
            const factor = (259 * (20 + 255)) / (255 * (259 - 20));
            for (let i = 0; i < data.length; i += 4) {
                const gray = 0.299 * data[i] + 0.587 * data[i+1] + 0.114 * data[i+2];
                const res = Math.min(255, Math.max(0, factor * (gray - 128) + 128));
                data[i] = data[i+1] = data[i+2] = res;
            }
        } else if (type === 'bright') {
            const brightAmt = amount * 15;
            for (let i = 0; i < data.length; i += 4) {
                data[i] = Math.min(255, data[i] + brightAmt);
                data[i+1] = Math.min(255, data[i+1] + brightAmt);
                data[i+2] = Math.min(255, data[i+2] + brightAmt);
            }
        }
        
        ctx.putImageData(imgData, 0, 0);
        return c;
    },
    
    applyBeauty: async function(baseCanvas, intensity) {
        const c = cloneCanvas(baseCanvas);
        const ctx = c.getContext('2d');
        const imgData = ctx.getImageData(0, 0, c.width, c.height);
        
        const blurData = new ImageData(new Uint8ClampedArray(imgData.data), c.width, c.height);
        const radius = Math.floor(intensity * (c.width > 150 ? 1.2 : 0.5));
        this._fastBoxBlur(blurData, radius);
        
        const data = imgData.data;
        const bData = blurData.data;
        const opacity = Math.min(1.0, 0.2 + (intensity * 0.1));
        
        for (let i = 0; i < data.length; i += 4) {
            const r = 255 - (((255 - data[i]) * (255 - bData[i])) / 255);
            const g = 255 - (((255 - data[i+1]) * (255 - bData[i+1])) / 255);
            const b = 255 - (((255 - data[i+2]) * (255 - bData[i+2])) / 255);
            
            data[i] = data[i] * (1 - opacity) + r * opacity;
            data[i+1] = data[i+1] * (1 - opacity) + g * opacity;
            data[i+2] = data[i+2] * (1 - opacity) + b * opacity;
        }
        
        ctx.putImageData(imgData, 0, 0);
        return c;
    },
    
    applyArt: async function(baseCanvas, type, level) {
        const c = cloneCanvas(baseCanvas);
        const ctx = c.getContext('2d');
        const imgData = ctx.getImageData(0, 0, c.width, c.height);
        const data = imgData.data;
        
        if (type === 'anime') {
            const contrast = 30 + level * 10;
            const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));
            const quant = 255 / (8 - level * 0.5); 
            
            for (let i = 0; i < data.length; i += 4) {
                let r = factor * (data[i] - 128) + 128;
                let g = factor * (data[i+1] - 128) + 128;
                let b = factor * (data[i+2] - 128) + 128;
                data[i] = Math.min(255, Math.max(0, Math.round(r / quant) * quant));
                data[i+1] = Math.min(255, Math.max(0, Math.round(g / quant) * quant));
                data[i+2] = Math.min(255, Math.max(0, Math.round(b / quant) * quant));
            }
            ctx.putImageData(imgData, 0, 0);
        } else if (type === 'watercolor') {
            const radius = Math.floor(level * (c.width > 150 ? 1 : 0.5));
            this._fastBoxBlur(imgData, radius);
            const contrast = 50 + level * 5;
            const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));
            for (let i = 0; i < data.length; i += 4) {
                data[i] = Math.min(255, Math.max(0, factor * (data[i] - 128) + 128));
                data[i+1] = Math.min(255, Math.max(0, factor * (data[i+1] - 128) + 128));
                data[i+2] = Math.min(255, Math.max(0, factor * (data[i+2] - 128) + 128));
            }
            ctx.putImageData(imgData, 0, 0);
        }
        return c;
    },
    
    applyHair: async function(baseCanvas, faceData, hairIndex, gender) {
        const c = cloneCanvas(baseCanvas);
        if (!faceData) return c; 
        
        const ctx = c.getContext('2d');
        const landmarks = faceData.landmarks;
        const jawline = landmarks.getJawOutline();
        
        const minX = Math.min(...jawline.map(p => p.x));
        const maxX = Math.max(...jawline.map(p => p.x));
        const minY = Math.min(...jawline.map(p => p.y));
        const maxY = Math.max(...jawline.map(p => p.y));
        
        const faceWidth = maxX - minX;
        const faceHeight = maxY - minY;
        const faceCenter = { x: minX + faceWidth / 2, y: minY + faceHeight / 2 };
        
        // Realistic Transparent Hair PNGs from Pixabay/Wikimedia
        const urls = {
            'M': [
                'https://cdn.pixabay.com/photo/2014/04/03/10/38/hair-310969_1280.png', 
                'https://cdn.pixabay.com/photo/2014/04/02/14/08/hair-306263_1280.png',
                'https://cdn.pixabay.com/photo/2013/07/13/11/44/hair-158586_1280.png'
            ],
            'F': [
                'https://cdn.pixabay.com/photo/2016/04/01/10/44/hair-1300062_1280.png',
                'https://cdn.pixabay.com/photo/2014/03/25/16/24/hair-296996_1280.png',
                'https://cdn.pixabay.com/photo/2014/04/02/10/47/hair-304546_1280.png'
            ]
        };
        
        const url = urls[gender][hairIndex - 1];
        
        return new Promise((resolve) => {
            const img = new Image();
            img.crossOrigin = "Anonymous";
            img.onload = () => {
                ctx.save();
                // Positioning tuning
                const hairScale = faceWidth * 1.5;
                const aspect = img.height / img.width;
                const hairH = hairScale * aspect;
                
                const yOffset = gender === 'M' ? (faceHeight * 0.45) : (faceHeight * 0.3);
                
                ctx.translate(faceCenter.x, faceCenter.y - yOffset);
                ctx.drawImage(img, -hairScale/2, -hairH/2, hairScale, hairH);
                ctx.restore();
                resolve(c);
            };
            img.onerror = () => resolve(c); // Fallback on error
            img.src = url;
        });
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
    container.innerHTML = '<div style="color:#94a3b8; padding-top:20px;">썸네일 생성 중... (픽셀 연산)</div>';
    
    const thumbBase = document.createElement('canvas');
    thumbBase.width = 100;
    thumbBase.height = 100;
    const tctx = thumbBase.getContext('2d');
    tctx.drawImage(originalCanvas, 0, 0, 100, 100);
    
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
        configs.push({ id: 'none', label: '원본', filter: async () => cloneCanvas(thumbBase), apply: async () => originalCanvas });
        configs.push({ id: 'bw', label: '흑백', filter: async () => FilterEngine.applyBasic(thumbBase, 'bw'), apply: async () => FilterEngine.applyBasic(originalCanvas, 'bw') });
        for(let i=1; i<=5; i++) {
            configs.push({ id: `br${i}`, label: `밝기 +${i}`, filter: async () => FilterEngine.applyBasic(thumbBase, 'bright', i), apply: async () => FilterEngine.applyBasic(originalCanvas, 'bright', i) });
        }
    } else if (tabId === 'beauty') {
        for(let i=1; i<=8; i++) {
            configs.push({ id: `be${i}`, label: `뽀샵 ${i}`, filter: async () => FilterEngine.applyBeauty(thumbBase, i), apply: async () => FilterEngine.applyBeauty(originalCanvas, i) });
        }
    } else if (tabId === 'art') {
        for(let i=1; i<=4; i++) {
            configs.push({ id: `an${i}`, label: `애니 ${i}`, filter: async () => FilterEngine.applyArt(thumbBase, 'anime', i), apply: async () => FilterEngine.applyArt(originalCanvas, 'anime', i) });
            configs.push({ id: `wc${i}`, label: `수채화 ${i}`, filter: async () => FilterEngine.applyArt(thumbBase, 'watercolor', i), apply: async () => FilterEngine.applyArt(originalCanvas, 'watercolor', i) });
        }
    } else if (tabId === 'hair') {
        for(let i=1; i<=3; i++) {
            configs.push({ id: `hm${i}`, label: `남성가발 ${i}`, filter: async () => FilterEngine.applyHair(thumbBase, thumbFaceData, i, 'M'), apply: async () => FilterEngine.applyHair(originalCanvas, currentFaceData, i, 'M') });
            configs.push({ id: `hf${i}`, label: `여성가발 ${i}`, filter: async () => FilterEngine.applyHair(thumbBase, thumbFaceData, i, 'F'), apply: async () => FilterEngine.applyHair(originalCanvas, currentFaceData, i, 'F') });
        }
    }

    // Render configs to DOM
    const fragment = document.createDocumentFragment();
    for (const conf of configs) {
        if (!thumbnailCache[conf.id]) {
            const resC = await conf.filter();
            thumbnailCache[conf.id] = resC.toDataURL('image/jpeg', 0.6);
        }
        
        const div = document.createElement('div');
        div.style.cssText = 'min-width: 70px; display:flex; flex-direction:column; align-items:center; cursor:pointer; gap:5px;';
        div.onclick = async () => {
            document.querySelectorAll('.thumb-img').forEach(el => el.style.borderColor = 'transparent');
            div.querySelector('.thumb-img').style.borderColor = '#3b82f6';
            
            showLoading("초정밀 픽셀 보정 중...");
            // Use setTimeout to allow DOM to paint loading screen
            setTimeout(async () => {
                currentFilteredCanvas = await conf.apply();
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
        fragment.appendChild(div);
    }
    
    container.innerHTML = '';
    container.appendChild(fragment);
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
