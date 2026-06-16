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
            // 진짜 밝기 조절 (비율 곱셈)
            const factor = 1 + (amount * 0.15);
            for (let i = 0; i < data.length; i += 4) {
                data[i] = Math.min(255, data[i] * factor);
                data[i+1] = Math.min(255, data[i+1] * factor);
                data[i+2] = Math.min(255, data[i+2] * factor);
            }
        }
        
        ctx.putImageData(imgData, 0, 0);
        return c;
    },
    
    applyBeauty: async function(baseCanvas, faceData, intensity) {
        const c = cloneCanvas(baseCanvas);
        const ctx = c.getContext('2d');
        const imgData = ctx.getImageData(0, 0, c.width, c.height);
        const data = imgData.data;
        
        // 1. 블러 캔버스 생성 (스킨 스무딩용)
        const blurCanvas = cloneCanvas(baseCanvas);
        const bCtx = blurCanvas.getContext('2d');
        bCtx.filter = `blur(${intensity * 1.5}px)`;
        bCtx.drawImage(baseCanvas, 0, 0);
        const bData = bCtx.getImageData(0, 0, c.width, c.height).data;
        
        // 화이트닝 효과 (약간 밝고 핑크빛)
        for(let i=0; i<bData.length; i+=4) {
            bData[i] = Math.min(255, bData[i] * 1.05 + 5);
            bData[i+1] = Math.min(255, bData[i+1] * 1.02 + 5);
            bData[i+2] = Math.min(255, bData[i+2] * 1.02 + 5);
        }

        // 2. 마스크 생성 (눈/코/입 제외한 피부만 블러 처리)
        const maskCanvas = document.createElement('canvas');
        maskCanvas.width = c.width; maskCanvas.height = c.height;
        const mCtx = maskCanvas.getContext('2d');
        mCtx.fillStyle = '#000';
        mCtx.fillRect(0, 0, c.width, c.height);

        if (faceData && faceData.landmarks) {
            const scale = c.width / 400; // 썸네일과 원본 스케일 차이 보정
            const getPoints = (pts) => pts.map(p => ({x: p.x * scale, y: p.y * scale}));
            
            const jaw = getPoints(faceData.landmarks.getJawOutline());
            const eyebrows = getPoints(faceData.landmarks.getLeftEyeBrow()).concat(getPoints(faceData.landmarks.getRightEyeBrow()).reverse());
            
            // 피부 영역 (흰색)
            mCtx.fillStyle = '#fff';
            mCtx.filter = 'blur(8px)';
            mCtx.beginPath();
            if(jaw.length > 0) {
                mCtx.moveTo(jaw[0].x, jaw[0].y);
                jaw.forEach(p => mCtx.lineTo(p.x, p.y));
                eyebrows.forEach(p => mCtx.lineTo(p.x, p.y));
                mCtx.closePath();
                mCtx.fill();
            }

            // 이목구비 영역 제외 (검은색)
            mCtx.fillStyle = '#000';
            mCtx.filter = 'blur(3px)';
            const drawPoly = (pts) => {
                mCtx.beginPath(); mCtx.moveTo(pts[0].x, pts[0].y);
                pts.forEach(p => mCtx.lineTo(p.x, p.y)); mCtx.closePath(); mCtx.fill();
            };
            drawPoly(getPoints(faceData.landmarks.getLeftEye()));
            drawPoly(getPoints(faceData.landmarks.getRightEye()));
            drawPoly(getPoints(faceData.landmarks.getMouth()));
            drawPoly(getPoints(faceData.landmarks.getNose()));
        } else {
            // 얼굴 인식이 안 된 경우 전체 약하게 적용
            mCtx.fillStyle = 'rgba(255,255,255,0.4)';
            mCtx.fillRect(0, 0, c.width, c.height);
        }

        const mData = mCtx.getImageData(0, 0, c.width, c.height).data;

        // 3. 원본과 뽀샵본 블렌딩
        for (let i = 0; i < data.length; i += 4) {
            const maskAlpha = mData[i] / 255;
            const blend = maskAlpha * 0.85; // 최대 85% 강도로 블렌딩
            
            data[i]   = data[i]   * (1 - blend) + bData[i]   * blend;
            data[i+1] = data[i+1] * (1 - blend) + bData[i+1] * blend;
            data[i+2] = data[i+2] * (1 - blend) + bData[i+2] * blend;
            
            // 전체적으로 뽀샤시한 느낌을 위해 밝기 조금 추가
            const globalBoost = 1.0 + (intensity * 0.03);
            data[i] = Math.min(255, data[i] * globalBoost);
            data[i+1] = Math.min(255, data[i+1] * globalBoost);
            data[i+2] = Math.min(255, data[i+2] * globalBoost);
        }

        ctx.putImageData(imgData, 0, 0);
        return c;
    },
    
    applyArt: async function(baseCanvas, type, level) {
        const c = cloneCanvas(baseCanvas);
        const ctx = c.getContext('2d');
        const imgData = ctx.getImageData(0, 0, c.width, c.height);
        
        // Native canvas blur is much faster and cleaner than _fastBoxBlur
        const blurCanvas = cloneCanvas(baseCanvas);
        const bCtx = blurCanvas.getContext('2d');
        
        if (type === 'anime') {
            // 애니메이션 필터: 뽀샤시한 블러 + 채도/대비 증가 + 약간의 외곽선 강조 효과
            bCtx.filter = `blur(${level}px)`;
            bCtx.drawImage(baseCanvas, 0, 0);
            const bData = bCtx.getImageData(0, 0, c.width, c.height).data;
            
            const data = imgData.data;
            const contrast = 20 + level * 5;
            const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));
            
            for (let i = 0; i < data.length; i += 4) {
                // 원본과 블러를 섞어 뽀샤시한 느낌
                let r = (data[i] * 0.4) + (bData[i] * 0.6);
                let g = (data[i+1] * 0.4) + (bData[i+1] * 0.6);
                let b = (data[i+2] * 0.4) + (bData[i+2] * 0.6);
                
                // 대비 증가
                r = factor * (r - 128) + 128;
                g = factor * (g - 128) + 128;
                b = factor * (b - 128) + 128;
                
                // 채도 증가 (Saturation)
                const gray = 0.2989 * r + 0.5870 * g + 0.1140 * b;
                const satAmt = 1.3 + (level * 0.1);
                r = gray + satAmt * (r - gray);
                g = gray + satAmt * (g - gray);
                b = gray + satAmt * (b - gray);
                
                data[i] = Math.min(255, Math.max(0, r * 1.05)); // 전체적으로 살짝 밝게
                data[i+1] = Math.min(255, Math.max(0, g * 1.05));
                data[i+2] = Math.min(255, Math.max(0, b * 1.05));
            }
            ctx.putImageData(imgData, 0, 0);
            
        } else if (type === 'watercolor') {
            // 수채화: 캔버스 텍스처 느낌과 강한 색상 뭉개짐
            const radius = level * 1.5;
            bCtx.filter = `blur(${radius}px)`;
            bCtx.drawImage(baseCanvas, 0, 0);
            const bData = bCtx.getImageData(0, 0, c.width, c.height).data;
            const data = imgData.data;
            
            const contrast = 40 + level * 10;
            const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));
            
            for (let i = 0; i < data.length; i += 4) {
                // 대비 증가시켜 색상 뭉개기 (블러 처리된 데이터 기준)
                let r = factor * (bData[i] - 128) + 128;
                let g = factor * (bData[i+1] - 128) + 128;
                let b = factor * (bData[i+2] - 128) + 128;
                
                // 수채화 물빠진 느낌 (채도 감소)
                const gray = 0.2989 * r + 0.5870 * g + 0.1140 * b;
                r = gray + 0.8 * (r - gray);
                g = gray + 0.8 * (g - gray);
                b = gray + 0.8 * (b - gray);
                
                data[i] = Math.min(255, Math.max(0, r + 10)); 
                data[i+1] = Math.min(255, Math.max(0, g + 10));
                data[i+2] = Math.min(255, Math.max(0, b + 10));
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
        
        // Local Transparent Hair PNGs (AI Generated)
        const urls = {
            'M': [
                '/sejong/images/m1.png', 
                '/sejong/images/m2.png',
                '/sejong/images/m1.png' // fallback if 3rd requested
            ],
            'F': [
                '/sejong/images/f1.png',
                '/sejong/images/f1.png',
                '/sejong/images/f1.png'
            ]
        };
        
        const url = urls[gender][hairIndex - 1];
        
        return new Promise((resolve) => {
            const img = new Image();
            img.crossOrigin = "Anonymous";
            img.onload = () => {
                ctx.save();
                // Positioning tuning: 머리카락이 코가 아닌 머리통 위로 올라가도록 스케일과 yOffset 대폭 상향
                const hairScale = gender === 'M' ? faceWidth * 1.4 : faceWidth * 1.8;
                const aspect = img.height / img.width;
                const hairH = hairScale * aspect;
                
                // yOffset을 얼굴 높이의 80~90% 수준으로 올려야 이마선에 맞음
                const yOffset = gender === 'M' ? (faceHeight * 0.75) : (faceHeight * 0.95);
                
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
