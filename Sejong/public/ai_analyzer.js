const API_KEYS = [
    // Keys are now securely managed on the server side
];

let currentMode = 'student'; // 'student' or 'phonebook'
let processingCount = 0;
let totalFiles = 0;

function getNextKey() {
    if (API_KEYS.length === 0) return null;
    const key = API_KEYS[keyIdx];
    keyIdx = (keyIdx + 1) % API_KEYS.length;
    return key;
}

document.addEventListener('DOMContentLoaded', () => {
    const uploadZone = document.getElementById('uploadZone');
    const fileInput = document.getElementById('fileInput');
    const modeBtns = document.querySelectorAll('.mode-btn');

    // Mode selection
    modeBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            modeBtns.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            currentMode = e.target.dataset.mode;
        });
    });

    // Drag & Drop Handlers
    uploadZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadZone.classList.add('dragover');
    });

    uploadZone.addEventListener('dragleave', () => {
        uploadZone.classList.remove('dragover');
    });

    uploadZone.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadZone.classList.remove('dragover');
        if (e.dataTransfer.files.length > 0) {
            handleFiles(e.dataTransfer.files);
        }
    });

    uploadZone.addEventListener('click', () => {
        fileInput.click();
    });

    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFiles(e.target.files);
        }
        e.target.value = '';
    });

    const folderInput = document.getElementById('folderInput');
    if (folderInput) {
        folderInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                handleFiles(e.target.files);
            }
            e.target.value = '';
        });
    }
});

window.selectFolderNative = async function() {
    if (window.showDirectoryPicker) {
        try {
            const dirHandle = await window.showDirectoryPicker();
            const files = [];
            
            async function getFiles(dirHandle, path = '') {
                for await (const entry of dirHandle.values()) {
                    if (entry.kind === 'file') {
                        const file = await entry.getFile();
                        files.push(file);
                    } else if (entry.kind === 'directory') {
                        await getFiles(entry, path + entry.name + '/');
                    }
                }
            }
            
            await getFiles(dirHandle);
            
            if (files.length > 0) {
                handleFiles(files);
            } else {
                alert("선택한 폴더에 파일이 없습니다.");
            }
        } catch (err) {
            if (err.name !== 'AbortError') {
                console.warn("showDirectoryPicker failed, falling back to input.", err);
                document.getElementById('folderInput').click();
            }
        }
    } else {
        document.getElementById('folderInput').click();
    }
};

async function handleFiles(files) {
    const validFiles = Array.from(files).filter(f => {
        const typeValid = f.type.startsWith('image/') || f.type === 'application/pdf';
        const extValid = f.name.toLowerCase().match(/\.(jpg|jpeg|png|pdf|heic)$/);
        return typeValid || extValid;
    });
    
    if (validFiles.length === 0) {
        alert('폴더 또는 파일에 처리 가능한 이미지/PDF 파일이 없습니다. (JPG, PNG, PDF 지원)');
        return;
    }

    totalFiles += validFiles.length;
    updateProgress();

    // 6개의 멀티 API 키를 활용하여 6개씩 초고속 동시 처리 (속도 대폭 향상)
    const CONCURRENCY_LIMIT = 6;
    for (let i = 0; i < validFiles.length; i += CONCURRENCY_LIMIT) {
        const chunk = validFiles.slice(i, i + CONCURRENCY_LIMIT);
        const promises = chunk.map(file => {
            if (file.type === 'application/pdf') {
                return processPDF(file);
            } else {
                return processImage(file);
            }
        });
        await Promise.all(promises);
    }
}

function updateProgress() {
    const container = document.getElementById('progressContainer');
    const bar = document.getElementById('progressBar');
    const text = document.getElementById('progressText');
    
    if (totalFiles > 0) {
        container.style.display = 'block';
        const percent = (processingCount / totalFiles) * 100;
        bar.style.width = `${percent}%`;
        text.textContent = `${processingCount} / ${totalFiles} 완료`;
        
        if (processingCount === totalFiles) {
            setTimeout(() => {
                container.style.display = 'none';
                processingCount = 0;
                totalFiles = 0;
            }, 2000);
        }
    }
}

async function processPDF(file) {
    return new Promise((resolve, reject) => {
        try {
            const fileReader = new FileReader();
            fileReader.onload = async function() {
                try {
                    const typedarray = new Uint8Array(this.result);
                    const pdf = await pdfjsLib.getDocument(typedarray).promise;
                    
                    totalFiles += pdf.numPages - 1; // Adjust total files for PDF pages
                    updateProgress();

                    const analyzePromises = [];
                    // OOM(메모리 초과) 방지를 위해 PDF 렌더링을 3장씩 끊어서 처리합니다.
                    for (let i = 1; i <= pdf.numPages; i += 3) {
                        const chunkPromises = [];
                        for (let j = i; j < i + 3 && j <= pdf.numPages; j++) {
                            const page = await pdf.getPage(j);
                            const viewport = page.getViewport({ scale: 2.5 });
                            const canvas = document.createElement('canvas');
                            const context = canvas.getContext('2d');
                            canvas.height = viewport.height;
                            canvas.width = viewport.width;

                            await page.render({ canvasContext: context, viewport: viewport }).promise;
                            
                            const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
                            const base64Data = dataUrl.split(',')[1];
                            chunkPromises.push(analyzeImage(base64Data, `${file.name} (페이지 ${j})`, dataUrl));
                        }
                        analyzePromises.push(...chunkPromises);
                        
                        // Wait for this chunk of rendering to avoid storing 100+ high-res canvases in memory at once
                        // We don't await the analyzeImage (which is queued), we just yield the event loop
                        await new Promise(r => setTimeout(r, 100));
                    }
                    await Promise.all(analyzePromises);
                    resolve();
                } catch (e) {
                    console.error('PDF 페이지 처리 실패', e);
                    processingCount++;
                    updateProgress();
                    resolve();
                }
            };
            fileReader.onerror = function() {
                console.error('FileReader 에러');
                processingCount++;
                updateProgress();
                resolve();
            }
            fileReader.readAsArrayBuffer(file);
        } catch (e) {
            console.error('PDF 처리 실패', e);
            processingCount++;
            updateProgress();
            resolve();
        }
    });
}

async function processImage(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = async () => {
                // Resize image to max 2048px for OCR clarity
                const maxSize = 2048;
                let width = img.width;
                let height = img.height;
                
                if (width > maxSize || height > maxSize) {
                    if (width > height) {
                        height = Math.round(height * maxSize / width);
                        width = maxSize;
                    } else {
                        width = Math.round(width * maxSize / height);
                        height = maxSize;
                    }
                }
                
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                
                const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
                const base64Data = dataUrl.split(',')[1];
                
                try {
                    await analyzeImage(base64Data, file.name, dataUrl);
                } catch(err) {
                    console.error(err);
                }
                resolve();
            };
            img.src = e.target.result;
        };
        reader.onerror = () => resolve();
        reader.readAsDataURL(file);
    });
}

function createCardUI(title, imgUrl, id) {
    const grid = document.getElementById('resultsGrid');
    const card = document.createElement('div');
    card.className = 'result-card processing';
    card.id = `card-${id}`;
    
    card.innerHTML = `
        <div class="result-header">
            <div class="result-title">${title}</div>
            <div class="result-status status-processing" id="status-${id}">분석 중...</div>
        </div>
        <div class="image-container">
            <img src="${imgUrl}" class="image-preview" onclick="openImageModal(this.src)" title="클릭하여 확대">
            <div class="scanner-line" id="scanner-${id}"></div>
        </div>
        <div id="content-${id}">
            <div style="text-align:center; padding: 20px; color:#94a3b8;">
                <i class="fas fa-spinner fa-spin fa-2x"></i>
                <p style="margin-top:10px;">AI가 이미지를 정밀 분석하고 있습니다.</p>
            </div>
        </div>
    `;
    
    // Add to top
    if (grid.firstChild) {
        grid.insertBefore(card, grid.firstChild);
    } else {
        grid.appendChild(card);
    }
    
    return card;
}

let currentModalRotation = 0;
let currentModalScale = 1;

function openImageModal(src, startRotation = 0) {
    const modal = document.getElementById('imageModal');
    const modalImg = document.getElementById('imageModalImg');
    if(modal && modalImg) {
        modalImg.src = src;
        currentModalRotation = startRotation;
        currentModalScale = 1;
        modalImg.style.maxWidth = '90vw';
        modalImg.style.maxHeight = '90vh';
        modalImg.style.width = 'auto';
        modalImg.style.transform = `rotate(${startRotation}deg)`;
        modal.style.display = 'block';
    }
}

function closeImageModal() {
    const modal = document.getElementById('imageModal');
    if(modal) {
        modal.style.display = 'none';
    }
}

function rotateModalImage(degrees) {
    const modalImg = document.getElementById('imageModalImg');
    if(modalImg) {
        currentModalRotation += degrees;
        modalImg.style.transform = `rotate(${currentModalRotation}deg)`;
    }
}

function zoomModalImage(delta) {
    const modalImg = document.getElementById('imageModalImg');
    if(modalImg) {
        currentModalScale += delta;
        if(currentModalScale < 0.5) currentModalScale = 0.5;
        if(currentModalScale > 5) currentModalScale = 5;
        
        if (currentModalScale > 1) {
            modalImg.style.maxWidth = 'none';
            modalImg.style.maxHeight = 'none';
            modalImg.style.width = `${currentModalScale * 90}vw`; 
        } else {
            modalImg.style.maxWidth = '90vw';
            modalImg.style.maxHeight = '90vh';
            modalImg.style.width = 'auto';
        }
    }
}

const CONCURRENCY_LIMIT = 5;
let activeRequests = 0;
const requestQueue = [];

async function analyzeImage(base64Data, fileName, imgUrl) {
    return new Promise((resolve) => {
        requestQueue.push(async () => {
            activeRequests++;
            try {
                await executeAnalysis(base64Data, fileName, imgUrl);
            } catch(e) {
                console.error(e);
            } finally {
                activeRequests--;
                processQueue();
                resolve();
            }
        });
        processQueue();
    });
}

function processQueue() {
    if (activeRequests < CONCURRENCY_LIMIT && requestQueue.length > 0) {
        const nextJob = requestQueue.shift();
        nextJob();
    }
}

async function executeAnalysis(base64Data, fileName, imgUrl) {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    const card = createCardUI(fileName, imgUrl, id);
    
    let prompt = "";
    if (currentMode === 'phonebook') {
        prompt = `이 이미지는 요리학원의 전화번호부입니다. (사진이 옆으로 누워있거나 90도 회전되어 있을 수 있으니 글씨 방향에 맞춰서 정확히 읽어주세요.)

[중요 지시사항: 2~3번 교차 검증]
이미지를 한 번만 보고 넘기지 말고, 2~3번에 걸쳐서 꼼꼼히 다시 확인하며 분석하세요.
특히 수강생 본인의 연락처와 부모님의 연락처를 절대 헷갈리지 않게 정확히 구별해서 추출하세요.

목록에서 이름과 전화번호를 추출해주세요.
- 제일 처음 적힌 번호나 관계 표시가 없는 번호는 '본인전화번호'로 분류하세요.
- 한문(母, 父)이나 한글(모, 부)로 표시된 번호는 '부모전화번호'로 분류하세요.
- 한 사람에게 전화번호가 3개 이상 있다면, 본인 번호끼리 또는 부모 번호끼리 콤마(,)로 연결해서 모두 표시하세요. (이름은 중복해서 여러 번 적지 말고 1번만 적어주세요.)

[절대 주의사항]
1. 사진에 없는 내용이나 이름(예: 김아영 등)을 절대 지어내지 마세요. (No Hallucination)
2. 글씨를 알아볼 수 없거나 비어있는 칸은 무조건 빈칸("")으로 처리하세요.
3. 이름 끝에 마침표(.)나 특수기호가 잘못 인식되어 있다면 제외하고 순수 이름만 추출하세요.

반드시 다음 JSON 형식의 배열로 반환하세요:
[
  {"이름": "민수정", "본인전화번호": "010-1243-6763, 031-888-6763", "부모전화번호": "010-3243-9286"}
]
이름이나 글씨를 절대 유추해서 획일화하지 말고, 적혀있는 그대로(예: 민지영, 민수정, 민원기, 민종훈, 문다빈, 문승희 등) 정확하게 판독하세요. 찾을 수 없으면 빈 배열 []을 반환하세요. JSON 코드 블록 없이 순수 JSON 텍스트만 출력하세요.`;
    } else if (currentMode === 'exam') {
        prompt = `이 이미지는 요리학원 수강생의 시험지(또는 평가지)입니다.
사진이 거꾸로(180도) 찍혀 있거나 옆으로 돌아가 있을 수 있으니, 글자 방향을 스스로 판단하여 이미지를 회전시킨 상태로 읽어주세요.
사용자가 직접 펜으로 적은 글씨와 평가 내용, 점수 등을 완벽하게 인식해주세요.

[중요 지시사항: 2~3번 교차 검증]
이미지를 단번에 판단하지 말고, 2~3번에 걸쳐서 꼼꼼히 다시 읽고 확인하며 분석하세요.
특히 시험 점수나 합격/불합격 여부를 절대 헷갈리지 않게 정확히 추출하세요.

[데이터 추출 규칙 및 절대 주의사항]
1. 글씨를 알아볼 수 없거나 비어있는 칸은 무조건 빈칸("")으로 처리하세요. 사진에 없는 내용을 지어내지 마세요. (No Hallucination)
2. 이름에 숫자나 특수문자가 들어가는 등 판독이 도저히 불가능한 경우는 지어내지 말고 무조건 빈칸("")으로 두세요.

다음 정보를 추출하여 정확히 아래 형식의 JSON 객체로 반환하세요. JSON 코드 블록 없이 순수 JSON 텍스트만 출력하세요.
{
    "성명": "응시자 이름",
    "시험명": "시험 과목 또는 종류 (없으면 빈칸)",
    "시험일자": "시험을 본 날짜 (YYYY-MM-DD 형식, 없으면 빈칸)",
    "점수": "시험 점수 (숫자만, 없으면 빈칸)",
    "결과": "합격 또는 불합격 (없으면 빈칸)",
    "피드백": "강사 코멘트나 메모, 감점 사유 등 (없으면 빈칸)"
}`;
    } else {
        prompt = `이 이미지는 요리학원의 수강생 등록 원서입니다. 
사진이 거꾸로(180도) 찍혀 있거나 옆으로 돌아가 있을 수 있으니, 글자 방향을 스스로 판단하여 이미지를 회전시킨 상태로 읽어주세요.
사용자가 직접 펜으로 적은 글씨와 펜으로 동그라미 친 부분을 완벽하게 인식해주세요.

[중요 지시사항: 2~3번 교차 검증]
이미지를 단번에 판단하지 말고, 2~3번에 걸쳐서 꼼꼼히 다시 읽고 확인하며 분석하세요.
특히 '수강생 본인 연락처'와 '부모님 연락처' 필드의 위치와 내용을 2~3번 확인하여 절대 헷갈리지 않게 정확히 추출하세요.

[데이터 추출 규칙 및 절대 주의사항]
1. 전화번호는 주소 필드에 절대 입력하지 마세요. 주소 란에 전화번호(예: 010-XXXX-XXXX)가 적혀 있다면, 해당 번호를 주소에서 완전히 삭제하고 순수 주소만 남기세요.
2. 주소 란이나 다른 곳에서 발견된 모든 전화번호는 반드시 '학생연락처'나 '부모연락처' 필드로 이동시키세요.
   - 번호 옆에 부, 모, 父, 母 등의 한글/한문이 있다면 '부모연락처'입니다.
   - 관계 표시가 없는 번호나 본인 번호는 '학생연락처'입니다.
3. 성명은 표의 맨 위 좌측 '성명' 란에 있는 이름을 추출합니다. 주소를 이름으로 착각해서는 절대 안 됩니다.
4. 글씨를 알아볼 수 없거나 비어있는 칸은 무조건 빈칸("")으로 처리하세요. 사진에 없는 내용을 지어내지 마세요. (No Hallucination)
5. 이름 끝에 마침표(.)나 특수기호가 잘못 인식되어 있다면 제외하고 순수 이름만 추출하세요.

다음 정보를 추출하여 정확히 아래 형식의 JSON 객체로 반환하세요. JSON 코드 블록 없이 순수 JSON 텍스트만 출력하세요.
{
    "성명": "이름 추출 (주소나 번호 절대 금지)",
    "성별": "남 또는 여 (동그라미 쳐진 것)",
    "생년월일": "원서에 적힌 그대로 추출 (주민등록번호가 적혀있으면 주민번호 그대로, 생년월일이 적혀있으면 생년월일 그대로. 임의 변환 금지)",
    "주소": "순수 주소 텍스트만 (전화번호가 포함되어 있으면 전화번호는 완전히 제거할 것)",
    "학생연락처": "수강생 본인 연락처 (연락처 란 또는 주소 란에서 찾은 학생 본인의 번호)",
    "부모연락처": "부모 연락처 (연락처 란 또는 주소 란에서 찾은 부모님 번호)",
    "학교": "학교 및 학년 (원서에 적힌 그대로만. 적혀있지 않으면 무조건 빈칸 처리. 절대 임의로 지어내지 말 것. 성인이라 '일반'이라고 적혀있으면 '일반' 추출)",
    "수강과목": "직접 펜으로 쓴 수강과목란 내용",
    "수강시작일": "YYYY년 M월 D일 HH:MM 형식",
    "수강료": "숫자만 (예: 250000)",
    "도구비": "숫자만",
    "결제금액": "숫자만",
    "등록일": "YYYY년 M월 D일 형식 (원서 작성일자 또는 등록일자)",
    "과정체크": "하단 표에서 펜으로 동그라미 쳐진 과목명과 시간 (예: 제과, 7시). 동그라미 쳐지지 않은 인쇄된 글자는 절대 추출하지 마세요.",
    "비고": "하단 빈 공간(메모란)에 적힌 글씨 (예: 6:30~40사이)",
    "회전": "이미지의 글자가 올바른 정방향이면 0, 거꾸로(180도) 뒤집혀 있으면 180, 오른쪽으로 누워있으면 90, 왼쪽이면 270을 숫자로 반환"
}`;
    }

    // Call the local Next.js proxy instead of Google's endpoint directly
    let result = null;
    let lastError = null;

    let retryCount = 0;
    const maxRetries = 40; // 무료 한도(429) 회피를 위해 최대 40번까지 재시도 (약 3분 이상 대기 가능)

    while (retryCount <= maxRetries && !result) {
        try {
            const response = await fetch('/api/sejong/ai_analyze', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [
                            { text: prompt },
                            { inlineData: { mimeType: 'image/jpeg', data: base64Data } }
                        ]
                    }],
                    generationConfig: {
                        temperature: 0.0,
                        responseMimeType: "application/json"
                    },
                    safetySettings: [
                        { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
                        { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
                        { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
                        { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
                    ]
                })
            });

            if (response.ok) {
                const data = await response.json();
                if (data.candidates && data.candidates.length > 0) {
                    let contentNode = data.candidates[0].content;
                    if (!contentNode || !contentNode.parts || contentNode.parts.length === 0) {
                        lastError = 'AI가 응답 텍스트를 생성하지 못했습니다. (재시도 중)';
                        retryCount++;
                        continue;
                    } else {
                        let text = contentNode.parts[0].text || '';
                        text = text.replace(/```json/gi, '').replace(/```/g, '').trim();
                        try {
                            result = JSON.parse(text);
                        } catch (parseErr) {
                            try {
                                const jsonStartArr = text.indexOf('[');
                                const jsonEndArr = text.lastIndexOf(']');
                                const jsonStartObj = text.indexOf('{');
                                const jsonEndObj = text.lastIndexOf('}');
                                
                                let extracted = '';
                                if (currentMode === 'phonebook' && jsonStartArr !== -1 && jsonEndArr !== -1) {
                                    extracted = text.substring(jsonStartArr, jsonEndArr + 1);
                                } else if (jsonStartObj !== -1 && jsonEndObj !== -1) {
                                    if (jsonStartArr !== -1 && jsonEndArr !== -1 && jsonStartArr < jsonStartObj && jsonEndArr > jsonEndObj) {
                                        extracted = text.substring(jsonStartArr, jsonEndArr + 1);
                                    } else {
                                        extracted = text.substring(jsonStartObj, jsonEndObj + 1);
                                    }
                                }
                                
                                if (extracted) {
                                    result = JSON.parse(extracted);
                                } else {
                                    throw new Error("No JSON structure found");
                                }
                            } catch (fallbackErr) {
                                console.error('JSON Parse Error:', fallbackErr, 'Text:', text);
                                lastError = '결과 데이터 파싱 실패: ' + fallbackErr.message;
                                retryCount++;
                                continue;
                            }
                        }
                    }
                } else {
                    lastError = 'AI가 결과를 반환하지 않았습니다.';
                    retryCount++;
                }
            } else {
                const errData = await response.json().catch(() => ({}));
                lastError = errData.error || `서버 오류 (${response.status})`;
                if (response.status === 400 || response.status === 401 || response.status === 403 || response.status === 404) {
                    // 치명적 오류(잘못된 요청, 인증 실패, 모델 없음 등)는 재시도 불가
                    break;
                }
                retryCount++;
            }
        } catch (e) {
            console.error('Fetch error:', e);
            lastError = `네트워크 오류: ${e.message}`;
            retryCount++;
        }
        
        if (!result && retryCount <= maxRetries) {
            updateCardStatus(id, 'processing', `일시적 통신 지연... 재시도 중 (${retryCount}/${maxRetries}) [사유: ${lastError}]`);
            await new Promise(resolve => setTimeout(resolve, 3000));
        }
    }

    processingCount++;
    updateProgress();

    if (result) {
        if (currentMode === 'phonebook' && Array.isArray(result)) {
            renderPhonebookResult(id, result);
        } else if (currentMode === 'exam') {
            if (Array.isArray(result) && result.length > 0) {
                result = result[0];
            }
            renderExamResult(id, result);
        } else if (currentMode === 'student') {
            if (Array.isArray(result) && result.length > 0) {
                result = result[0];
            }
            renderStudentResult(id, result);
        } else {
            updateCardStatus(id, 'error', '결과 형식 오류');
            document.getElementById(`content-${id}`).innerHTML = `<p style="text-align:center;color:#ef4444;">반환된 데이터 형식이 예상과 다릅니다.<br>${JSON.stringify(result)}</p>`;
        }
    } else {
        updateCardStatus(id, 'error', '분석 실패');
        document.getElementById(`content-${id}`).innerHTML = `<p style="text-align:center;color:#ef4444;">분석에 실패했습니다.<br>사유: ${lastError}</p>`;
    }
}

function renderExamResult(id, data) {
    updateCardStatus(id, 'success', '분석 완료');
    const content = document.getElementById(`content-${id}`);
    
    const html = `
        <table class="dark-table" style="margin-top:10px;">
            <tr>
                <td class="th-dark" style="width:30%;">성명</td>
                <td><input type="text" class="result-input" data-id="${id}" data-field="성명" value="${data['성명'] || ''}"></td>
            </tr>
            <tr>
                <td class="th-dark">시험명</td>
                <td><input type="text" class="result-input" data-id="${id}" data-field="시험명" value="${data['시험명'] || ''}"></td>
            </tr>
            <tr>
                <td class="th-dark">시험일자</td>
                <td><input type="text" class="result-input" data-id="${id}" data-field="시험일자" value="${data['시험일자'] || ''}"></td>
            </tr>
            <tr>
                <td class="th-dark">점수</td>
                <td><input type="text" class="result-input" data-id="${id}" data-field="점수" value="${data['점수'] || ''}"></td>
            </tr>
            <tr>
                <td class="th-dark">결과</td>
                <td><input type="text" class="result-input" data-id="${id}" data-field="결과" value="${data['결과'] || ''}"></td>
            </tr>
            <tr>
                <td class="th-dark">피드백</td>
                <td><input type="text" class="result-input" data-id="${id}" data-field="피드백" value="${data['피드백'] || ''}"></td>
            </tr>
        </table>
        <div style="display:flex; justify-content:flex-end; margin-top:10px; gap:8px;">
            <button onclick="copyExamData('${id}')" style="background:#475569; color:white; border:none; padding:6px 12px; border-radius:4px; cursor:pointer; font-size:0.85rem;">복사하기</button>
        </div>
    `;
    
    content.innerHTML = html;
}

window.copyExamData = function(id) {
    const inputs = document.querySelectorAll(`.result-input[data-id="${id}"]`);
    let dataMap = {};
    inputs.forEach(inp => {
        dataMap[inp.dataset.field] = inp.value;
    });
    
    const copyText = `성명: ${dataMap['성명']}\\n시험명: ${dataMap['시험명']}\\n시험일자: ${dataMap['시험일자']}\\n점수: ${dataMap['점수']}\\n결과: ${dataMap['결과']}\\n피드백: ${dataMap['피드백']}`;
    
    navigator.clipboard.writeText(copyText).then(() => {
        alert('시험지 결과가 복사되었습니다!');
    }).catch(err => {
        console.error('Copy failed', err);
        alert('복사 실패');
    });
};

function updateCardStatus(id, status, message) {
    const card = document.getElementById(`card-${id}`);
    const statusEl = document.getElementById(`status-${id}`);
    const scanner = document.getElementById(`scanner-${id}`);
    
    if (scanner && status !== 'processing') {
        scanner.remove();
    }
    
    card.className = `result-card ${status}`;
    statusEl.className = `result-status status-${status}`;
    statusEl.textContent = message;
}

function renderStudentResult(id, data) {
    updateCardStatus(id, 'success', '분석 완료');
    const content = document.getElementById(`content-${id}`);
    
    // 회전값 적용
    let rotateDeg = parseInt(data.회전) || 0;
    const cardImg = document.querySelector(`#card-${id} .image-preview`);
    if (cardImg && rotateDeg !== 0) {
        cardImg.style.transform = `rotate(${rotateDeg}deg)`;
        // 모달 열릴 때도 해당 회전값 적용되도록 onclick 덮어쓰기
        cardImg.onclick = function() { openImageModal(this.src, rotateDeg); };
    }
    
    // Convert course info for saving
    const combinedCourse = [data.수강과목, data.과정체크].filter(x => x).join(' / ');

    // Parse member type and school info
    let memberType = "student";
    let schoolName = (data.학교 || '').trim();
    let schoolLevel = "";
    let grade = "";

    if (schoolName === "일반" || schoolName === "일반인" || schoolName === "성인" || schoolName === "일반(성인)") {
        memberType = "general";
        schoolName = "";
    } else if (schoolName) {
        // Extract grade (e.g., "3학년" or "3")
        const gradeMatch = schoolName.match(/([1-6])\s*학년/);
        if (gradeMatch) {
            grade = gradeMatch[1];
            schoolName = schoolName.replace(gradeMatch[0], "").trim();
        }
        
        schoolName = schoolName.replace(/,/g, '').trim();

        // Detect and separate school level
        if (schoolName.includes("초등")) {
            schoolLevel = "초등학교";
            schoolName = schoolName.replace("초등학교", "").replace("초등", "").trim();
        } else if (schoolName.includes("중학") || schoolName.match(/중$/)) {
            schoolLevel = "중학교";
            schoolName = schoolName.replace("중학교", "").replace(/중$/, "").trim();
        } else if (schoolName.includes("고등") || schoolName.match(/고$/)) {
            schoolLevel = "고등학교";
            schoolName = schoolName.replace("고등학교", "").replace(/고$/, "").trim();
        } else if (schoolName.includes("대학") || schoolName.match(/대$/)) {
            schoolLevel = "대학교";
            schoolName = schoolName.replace("대학교", "").replace(/대$/, "").trim();
        }
    }
    
    // 수강과목, 과정체크, 그리고 비고(메모)까지 모두 합쳐서 시간을 판별합니다.
    const courseStr = (data.수강과목 || '') + ' ' + (data.과정체크 || '') + ' ' + (data.비고 || '');
    
    const isBake = courseStr.includes('제과');
    const isBread = courseStr.includes('제빵');
    const isKorean = courseStr.includes('한식');
    const isWestern = courseStr.includes('양식');
    const isJapanese = courseStr.includes('일식');
    const isChinese = courseStr.includes('중식');
    const isPuffer = courseStr.includes('복어');

    // 스마트 시간 인지 정규식 (앞뒤 공백 무시하고 정확히 숫자와 콜론/시 매칭)
    const is10 = /(?:10|9)[:시]\s*[0-9]*/.test(courseStr) || courseStr.includes('10시');
    const is5 = /(?:16|17|4)[:시]\s*[0-9]*/.test(courseStr) || courseStr.includes('5시');
    const is7 = /(?:18|19|6)[:시]\s*[0-9]*/.test(courseStr) || courseStr.includes('7시');
    
    // 시간이 안써있으면 5시,7시 체크
    const hasTime = is10 || is5 || is7;
    const check10 = is10;
    const check5 = is5 || (!hasTime);
    const check7 = is7 || (!hasTime);

    content.innerHTML = `
        <div class="result-table-wrapper" style="margin-bottom: 15px; text-align: left; overflow-x: auto; width: 100%;">
            <table class="dark-table" style="width: 100%; min-width: 550px; margin: 0 auto; table-layout: fixed;">
                <tr>
                    <td class="th-dark" style="width: 14%; padding: 4px; font-size: 12px; word-break: keep-all; white-space: nowrap;">성명 <span class="required" style="color:#ef4444">*</span></td>
                    <td style="width: 20%; padding: 2px;"><input type="text" id="name-${id}" value="${data.성명 || ''}" required placeholder="이름 입력" style="text-align: center; width: 100%; background: transparent; border: none; outline: none; font-family: inherit; font-size: 13px;"></td>
                    <td class="th-dark" style="width: 10%; padding: 4px; font-size: 12px; word-break: keep-all; white-space: nowrap;">성별</td>
                    <td style="width: 12%; padding: 2px;">
                        <select id="gender-${id}" style="text-align: center; text-align-last: center; width: 100%; background: transparent; border: none; outline: none; font-family: inherit; font-size: 13px; padding: 0;">
                            <option value="">선택</option>
                            <option value="여" ${data.성별 === '여' ? 'selected' : ''}>여</option>
                            <option value="남" ${data.성별 === '남' ? 'selected' : ''}>남</option>
                        </select>
                    </td>
                    <td class="th-dark" style="width: 16%; padding: 4px; font-size: 11px; line-height: 1.2; word-break: keep-all; white-space: nowrap;">주민등록번호</td>
                    <td style="width: 28%; padding: 2px;">
                        <input type="text" id="birth-${id}" value="${data.생년월일 || ''}" placeholder="000000-0000000" style="text-align: center; width: 100%; background: transparent; border: none; outline: none; font-family: inherit; font-size: 13px;">
                    </td>
                </tr>
                <tr>
                    <td class="th-dark">주소</td>
                    <td colspan="5" style="text-align: left; padding: 0;">
                        <div style="display: flex; align-items: center; width: 100%; box-sizing: border-box; padding: 5px;">
                            <input type="text" id="address-${id}" value="${data.주소 || ''}" placeholder="상세 주소 입력" style="flex: 1; text-align: left; background: transparent; border: none; outline: none; font-family: inherit; padding: 0 5px; min-width: 0;">
                            <button type="button" class="address-btn" style="background: #3b82f6; color: white; border: none; border-radius: 4px; padding: 4px 8px; cursor: pointer; font-size: 12px; min-width: 40px; margin-left: 5px;">검색</button>
                        </div>
                    </td>
                </tr>
                <tr>
                    <td rowspan="2" class="th-dark">연락처</td>
                    <td class="th-dark">본인</td>
                    <td colspan="4" style="text-align: center; padding: 0;">
                        <div style="display: flex; align-items: center; justify-content: center; gap: 5px; height: 100%; min-height: 35px;">
                            <span style="color: #94a3b8; font-weight: 500;">010 - </span>
                            <input type="tel" id="phone-${id}" value="${(data.학생연락처 || '').replace(/^010-?/, '')}" maxlength="9" placeholder="0000-0000" style="width: 120px; text-align: center; background: transparent; border: none; outline: none; font-family: inherit;">
                        </div>
                    </td>
                </tr>
                <tr>
                    <td class="th-dark">보호자 / 자택</td>
                    <td colspan="2" style="text-align: center; padding: 0;">
                        <div style="display: flex; align-items: center; justify-content: center; gap: 5px; height: 100%; min-height: 35px;">
                            <span style="color: #94a3b8; font-weight: 500; font-size: 12px; margin-right: 5px; white-space: nowrap;">보호자</span>
                            <span style="color: #94a3b8; font-weight: 500; white-space: nowrap;">010 - </span>
                            <input type="tel" id="parentPhone-${id}" value="${(data.부모연락처 || '').replace(/^010-?/, '')}" maxlength="9" placeholder="0000-0000" style="width: 100px; text-align: center; background: transparent; border: none; outline: none; font-family: inherit;">
                        </div>
                    </td>
                    <td colspan="2" style="text-align: center; padding: 0;">
                        <div style="display: flex; align-items: center; justify-content: center; gap: 5px; height: 100%; min-height: 35px;">
                            <span style="color: #94a3b8; font-weight: 500; font-size: 12px; margin-right: 5px; white-space: nowrap;">자택</span>
                            <span style="color: #94a3b8; font-weight: 500; white-space: nowrap;">02 - </span>
                            <input type="tel" id="homePhone-${id}" value="" maxlength="9" placeholder="0000-0000" style="width: 100px; text-align: center; background: transparent; border: none; outline: none; font-family: inherit;">
                        </div>
                    </td>
                </tr>
                <tr>
                    <td class="th-dark">회원구분</td>
                    <td colspan="5">
                        <select id="type-${id}" style="text-align: center; text-align-last: center; width: 100%; background: transparent; border: none; outline: none; font-family: inherit;">
                            <option value="student" ${memberType === 'student' ? 'selected' : ''}>학생</option>
                            <option value="general" ${memberType === 'general' ? 'selected' : ''}>일반인</option>
                        </select>
                    </td>
                </tr>
                <tr>
                    <td class="th-dark">학교</td>
                    <td colspan="2"><input type="text" id="school-${id}" value="${schoolName}" placeholder="학교명" style="text-align: center; width: 100%; background: transparent; border: none; outline: none; font-family: inherit;"></td>
                    <td colspan="3" style="border: none; padding: 5px;">
                        <div style="display: flex; gap: 5px; width: 100%;">
                            <select id="schoolLevel-${id}" style="flex: 1; border: 1px solid #cbd5e1; border-radius: 4px; padding: 5px; box-sizing: border-box; background: transparent; outline: none; font-family: inherit;">
                                <option value="">구분</option>
                                <option value="고등학교" ${schoolLevel === '고등학교' ? 'selected' : ''}>고등학교</option>
                                <option value="중학교" ${schoolLevel === '중학교' ? 'selected' : ''}>중학교</option>
                                <option value="초등학교" ${schoolLevel === '초등학교' ? 'selected' : ''}>초등학교</option>
                                <option value="대학교" ${schoolLevel === '대학교' ? 'selected' : ''}>대학교</option>
                            </select>
                            <select id="grade-${id}" style="flex: 1; border: 1px solid #cbd5e1; border-radius: 4px; padding: 5px; box-sizing: border-box; background: transparent; outline: none; font-family: inherit;">
                                <option value="">학년</option>
                                <option value="1" ${grade === '1' ? 'selected' : ''}>1</option>
                                <option value="2" ${grade === '2' ? 'selected' : ''}>2</option>
                                <option value="3" ${grade === '3' ? 'selected' : ''}>3</option>
                                <option value="4" ${grade === '4' ? 'selected' : ''}>4</option>
                                <option value="5" ${grade === '5' ? 'selected' : ''}>5</option>
                                <option value="6" ${grade === '6' ? 'selected' : ''}>6</option>
                            </select>
                        </div>
                    </td>
                </tr>
                <tr>
                    <td class="th-dark">수강과목</td>
                    <td colspan="5" style="text-align: left; padding: 5px;">
                        <div id="course-container-${id}">
                            <div class="course-row-${id}" style="display: flex; gap: 5px; width: 100%; margin-bottom: 5px;">
                                <input type="text" class="courseName-${id}" value="${data.수강과목 || ''}" placeholder="과정명 입력 또는 선택" list="course_datalist_options" style="flex: 2; padding: 6px; border: 1px solid #cbd5e1; border-radius: 4px; background: transparent; outline: none; font-family: inherit;">
                                <input type="text" class="courseTime-${id}" value="${data.과정체크 || ''}" placeholder="시간/요일 입력" list="time_datalist_options" style="flex: 1; padding: 6px; border: 1px solid #cbd5e1; border-radius: 4px; background: transparent; outline: none; font-family: inherit;">
                                <button type="button" onclick="this.parentElement.remove()" style="background: #ef4444; color: white; border: none; border-radius: 4px; width: 30px; cursor: pointer; font-weight: bold; font-size: 16px; padding: 0;">-</button>
                            </div>
                        </div>
                        <button type="button" onclick="addAICourseRow('${id}')" style="margin-top: 5px; padding: 6px; border-radius: 4px; background: #3b82f6; color: white; border: none; font-size: 13px; cursor: pointer; display: flex; align-items: center; gap: 4px; justify-content: center; width: 100%;">
                            <span style="font-weight: bold; font-size: 14px;">+</span> 과정 추가
                        </button>
                    </td>
                </tr>
                <tr>
                    <td class="th-dark">시작일</td>
                    <td colspan="5" style="padding: 5px;">
                        <input type="date" id="startDate-${id}" value="${(() => {
                            if (!data.수강시작일) return '';
                            let match = data.수강시작일.match(/(\d{4})[년\-.\/]\s*(\d{1,2})[월\-.\/]\s*(\d{1,2})/);
                            if (match) {
                                return match[1] + '-' + match[2].padStart(2, '0') + '-' + match[3].padStart(2, '0');
                            }
                            return '';
                        })()}" style="width: 100%; text-align: left; border: 1px solid #cbd5e1; border-radius: 4px; padding: 6px 10px; background: transparent; cursor: pointer; font-size: 14px; box-sizing: border-box; outline: none; font-family: inherit;">
                    </td>
                </tr>
                <tr>
                    <td class="th-dark">비고</td>
                    <td colspan="5" style="padding: 5px;">
                        <input type="text" id="notes-${id}" value="" placeholder="특이사항 입력" style="width: 100%; text-align: left; background: transparent; border: 1px solid transparent; outline: none; font-family: inherit; padding: 6px 5px;">
                    </td>
                </tr>
                <!-- Removed old AI fee row -->
            </table>
            
            <!-- Premium Paper Form UI -->
            <div style="margin-top: 10px; border-top: 2px dashed #cbd5e1; padding-top: 10px; overflow-x: auto;">
                <table class="dark-table" style="border-top: none; margin: 0 auto; border-collapse: collapse; font-size: 12px;">
                    <tr>
                        <td class="th-dark" style="width: 15%; padding: 4px;">I.D</td>
                        <td colspan="2" style="padding: 4px;"><input type="text" id="paper_id-${id}" style="text-align: center; width: 100%; background: transparent; border: none; outline: none; font-family: inherit;"></td>
                        <td class="th-dark" rowspan="2" style="width: 15%; padding: 4px;">전자메일</td>
                        <td rowspan="2" colspan="2" style="padding: 2px;">
                            <div style="display: flex; align-items: center; justify-content: center; gap: 4px; padding: 0 2px; width: 100%;">
                                <input type="text" id="paper_email_id-${id}" style="flex: 1; text-align: right; font-size: 12px; min-width: 40px; background: transparent; border: 1px solid transparent; outline: none; font-family: inherit;">
                                <span style="font-weight: bold; color: #475569;">@</span>
                                <input type="text" id="paper_email_domain_manual-${id}" style="display: none; flex: 1.2; text-align: left; font-size: 12px; min-width: 50px; background: transparent; border: 1px solid #cbd5e1; border-radius: 4px; padding: 2px;" placeholder="직접 입력">
                                <select id="paper_email_domain_select-${id}" style="flex: 1.2; padding: 2px; box-sizing: border-box; font-family: inherit; font-size: 12px; min-width: 70px; background: transparent; border: 1px solid #cbd5e1; border-radius: 4px;" onchange="if(this.value==='direct'){document.getElementById('paper_email_domain_manual-${id}').style.display='block';this.style.display='none';}">
                                    <option value="">도메인 선택</option>
                                    <option value="naver.com">naver.com</option>
                                    <option value="gmail.com">gmail.com</option>
                                    <option value="daum.net">daum.net</option>
                                    <option value="hanmail.net">hanmail.net</option>
                                    <option value="nate.com">nate.com</option>
                                    <option value="direct">직접 입력</option>
                                </select>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td class="th-dark" style="padding: 4px;">비밀번호</td>
                        <td colspan="2" style="padding: 4px;"><input type="text" id="paper_pw-${id}" style="text-align: center; width: 100%; background: transparent; border: none; outline: none; font-family: inherit;"></td>
                    </tr>
                    <tr>
                        <td class="th-dark" style="padding: 4px;">수강료</td>
                        <td colspan="2" style="text-align: left; padding: 4px;">
                            <div style="display: flex; align-items: center; height: 22px;">₩ <input type="text" id="paper_tuition-${id}" value="${data.수강료 || ''}" style="flex: 1; margin-left: 5px; background: transparent; border: none; outline: none; font-family: inherit;"></div>
                        </td>
                        <td class="th-dark" style="padding: 4px;">락카</td>
                        <td colspan="2" style="padding: 4px;"><input type="text" id="paper_locker-${id}" style="text-align: center; height: 100%; width: 100%; background: transparent; border: none; outline: none; font-family: inherit;"></td>
                    </tr>
                    <tr>
                        <td class="th-dark" style="padding: 4px;">도구비</td>
                        <td colspan="2" style="text-align: left; padding: 4px;">
                            <div style="display: flex; align-items: center; height: 22px;">₩ <input type="text" id="paper_tool_fee-${id}" value="${data.도구비 || ''}" style="flex: 1; margin-left: 5px; background: transparent; border: none; outline: none; font-family: inherit;"></div>
                        </td>
                        <td class="th-dark" style="font-size: 11px; line-height: 1.1; padding: 2px;">
                            <div style="display: flex; flex-direction: column; align-items: flex-start; justify-content: center; height: 100%; gap: 1px;">
                                <label style="cursor: pointer; display: flex; align-items: center; gap: 2px;"><input type="checkbox" id="paper_book_prac-${id}" style="margin:0;"> 실기책</label>
                                <label style="cursor: pointer; display: flex; align-items: center; gap: 2px;"><input type="checkbox" id="paper_book_theory-${id}" style="margin:0;"> 필기책</label>
                            </div>
                        </td>
                        <td colspan="2" style="text-align: left; padding: 4px;">
                            <div style="display: flex; align-items: center; height: 22px;">₩ <input type="text" id="paper_book_price-${id}" style="flex: 1; margin-left: 5px; background: transparent; border: none; outline: none; font-family: inherit;"></div>
                        </td>
                    </tr>
                    <tr>
                        <td class="th-dark" style="padding: 4px;">결제금액</td>
                        <td colspan="2" style="text-align: left; padding: 4px;">
                            <div style="display: flex; align-items: center; height: 22px;">₩ <input type="text" id="paper_total-${id}" value="${data.결제금액 || ''}" style="flex: 1; margin-left: 5px; background: transparent; border: none; outline: none; font-family: inherit;"></div>
                        </td>
                        <td colspan="3" style="text-align: left; padding: 4px; white-space: nowrap;">
                            <div style="display: flex; align-items: center; justify-content: flex-start; gap: 4px;">
                                <span style="color: #64748b; font-size: 11px; white-space: nowrap;">등록일</span>
                                <input type="date" id="paper_date-${id}" value="${(() => {
                                    if (data.등록일) {
                                        let match = data.등록일.match(/(\d{4})[년\-.\/]\s*(\d{1,2})[월\-.\/]\s*(\d{1,2})/);
                                        if (match) return match[1] + '-' + match[2].padStart(2, '0') + '-' + match[3].padStart(2, '0');
                                    }
                                    return document.getElementById('masterDateSelector')?.value || new Date().toISOString().split('T')[0];
                                })()}" style="flex: 1; text-align: center; border: 1px solid #cbd5e1; border-radius: 4px; padding: 1px 4px; background: transparent; color: #1e293b; cursor: pointer; font-family: inherit; font-size: 11px;">
                            </div>
                        </td>
                    </tr>
                </table>
                <table class="dark-table" style="border-top: none; width: auto; min-width: unset; margin: 0 auto; border-collapse: collapse; font-size: 12px;">
                    <tr class="th-dark">
                        <td style="width: 14.2%; padding: 4px;"><label style="cursor: pointer;"><input type="checkbox" id="course_bake-${id}" ${isBake ? 'checked' : ''} style="margin:0;"> 제과</label></td>
                        <td style="width: 14.2%; padding: 4px;"><label style="cursor: pointer;"><input type="checkbox" id="course_bread-${id}" ${isBread ? 'checked' : ''} style="margin:0;"> 제빵</label></td>
                        <td style="width: 14.2%; padding: 4px;"><label style="cursor: pointer;"><input type="checkbox" id="course_korean-${id}" ${isKorean ? 'checked' : ''} style="margin:0;"> 한식</label></td>
                        <td style="width: 14.2%; padding: 4px;"><label style="cursor: pointer;"><input type="checkbox" id="course_western-${id}" ${isWestern ? 'checked' : ''} style="margin:0;"> 양식</label></td>
                        <td style="width: 14.2%; padding: 4px;"><label style="cursor: pointer;"><input type="checkbox" id="course_japanese-${id}" ${isJapanese ? 'checked' : ''} style="margin:0;"> 일식</label></td>
                        <td style="width: 14.2%; padding: 4px;"><label style="cursor: pointer;"><input type="checkbox" id="course_chinese-${id}" ${isChinese ? 'checked' : ''} style="margin:0;"> 중식</label></td>
                        <td style="width: 14.8%; padding: 4px;"><label style="cursor: pointer;"><input type="checkbox" id="course_puffer-${id}" ${isPuffer ? 'checked' : ''} style="margin:0;"> 복어</label></td>
                    </tr>
                    <tr class="th-dark">
                        <td colspan="3" style="padding: 4px;"><label style="cursor: pointer;"><input type="checkbox" id="time_10-${id}" ${check10 ? 'checked' : ''} style="margin:0;"> 10시</label></td>
                        <td colspan="2" style="padding: 4px;"><label style="cursor: pointer;"><input type="checkbox" id="time_5-${id}" ${check5 ? 'checked' : ''} style="margin:0;"> 5시</label></td>
                        <td colspan="2" style="padding: 4px;"><label style="cursor: pointer;"><input type="checkbox" id="time_7-${id}" ${check7 ? 'checked' : ''} style="margin:0;"> 7시</label></td>
                    </tr>
                    <tr>
                        <td colspan="7" style="height: 60px; vertical-align: top; text-align: left; padding: 5px;">
                            <textarea id="paper_notes-${id}" style="width:100%; height:100%; background:transparent; border:none; color:#1e293b; resize:none; font-size: 12px; outline: none; font-family: inherit;" placeholder="메모 및 비고 입력...">${data.비고 || ''}</textarea>
                        </td>
                    </tr>
                    <tr class="th-dark">
                        <td colspan="4" style="text-align: left; padding-left: 10px; border-right: none; font-size: 11px; letter-spacing: 1px; padding: 4px;">세종요리제과기술학원</td>
                        <td colspan="3" style="text-align: right; padding-right: 10px; border-left: none; font-size: 11px; letter-spacing: 1px; padding: 4px;">031)986-1933</td>
                    </tr>
                </table>
            </div>
        </div>
        <div class="card-actions" style="display: flex; gap: 10px;">
            <button class="btn-save" onclick="saveStudent('${id}')" style="background: #4ade80; color: #064e3b; flex: 1; padding: 12px; border-radius: 8px; font-weight: bold; font-size: 14px; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 5px;"><i class="fas fa-save"></i> 수강생 대장등록</button>
            <button class="btn-delete" onclick="removeCard('${id}')" style="background: #3f3f46; color: #f87171; flex: 0 0 50px; padding: 12px; border-radius: 8px; border: none; cursor: pointer;"><i class="fas fa-trash"></i></button>
        </div>
    `;
}

function renderPhonebookResult(id, dataList) {
    if (dataList.length === 0) {
        updateCardStatus(id, 'error', '데이터 없음');
        document.getElementById(`content-${id}`).innerHTML = '<p style="text-align:center;color:#94a3b8;">추출된 데이터가 없습니다.</p>';
        return;
    }
    
    updateCardStatus(id, 'success', `${dataList.length}명 추출됨`);
    const content = document.getElementById(`content-${id}`);
    
    let html = '<div style="max-height:200px; overflow-y:auto; margin-bottom:15px; border:1px solid #cbd5e1; border-radius:6px; padding:10px; background:#f8fafc;">';
    
    dataList.forEach((item, index) => {
        html += `
            <div style="display:flex; gap:10px; margin-bottom:10px; align-items:center; flex-wrap:wrap;">
                <input type="text" id="pb-name-${id}-${index}" value="${item.이름 || ''}" placeholder="이름" style="width:25%; background:transparent; border:1px solid #cbd5e1; color:#1e293b; padding:5px; border-radius:4px;">
                <input type="text" id="pb-phone-${id}-${index}" value="${item.본인전화번호 || item.전화번호 || ''}" placeholder="본인연락처" style="width:33%; background:transparent; border:1px solid #cbd5e1; color:#1e293b; padding:5px; border-radius:4px;">
                <input type="text" id="pb-parent-${id}-${index}" value="${item.부모전화번호 || ''}" placeholder="부모연락처" style="width:33%; background:transparent; border:1px solid #cbd5e1; color:#1e293b; padding:5px; border-radius:4px;">
            </div>
        `;
    });
    html += '</div>';
    
    html += `
        <div class="card-actions">
            <button class="btn-save" onclick="savePhonebook('${id}', ${dataList.length})"><i class="fas fa-save"></i> 일괄 등록</button>
            <button class="btn-delete" onclick="removeCard('${id}')"><i class="fas fa-trash"></i></button>
        </div>
    `;
    
    content.innerHTML = html;
}

function removeCard(id) {
    document.getElementById(`card-${id}`).remove();
}

function addAICourseRow(id) {
    const container = document.getElementById(`course-container-${id}`);
    if (!container) return;

    const div = document.createElement('div');
    div.className = `course-row-${id}`;
    div.style.cssText = 'display: flex; gap: 5px; width: 100%; margin-bottom: 5px;';

    div.innerHTML = `
        <input type="text" class="courseName-${id}" placeholder="과정명 입력 또는 선택" list="course_datalist_options" style="flex: 2; padding: 6px; border: 1px solid #cbd5e1; border-radius: 4px; background: transparent; outline: none; font-family: inherit;">
        <input type="text" class="courseTime-${id}" placeholder="시간/요일 입력" list="time_datalist_options" style="flex: 1; padding: 6px; border: 1px solid #cbd5e1; border-radius: 4px; background: transparent; outline: none; font-family: inherit;">
        <button type="button" onclick="this.parentElement.remove()" style="background: #ef4444; color: white; border: none; border-radius: 4px; width: 30px; cursor: pointer; font-weight: bold; font-size: 16px; padding: 0;">-</button>
    `;

    container.appendChild(div);
}

async function saveStudent(id) {
    const nameInput = document.getElementById(`name-${id}`);
    const phoneInput = document.getElementById(`phone-${id}`);
    
    // Gather all course rows
    const courseNameInputs = document.querySelectorAll(`.courseName-${id}`);
    const courseTimeInputs = document.querySelectorAll(`.courseTime-${id}`);
    
    let courseList = [];
    // 1. Gather from old dynamic rows
    for (let i = 0; i < courseNameInputs.length; i++) {
        let cName = courseNameInputs[i].value.trim();
        let cTime = courseTimeInputs[i].value.trim();
        if (cName) {
            let timeStr = cTime ? `(${cTime})` : '';
            courseList.push(`${cName}${timeStr}`);
        }
    }
    
    // 2. Gather from Premium Checkboxes
    let premiumCourses = [];
    const courseMap = {
        'bake': '제과', 'bread': '제빵', 'korean': '한식', 
        'western': '양식', 'japanese': '일식', 'chinese': '중식', 'puffer': '복어'
    };
    for (const [key, val] of Object.entries(courseMap)) {
        if (document.getElementById(`course_${key}-${id}`)?.checked) {
            premiumCourses.push(val);
        }
    }
    
    let premiumTimes = [];
    if (document.getElementById(`time_10-${id}`)?.checked) premiumTimes.push('10시');
    if (document.getElementById(`time_5-${id}`)?.checked) premiumTimes.push('5시');
    if (document.getElementById(`time_7-${id}`)?.checked) premiumTimes.push('7시');
    
    if (premiumCourses.length > 0) {
        let timeSuffix = premiumTimes.length > 0 ? `(${premiumTimes.join(', ')})` : '';
        courseList.push(premiumCourses.join(', ') + timeSuffix);
    }
    
    // Remove duplicates and join
    const finalCourse = [...new Set(courseList)].join(' / ');
    
    if (!nameInput.value || !phoneInput.value) {
        alert('이름과 전화번호는 필수입니다.');
        return;
    }

    const gender = document.getElementById(`gender-${id}`)?.value || '';
    const birth = document.getElementById(`birth-${id}`)?.value || '';
    const fee = document.getElementById(`paper_tuition-${id}`)?.value || '';
    const toolFee = document.getElementById(`paper_tool_fee-${id}`)?.value || '';
    const totalFee = document.getElementById(`paper_total-${id}`)?.value || '';
    
    let aiNotes = `[AI분석] 성별: ${gender}, 생년월일: ${birth}\n수강료: ${fee}, 도구비: ${toolFee}, 총결제금액: ${totalFee}`;
    let userNotes = document.getElementById(`notes-${id}`)?.value || '';
    let paperNotes = document.getElementById(`paper_notes-${id}`)?.value || '';
    
    let notesArr = [];
    if (userNotes) notesArr.push(userNotes);
    if (paperNotes) notesArr.push(paperNotes);
    notesArr.push(aiNotes);
    let combinedNotes = notesArr.join('\n');

    const emailId = document.getElementById(`paper_email_id-${id}`)?.value || '';
    const domainSelect = document.getElementById(`paper_email_domain_select-${id}`)?.value || '';
    const domainManual = document.getElementById(`paper_email_domain_manual-${id}`)?.value || '';
    let domain = domainSelect === 'direct' ? domainManual : domainSelect;
    let paper_email = '';
    if (emailId && domain) paper_email = `${emailId}@${domain}`;

    const birthValue = document.getElementById(`birth-${id}`)?.value || '';

    const studentData = {
        id: String(Date.now()), // Generate ID locally
        name: nameInput?.value || '',
        phone: phoneInput?.value || '',
        phone_guardian: document.getElementById(`parentPhone-${id}`)?.value || '',
        address: document.getElementById(`address-${id}`)?.value || '',
        school: document.getElementById(`school-${id}`)?.value || '',
        course_select: '', // Usually unused if course is populated
        start_date: document.getElementById(`startDate-${id}`)?.value || '',
        course: finalCourse,
        notes: combinedNotes,
        registeredDate: document.getElementById(`paper_date-${id}`)?.value || new Date().toISOString().split('T')[0],
        type: document.getElementById(`type-${id}`)?.value || 'student',
        school_level: document.getElementById(`schoolLevel-${id}`)?.value || '',
        grade: document.getElementById(`grade-${id}`)?.value || '',
        resident_num: birthValue
    };

    try {
        const btn = document.querySelector(`#card-${id} .btn-save`);
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 저장 중...';
        btn.disabled = true;

        // Fetch current members
        const res = await fetch('/api/sejong/members');
        const data = await res.json();
        let members = Array.isArray(data) && data.length > 0 ? data[0] : (data.key === "members" ? data.value : data);
        if (!Array.isArray(members)) members = [];

        // Check if exists
        let exists = members.find(m => m.name === studentData.name && m.phone === studentData.phone);
        if (exists) {
            alert('이미 등록된 수강생입니다.');
            btn.innerHTML = '<i class="fas fa-save"></i> 수강생 대장등록';
            btn.disabled = false;
            return;
        }

        // POST only the new student
        const saveRes = await fetch('/api/sejong/members', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(studentData)
        });

        if (saveRes.ok) {
            updateCardStatus(id, 'success', '등록 완료!');
            btn.innerHTML = '<i class="fas fa-check"></i> 등록 완료';
            btn.style.background = '#334155';
            btn.style.color = '#94a3b8';
            if (window.notifyMemberUpdate) window.notifyMemberUpdate();
        } else {
            const errJson = await saveRes.json();
            throw new Error(errJson.error || 'Save failed');
        }
    } catch (e) {
        alert('저장에 실패했습니다: ' + e.message);
        console.error(e);
        const btn = document.querySelector(`#card-${id} .btn-save`);
        btn.innerHTML = '<i class="fas fa-save"></i> 수강생 대장등록';
        btn.disabled = false;
    }
}

async function savePhonebook(id, count) {
    try {
        const btn = document.querySelector(`#card-${id} .btn-save`);
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 저장 중...';
        btn.disabled = true;

        const res = await fetch('/api/sejong/members');
        const data = await res.json();
        let members = Array.isArray(data) && data.length > 0 ? data[0] : (data.key === "members" ? data.value : data);
        if (!Array.isArray(members)) members = [];

        let added = 0;
        let newItems = [];
        for (let i = 0; i < count; i++) {
            const name = document.getElementById(`pb-name-${id}-${i}`)?.value || '';
            const phone = document.getElementById(`pb-phone-${id}-${i}`)?.value || '';
            const parentPhone = document.getElementById(`pb-parent-${id}-${i}`)?.value || '';
            
            if (name && !members.find(m => m.name === name && m.phone === phone)) {
                newItems.push({
                    id: String(Date.now() + i), // Generate ID locally
                    name: name,
                    phone: phone,
                    phone_guardian: parentPhone,
                    course: "전화번호부 업로드",
                    registeredDate: new Date().toISOString().split('T')[0]
                });
                added++;
            }
        }

        if (added > 0) {
            await fetch('/api/sejong/members', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newItems)
            });
            alert(`${added}명이 추가되었습니다.`);
        } else {
            alert('새로 추가할 명단이 없습니다 (중복).');
        }

        updateCardStatus(id, 'success', '등록 완료!');
        btn.innerHTML = '<i class="fas fa-check"></i> 등록 완료';
        btn.style.background = '#334155';
        btn.style.color = '#94a3b8';
    } catch (e) {
        alert('저장에 실패했습니다.');
        console.error(e);
        const btn = document.querySelector(`#card-${id} .btn-save`);
        btn.innerHTML = '<i class="fas fa-save"></i> 일괄 등록';
        btn.disabled = false;
    }
}
