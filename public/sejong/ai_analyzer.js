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
let global_course_options = [];
let global_time_options = [];

async function loadGlobalCourseTimeSettings() {
    try {
        const [settingsRes, membersRes] = await Promise.all([
            fetch(`/api/sejong/settings?t=${Date.now()}`),
            fetch(`/api/sejong/members?t=${Date.now()}`)
        ]);
        const data = await settingsRes.json();
        const members = await membersRes.json();
        
        let settings = Array.isArray(data) && data.length > 0 ? data[0] : (data.key === "settings" ? data.value : data);
        
        const courseSet = new Set();
        const timeSet = new Set(['10:00', '17:00', '19:00']);

        if (Array.isArray(members)) {
            members.forEach(m => {
                if (m.course) {
                    const parts = m.course.split(',').map(s => s.trim());
                    parts.forEach(p => {
                        const match = p.match(/(.*?)\((.*?)\)/);
                        if (match) {
                            courseSet.add(match[1].trim());
                            timeSet.add(match[2].trim());
                        } else {
                            courseSet.add(p.trim());
                        }
                    });
                }
                if (m.timeSlot) {
                    m.timeSlot.split(',').forEach(t => timeSet.add(t.trim()));
                }
            });
        }
        
        courseSet.delete('');
        timeSet.delete('');
        
        if (courseSet.size > 0) {
            global_course_options = Array.from(courseSet);
        } else if (settings && settings.courses) {
            global_course_options = settings.courses;
        }
        
        global_time_options = Array.from(timeSet).sort();
        
    } catch(e) {
        console.error("Failed to load global settings", e);
    }

    // 재생성 로직
    let courseDl = document.getElementById('course_datalist_options');
    if (courseDl) courseDl.remove();
    courseDl = document.createElement('datalist');
    courseDl.id = 'course_datalist_options';
    global_course_options.forEach(c => {
        const opt = document.createElement('option');
        opt.value = c;
        courseDl.appendChild(opt);
    });
    document.body.appendChild(courseDl);

    let timeDl = document.getElementById('time_datalist_options');
    if (timeDl) timeDl.remove();
    timeDl = document.createElement('datalist');
    timeDl.id = 'time_datalist_options';
    global_time_options.forEach(t => {
        const opt = document.createElement('option');
        opt.value = t;
        timeDl.appendChild(opt);
    });
    document.body.appendChild(timeDl);
}

document.addEventListener('DOMContentLoaded', () => {
    loadGlobalCourseTimeSettings();
    const urlParams = new URLSearchParams(window.location.search);
    const shouldOpenSettings = urlParams.get('openSettings') === 'true';

    const uploadZone = document.getElementById('uploadZone');
    const fileInput = document.getElementById('fileInput');
    const modeBtns = document.querySelectorAll('.mode-btn');

    // Mode selection
    const examCourseSelector = document.getElementById('examCourseSelector');
    modeBtns.forEach(btn => {
        if(btn.dataset.course) return; // Skip course buttons here
        btn.addEventListener('click', (e) => {
            modeBtns.forEach(b => {
                if(!b.dataset.course) b.classList.remove('active');
            });
            e.target.classList.add('active');
            currentMode = e.target.dataset.mode;
            
            if (currentMode === 'exam') {
                if(examCourseSelector) examCourseSelector.style.display = 'block';
                loadExamQuestions();
            } else {
                if(examCourseSelector) examCourseSelector.style.display = 'none';
            }
        });
    });

    // Load Exam Courses dynamically
    loadExamCourses().then(() => {
        if(shouldOpenSettings) {
            const examBtn = Array.from(modeBtns).find(b => b.dataset.mode === 'exam');
            if(examBtn) examBtn.click();
            setTimeout(() => {
                if(typeof openCourseSettingsModal === 'function') openCourseSettingsModal();
            }, 300);
        }
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

window.calcPaperTotal = function(id) {
    const tuitionInput = document.getElementById(`paper_tuition-${id}`);
    const toolInput = document.getElementById(`paper_tool_fee-${id}`);
    const bookInput = document.getElementById(`paper_book_price-${id}`);
    const totalInput = document.getElementById(`paper_total-${id}`);

    if (!tuitionInput || !toolInput || !bookInput || !totalInput) return;

    // Helper to extract numeric value
    const getNum = (val) => {
        const cleaned = (val || '').toString().replace(/[^0-9]/g, '');
        return cleaned === '' ? 0 : parseInt(cleaned, 10);
    };

    // Helper to format with commas
    const formatNum = (num) => {
        return num.toLocaleString();
    };

    const tuitionVal = getNum(tuitionInput.value);
    const toolVal = getNum(toolInput.value);
    const bookVal = getNum(bookInput.value);

    // Format the current inputs if they have a valid number
    if (tuitionInput.value) tuitionInput.value = formatNum(tuitionVal);
    if (toolInput.value) toolInput.value = formatNum(toolVal);
    if (bookInput.value) bookInput.value = formatNum(bookVal);

    // Calculate total
    const total = tuitionVal + toolVal + bookVal;
    
    // Only update total if it's > 0 (or if they cleared everything, it becomes empty)
    if (total > 0) {
        totalInput.value = formatNum(total);
    } else {
        totalInput.value = '';
    }
};

window.handleAnalyzedRegistration = async function(id) {
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

window.selectFolderNative = function() {
    document.getElementById('folderInput').click();
};

async function handleFiles(files) {
    const validFiles = Array.from(files).filter(f => {
        const typeValid = f.type.startsWith('image/') || f.type === 'application/pdf';
        const extValid = f.name.toLowerCase().match(/\.(jpg|jpeg|png|pdf|heic|hwp|xlsx|xls)$/);
        return typeValid || extValid;
    });
    
    if (validFiles.length === 0) {
        alert('폴더 또는 파일에 처리 가능한 이미지/PDF/문서 파일이 없습니다. (JPG, PNG, PDF, HWP, XLSX, XLS 지원)');
        return;
    }

    totalFiles += validFiles.length;
    updateProgress();

    // 6개의 멀티 API 키를 활용하여 6개씩 초고속 동시 처리 (속도 대폭 향상)
    const CONCURRENCY_LIMIT = 6;
    for (let i = 0; i < validFiles.length; i += CONCURRENCY_LIMIT) {
        const chunk = validFiles.slice(i, i + CONCURRENCY_LIMIT);
        const promises = chunk.map(file => {
            const ext = file.name.toLowerCase();
            if (file.type === 'application/pdf' || ext.endsWith('.pdf')) {
                return processPDF(file);
            } else if (ext.match(/\.(xlsx|xls)$/)) {
                return processExcel(file);
            } else if (ext.endsWith('.hwp')) {
                return processHWP(file);
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

async function processExcel(file) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = async (e) => {
            let captureDiv = null;
            try {
                if (typeof XLSX === 'undefined') {
                    throw new Error("XLSX 라이브러리가 로드되지 않았습니다.");
                }
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, {type: 'array'});
                let fullText = "";
                
                captureDiv = document.createElement('div');
                captureDiv.style.cssText = "position:absolute; top:0; left:0; z-index:-9999; background:white; padding:40px; font-family:sans-serif; width:1000px; color:black; min-height:800px;";
                document.body.appendChild(captureDiv);

                for(let sheetName of workbook.SheetNames) {
                    const htmlStr = XLSX.utils.sheet_to_html(workbook.Sheets[sheetName]);
                    fullText += "Sheet: " + sheetName + "\n" + htmlStr + "\n\n";
                    const sheetDiv = document.createElement('div');
                    sheetDiv.innerHTML = `<h3>${sheetName}</h3>` + htmlStr;
                    captureDiv.appendChild(sheetDiv);
                }
                
                const tables = captureDiv.querySelectorAll('table');
                tables.forEach(t => {
                    t.style.borderCollapse = 'collapse';
                    t.style.width = '100%';
                    t.style.marginBottom = '20px';
                    t.querySelectorAll('td, th').forEach(cell => {
                        cell.style.border = '1px solid #cbd5e1';
                        cell.style.padding = '8px';
                    });
                });

                let base64Image = null;
                if (typeof html2canvas !== 'undefined') {
                    const canvas = await html2canvas(captureDiv, { scale: 1.5, useCORS: true, logging: true, backgroundColor: "#ffffff" });
                    base64Image = canvas.toDataURL('image/jpeg', 0.8);
                }

                if (!base64Image) {
                    const dummyImageSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect width="200" height="200" fill="#f1f5f9"/><text x="50%" y="50%" font-family="Arial" font-size="24" fill="#64748b" dominant-baseline="middle" text-anchor="middle">Excel 문서</text></svg>';
                    base64Image = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(dummyImageSvg)));
                }
                
                const finalBase64 = base64Image.split(',')[1];
                await analyzeImage(finalBase64, file.name, base64Image, fullText);
            } catch(err) {
                console.error('Excel parsing error', err);
                const dummyErrorSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect width="200" height="200" fill="#f1f5f9"/><text x="50%" y="50%" font-family="Arial" font-size="24" fill="#ef4444" dominant-baseline="middle" text-anchor="middle">Excel 오류</text></svg>';
                const dummyImage = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(dummyErrorSvg)));
                await analyzeImage(null, file.name, dummyImage, "엑셀 파일 파싱 중 오류가 발생했습니다: " + err.message);
            } finally {
                if (captureDiv && captureDiv.parentNode) {
                    captureDiv.parentNode.removeChild(captureDiv);
                }
            }
            resolve();
        };
        reader.onerror = () => resolve();
        reader.readAsArrayBuffer(file);
    });
}

async function processHWP(file) {
    return new Promise(async (resolve) => {
        let preExtractedHtml = null;
        let backendTextContent = "";
        
        try {
            const formData = new FormData();
            formData.append('file', file);
            const extractRes = await fetch('/api/sejong/hwp-extract', { method: 'POST', body: formData });
            if (extractRes.ok) {
                const extractData = await extractRes.json();
                if (extractData.html) {
                    preExtractedHtml = extractData.html;
                    const tempDiv = document.createElement('div');
                    tempDiv.innerHTML = preExtractedHtml;
                    backendTextContent = tempDiv.innerText || tempDiv.textContent || "";
                }
            }
        } catch (err) {
            console.warn("Backend HWP extraction failed", err);
        }

        if (preExtractedHtml && backendTextContent) {
            const dummyImageSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect width="200" height="200" fill="#f1f5f9"/><text x="50%" y="50%" font-family="Arial" font-size="24" fill="#64748b" dominant-baseline="middle" text-anchor="middle">HWP 문서</text></svg>';
            const base64Image = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(dummyImageSvg)));
            const finalBase64 = base64Image.split(',')[1];
            await analyzeImage(finalBase64, file.name, base64Image, backendTextContent, preExtractedHtml);
            resolve();
            return;
        }

        const reader = new FileReader();
        reader.onload = async (e) => {
            let captureDiv = null;
            try {
                const data = new Uint8Array(e.target.result);
                let textContent = "";
                let base64Image = null;

                // Check if it's a ZIP file (HWPX)
                if (data.length > 2 && data[0] === 0x50 && data[1] === 0x4B) { // 'PK' magic bytes
                    if (typeof JSZip !== 'undefined') {
                        const zip = await JSZip.loadAsync(data);
                        const sectionFiles = Object.keys(zip.files).filter(name => name.includes('Contents/section') && name.endsWith('.xml'));
                        if (sectionFiles.length > 0) {
                            for (let sf of sectionFiles) {
                                const xmlData = await zip.file(sf).async("string");
                                const parser = new DOMParser();
                                const xmlDoc = parser.parseFromString(xmlData, "text/xml");
                                const tTags = xmlDoc.getElementsByTagName("hp:t");
                                for (let i = 0; i < tTags.length; i++) {
                                    textContent += tTags[i].textContent + "\n";
                                }
                            }
                        } else {
                            throw new Error("HWPX 형식이지만 본문 텍스트(section.xml)를 찾을 수 없습니다.");
                        }
                    } else {
                        throw new Error("JSZip 라이브러리가 로드되지 않아 HWPX를 파싱할 수 없습니다.");
                    }
                } else {
                    // Standard HWP (OLE)
                    const hwp = window.HWP.parse(data, { type: 'array' });
                    try {
                        captureDiv = document.createElement('div');
                        // Use left:-10000px instead of negative z-index to ensure html2canvas can capture it without stacking context issues
                        captureDiv.style.cssText = "position:absolute; top:0; left:-10000px; background:white; padding:40px; width:1000px; color:black; min-height:800px;";
                        document.body.appendChild(captureDiv);

                        new window.HWP.Viewer(captureDiv, hwp);
                        
                        // Increase timeout from 800ms to 3000ms to allow large exams with complex tables to fully render
                        await new Promise(r => setTimeout(r, 3000)); 

                        // Extract text only if the backend extraction failed
                        if (!textContent) {
                            textContent = captureDiv.innerText || captureDiv.textContent || "";
                        }

                        if (typeof html2canvas !== 'undefined') {
                            // Ensure all images are loaded before capturing
                            const canvas = await html2canvas(captureDiv, { scale: 1.5, useCORS: true, logging: true, backgroundColor: "#ffffff" });
                            base64Image = canvas.toDataURL('image/jpeg', 0.8);
                        }
                    } catch (viewerErr) {
                        console.warn("HWP Viewer 렌더링 실패...", viewerErr);
                    }
                    
                    // Fallback text extraction if Viewer text is empty and backend failed
                    if (!textContent || textContent.trim().length === 0) {
                        if (hwp.sections && hwp.sections.length > 0) {
                            for (let section of hwp.sections) {
                                if (section.content && section.content.length > 0) {
                                    for (let paragraph of section.content) {
                                        if (paragraph.content && paragraph.content.length > 0) {
                                            for (let char of paragraph.content) {
                                                if (char.type === 0 && char.value) {
                                                    textContent += char.value;
                                                }
                                            }
                                            textContent += "\n";
                                        }
                                    }
                                }
                            }
                        }
                    }
                }

                if (!textContent || textContent.trim().length === 0) {
                    throw new Error("문서에서 텍스트를 추출할 수 없습니다. (빈 문서이거나 호환되지 않는 버전입니다)");
                }

                if (!base64Image) {
                    const dummyImageSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect width="200" height="200" fill="#f1f5f9"/><text x="50%" y="50%" font-family="Arial" font-size="24" fill="#64748b" dominant-baseline="middle" text-anchor="middle">HWP 문서</text></svg>';
                    base64Image = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(dummyImageSvg)));
                }

                const finalBase64 = base64Image.startsWith('data:image/') ? base64Image.split(',')[1] : null;
                await analyzeImage(finalBase64, file.name, base64Image, textContent);
            } catch(err) {
                console.error('HWP parsing error', err);
                const safeErrMsg = (err.message || '').replace(/</g, '&lt;').replace(/>/g, '&gt;');
                const dummyErrorSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="200"><rect width="400" height="200" fill="#f1f5f9"/><text x="50%" y="40%" font-family="Arial" font-size="24" fill="#ef4444" dominant-baseline="middle" text-anchor="middle">HWP 오류</text><text x="50%" y="60%" font-family="Arial" font-size="14" fill="#ef4444" dominant-baseline="middle" text-anchor="middle">${safeErrMsg}</text></svg>`;
                const dummyImage = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(dummyErrorSvg)));
                await analyzeImage(null, file.name, dummyImage, "HWP 파일 파싱 중 오류가 발생했습니다: " + err.message);
            } finally {
                if (captureDiv && captureDiv.parentNode) {
                    captureDiv.parentNode.removeChild(captureDiv);
                }
            }
            resolve();
        };
        reader.onerror = () => resolve();
        reader.readAsArrayBuffer(file);
    });
}

function createCardUI(title, imgUrl, id) {
    const grid = document.getElementById('resultsGrid');
    const card = document.createElement('div');
    card.className = 'result-card processing';
    card.id = `card-${id}`;
    card.dataset.mode = window.currentMode || currentMode;
    
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

async function analyzeImage(base64Data, fileName, imgUrl, textContent = null, preExtractedHtml = null) {
    return new Promise((resolve) => {
        requestQueue.push(async () => {
            activeRequests++;
            try {
                await executeAnalysis(base64Data, fileName, imgUrl, textContent, preExtractedHtml);
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

async function executeAnalysis(base64Data, fileName, imgUrl, textContent = null, preExtractedHtml = null) {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    const card = createCardUI(fileName, imgUrl, id);
    
    let prompt = "";
    if (currentMode === 'phonebook') {
        prompt = `이 이미지는 요리학원의 전화번호부입니다. (사진이 옆으로 누워있거나 90도 회전되어 있을 수 있으니 글씨 방향에 맞춰서 정확히 읽어주세요.)

    [중요 지시사항: 2~3번 교차 검증]
    이미지를 한 번만 보고 넘기지 말고, 2~3번에 걸쳐서 꼼꼼히 다시 확인하여 틀린 글자가 없는지 완벽하게 검증하세요.

    다음 JSON 형식의 배열로 반환하세요:
    [
      {"이름": "민수정", "본인전화번호": "010-1243-6763, 031-888-6763", "부모전화번호": "010-3243-9286"}
    ]
    이름이나 글씨를 절대 유추해서 획일화하지 말고, 적혀있는 그대로(예: 민지영, 민수정, 민원기, 민종훈, 문다빈, 문승희 등) 정확하게 판독하세요. 찾을 수 없으면 빈 배열 []을 반환하세요. JSON 코드 블록 없이 순수 JSON 텍스트만 출력하세요.`;
        } else if (currentMode === 'exam') {
            if (preExtractedHtml) {
                prompt = `이 문서는 요리학원 수강생의 시험지(또는 평가지)입니다.
    
    [중요 지시사항]
    가장 중요한 "정답(답안지)"를 무조건 찾아내어, JSON의 "답안지" 필드에 텍스트 형식으로 추출해야 합니다.

    [⭐️정답표 텍스트 깨짐 주의사항⭐️]
    문서(HWP 등)의 텍스트가 추출될 때, 정답표가 "가로 다단 배열"로 되어 있는 경우, 각 열의 숫자들이 가로줄 단위로 마구 섞여서 들어올 수 있습니다. (예: "1 2 3 4 5 16 17 18 19 20... 2 4 3 3 1...")
    절대 단순히 숫자가 나열된 순서대로 정답을 매기지 마세요! 문제 번호 숫자들 밑에 정답 숫자 블록이 따로 나오는 형태일 수 있습니다. 숫자의 패턴과 블록을 논리적으로 분석하여, "몇 번 문제 번호들의 정답 묶음인지" 상하/좌우 열(Column/Row)의 흐름을 퍼즐 맞추듯이 완벽하게 역추적해서 정확한 정답을 추출해야 합니다.
    
    다음 정보를 추출하여 정확히 아래 형식의 JSON 객체로 반환하세요. JSON 코드 블록 없이 순수 JSON 텍스트만 출력하세요.
    {
        "답안지": "문서 내에 있는 모든 정답(1번부터 끝번까지)을 빠짐없이 찾아내어 텍스트로 추출하세요. (표가 깨져서 섞여있더라도 논리적으로 유추하여 '1번: 2, 2번: 1...' 형식으로 추출할 것. 단, 절대 지어내지는 말 것)"
    }`;
            } else {
                prompt = `이 이미지는 요리학원 수강생의 시험지(또는 평가지)이거나 일반 문서입니다.
    사진이 거꾸로(180도) 찍혀 있거나 옆으로 돌아가 있을 수 있으니, 글자 방향을 스스로 판단하여 이미지를 회전시킨 상태로 읽어주세요.

    [중요 지시사항]
    1. 사용자는 이 이미지/문서에 있는 내용을 완벽한 '웹 페이지(HTML/CSS)'로 보길 원합니다.
    2. 하지만 이 시험지는 문항 수가 적게는 5문제부터 많게는 100문제까지 다양하며 내용이 매우 길 수 있기 때문에, AI의 출력 한계로 인해 뒷부분이 잘릴 수 있습니다.
    3. 따라서 **가장 중요한 "정답(답안지)"**를 무조건 제일 먼저 찾아내어, JSON의 "답안지" 필드에 텍스트 형식으로 추출해야 합니다.
    4. "답안지" 추출이 끝난 후, "전체내용" 필드에 전체 페이지 내용을 HTML/CSS로 그려내세요.

    [⭐️절대 금지: 창작 및 지어내기(Hallucination) 금지⭐️]
    문서의 글씨가 깨지거나 표가 망가져서 내용을 읽을 수 없더라도, **절대 AI가 임의로 새로운 문제나 정답을 만들어내거나(창작) 과거 데이터를 바탕으로 지어내면 안 됩니다.**
    오직 제공된 이미지/문서 안에 **실제로 적혀있는 글씨**만 있는 그대로 100% 똑같이 가져와야 합니다. 판독이 불가능한 부분은 임의로 채우지 말고 비워두세요. 원본과 단 한 글자라도 다르게 지어내면 매우 치명적인 오류가 발생합니다.

    [⭐️정답표 텍스트 깨짐 주의사항⭐️]
    문서(HWP 등)의 텍스트가 추출될 때, 정답표가 "가로 다단 배열"로 되어 있는 경우, 각 열의 숫자들이 가로줄 단위로 마구 섞여서 들어올 수 있습니다. (예: "1 2 3 4 5 16 17 18 19 20...")
    절대 단순히 나열된 순서대로 정답을 매기지 마세요! 숫자의 패턴과 블록을 논리적으로 분석하여, "몇 번 단의 정답이 무엇인지" 세로열(Column)의 흐름을 퍼즐 맞추듯이 완벽하게 역추적해서 정확한 정답을 추출해야 합니다.

    다음 정보를 추출하여 정확히 아래 형식의 JSON 객체로 반환하세요. JSON 코드 블록 없이 순수 JSON 텍스트만 출력하세요.
    {
        "답안지": "문서 내에 있는 모든 정답(1번부터 끝번까지)을 빠짐없이 찾아내어 텍스트로 추출하세요. (표가 깨져서 섞여있더라도 논리적으로 유추하여 '1번: 2, 2번: 1...' 형식으로 추출할 것. 단, 절대 지어내지는 말 것)",
        "전체내용": "여기에 작성된 완벽한 HTML/CSS 코드를 줄바꿈 포함하여 입력하세요. (원본 내용 그대로만 작성할 것. 문제나 답을 절대 임의로 지어내지 말 것)"
    }`;
            }
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
    "생년월일": "원서에 적힌 그대로 추출하되, 주민등록번호 전체가 있으면 그대로 추출(예: 900101-1234567), 년월일만 적혀있으면 YYYY-MM-DD 형식으로 변환하여 추출(예: 2005-03-04. 임의 변환 금지)",
    "주소": "순수 주소 텍스트만 (전화번호가 포함되어 있으면 전화번호는 완전히 제거할 것)",
    "학생연락처": "수강생 본인 연락처 (연락처 란 또는 주소 란에서 찾은 학생 본인의 번호)",
    "부모연락처": "부모 연락처 (연락처 란 또는 주소 란에서 찾은 부모님 번호)",
    "학교": "학교 및 학년 (원서에 적힌 그대로만. 적혀있지 않으면 무조건 빈칸 처리. 절대 임의로 지어내지 말 것. 성인이라 '일반'이라고 적혀있으면 '일반' 추출)",
    "수강과목": "표에서 체크되거나 직접 적힌 수강 과정명 (예: '제과', '한식' 등은 '제과기능사', '한식기능사', '제과제빵기능사' 등으로 변환하여 추출. 시간은 절대 포함하지 말 것)",
    "수강시작일": "YYYY년 M월 D일 HH:MM 형식",
    "수강료": "숫자만 (예: 250000)",
    "도구비": "숫자만",
    "결제금액": "숫자만",
    "등록일": "YYYY년 M월 D일 형식 (원서 작성일자 또는 등록일자)",
    "과정체크": "표에서 체크되거나 직접 적힌 수강 시간 (예: '5시', '7시'라고 써있으면 무조건 24시간제인 '17:00', '19:00' 형식으로 표기할 것. '18:30' 등 표에 없는 시간은 절대 임의로 추가하지 말 것. 과목명은 제외하고 체크된 시간만 기재)",
    "비고": "하단 빈 공간(메모란)에 적힌 글씨 (예: 6:30~40사이)",
    "회전": "이미지의 글자가 올바른 정방향이면 0, 거꾸로(180도) 뒤집혀 있으면 180, 오른쪽으로 누워있으면 90, 왼쪽이면 270을 숫자로 반환"
}`;
    }

    // Call the local Next.js proxy instead of Google's endpoint directly
    let result = null;
    let lastError = null;

    let retryCount = 0;
    const maxRetries = 40; // 무료 한도(429) 회피를 위해 최대 40번까지 재시도 (약 3분 이상 대기 가능)

    let finalPrompt = textContent ? (prompt + "\n\n[문서 내용]\n" + textContent) : prompt;
    let parts = [{ text: finalPrompt }];
    if (base64Data) {
        parts.push({ inlineData: { mimeType: 'image/jpeg', data: base64Data } });
    }

    while (retryCount <= maxRetries && !result) {
        try {
            const response = await fetch('/api/sejong/ai_analyze', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    contents: [{
                        parts: parts
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
                                // Token limit truncation fallback
                                if (currentMode === 'exam') {
                                    let answerMatch = text.match(/"답안지"\s*:\s*"((?:[^"\\]|\\.)*)"/);
                                    let htmlMatch = text.match(/"전체내용"\s*:\s*"([\s\S]*)/);
                                    
                                    if (answerMatch || htmlMatch) {
                                        result = {};
                                        if (answerMatch) result['답안지'] = answerMatch[1].replace(/\\n/g, '\n').replace(/\\"/g, '"');
                                        if (htmlMatch) {
                                            let htmlStr = htmlMatch[1];
                                            htmlStr = htmlStr.replace(/"\s*}$/, '');
                                            htmlStr = htmlStr.replace(/\\n/g, '\n').replace(/\\"/g, '"');
                                            result['전체내용'] = htmlStr;
                                        }
                                        console.log("Truncated JSON successfully rescued via Regex.");
                                    } else {
                                        console.error('JSON Parse Error:', fallbackErr, 'Text:', text);
                                        lastError = '결과 데이터 파싱 실패: ' + fallbackErr.message;
                                    }
                                } else {
                                    console.error('JSON Parse Error:', fallbackErr, 'Text:', text);
                                    lastError = '결과 데이터 파싱 실패: ' + fallbackErr.message;
                                }
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
        window.rawParsedResults = window.rawParsedResults || {};
        
        if (preExtractedHtml && currentMode === 'exam') {
            if (Array.isArray(result) && result.length > 0) {
                result[0]['전체내용'] = preExtractedHtml;
            } else {
                result['전체내용'] = preExtractedHtml;
            }
        }
        
        window.rawParsedResults[id] = {
            mode: currentMode,
            data: result,
            imageUrl: imgUrl,
            fileName: fileName
        };
        
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

function formatAnswerSheetToTable(text, deletedAnswers = []) {
    const maxQuestions = 60;
    const answers = new Array(maxQuestions).fill('');
    
    if (text && text.trim() !== '') {
        const regex = /([1-6]?\d)(?:번|문항)?\D{1,10}?([1-5①②③④⑤])/g;
        const matches = [...text.matchAll(regex)];
        for (const match of matches) {
            const qNum = parseInt(match[1], 10);
            const ans = match[2];
            if (qNum >= 1 && qNum <= maxQuestions) {
                if (!deletedAnswers.includes(qNum)) {
                    answers[qNum - 1] = ans;
                } else {
                    answers[qNum - 1] = ''; // Clear answer for duplicates
                }
            }
        }
    }
    
    const cols = 10;
    const rows = Math.ceil(maxQuestions / cols);
    let tableHtml = '<table style="width:100%; border-collapse:collapse; text-align:center; font-size:1rem; border: 1px solid #94a3b8; background: #fff; margin-top: 5px;"><tbody>';
    
    for (let i = 0; i < rows; i++) {
        let rowHtml = '<tr>';
        for (let j = 0; j < cols; j++) {
            const index = i * cols + j;
            const qNum = index + 1;
            const ans = answers[index];
            
            rowHtml += `<td style="border: 1px solid #cbd5e1; padding: 6px 2px; background:#f8fafc; font-weight:bold; color:#64748b; width:5%; font-size:0.9rem;">${qNum}</td>`;
            if (deletedAnswers.includes(qNum)) {
                rowHtml += `<td style="border: 1px solid #cbd5e1; padding: 6px 2px; color:#ef4444; width:5%; font-weight:900; font-size:1.05rem;">-</td>`;
            } else {
                rowHtml += `<td style="border: 1px solid #cbd5e1; padding: 6px 2px; color:#1d4ed8; width:5%; font-weight:900; font-size:1.05rem;">${ans}</td>`;
            }
        }
        rowHtml += '</tr>';
        tableHtml += rowHtml; 
    }
    tableHtml += '</tbody></table>';
    
    const hasAnyAnswer = answers.some(a => a !== '');
    if (!hasAnyAnswer && text && text.trim() !== '' && deletedAnswers.length === 0) {
        tableHtml += `<div style="margin-top: 10px; color: #ef4444; font-size: 0.9rem; font-weight: bold;">⚠️ AI가 정답을 자동 추출하지 못했습니다. 원본 텍스트:</div>`;
        tableHtml += `<div style="margin-top: 5px; font-size: 0.95rem; color: #475569; border: 1px solid #e2e8f0; padding: 10px; border-radius: 6px; background: #f8fafc; white-space: pre-wrap;">${text}</div>`;
    }
    
    return tableHtml;
}

async function renderExamResult(id, data) {
    updateCardStatus(id, 'success', '분석 완료');
    const content = document.getElementById(`content-${id}`);
    
    let title = '시험지 분석 결과';
    const cardEl = document.getElementById(`card-${id}`);
    if (cardEl) {
        const titleEl = cardEl.querySelector('.result-title');
        if (titleEl) {
            title = titleEl.innerText.replace(/\.[^/.]+$/, "");
        }
    }
    
    let finalContent = data['전체내용'] || '';
    let deletedAnswers = [];
    
    // Client-side deduplication against questions_data.json
    try {
        const res = await fetch('/api/sejong/questions');
        if (res.ok) {
            const dbData = await res.json();
            const existingSet = new Set();
            
            // Build normalized set
            for (const cat in dbData) {
                if (Array.isArray(dbData[cat])) {
                    for (const q of dbData[cat]) {
                        if (q.q && !q.q.includes("중복")) {
                            let norm = q.q.replace(/^[\d①-⑳가-하a-zA-Z]+[\.\)]?\s*/, '').replace(/[\s\W_]+/g, '');
                            if (norm) existingSet.add(norm);
                        }
                    }
                }
            }
            
            // Parse HTML and check duplicates
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = finalContent;
            
            // 정답표 및 안내사항(첫 페이지) 통째로 맨 밑으로 이동 로직
            let examStartNode = null;
            let currentNode = tempDiv.firstElementChild;
            
            while (currentNode) {
                const txt = currentNode.textContent.trim();
                
                // 1번 문제의 시작("1. ")을 찾습니다.
                if (txt.match(/^1\.[^\d]/)) {
                    examStartNode = currentNode;
                    
                    // 바로 위 노드가 과목명이나 안내 텍스트(예: 【1과목】)인지 확인하여 거기도 문제 영역으로 포함시킵니다.
                    let prev = currentNode.previousElementSibling;
                    while (prev) {
                        const prevTxt = prev.textContent.trim();
                        if (prevTxt.includes('과목') && !prevTxt.includes('답안') && !prevTxt.includes('문제】') && !prevTxt.includes('문제]')) {
                            examStartNode = prev;
                        } else if (prevTxt === '') {
                            // 빈 줄은 무시하고 더 위로
                            prev = prev.previousElementSibling;
                            continue;
                        } else {
                            break;
                        }
                        prev = prev.previousElementSibling;
                    }
                    break;
                }
                
                currentNode = currentNode.nextElementSibling;
            }

            if (examStartNode && examStartNode !== tempDiv.firstElementChild) {
                // 첫 노드부터 examStartNode 직전까지 (즉, 첫 페이지 전체) 수집
                const nodesToMove = [];
                let node = tempDiv.firstElementChild;
                let hasAnswerTable = false;

                while (node && node !== examStartNode) {
                    nodesToMove.push(node);
                    if (node.tagName === 'TABLE' || node.querySelector('table')) {
                        hasAnswerTable = true; // 표가 있으면 정답표일 확률이 높음
                    }
                    if (node.textContent && (node.textContent.includes('답안') || node.textContent.includes('모의고사'))) {
                        hasAnswerTable = true;
                    }
                    node = node.nextElementSibling;
                }

                // 상단에 표나 "답안" 텍스트가 있다면 확실한 정답표/안내 페이지이므로 통째로 맨 밑으로 이동
                if (hasAnswerTable && nodesToMove.length > 0) {
                    const answerSection = document.createElement('div');
                    answerSection.style.marginTop = '40px';
                    answerSection.style.paddingTop = '20px';
                    answerSection.style.borderTop = '2px dashed #cbd5e1';
                    answerSection.style.backgroundColor = '#f8fafc';
                    answerSection.style.padding = '20px';
                    answerSection.style.borderRadius = '8px';
                    answerSection.innerHTML = '<h3 style="color:#1e40af; margin-bottom:15px; text-align:center; font-size:1.2rem; font-weight:bold;">📝 정답표 및 안내사항</h3>';
                    
                    nodesToMove.forEach(n => answerSection.appendChild(n));
                    tempDiv.appendChild(answerSection);
                }
            }

            // Find elements that look like a question (e.g., "1. 식품위생법...")
            const walker = document.createTreeWalker(tempDiv, NodeFilter.SHOW_TEXT, null, false);
            let node;
            while (node = walker.nextNode()) {
                const text = node.nodeValue.trim();
                const match = text.match(/^(\d+)\.\s*(.*)/);
                if (match) {
                    const qNum = parseInt(match[1], 10);
                    const qText = match[2];
                    const normText = qText.replace(/[\s\W_]+/g, '');
                    
                    if (normText && existingSet.has(normText)) {
                        // It's a duplicate!
                        deletedAnswers.push(qNum);
                        
                        // Replace the entire parent element's content
                        const parent = node.parentElement;
                        if (parent) {
                            parent.innerHTML = `<span style="color:#ef4444; font-weight:bold;">${qNum}. [중복 문항으로 삭제되었습니다]</span>`;
                            // Try to remove following siblings if they are choices (1., 2., 3., 4.)
                            let next = parent.nextElementSibling;
                            for (let i=0; i<4; i++) {
                                if (next && (next.innerText.match(/^[①-④1-4]/) || next.innerText.match(/^[가-라]/))) {
                                    const toRemove = next;
                                    next = next.nextElementSibling;
                                    toRemove.remove();
                                } else {
                                    break;
                                }
                            }
                        }
                    }
                }
            }
            finalContent = tempDiv.innerHTML;
        }
    } catch (e) {
        console.error("Deduplication error:", e);
    }
    
    if (finalContent) {
        finalContent = `<h1 contenteditable="true" onblur="const ta = document.querySelector('.result-input[data-id=\\'${id}\\'][data-field=\\'전체내용\\']'); if(ta) ta.value = document.getElementById('html-container-${id}').innerHTML;" style="text-align:center; color:#1e293b; font-size:1.3rem; font-weight:bold; margin-top:0; margin-bottom:10px; border-bottom: 2px solid #e2e8f0; padding-bottom: 5px; outline:none; cursor:text;" title="클릭하여 제목 수정 가능">${title}</h1>\n` + finalContent;
    }
    
    const html = `
        <div style="margin-top:15px;">
            <div style="margin-bottom: 5px; font-weight: bold; color: #334155; font-size: 0.9rem;">분석 결과 (원본 페이지 재현)</div>
            <div id="html-container-${id}" style="width:100%; min-height:300px; padding:10px 15px; border:1px solid #cbd5e1; border-radius:6px; background:#fff; overflow:auto; color:#000;">
                ${finalContent}
            </div>
            <textarea class="result-input" data-id="${id}" data-field="전체내용" style="display:none;">${finalContent}</textarea>
        </div>
        <textarea class="result-input" data-id="${id}" data-field="답안지" style="display:none;">${data['답안지'] || ''}</textarea>
        <div style="display:flex; justify-content:flex-end; margin-top:10px; gap:8px;">
            <button onclick="saveExamQuestion('${id}')" style="background:#16a34a; color:white; border:none; padding:6px 12px; border-radius:4px; cursor:pointer; font-size:0.85rem; font-weight:bold;"><i class="fas fa-save"></i> 과정에 추가</button>
            <button onclick="copyExamData('${id}')" style="background:#475569; color:white; border:none; padding:6px 12px; border-radius:4px; cursor:pointer; font-size:0.85rem;">복사하기</button>
            <button class="btn-delete" onclick="deleteCard('${id}')" style="padding:6px 12px; font-size:0.85rem;">삭제</button>
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
    
    const copyText = dataMap['전체내용'] || '';
    
    navigator.clipboard.writeText(copyText).then(() => {
        alert('시험지 결과가 복사되었습니다!');
    }).catch(err => {
        console.error('Copy failed', err);
        alert('복사 실패');
    });
};

window.openAnswerSheetWindow = function(id) {
    const textarea = document.querySelector(`.result-input[data-id="${id}"][data-field="답안지"]`);
    if (!textarea || !textarea.value.trim()) {
        alert("문서에서 추출된 답안지가 없습니다.");
        return;
    }
    const answerData = textarea.value;
    const displayHtml = typeof formatAnswerSheetToTable === 'function' ? formatAnswerSheetToTable(answerData) : answerData;

    const newWin = window.open('', '_blank', 'width=800,height=600');
    if (!newWin) {
        alert("팝업 차단을 해제해주세요.");
        return;
    }
    
    newWin.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>답안지</title>
            <meta charset="utf-8">
            <style>
                body { font-family: 'Malgun Gothic', 'Apple SD Gothic Neo', sans-serif; padding: 30px; line-height: 1.8; background: #f8fafc; color: #0f172a; }
                h2 { color: #1e293b; border-bottom: 2px solid #cbd5e1; padding-bottom: 15px; margin-bottom: 25px; font-size: 1.5rem; text-align: center; }
                .content { background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06); white-space: pre-wrap; font-size: 1.15rem; overflow-x: auto; }
                .btn-container { text-align: center; margin-top: 30px; }
                .btn { display: inline-block; padding: 12px 24px; background: #2563eb; color: white; border: none; border-radius: 8px; cursor: pointer; text-decoration: none; font-size: 1.1rem; font-weight: bold; box-shadow: 0 2px 4px rgba(37,99,235,0.3); transition: all 0.2s; }
                .btn:hover { background: #1d4ed8; transform: translateY(-1px); }
                @media print {
                    body { background: white; padding: 0; }
                    .content { box-shadow: none; padding: 0; border: none; }
                    .btn-container { display: none; }
                }
            </style>
        </head>
        <body>
            <h2>📝 답안지 추출 결과</h2>
            <div class="content">${displayHtml}</div>
            <div class="btn-container">
                <button class="btn" onclick="window.print()">🖨️ 인쇄하기</button>
            </div>
        </body>
        </html>
    `);
    newWin.document.close();
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
                    <td class="th-dark" style="width: 16%; padding: 4px; font-size: 11px; line-height: 1.2; word-break: keep-all; white-space: nowrap;">생년월일 /<br>주민번호</td>
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
                            <div style="display: flex; align-items: center; height: 22px;">₩ <input type="text" id="paper_tuition-${id}" value="${data.수강료 || ''}" oninput="calcPaperTotal('${id}')" style="flex: 1; margin-left: 5px; background: transparent; border: none; outline: none; font-family: inherit;"></div>
                        </td>
                        <td class="th-dark" style="padding: 4px;">락카</td>
                        <td colspan="2" style="padding: 4px;"><input type="text" id="paper_locker-${id}" style="text-align: center; height: 100%; width: 100%; background: transparent; border: none; outline: none; font-family: inherit;"></td>
                    </tr>
                    <tr>
                        <td class="th-dark" style="padding: 4px;">도구비</td>
                        <td colspan="2" style="text-align: left; padding: 4px;">
                            <div style="display: flex; align-items: center; height: 22px;">₩ <input type="text" id="paper_tool_fee-${id}" value="${data.도구비 || ''}" oninput="calcPaperTotal('${id}')" style="flex: 1; margin-left: 5px; background: transparent; border: none; outline: none; font-family: inherit;"></div>
                        </td>
                        <td class="th-dark" style="font-size: 11px; line-height: 1.1; padding: 2px;">
                            <div style="display: flex; flex-direction: column; align-items: flex-start; justify-content: center; height: 100%; gap: 1px;">
                                <label style="cursor: pointer; display: flex; align-items: center; gap: 2px;"><input type="checkbox" id="paper_book_prac-${id}" style="margin:0;"> 실기책</label>
                                <label style="cursor: pointer; display: flex; align-items: center; gap: 2px;"><input type="checkbox" id="paper_book_theory-${id}" style="margin:0;"> 필기책</label>
                            </div>
                        </td>
                        <td colspan="2" style="text-align: left; padding: 4px;">
                            <div style="display: flex; align-items: center; height: 22px;">₩ <input type="text" id="paper_book_price-${id}" oninput="calcPaperTotal('${id}')" style="flex: 1; margin-left: 5px; background: transparent; border: none; outline: none; font-family: inherit;"></div>
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
    
    // Automatically calculate total if missing or possible
    setTimeout(() => {
        if (window.calcPaperTotal) window.calcPaperTotal(id);
    }, 100);
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

window.removeCard = window.deleteCard = function(id) {
    const card = document.getElementById(`card-${id}`);
    if (card) card.remove();
    if (window.rawParsedResults && window.rawParsedResults[id]) {
        delete window.rawParsedResults[id];
    }
};

window.exportAnalysis = function() {
    const cards = document.querySelectorAll('.result-card');
    if (cards.length === 0) {
        alert('저장할 분석 결과가 없습니다.');
        return;
    }

    const exportData = [];

    cards.forEach(card => {
        const id = card.id.replace('card-', '');
        if (window.rawParsedResults && window.rawParsedResults[id]) {
            exportData.push(window.rawParsedResults[id]);
        }
    });

    if (exportData.length === 0) {
        alert('백업할 데이터가 없습니다 (분석이 진행중이거나 원본 데이터가 손상됨).');
        return;
    }

    const dataStr = JSON.stringify(exportData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    const dateStr = new Date().toISOString().split('T')[0];
    a.download = `세종요리_분석백업_${dateStr}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};

window.importAnalysis = function(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const exportData = JSON.parse(e.target.result);
            if (!Array.isArray(exportData)) throw new Error('올바른 배열 형식이 아닙니다.');

            // Clear current grid
            document.getElementById('resultsGrid').innerHTML = '';
            window.rawParsedResults = window.rawParsedResults || {};
            
            // Recreate cards
            exportData.forEach(item => {
                const id = Date.now() + Math.floor(Math.random() * 100000); // Generate new ID
                const mode = item.mode;
                
                const prevMode = window.currentMode;
                window.currentMode = mode;
                
                createCardUI(item.fileName || '백업에서 복원됨', item.imageUrl || '', id);
                
                window.rawParsedResults[id] = item;
                
                if (mode === 'student') {
                    renderStudentResult(id, item.data);
                } else if (mode === 'phonebook') {
                    renderPhonebookResult(id, item.data);
                } else if (mode === 'exam') {
                    renderExamResult(id, item.data);
                }
                
                window.currentMode = prevMode;
            });
            
            alert(`성공적으로 ${exportData.length}개의 결과를 복원했습니다.`);
        } catch(err) {
            alert('파일을 읽는 중 오류가 발생했습니다. 올바른 백업 파일인지 확인해주세요.\\n' + err.message);
        }
    };
    reader.readAsText(file);
    event.target.value = ''; // Reset input
};

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

window.loadExamQuestions = async function() {
    try {
        const res = await fetch('/api/sejong/questions');
        if (!res.ok) throw new Error('Failed to fetch questions');
        const allData = await res.json();
        
        const course = window.currentExamCourse || '한식기능사';
        const questions = allData[course] || [];
        
        const countSpan = document.getElementById('savedExamCount');
        if(countSpan) countSpan.textContent = questions.length;
        
        const listDiv = document.getElementById('savedExamList');
        if(listDiv) {
            if(questions.length === 0) {
                listDiv.innerHTML = '<div style="color:#94a3b8; font-style:italic; padding: 20px;">이 과정에 저장된 문제가 없습니다.</div>';
            } else {
                listDiv.innerHTML = questions.map((q, index) => `
                    <div style="border: 1px solid #cbd5e1; border-radius: 8px; padding: 15px; background: #f8fafc;">
                        <div style="font-size: 0.8rem; color: #64748b; margin-bottom: 8px; display:flex; justify-content:space-between;">
                            <span>문제 #${index + 1}</span>
                            <span>${new Date(q.timestamp).toLocaleString()}</span>
                        </div>
                        <div style="max-height: 200px; overflow-y: auto; font-size: 0.9rem; background: #fff; padding: 10px; border: 1px solid #e2e8f0; border-radius: 4px;">
                            ${q.content}
                        </div>
                        <div style="margin-top:10px; text-align:right;">
                            <button onclick="deleteExamQuestion('${course}', ${index})" style="background:#ef4444; color:white; border:none; padding:4px 8px; border-radius:4px; cursor:pointer; font-size:0.8rem;">삭제</button>
                        </div>
                    </div>
                `).join('');
            }
        }
    } catch (e) {
        console.error("loadExamQuestions error:", e);
    }
};

window.saveExamQuestion = async function(id) {
    const btn = document.querySelector(`#card-${id} button[onclick="saveExamQuestion('${id}')"]`);
    if(btn) btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 저장 중...';
    
    try {
        const inputs = document.querySelectorAll(`.result-input[data-id="${id}"]`);
        let dataMap = {};
        inputs.forEach(inp => {
            dataMap[inp.dataset.field] = inp.value;
        });
        
        const content = dataMap['전체내용'] || '';
        if(!content) {
            alert('저장할 내용이 없습니다.');
            if(btn) btn.innerHTML = '<i class="fas fa-save"></i> 과정에 추가';
            return;
        }

        const course = window.currentExamCourse || '한식기능사';
        
        // Fetch existing
        const res = await fetch('/api/sejong/questions');
        let allData = {};
        if (res.ok) {
            allData = await res.json();
        }
        
        if (!allData[course]) {
            allData[course] = [];
        }
        
        allData[course].push({
            id: Date.now().toString(),
            content: content,
            timestamp: new Date().toISOString()
        });
        
        // Save back
        const saveRes = await fetch('/api/sejong/questions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(allData)
        });
        
        if (!saveRes.ok) throw new Error('Failed to save');
        
        alert(`[${course}] 과정 시험지에 성공적으로 추가되었습니다!`);
        if(btn) {
            btn.innerHTML = '<i class="fas fa-check"></i> 저장 완료';
            btn.style.background = '#0f172a';
            btn.disabled = true;
        }
        
        loadExamQuestions(); // Refresh UI
        
    } catch (e) {
        console.error("saveExamQuestion error:", e);
        alert('저장 중 오류가 발생했습니다.');
        if(btn) btn.innerHTML = '<i class="fas fa-save"></i> 과정에 추가';
    }
};

window.deleteExamQuestion = async function(course, index) {
    if(!confirm('정말로 이 문제를 삭제하시겠습니까?')) return;
    
    try {
        const res = await fetch('/api/sejong/questions');
        if (!res.ok) throw new Error('Failed to fetch questions');
        let allData = await res.json();
        
        if(allData[course]) {
            allData[course].splice(index, 1);
            
            const saveRes = await fetch('/api/sejong/questions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(allData)
            });
            
            if (saveRes.ok) {
                loadExamQuestions();
            }
        }
    } catch (e) {
        console.error("deleteExamQuestion error:", e);
        alert('삭제 중 오류가 발생했습니다.');
    }
};

window.downloadExamWord = async function() {
    try {
        const res = await fetch('/api/sejong/questions');
        if (!res.ok) throw new Error('Failed to fetch questions');
        const allData = await res.json();
        
        const course = window.currentExamCourse || '한식기능사';
        const questions = allData[course] || [];
        
        if (questions.length === 0) {
            alert('다운로드할 문제가 없습니다.');
            return;
        }
        
        let htmlContent = `
            <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
            <head>
                <meta charset="utf-8">
                <title>${course} 시험지</title>
                <style>
                    body { font-family: 'Malgun Gothic', '맑은 고딕', sans-serif; }
                    .question-block { margin-bottom: 40px; page-break-inside: avoid; }
                    table { border-collapse: collapse; width: 100%; }
                    th, td { border: 1px solid black; padding: 5px; }
                </style>
            </head>
            <body>
                <h1 style="text-align:center;">${course} 시험지</h1>
                <hr>
        `;
        
        questions.forEach((q, index) => {
            htmlContent += `
                <div class="question-block">
                    <h3>문제 ${index + 1}</h3>
                    <div>${q.content}</div>
                </div>
            `;
        });
        
        htmlContent += `</body></html>`;
        
        const blob = new Blob(['\ufeff' + htmlContent], { type: 'application/msword' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${course}_시험지.doc`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
    } catch (e) {
        console.error("Word Download Error:", e);
        alert('다운로드 중 오류가 발생했습니다.');
    }
};

window.downloadExamExcel = async function() {
    try {
        const res = await fetch('/api/sejong/questions');
        if (!res.ok) throw new Error('Failed to fetch questions');
        const allData = await res.json();
        
        const course = window.currentExamCourse || '한식기능사';
        const questions = allData[course] || [];
        
        if (questions.length === 0) {
            alert('다운로드할 문제가 없습니다.');
            return;
        }
        
        let htmlContent = `
            <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
            <head>
                <meta charset="utf-8">
                <!--[if gte mso 9]>
                <xml>
                    <x:ExcelWorkbook>
                        <x:ExcelWorksheets>
                            <x:ExcelWorksheet>
                                <x:Name>${course}</x:Name>
                                <x:WorksheetOptions>
                                    <x:DisplayGridlines/>
                                </x:WorksheetOptions>
                            </x:ExcelWorksheet>
                        </x:ExcelWorksheets>
                    </x:ExcelWorkbook>
                </xml>
                <![endif]-->
                <style>
                    table { border-collapse: collapse; }
                    td { border: 1px solid #000; padding: 5px; vertical-align: top; }
                </style>
            </head>
            <body>
                <table>
                    <tr>
                        <th style="background:#f1f5f9; width:100px;">번호</th>
                        <th style="background:#f1f5f9; width:800px;">문제 내용 (HTML)</th>
                        <th style="background:#f1f5f9; width:200px;">저장 일시</th>
                    </tr>
        `;
        
        questions.forEach((q, index) => {
            htmlContent += `
                <tr>
                    <td>${index + 1}</td>
                    <td>${q.content}</td>
                    <td>${new Date(q.timestamp).toLocaleString()}</td>
                </tr>
            `;
        });
        
        htmlContent += `</table></body></html>`;
        
        const blob = new Blob(['\ufeff' + htmlContent], { type: 'application/vnd.ms-excel' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${course}_시험지.xls`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
    } catch (e) {
        console.error("Excel Download Error:", e);
        alert('다운로드 중 오류가 발생했습니다.');
    }
};

window.allExamCourses = []; // Now stores [{category: '...', courses: ['...']}, ...]
window.currentExamCategory = null;

window.loadExamCourses = async function() {
    try {
        const res = await fetch('/api/sejong/exam-courses');
        if (!res.ok) throw new Error('Failed to fetch exam courses');
        const data = await res.json();
        
        // Ensure data is array of objects
        if(Array.isArray(data) && data.length > 0 && typeof data[0] === 'string') {
            window.allExamCourses = [{category: '기본과정', courses: data}];
        } else {
            window.allExamCourses = data;
        }

        if(!window.currentExamCategory && window.allExamCourses.length > 0) {
            window.currentExamCategory = window.allExamCourses[0].category;
        }

        if(!window.currentExamCourse && window.allExamCourses.length > 0 && window.allExamCourses[0].courses.length > 0) {
            window.currentExamCourse = window.allExamCourses[0].courses[0];
        }

        renderExamCourseButtons();
        if(document.getElementById('courseSettingsModal').style.display === 'flex') {
            renderCourseSettingsList();
        }
    } catch (e) {
        console.error("loadExamCourses Error:", e);
    }
};

window.renderExamCourseButtons = function() {
    const container = document.getElementById('examCourseButtons');
    if(!container) return;

    let html = '<div style="margin-bottom: 15px; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px; display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">';
    
    // Search Box
    html += `<div style="display:flex; align-items:center; background:#fff; border:1px solid #cbd5e1; border-radius:8px; padding:2px 8px;">
                <i class="fas fa-search" style="color:#94a3b8; margin-right:5px;"></i>
                <input type="text" id="courseSearchBox" placeholder="과정 검색..." style="border:none; outline:none; font-size:0.95rem; padding:6px; width:150px;">
             </div>`;

    // 1. Render Category Tabs (대분류)
    const isAllActive = window.currentExamCategory === '전체과정' || !window.currentExamCategory;
    html += `<button class="mode-btn ${isAllActive ? 'active' : ''}" data-category="전체과정" style="padding: 6px 12px; font-size: 0.95rem; border-radius: 8px 8px 0 0; border-bottom: ${isAllActive ? '2px solid #2563eb' : 'none'}; background: ${isAllActive ? '#f1f5f9' : 'transparent'}; box-shadow: none;">📁 전체과정</button>`;

    window.allExamCourses.forEach(catObj => {
        const isActive = catObj.category === window.currentExamCategory;
        html += `<button class="mode-btn ${isActive ? 'active' : ''}" data-category="${catObj.category}" style="padding: 6px 12px; font-size: 0.95rem; border-radius: 8px 8px 0 0; border-bottom: ${isActive ? '2px solid #2563eb' : 'none'}; background: ${isActive ? '#f1f5f9' : 'transparent'}; box-shadow: none;">📁 ${catObj.category}</button>`;
    });
    html += '</div>';

    // 2. Render Courses (소분류) for selected category (or All)
    let coursesToShow = [];
    if (isAllActive) {
        window.allExamCourses.forEach(catObj => {
            coursesToShow = coursesToShow.concat(catObj.courses);
        });
    } else {
        const currentCatObj = window.allExamCourses.find(c => c.category === window.currentExamCategory);
        if (currentCatObj) coursesToShow = currentCatObj.courses;
    }

    if (coursesToShow.length > 0) {
        html += '<div style="display:flex; flex-wrap:wrap; gap:8px;" id="courseButtonsContainer">';
        coursesToShow.forEach(course => {
            const isActive = course === window.currentExamCourse;
            html += `<button class="mode-btn course-item-btn ${isActive ? 'active' : ''}" data-course="${course}" style="padding: 8px 16px; font-size: 0.9rem;">${course}</button>`;
        });
        html += '</div>';
    } else {
        html += '<div style="color: #94a3b8; font-size: 0.9rem; padding: 10px;">등록된 과정이 없습니다. 설정에서 하위 폴더를 추가해주세요.</div>';
    }

    container.innerHTML = html;

    // Attach events to Category Tabs
    const catBtns = container.querySelectorAll('button[data-category]');
    catBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            window.currentExamCategory = e.target.getAttribute('data-category');
            
            // Auto-select first course in this category if any
            const catObj = window.allExamCourses.find(c => c.category === window.currentExamCategory);
            if(catObj && catObj.courses.length > 0) {
                window.currentExamCourse = catObj.courses[0];
            } else {
                window.currentExamCourse = null;
            }
            
            renderExamCourseButtons();
            if(window.currentExamCourse) {
                loadExamQuestions();
            } else {
                document.getElementById('examQuestionList').innerHTML = '<div style="text-align:center; padding:40px; color:#94a3b8;">하위 폴더(과정)를 선택해주세요.</div>';
            }
        });
    });

    // Attach events to Course Buttons
    const courseBtns = container.querySelectorAll('button[data-course]');
    courseBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            window.currentExamCourse = e.target.getAttribute('data-course');
            renderExamCourseButtons(); // Update active states
            loadExamQuestions();
        });
    });

    // Attach event for Course Search Box
    const searchBox = document.getElementById('courseSearchBox');
    if (searchBox) {
        searchBox.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();
            const allCourseBtns = container.querySelectorAll('.course-item-btn');
            allCourseBtns.forEach(btn => {
                const courseName = btn.getAttribute('data-course').toLowerCase();
                if (courseName.includes(query)) {
                    btn.style.display = 'inline-block';
                } else {
                    btn.style.display = 'none';
                }
            });
        });
        // Restore focus if it was focused before (optional, since typing doesn't re-render right now)
    }
};
