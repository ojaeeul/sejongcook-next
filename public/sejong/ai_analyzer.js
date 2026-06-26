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
    });

    const folderInput = document.getElementById('folderInput');
    if (folderInput) {
        folderInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                handleFiles(e.target.files);
            }
        });
    }
});

async function handleFiles(files) {
    const validFiles = Array.from(files).filter(f => f.type.startsWith('image/') || f.type === 'application/pdf');
    if (validFiles.length === 0) {
        alert('이미지(JPG, PNG) 또는 PDF 파일만 업로드 가능합니다.');
        return;
    }

    totalFiles += validFiles.length;
    updateProgress();

    const promises = [];
    for (let file of validFiles) {
        if (file.type === 'application/pdf') {
            promises.push(processPDF(file));
        } else {
            promises.push(processImage(file));
        }
    }
    await Promise.all(promises);
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
    try {
        const fileReader = new FileReader();
        fileReader.onload = async function() {
            const typedarray = new Uint8Array(this.result);
            const pdf = await pdfjsLib.getDocument(typedarray).promise;
            
            totalFiles += pdf.numPages - 1; // Adjust total files for PDF pages
            updateProgress();

            const analyzePromises = [];
            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const viewport = page.getViewport({ scale: 1.5 });
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                canvas.height = viewport.height;
                canvas.width = viewport.width;

                await page.render({ canvasContext: context, viewport: viewport }).promise;
                
                const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
                const base64Data = dataUrl.split(',')[1];
                analyzePromises.push(analyzeImage(base64Data, `${file.name} (페이지 ${i})`, dataUrl));
            }
            await Promise.all(analyzePromises);
        };
        fileReader.readAsArrayBuffer(file);
    } catch (e) {
        console.error('PDF 처리 실패', e);
        processingCount++;
        updateProgress();
    }
}

async function processImage(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = async () => {
                // Resize image to max 600px for EXTREME upload speed
                const maxSize = 600;
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
                
                const dataUrl = canvas.toDataURL('image/jpeg', 0.4);
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

function openImageModal(src) {
    const modal = document.getElementById('imageModal');
    const modalImg = document.getElementById('imageModalImg');
    if(modal && modalImg) {
        modalImg.src = src;
        currentModalRotation = 0;
        modalImg.style.transform = `rotate(0deg)`;
        modal.style.display = 'flex';
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

const CONCURRENCY_LIMIT = 2;
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
목록에서 이름과 전화번호를 추출해주세요.
- 제일 처음 적힌 번호나 관계 표시가 없는 번호는 '본인전화번호'로 분류하세요.
- 한문(母, 父)이나 한글(모, 부)로 표시된 번호는 '부모전화번호'로 분류하세요.
- 한 사람에게 전화번호가 3개 이상 있다면, 본인 번호끼리 또는 부모 번호끼리 콤마(,)로 연결해서 모두 표시하세요. (이름은 중복해서 여러 번 적지 말고 1번만 적어주세요.)
[절대 주의사항]
1. 사진에 없는 내용이나 이름(예: 김아영 등)을 절대 지어내지 마세요. (No Hallucination)
2. 글씨를 알아볼 수 없거나 비어있는 칸은 무조건 빈칸("")으로 처리하세요.
반드시 다음 JSON 형식의 배열로 반환하세요:
[
  {"이름": "민수정", "본인전화번호": "010-1243-6763, 031-888-6763", "부모전화번호": "010-3243-9286"}
]
이름이나 글씨를 절대 유추해서 획일화하지 말고, 적혀있는 그대로(예: 민지영, 민수정, 민원기, 민종훈, 문다빈, 문승희 등) 정확하게 판독하세요. 찾을 수 없으면 빈 배열 []을 반환하세요. JSON 코드 블록 없이 순수 JSON 텍스트만 출력하세요.`;
    } else {
        prompt = `이 이미지는 요리학원의 수강생 등록 원서입니다. 
사진이 거꾸로(180도) 찍혀 있거나 옆으로 돌아가 있을 수 있으니, 글자 방향을 스스로 판단하여 이미지를 회전시킨 상태로 읽어주세요.
사용자가 직접 펜으로 적은 글씨와 펜으로 동그라미 친 부분을 완벽하게 인식해주세요.
[절대 주의사항]
1. 사진에 없는 내용이나 이름(예: 김아영 등)을 절대 지어내지 마세요. (No Hallucination)
2. 글씨를 알아볼 수 없거나 비어있는 칸은 무조건 빈칸("")으로 처리하세요.

다음 정보를 추출하여 정확히 아래 형식의 JSON 객체로 반환하세요. JSON 코드 블록 없이 순수 JSON 텍스트만 출력하세요.
{
    "성명": "이름 추출",
    "성별": "남 또는 여 (동그라미 쳐진 것)",
    "생년월일": "YYYY년 M월 D일 형식",
    "주소": "주소 전체",
    "학생연락처": "수강생 본인 연락처",
    "부모연락처": "부모 연락처",
    "학교": "학교 및 학년 (예: 풍무중학교 3학년). 단, '일반'이라고 적혀있으면 '일반'으로 추출",
    "수강과목": "직접 펜으로 쓴 수강과목란 내용",
    "수강시작일": "YYYY년 M월 D일 HH:MM 형식",
    "수강료": "숫자만 (예: 250000)",
    "도구비": "숫자만",
    "결제금액": "숫자만",
    "과정체크": "하단 표에서 펜으로 동그라미 쳐진 과목명과 시간을 결합 (예: 한식(10시), 양식(5시)). 여러 개면 콤마로 연결."
}`;
    }

    // Call the local Next.js proxy instead of Google's endpoint directly
    let result = null;
    let lastError = null;

    let retryCount = 0;
    const maxRetries = 15;

    while (retryCount <= maxRetries && !result) {
        if (retryCount > 0) {
            updateCardStatus(id, 'processing', `서버 지연... 재시도 중 (${retryCount}/${maxRetries})`);
            await new Promise(resolve => setTimeout(resolve, 2000 * retryCount));
        }

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
                    }
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
                retryCount++;
            }
        } catch (e) {
            console.error('Fetch error:', e);
            lastError = `네트워크 오류: ${e.message}`;
            retryCount++;
        }
    }

    processingCount++;
    updateProgress();

    if (result) {
        if (currentMode === 'phonebook' && Array.isArray(result)) {
            renderPhonebookResult(id, result);
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
    
    // Convert course info for saving
    const combinedCourse = [data.수강과목, data.과정체크].filter(x => x).join(' / ');
    
    content.innerHTML = `
        <div class="result-table-wrapper" style="margin-bottom: 15px;">
            <table style="width: 100%; border-collapse: collapse; font-size: 11px; color: #fff; text-align: center; border: 1px solid #334155;">
                <tr>
                    <td style="border: 1px solid #334155; padding: 5px; background: #1e293b; width: 15%;">성명</td>
                    <td style="border: 1px solid #334155; padding: 5px;"><input type="text" id="name-${id}" value="${data.성명 || ''}" class="editable-input" style="text-align: center;"></td>
                    <td style="border: 1px solid #334155; padding: 5px; background: #1e293b; width: 10%;">성별</td>
                    <td style="border: 1px solid #334155; padding: 5px; width: 10%;"><input type="text" id="gender-${id}" value="${data.성별 || ''}" class="editable-input" style="text-align: center;"></td>
                    <td style="border: 1px solid #334155; padding: 5px; background: #1e293b; width: 15%;">생년월일</td>
                    <td style="border: 1px solid #334155; padding: 5px;"><input type="text" id="birth-${id}" value="${data.생년월일 || ''}" class="editable-input" style="text-align: center;"></td>
                </tr>
                <tr>
                    <td style="border: 1px solid #334155; padding: 5px; background: #1e293b;">주소</td>
                    <td colspan="5" style="border: 1px solid #334155; padding: 5px;"><input type="text" id="address-${id}" value="${data.주소 || ''}" class="editable-input"></td>
                </tr>
                <tr>
                    <td rowspan="2" style="border: 1px solid #334155; padding: 5px; background: #1e293b;">연락처</td>
                    <td style="border: 1px solid #334155; padding: 5px; background: #1e293b;">본인</td>
                    <td colspan="4" style="border: 1px solid #334155; padding: 5px;"><input type="text" id="phone-${id}" value="${data.학생연락처 || ''}" class="editable-input"></td>
                </tr>
                <tr>
                    <td style="border: 1px solid #334155; padding: 5px; background: #1e293b;">부모</td>
                    <td colspan="4" style="border: 1px solid #334155; padding: 5px;"><input type="text" id="parentPhone-${id}" value="${data.부모연락처 || ''}" class="editable-input"></td>
                </tr>
                <tr>
                    <td style="border: 1px solid #334155; padding: 5px; background: #1e293b;">학교</td>
                    <td colspan="5" style="border: 1px solid #334155; padding: 5px;"><input type="text" id="school-${id}" value="${data.학교 || ''}" class="editable-input"></td>
                </tr>
                <tr>
                    <td style="border: 1px solid #334155; padding: 5px; background: #1e293b;">수강과목</td>
                    <td colspan="5" style="border: 1px solid #334155; padding: 5px;"><input type="text" id="courseName-${id}" value="${data.수강과목 || ''}" class="editable-input"></td>
                </tr>
                <tr>
                    <td style="border: 1px solid #334155; padding: 5px; background: #1e293b;">시작일</td>
                    <td colspan="5" style="border: 1px solid #334155; padding: 5px;"><input type="text" id="startDate-${id}" value="${data.수강시작일 || ''}" class="editable-input"></td>
                </tr>
                <tr>
                    <td style="border: 1px solid #334155; padding: 5px; background: #1e293b;">수강료</td>
                    <td style="border: 1px solid #334155; padding: 5px;"><input type="text" id="fee-${id}" value="${data.수강료 || ''}" class="editable-input" style="text-align: center;"></td>
                    <td style="border: 1px solid #334155; padding: 5px; background: #1e293b;">도구비</td>
                    <td style="border: 1px solid #334155; padding: 5px;"><input type="text" id="toolFee-${id}" value="${data.도구비 || ''}" class="editable-input" style="text-align: center;"></td>
                    <td style="border: 1px solid #334155; padding: 5px; background: #1e293b;">결제금액</td>
                    <td style="border: 1px solid #334155; padding: 5px;"><input type="text" id="totalFee-${id}" value="${data.결제금액 || ''}" class="editable-input" style="text-align: center;"></td>
                </tr>
                <tr>
                    <td style="border: 1px solid #334155; padding: 5px; background: #1e293b;">체크과정</td>
                    <td colspan="5" style="border: 1px solid #334155; padding: 5px;"><input type="text" id="course-${id}" value="${combinedCourse}" class="editable-input"></td>
                </tr>
            </table>
        </div>
        <div class="card-actions">
            <button class="btn-save" onclick="saveStudent('${id}')"><i class="fas fa-save"></i> 명단에 등록</button>
            <button class="btn-delete" onclick="removeCard('${id}')"><i class="fas fa-trash"></i></button>
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
    
    let html = '<div style="max-height:200px; overflow-y:auto; margin-bottom:15px; border:1px solid #334155; border-radius:6px; padding:10px; background:#0f172a;">';
    
    dataList.forEach((item, index) => {
        html += `
            <div style="display:flex; gap:10px; margin-bottom:10px; align-items:center; flex-wrap:wrap;">
                <input type="text" id="pb-name-${id}-${index}" value="${item.이름 || ''}" placeholder="이름" style="width:25%; background:transparent; border:1px solid #334155; color:#fff; padding:5px; border-radius:4px;">
                <input type="text" id="pb-phone-${id}-${index}" value="${item.본인전화번호 || item.전화번호 || ''}" placeholder="본인연락처" style="width:33%; background:transparent; border:1px solid #334155; color:#fff; padding:5px; border-radius:4px;">
                <input type="text" id="pb-parent-${id}-${index}" value="${item.부모전화번호 || ''}" placeholder="부모연락처" style="width:33%; background:transparent; border:1px solid #334155; color:#fff; padding:5px; border-radius:4px;">
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

async function saveStudent(id) {
    const nameInput = document.getElementById(`name-${id}`);
    const phoneInput = document.getElementById(`phone-${id}`);
    const courseInput = document.getElementById(`course-${id}`);
    
    if (!nameInput.value || !phoneInput.value) {
        alert('이름과 전화번호는 필수입니다.');
        return;
    }

    const gender = document.getElementById(`gender-${id}`)?.value || '';
    const birth = document.getElementById(`birth-${id}`)?.value || '';
    const fee = document.getElementById(`fee-${id}`)?.value || '';
    const toolFee = document.getElementById(`toolFee-${id}`)?.value || '';
    const totalFee = document.getElementById(`totalFee-${id}`)?.value || '';
    
    let notes = `[AI분석] 성별: ${gender}, 생년월일: ${birth}\n수강료: ${fee}, 도구비: ${toolFee}, 총결제금액: ${totalFee}`;

    const studentData = {
        id: String(Date.now()), // Generate ID locally
        name: nameInput?.value || '',
        phone: phoneInput?.value || '',
        phone_guardian: document.getElementById(`parentPhone-${id}`)?.value || '',
        address: document.getElementById(`address-${id}`)?.value || '',
        school: document.getElementById(`school-${id}`)?.value || '',
        course_select: document.getElementById(`courseName-${id}`)?.value || '',
        start_date: document.getElementById(`startDate-${id}`)?.value || '',
        course: courseInput?.value || '',
        notes: notes,
        registeredDate: new Date().toISOString().split('T')[0]
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
            btn.innerHTML = '<i class="fas fa-save"></i> 명단에 등록';
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
        } else {
            throw new Error('Save failed');
        }
    } catch (e) {
        alert('저장에 실패했습니다.');
        console.error(e);
        const btn = document.querySelector(`#card-${id} .btn-save`);
        btn.innerHTML = '<i class="fas fa-save"></i> 명단에 등록';
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
