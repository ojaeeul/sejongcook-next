const API_KEYS = [
    "AIzaSyAbithanLsxpTCThUf6yd_lAiw3fCLkN54",
    "AIzaSyBn8v_hFyHNQjhbrEBjf7G3iodTY7s5zCI",
    "AIzaSyBP3YmvRI1XVg6Y4rMTtwLLXMu6mC8AfX8",
    "AIzaSyDglNiKFOHCXVkAevVB8BVr4oKfDieU5-g",
    "AIzaSyD8MzvUbpcZOWtMk_vQD4Z3P1ocXJQ-pfU",
    "AIzaSyBRSlx0rJxcYb60Rs1Wwjz-GY-8bxXSyZk",
    "AIzaSyAPLn64NWRvp5zriu-bgYLBIlkODaPakWE",
    "AIzaSyCUi7c-ZLpN_H-wNQxglQMcCj12Ojsv0NI",
    "AIzaSyDMhvfs3HHb_mI0Cew5dOJFxj7r7vYjxEM"
];

let keyIdx = 0;
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
});

async function handleFiles(files) {
    const validFiles = Array.from(files).filter(f => f.type.startsWith('image/') || f.type === 'application/pdf');
    if (validFiles.length === 0) {
        alert('이미지(JPG, PNG) 또는 PDF 파일만 업로드 가능합니다.');
        return;
    }

    totalFiles += validFiles.length;
    updateProgress();

    for (let file of validFiles) {
        if (file.type === 'application/pdf') {
            await processPDF(file);
        } else {
            await processImage(file);
        }
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
    try {
        const fileReader = new FileReader();
        fileReader.onload = async function() {
            const typedarray = new Uint8Array(this.result);
            const pdf = await pdfjsLib.getDocument(typedarray).promise;
            
            totalFiles += pdf.numPages - 1; // Adjust total files for PDF pages
            updateProgress();

            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const viewport = page.getViewport({ scale: 1.5 });
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                canvas.height = viewport.height;
                canvas.width = viewport.width;

                await page.render({ canvasContext: context, viewport: viewport }).promise;
                
                const base64Data = canvas.toDataURL('image/jpeg', 0.8).split(',')[1];
                await analyzeImage(base64Data, `${file.name} (페이지 ${i})`, canvas.toDataURL('image/jpeg', 0.8));
            }
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
                // Resize image to max 900px to speed up upload drastically (Fast Mode)
                const maxSize = 900;
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
                
                const dataUrl = canvas.toDataURL('image/jpeg', 0.6);
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
            <img src="${imgUrl}" class="image-preview" style="display:block; width:100%;">
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

async function analyzeImage(base64Data, fileName, imgUrl) {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    const card = createCardUI(fileName, imgUrl, id);
    
    let prompt = "";
    if (currentMode === 'phonebook') {
        prompt = `이 이미지는 요리학원의 전화번호부입니다. 
목록에서 이름과 전화번호를 추출해주세요. 
반드시 다음 JSON 형식의 배열로 반환하세요:
[
  {"이름": "홍길동", "전화번호": "010-1234-5678"}
]
찾을 수 없으면 빈 배열 []을 반환하세요. JSON 코드 블록 없이 순수 JSON 텍스트만 출력하세요.`;
    } else {
        prompt = `이 이미지는 요리학원의 수강생 등록 원서입니다. 
사용자가 직접 펜으로 적은 글씨와 펜으로 동그라미 친 부분을 완벽하게 인식해주세요.

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

    let result = null;
    let maxRetries = 30;
    let lastError = "";
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
        const key = getNextKey();
        if (!key) {
            lastError = 'API 키가 모두 소진되었습니다.';
            break;
        }

        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${key}`;
        
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                        parts: [
                            { text: prompt },
                            { inlineData: { mimeType: "image/jpeg", data: base64Data } }
                        ]
                    }],
                    generationConfig: { temperature: 0.1, responseMimeType: "application/json" }
                })
            });

            if (response.status === 200) {
                const data = await response.json();
                if (data.candidates && data.candidates.length > 0) {
                    let text = data.candidates[0].content.parts[0].text;
                    text = text.replace(/```json/g, '').replace(/```/g, '').trim();
                    try {
                        result = JSON.parse(text);
                        break;
                    } catch (parseErr) {
                        console.error('JSON Parse Error:', parseErr, 'Text:', text);
                        lastError = '결과 데이터 파싱 실패';
                        await new Promise(r => setTimeout(r, 1000));
                        continue;
                    }
                } else {
                    lastError = 'AI가 결과를 반환하지 않았습니다.';
                    await new Promise(r => setTimeout(r, 1000));
                    continue;
                }
            } else if (response.status === 429) {
                console.warn('Rate limit exceeded (429), retrying...');
                lastError = '요청이 너무 많습니다 (429). 재시도 중...';
                await new Promise(r => setTimeout(r, 3000));
                continue;
            } else if ([400, 403, 404].includes(response.status)) {
                console.warn(`API Error ${response.status} with key... removing key.`);
                lastError = `API 인증/오류 (${response.status})`;
                API_KEYS.splice(API_KEYS.indexOf(key), 1);
                continue;
            } else {
                console.warn(`Unexpected status ${response.status}`);
                lastError = `서버 오류 (${response.status})`;
                await new Promise(r => setTimeout(r, 1000));
            }
        } catch (e) {
            console.error('Fetch error:', e);
            lastError = `네트워크 오류: ${e.message}`;
            await new Promise(r => setTimeout(r, 1000));
        }
    }

    processingCount++;
    updateProgress();

    if (result) {
        if (currentMode === 'phonebook' && Array.isArray(result)) {
            renderPhonebookResult(id, result);
        } else if (currentMode === 'student') {
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
            <table style="width: 100%; border-collapse: collapse; font-size: 13px; color: #fff; text-align: center; border: 1px solid #334155;">
                <tr>
                    <td style="border: 1px solid #334155; padding: 5px; background: #1e293b; width: 15%;">성명</td>
                    <td style="border: 1px solid #334155; padding: 5px;"><input type="text" id="name-${id}" value="${data.성명 || ''}" style="width: 100%; background: transparent; border: none; color: #fff; text-align: center;"></td>
                    <td style="border: 1px solid #334155; padding: 5px; background: #1e293b; width: 10%;">성별</td>
                    <td style="border: 1px solid #334155; padding: 5px; width: 10%;"><input type="text" id="gender-${id}" value="${data.성별 || ''}" style="width: 100%; background: transparent; border: none; color: #fff; text-align: center;"></td>
                    <td style="border: 1px solid #334155; padding: 5px; background: #1e293b; width: 15%;">생년월일</td>
                    <td style="border: 1px solid #334155; padding: 5px;"><input type="text" id="birth-${id}" value="${data.생년월일 || ''}" style="width: 100%; background: transparent; border: none; color: #fff; text-align: center;"></td>
                </tr>
                <tr>
                    <td style="border: 1px solid #334155; padding: 5px; background: #1e293b;">주소</td>
                    <td colspan="5" style="border: 1px solid #334155; padding: 5px;"><input type="text" id="address-${id}" value="${data.주소 || ''}" style="width: 100%; background: transparent; border: none; color: #fff;"></td>
                </tr>
                <tr>
                    <td rowspan="2" style="border: 1px solid #334155; padding: 5px; background: #1e293b;">연락처</td>
                    <td style="border: 1px solid #334155; padding: 5px; background: #1e293b;">본인</td>
                    <td colspan="4" style="border: 1px solid #334155; padding: 5px;"><input type="text" id="phone-${id}" value="${data.학생연락처 || ''}" style="width: 100%; background: transparent; border: none; color: #fff;"></td>
                </tr>
                <tr>
                    <td style="border: 1px solid #334155; padding: 5px; background: #1e293b;">부모</td>
                    <td colspan="4" style="border: 1px solid #334155; padding: 5px;"><input type="text" id="parentPhone-${id}" value="${data.부모연락처 || ''}" style="width: 100%; background: transparent; border: none; color: #fff;"></td>
                </tr>
                <tr>
                    <td style="border: 1px solid #334155; padding: 5px; background: #1e293b;">학교</td>
                    <td colspan="5" style="border: 1px solid #334155; padding: 5px;"><input type="text" id="school-${id}" value="${data.학교 || ''}" style="width: 100%; background: transparent; border: none; color: #fff;"></td>
                </tr>
                <tr>
                    <td style="border: 1px solid #334155; padding: 5px; background: #1e293b;">수강과목</td>
                    <td colspan="5" style="border: 1px solid #334155; padding: 5px;"><input type="text" id="courseName-${id}" value="${data.수강과목 || ''}" style="width: 100%; background: transparent; border: none; color: #fff;"></td>
                </tr>
                <tr>
                    <td style="border: 1px solid #334155; padding: 5px; background: #1e293b;">시작일</td>
                    <td colspan="5" style="border: 1px solid #334155; padding: 5px;"><input type="text" id="startDate-${id}" value="${data.수강시작일 || ''}" style="width: 100%; background: transparent; border: none; color: #fff;"></td>
                </tr>
                <tr>
                    <td style="border: 1px solid #334155; padding: 5px; background: #1e293b;">수강료</td>
                    <td style="border: 1px solid #334155; padding: 5px;"><input type="text" id="fee-${id}" value="${data.수강료 || ''}" style="width: 100%; background: transparent; border: none; color: #fff; text-align: center;"></td>
                    <td style="border: 1px solid #334155; padding: 5px; background: #1e293b;">도구비</td>
                    <td style="border: 1px solid #334155; padding: 5px;"><input type="text" id="toolFee-${id}" value="${data.도구비 || ''}" style="width: 100%; background: transparent; border: none; color: #fff; text-align: center;"></td>
                    <td style="border: 1px solid #334155; padding: 5px; background: #1e293b;">결제금액</td>
                    <td style="border: 1px solid #334155; padding: 5px;"><input type="text" id="totalFee-${id}" value="${data.결제금액 || ''}" style="width: 100%; background: transparent; border: none; color: #fff; text-align: center;"></td>
                </tr>
                <tr>
                    <td style="border: 1px solid #334155; padding: 5px; background: #1e293b;">체크과정</td>
                    <td colspan="5" style="border: 1px solid #334155; padding: 5px;"><input type="text" id="course-${id}" value="${combinedCourse}" style="width: 100%; background: transparent; border: none; color: #fff;"></td>
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
            <div style="display:flex; gap:10px; margin-bottom:10px; align-items:center;">
                <input type="text" id="pb-name-${id}-${index}" value="${item.이름 || ''}" style="width:30%; background:transparent; border:1px solid #334155; color:#fff; padding:5px; border-radius:4px;">
                <input type="text" id="pb-phone-${id}-${index}" value="${item.전화번호 || ''}" style="flex:1; background:transparent; border:1px solid #334155; color:#fff; padding:5px; border-radius:4px;">
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
            
            if (name && !members.find(m => m.name === name && m.phone === phone)) {
                newItems.push({
                    id: String(Date.now() + i), // Generate ID locally
                    name: name,
                    phone: phone,
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
