import os

path = "/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/SejongAttendance/public/cycle_settings.html"

html_content = """<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>결재 주기 설정 - 세종요리제과기술학원</title>
    <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
    <link rel="stylesheet" href="style.css">
    <style>
        .setting-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin-bottom: 20px; }
        .setting-card .title { font-size: 1.2rem; font-weight: bold; color: #334155; margin-bottom: 10px; display: flex; align-items: center; gap: 8px; }
        .setting-card .desc { color: #64748b; margin-bottom: 15px; }
        .setting-card .input-row { display: flex; align-items: center; gap: 10px; }
        .setting-card input[type="number"] { width: 80px; padding: 8px; font-size: 1.1rem; border: 1px solid #cbd5e1; border-radius: 6px; text-align: center; }
        
        .chip-container { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 15px; background: #ffffff; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0; min-height: 80px; align-content: flex-start; }
        
        .chip { display: flex; align-items: center; gap: 8px; background: #eff6ff; color: #1e40af; padding: 8px 14px; border-radius: 20px; border: 1px solid #bfdbfe; font-size: 1.05rem; font-weight: 600; transition: all 0.2s; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
        .chip:hover { transform: translateY(-2px); box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .chip.custom-chip { background: #fef2f2; color: #991b1b; border: 1px solid #fecaca; }
        .chip.baking-chip { background: #fffbeb; color: #b45309; border: 1px solid #fde68a; }
        
        .chip-btn { background: white; border: 1px solid #cbd5e1; cursor: pointer; display: flex; align-items: center; justify-content: center; padding: 4px; border-radius: 50%; color: #64748b; transition: all 0.2s; }
        .chip-btn:hover { background: #ef4444; color: white; border-color: #ef4444; }
        .chip-btn .material-icons { font-size: 16px; font-weight: bold; }
        
        .custom-rule-item { display: flex; justify-content: space-between; align-items: center; background: white; padding: 15px; border-radius: 12px; border: 1px solid #e2e8f0; margin-bottom: 12px; box-shadow: 0 2px 4px rgba(0,0,0,0.02); }
    </style>
</head>
<body style="background-color: #f1f5f9; font-family: 'Pretendard', sans-serif;">

<div class="app-container">
    <aside class="sidebar">
        <div class="logo-area">
            <span class="material-icons" style="font-size: 28px; color: #3b82f6;">school</span>
            <h2>세종학원 시스템</h2>
        </div>
        <nav class="nav-menu">
            <a href="sheet.html" class="nav-item">
                <span class="material-icons">calendar_month</span> 월간 출석부
            </a>
            <a href="attendance_daily.html" class="nav-item">
                <span class="material-icons">fact_check</span> 일일 출석 체크
            </a>
            <a href="register.html" class="nav-item">
                <span class="material-icons">person_add</span> 수강생 등록
            </a>
            <a href="members.html" class="nav-item">
                <span class="material-icons">people</span> 수강생 대장
            </a>
            <a href="tuition.html" class="nav-item">
                <span class="material-icons">payments</span> 수강료 관리
            </a>
            <a href="ledger.html" class="nav-item">
                <span class="material-icons">receipt_long</span> 수강료 납부대장
            </a>
            <a href="paid_list.html" class="nav-item">
                <span class="material-icons">how_to_reg</span> 납부완료 명단
            </a>
            <a href="stats.html" class="nav-item">
                <span class="material-icons">bar_chart</span> 통계 및 납부
            </a>
            <a href="sms_v4.html" class="nav-item">
                <span class="material-icons">sms</span> 문자 발송
            </a>
            <a href="kiosk_admin.html" class="nav-item">
                <span class="material-icons">touch_app</span> 출석 키오스크
            </a>
            <a href="photo_edit.html" class="nav-item">
                <span class="material-icons">photo_camera</span> 사진 촬영/편집
            </a>
            <a href="monitor.html" class="nav-item">
                <span class="material-icons">desktop_windows</span> 듀얼 모니터
            </a>

            <div class="nav-divider"></div>
            
            <a href="board.html" class="nav-item">
                <span class="material-icons">campaign</span> 학원 공지
            </a>
            <a href="timetable.html" class="nav-item">
                <span class="material-icons">schedule</span> 수업 요일 설정
            </a>
            <a href="cycle_settings.html" class="nav-item active">
                <span class="material-icons">tune</span> 결재 주기 설정
            </a>
            <a href="archive.html" class="nav-item">
                <span class="material-icons">inventory_2</span> 수료생 보관함
            </a>
            <a href="trash.html" class="nav-item">
                <span class="material-icons">delete</span> 휴지통
            </a>
        </nav>
    </aside>

    <main class="main-content" style="background-color: #f1f5f9; padding: 40px; display: flex; flex-direction: column; justify-content: flex-start; align-items: center;">
        <div style="background: white; width: 100%; max-width: 900px; border-radius: 20px; box-shadow: 0 10px 25px rgba(0,0,0,0.05); padding: 40px; border: 1px solid #e2e8f0;">
            
            <h1 style="display: flex; align-items: center; gap: 10px; color: #1e293b; margin-bottom: 20px;">
                <span class="material-icons" style="color: #3b82f6; font-size: 32px;">tune</span> 과정별 결재 주기 설정
            </h1>
            
            <div style="margin-bottom: 30px; padding: 15px; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 10px; color: #1e40af; line-height: 1.6;">
                <span class="material-icons" style="vertical-align: middle; margin-right: 5px;">info</span>
                <strong>사용 안내</strong><br>
                1. <strong>일반 과정</strong> 또는 <strong>제과제빵 과정</strong>에서 빼기 버튼을 누르면 밑의 '단독 특수 과정'으로 빠집니다.<br>
                2. 특수 과정에서는 과정마다 별도의 주기를 자유롭게 넣을 수 있습니다. 더하기 버튼을 누르면 다시 원래 자리로 올라갑니다.
            </div>

            <!-- 영역 1: 일반 과정 -->
            <div class="setting-card">
                <div class="title"><span class="material-icons" style="color:#10b981;">restaurant</span> 일반 과정 (기본 그룹)</div>
                <div class="desc">한식, 양식, 중식, 일식 등 기본 주기를 따르는 과정들입니다. 단독 주기가 필요한 경우 빼기(-)를 누르세요.</div>
                <div class="input-row" style="margin-bottom: 15px; padding-bottom: 15px; border-bottom: 1px solid #e2e8f0;">
                    <span style="font-weight: bold; color: #334155; font-size: 1.1rem;">결재 주기:</span>
                    <input type="number" id="defaultCycle" value="9" min="1">
                    <span style="color: #64748b;">회 출석 시 결재 발생</span>
                </div>
                <div class="chip-container" id="generalCoursesList">
                    <!-- 일반 과정 렌더링 영역 -->
                </div>
            </div>

            <!-- 영역 2: 제과제빵 전용 과정 -->
            <div class="setting-card" style="background: #fffdf5; border-color: #fef08a;">
                <div class="title"><span class="material-icons" style="color:#d97706;">bakery_dining</span> 제과제빵 전용 과정</div>
                <div class="desc">제과제빵 관련 과정들만 모인 전용 칸입니다. 이 칸에 있는 과정들은 모두 아래의 주기를 따릅니다.</div>
                <div class="input-row" style="margin-bottom: 15px; padding-bottom: 15px; border-bottom: 1px solid #fde047;">
                    <span style="font-weight: bold; color: #92400e; font-size: 1.1rem;">결재 주기:</span>
                    <input type="number" id="bakingCycle" value="17" min="1" style="border-color: #facc15; background: #fff;">
                    <span style="color: #b45309;">회 출석 시 결재 발생</span>
                </div>
                <div class="chip-container" id="bakingCoursesList" style="background: rgba(255,255,255,0.7); border-color: #fef08a;">
                    <!-- 제과제빵 과정 렌더링 영역 -->
                </div>
            </div>

            <!-- 영역 3: 특수 과정 -->
            <div class="setting-card" style="background: #fef8f8; border-color: #fee2e2;">
                <div class="title"><span class="material-icons" style="color:#ef4444;">stars</span> 단독 특수 과정 (목록에서 뺀 과정들)</div>
                <div class="desc">위의 상자들에서 뺀 과정들입니다. 각 과정마다 독자적인 결재 주기를 설정할 수 있습니다.</div>
                
                <div class="chip-container" id="customCoursesList" style="flex-direction: column; background: transparent; border: none; padding: 0; min-height: 0;">
                    <!-- 특수 과정 렌더링 영역 -->
                </div>
            </div>

            <!-- 영역 4: 수동 키워드 추가 -->
            <div style="margin-top: 30px; border-top: 1px dashed #cbd5e1; padding-top: 20px;">
                <div style="color: #64748b; font-size: 0.95rem; margin-bottom: 10px;">
                    <span class="material-icons" style="font-size: 16px; vertical-align: middle;">add_circle_outline</span> 전체 과정 목록에 아예 없는 <strong>새로운 과정</strong>을 수동으로 등록하시려면 아래에 입력하세요.
                </div>
                <div style="display: flex; gap: 10px; align-items: center; background: #f8fafc; padding: 15px; border-radius: 12px; border: 1px solid #e2e8f0;">
                    <input type="text" id="newKeyword" placeholder="새 과정 이름 (예: 바리스타)" style="flex: 1; padding: 12px; border-radius: 8px; border: 1px solid #cbd5e1; font-size: 1rem;">
                    <input type="number" id="newCycle" placeholder="주기(회)" style="width: 100px; padding: 12px; border-radius: 8px; border: 1px solid #cbd5e1; font-size: 1rem; text-align: center;">
                    <button onclick="addManualRule()" style="padding: 12px 20px; border-radius: 8px; background: #64748b; color: white; border: none; font-weight: bold; cursor: pointer; display: flex; align-items: center; gap: 5px;">
                        <span class="material-icons" style="font-size:18px;">add</span> 직접 추가
                    </button>
                </div>
            </div>

            <button onclick="saveCycleSettings()" 
                    style="background: #3b82f6; color: white; border: none; padding: 18px 24px; border-radius: 12px; cursor: pointer; font-size: 1.3rem; font-weight: bold; display: flex; align-items: center; justify-content: center; gap: 10px; margin-top: 40px; width: 100%; box-shadow: 0 4px 6px rgba(59, 130, 246, 0.3); transition: all 0.2s;">
                <span class="material-icons">save</span> 변경사항 저장 및 전체 시스템 반영
            </button>
        </div>
    </main>
</div>

<script>
    let globalSettings = {};
    let cycleRules = {
        default: 9,
        custom: [
            { keyword: "제과제빵", cycle: 17 } // 이건 이제 제과제빵 전용 칸의 기준값이 됩니다.
        ]
    };
    let allKnownCourses = []; 

    function isBakingCourse(c) {
        return c.includes('제과') || c.includes('제빵');
    }

    async function loadSettings() {
        try {
            const res = await fetch('/api/sejong/settings');
            if (res.ok) {
                globalSettings = await res.json();
                let target = Array.isArray(globalSettings) ? (globalSettings[0] || {}) : globalSettings;
                
                if (target.cycleRules) {
                    cycleRules = JSON.parse(JSON.stringify(target.cycleRules));
                }
                if (target.courses && Array.isArray(target.courses)) {
                    allKnownCourses = [...target.courses];
                }
            }
            
            // "제과제빵" 키워드 룰이 없으면 기본 생성
            if (!cycleRules.custom.find(r => r.keyword === "제과제빵")) {
                cycleRules.custom.push({ keyword: "제과제빵", cycle: 17 });
            }
            
            renderUI();
        } catch (e) {
            console.error('설정 로딩 실패:', e);
            alert("설정을 불러오는데 실패했습니다.");
        }
    }

    function renderUI() {
        document.getElementById('defaultCycle').value = cycleRules.default || 9;
        
        let bakingRule = cycleRules.custom.find(r => r.keyword === "제과제빵");
        if(bakingRule) {
            document.getElementById('bakingCycle').value = bakingRule.cycle || 17;
        }
        
        const generalContainer = document.getElementById('generalCoursesList');
        const bakingContainer = document.getElementById('bakingCoursesList');
        const customContainer = document.getElementById('customCoursesList');
        
        let generalHTML = '';
        let bakingHTML = '';
        let customHTML = '';

        let customKeywords = cycleRules.custom.map(r => r.keyword);
        
        // 분류
        let generalCourses = [];
        let bakingCourses = [];
        
        allKnownCourses.forEach(c => {
            // "제과제빵" 이라는 단어 자체는 그룹 마스터 키워드이므로 제외
            if (c === "제과제빵" && !allKnownCourses.includes("제과제빵기능사")) return;
            
            // 사용자가 개별 특수과정으로 빼놓은 것은 여기서 안그림
            if (customKeywords.includes(c) && c !== "제과제빵") return;
            
            if (isBakingCourse(c)) {
                bakingCourses.push(c);
            } else {
                generalCourses.push(c);
            }
        });

        // 1. 일반 과정 그리기
        if (generalCourses.length === 0) {
            generalHTML = '<div style="color:#94a3b8; width: 100%; text-align: center; padding: 10px;">목록이 비어있습니다.</div>';
        } else {
            generalCourses.forEach(c => {
                generalHTML += `
                    <div class="chip">
                        ${c}
                        <button class="chip-btn" onclick="moveToCustom('${c}')" title="특수 과정으로 빼기">
                            <span class="material-icons">remove</span>
                        </button>
                    </div>
                `;
            });
        }
        
        // 2. 제과제빵 과정 그리기
        if (bakingCourses.length === 0) {
            bakingHTML = '<div style="color:#b45309; width: 100%; text-align: center; padding: 10px; opacity:0.7;">목록이 비어있습니다.</div>';
        } else {
            bakingCourses.forEach(c => {
                bakingHTML += `
                    <div class="chip baking-chip">
                        ${c}
                        <button class="chip-btn" onclick="moveToCustom('${c}')" title="단독 특수 과정으로 빼기">
                            <span class="material-icons">remove</span>
                        </button>
                    </div>
                `;
            });
        }
        
        // 3. 특수 과정 그리기 (제과제빵 마스터 키워드 제외)
        let actualCustomRules = cycleRules.custom.filter(r => r.keyword !== "제과제빵");
        
        if (actualCustomRules.length === 0) {
            customHTML = '<div style="color:#ef4444; font-size:0.95rem; text-align:center; padding: 25px; background: white; border-radius: 8px; border: 1px dashed #fca5a5;">특수 과정으로 빠져나온 항목이 없습니다.</div>';
        } else {
            actualCustomRules.forEach(rule => {
                let inputId = 'cycle_input_' + rule.keyword.replace(/\s+/g, '_');
                customHTML += `
                    <div class="custom-rule-item">
                        <div style="display:flex; align-items:center; gap:15px;">
                            <div class="chip custom-chip" style="margin:0; box-shadow:none;">
                                ${rule.keyword}
                            </div>
                            <div style="color:#475569; font-size:1.1rem; font-weight: 500;">
                                출석 <input type="number" id="${inputId}" value="${rule.cycle}" class="cycle-input" onchange="updateCustomCycle('${rule.keyword}', this.value)" min="1" style="width: 70px; padding: 6px; text-align: center; border: 1px solid #cbd5e1; border-radius: 6px; margin: 0 8px; font-size: 1.1rem; color: #1e293b; font-weight: bold;"> 회
                            </div>
                        </div>
                        <button class="delete-btn" onclick="moveToGeneral('${rule.keyword}')" title="원래 그룹으로 되돌리기" style="background:#dcfce7; color:#166534; border:1px solid #bbf7d0; padding: 8px 16px; border-radius: 8px; font-weight: bold; cursor: pointer; display: flex; align-items: center; gap: 5px; transition: background 0.2s;">
                            <span class="material-icons" style="font-size:18px;">add</span> 원래 자리로
                        </button>
                    </div>
                `;
            });
        }

        generalContainer.innerHTML = generalHTML;
        bakingContainer.innerHTML = bakingHTML;
        customContainer.innerHTML = customHTML;
    }

    function moveToCustom(courseName) {
        if (!cycleRules.custom.find(r => r.keyword === courseName)) {
            // 빼낼 때 기본값은 해당 항목이 속했던 곳의 값을 준다
            let initCycle = isBakingCourse(courseName) ? 
                parseInt(document.getElementById('bakingCycle').value) || 17 : 
                parseInt(document.getElementById('defaultCycle').value) || 9;
            cycleRules.custom.push({ keyword: courseName, cycle: initCycle }); 
        }
        renderUI();
    }

    function moveToGeneral(keyword) {
        cycleRules.custom = cycleRules.custom.filter(r => r.keyword !== keyword);
        renderUI();
    }
    
    function updateCustomCycle(keyword, val) {
        let cycle = parseInt(val);
        if (isNaN(cycle) || cycle <= 0) cycle = 1;
        const rule = cycleRules.custom.find(r => r.keyword === keyword);
        if (rule) rule.cycle = cycle;
    }

    function addManualRule() {
        const keyword = document.getElementById('newKeyword').value.trim();
        const cycle = parseInt(document.getElementById('newCycle').value);

        if (!keyword) return alert('과정 이름을 입력해주세요.');
        if (!cycle || cycle <= 0) return alert('유효한 주기 횟수를 입력해주세요.');

        if (!allKnownCourses.includes(keyword)) {
            allKnownCourses.push(keyword);
        }

        const existingIdx = cycleRules.custom.findIndex(r => r.keyword === keyword);
        if (existingIdx >= 0) {
            cycleRules.custom[existingIdx].cycle = cycle;
        } else {
            cycleRules.custom.push({ keyword, cycle });
        }

        document.getElementById('newKeyword').value = '';
        document.getElementById('newCycle').value = '';
        renderUI();
    }

    async function saveCycleSettings() {
        // 일반 과정 동기화
        const defCycle = parseInt(document.getElementById('defaultCycle').value);
        if (!defCycle || defCycle <= 0) return alert('일반 과정 결재 주기를 올바르게 입력하세요.');
        cycleRules.default = defCycle;
        
        // 제과제빵 전용 주기 동기화
        const bakCycle = parseInt(document.getElementById('bakingCycle').value);
        if (!bakCycle || bakCycle <= 0) return alert('제과제빵 과정 결재 주기를 올바르게 입력하세요.');
        let bakingRule = cycleRules.custom.find(r => r.keyword === "제과제빵");
        if (bakingRule) {
            bakingRule.cycle = bakCycle;
        } else {
            cycleRules.custom.push({ keyword: "제과제빵", cycle: bakCycle });
        }
        
        // 특수 과정 동기화
        cycleRules.custom.forEach(rule => {
            if(rule.keyword === "제과제빵") return;
            let inputId = 'cycle_input_' + rule.keyword.replace(/\s+/g, '_');
            let el = document.getElementById(inputId);
            if (el) {
                let c = parseInt(el.value);
                if (c > 0) rule.cycle = c;
            }
        });

        let target = Array.isArray(globalSettings) ? (globalSettings[0] = globalSettings[0] || {}) : globalSettings;
        target.cycleRules = cycleRules;
        target.courses = allKnownCourses;
        
        if (Array.isArray(globalSettings) && globalSettings.length === 0) {
            globalSettings.push(target);
        }

        try {
            const res = await fetch('/api/sejong/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(globalSettings)
            });
            if (res.ok) {
                alert('저장이 완료되었습니다! 시스템 전체에 반영되었습니다.');
            } else {
                alert('저장 중 서버 오류가 발생했습니다.');
            }
        } catch (e) {
            console.error(e);
            alert('저장 중 통신 오류가 발생했습니다.');
        }
    }

    loadSettings();
</script>
</body>
</html>
"""

with open(path, 'w', encoding='utf-8') as f:
    f.write(html_content)

print("Updated cycle_settings.html with baking box")
