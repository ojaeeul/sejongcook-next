let type = new URLSearchParams(window.location.search).get('type') || 'payment';
let globalMembers = [];
let globalPayments = [];

// Configuration for different types
const config = {
    payment: {
        title: '납부 상세 통계', icon: 'payments', color: '#10b981',
        overallTitle: '전체 납부액 합계',
        t1Label: '연도 선택', t2Label: '월 선택', t3Label: '상세 결제 내역',
        t2Empty: '연도를 먼저 선택해주세요.', t3Empty: '월을 먼저 선택해주세요.'
    },
    unpaid: {
        title: '미납자 상세 조회', icon: 'warning', color: '#f43f5e',
        overallTitle: '전체 미납액 합계',
        t1Label: '연도 선택', t2Label: '월 선택', t3Label: '미납자 목록',
        t2Empty: '연도를 먼저 선택해주세요.', t3Empty: '월을 먼저 선택해주세요.'
    },
    students: {
        title: '학생수 상세 현황', icon: 'groups', color: '#3b82f6',
        overallTitle: '전체 활성 수강생',
        t1Label: '총인원', t2Label: '수강 과목', t3Label: '해당 학생 명단',
        t2Empty: '구분을 먼저 선택해주세요.', t3Empty: '과목을 먼저 선택해주세요.'
    },
    grades: {
        title: '학년별 상세 현황', icon: 'school', color: '#f59e0b',
        overallTitle: '전체 활성 수강생',
        t1Label: '구분', t2Label: '수강 과목', t3Label: '해당 학생 명단',
        t2Empty: '구분을 먼저 선택해주세요.', t3Empty: '과목을 먼저 선택해주세요.'
    },
    courses: {
        title: '강좌별 상세 현황', icon: 'local_library', color: '#8b5cf6',
        overallTitle: '전체 개설 강좌 수',
        t1Label: '대분류', t2Label: '세부 강좌', t3Label: '수강생 명단',
        t2Empty: '대분류를 먼저 선택해주세요.', t3Empty: '세부 강좌를 먼저 선택해주세요.'
    },
    vehicles: {
        title: '차량 호차별 인원 상세', icon: 'directions_bus', color: '#f59e0b',
        overallTitle: '차량 총 탑승 인원',
        t1Label: '차량 구분', t2Label: '호차 선택', t3Label: '탑승 학생 명단',
        t2Empty: '차량 구분을 먼저 선택해주세요.', t3Empty: '호차를 먼저 선택해주세요.'
    },
    missed_calls: {
        title: '부재중 전화 상세', icon: 'phone_missed', color: '#ef4444',
        overallTitle: '전체 부재중 건수',
        t1Label: '연도 선택', t2Label: '월 선택', t3Label: '부재중 상세 기록',
        t2Empty: '연도를 먼저 선택해주세요.', t3Empty: '월을 먼저 선택해주세요.'
    }
};

const curConfig = config[type] || config.payment;
document.documentElement.style.setProperty('--theme-color', curConfig.color);

document.addEventListener('DOMContentLoaded', async () => {
    // Set UI text
    document.getElementById('pageMainTitle').innerHTML = `<span class="material-icons" style="color: ${curConfig.color}; font-size: 2rem;">${curConfig.icon}</span> ${curConfig.title}`;
    document.getElementById('overallTitle').innerText = curConfig.overallTitle;
    document.getElementById('overallIcon').innerText = curConfig.icon;
    document.getElementById('overallIcon').style.color = curConfig.color;
    document.getElementById('overallIconBox').style.background = curConfig.color + '20';
    document.title = `${curConfig.title} - 세종요리`;

    document.getElementById('tier1Title').innerText = curConfig.t1Label;
    document.getElementById('tier2Title').innerText = curConfig.t2Label;
    document.getElementById('tier3Title').innerText = curConfig.t3Label;
    document.getElementById('tier2EmptyMsg').innerText = curConfig.t2Empty;
    document.getElementById('tier3EmptyMsg').innerText = curConfig.t3Empty;

    // Load Data
    try {
        if (type === 'unpaid') {
            const [mRes, pRes, aRes, sRes] = await Promise.all([
                fetch(`/api/sejong/members?t=${Date.now()}`),
                fetch(`/api/sejong/payments?t=${Date.now()}`),
                fetch(`/api/sejong/attendance?t=${Date.now()}`),
                fetch(`/api/sejong/settings?t=${Date.now()}`)
            ]);
            globalMembers = await mRes.json();
            globalPayments = await pRes.json();
            window.attendanceData = await aRes.json();
            const rawSettings = await sRes.json();
            const settings = Array.isArray(rawSettings) ? rawSettings[0] : rawSettings;
            window.courseFees = settings && settings.courseFees ? settings.courseFees : {};
            if(typeof window.loadCycleSettings === 'function') await window.loadCycleSettings();
            processData();
        } else {
            const [mRes, pRes] = await Promise.all([
                fetch(`/api/sejong/members?t=${Date.now()}`),
                fetch(`/api/sejong/payments?t=${Date.now()}`)
            ]);
            globalMembers = await mRes.json();
            globalPayments = await pRes.json();
            
            processData();
        }
    } catch(e) {
        console.error(e);
        document.getElementById('overallValue').innerText = '오류';
        document.getElementById('tier1List').innerHTML = `<div style="text-align: center; color: #ef4444; padding: 20px;">데이터 로딩 실패</div>`;
    }
});

let parsedData = {};

function processData() {
    parsedData = {};
    let overallValue = 0;
    const activeMembers = globalMembers.filter(m => !['completed', 'trash', 'delete'].includes(m.status));

    if (type === 'payment') {
        globalPayments.forEach(p => {
            if (p.status === 'paid') {
                const amt = p.amount || 200000;
                overallValue += amt;
                
                const d = new Date(p.updatedAt || p.date);
                const year = d.getFullYear();
                const month = d.getMonth() + 1;
                const day = d.getDate();
                
                if(!parsedData[year]) parsedData[year] = { total: 0, children: {} };
                parsedData[year].total += amt;
                
                if(!parsedData[year].children[month]) parsedData[year].children[month] = { total: 0, children: {} };
                parsedData[year].children[month].total += amt;
                
                if(!parsedData[year].children[month].children[day]) parsedData[year].children[month].children[day] = { total: 0, items: [] };
                parsedData[year].children[month].children[day].total += amt;
                
                // Find member name
                const member = globalMembers.find(m => m.id === p.memberId);
                const name = member ? member.name : '알수없음';
                parsedData[year].children[month].children[day].items.push({
                    name: name + (p.months ? ` (${p.months}개월)` : ''),
                    amount: amt
                });
            }
        });
        document.getElementById('overallValue').innerText = overallValue.toLocaleString() + '원';
    } 
    else if (type === 'unpaid') {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const DEFAULT_PRICE = 200000;
        
        activeMembers.forEach(m => {
            let myCourses = (m.course || '').split(',').map(c => c.trim()).filter(c => c !== '');
            
            const hasJeggwa = myCourses.some(c => c.includes('제과') && !c.includes('제과제빵'));
            const hasJeppang = myCourses.some(c => c.includes('제빵') && !c.includes('제과제빵'));
            if (hasJeggwa && hasJeppang) {
                myCourses = myCourses.filter(c => !c.includes('제과') && !c.includes('제빵'));
                myCourses.push('제과제빵기능사');
            }
            if (myCourses.some(c => c.includes('제과') && !c.includes('제과제빵')) && myCourses.some(c => c.includes('제빵') && !c.includes('제과제빵'))) {
                myCourses = myCourses.filter(c => !c.includes('제과') && !c.includes('제빵'));
                myCourses.push('제과제빵기능사');
            }
            if (myCourses.length === 0) myCourses.push('');

            myCourses.forEach(fullCourse => {
                const courseNameOnly = fullCourse ? fullCourse.split('(')[0].trim() : '';
                const courseFee = window.courseFees[courseNameOnly] || window.courseFees['all'] || DEFAULT_PRICE;
                
                if (typeof window.calculateRedBoxesForMonth === 'function') {
                    const stats = window.calculateRedBoxesForMonth(m, today.getFullYear(), today.getMonth()+1, window.attendanceData, courseNameOnly, {});
                    
                    if (stats && stats.allMilestones) {
                        let currentProgressObj = stats.currentCount || { count: 0, target: 9 };
                        let remainingForLoop = currentProgressObj.count;
                        const isDualBakeryLocal = (courseNameOnly && courseNameOnly.replace(/\s/g, '').includes('제과제빵')) || (!courseNameOnly && m.course && m.course.replace(/\s/g, '').includes('제과제빵'));
                        const firstTargetCount = isDualBakeryLocal ? 17 : 9;
                        const subTargetCount = isDualBakeryLocal ? 16 : 8;
                        let isFirstCycleForThisCourse = true;
                        const normalizeCourse = (c) => (!c || c === 'null') ? null : String(c).trim();

                        stats.allMilestones.forEach(ms => {
                            let currentTargetCount = isFirstCycleForThisCourse ? firstTargetCount : subTargetCount;
                            const msPayment = globalPayments.find(p => p.memberId == m.id && p.year == ms.year && p.month == ms.month && normalizeCourse(p.course) === normalizeCourse(courseNameOnly) && p.status !== 'delete');
                            
                            if (msPayment && msPayment.status === 'paid') {
                                remainingForLoop -= currentTargetCount;
                                isFirstCycleForThisCourse = false;
                            } else {
                                const msDateObj = new Date(ms.year, ms.month - 1, ms.day);
                                const isActualOverdue = remainingForLoop >= currentTargetCount || (ms.isReal !== false && msDateObj <= today);
                                
                                if (isActualOverdue) {
                                    const yearStr = ms.year + '년';
                                    const monthStr = ms.month + '월';
                                    const dayStr = ms.day + '일';
                                    const uAmt = courseFee;
                                    
                                    overallValue += uAmt;
                                    
                                    if(!parsedData[yearStr]) parsedData[yearStr] = { total: 0, children: {} };
                                    parsedData[yearStr].total += uAmt;
                                    
                                    if(!parsedData[yearStr].children[monthStr]) parsedData[yearStr].children[monthStr] = { total: 0, children: {} };
                                    parsedData[yearStr].children[monthStr].total += uAmt;
                                    
                                    if(!parsedData[yearStr].children[monthStr].children[dayStr]) parsedData[yearStr].children[monthStr].children[dayStr] = { total: 0, items: [] };
                                    parsedData[yearStr].children[monthStr].children[dayStr].total += uAmt;
                                    
                                    parsedData[yearStr].children[monthStr].children[dayStr].items.push({
                                        name: `${m.name} (${courseNameOnly})`,
                                        subText: `결제일: ${ms.year}년 ${ms.month}월 ${ms.day}일 | ${m.phone || '연락처 없음'}`,
                                        amount: uAmt
                                    });
                                }
                                remainingForLoop -= currentTargetCount;
                                isFirstCycleForThisCourse = false;
                            }
                        });
                    }
                }
            });
        });
        document.getElementById('overallValue').innerText = overallValue.toLocaleString() + '원';
    }
    else if (type === 'students') {
        const baseMembers = globalMembers.filter(m => !['trash', 'delete'].includes(m.status));
        const today = new Date();
        const thisYear = today.getFullYear();
        const thisMonth = today.getMonth() + 1;

        parsedData['총인원'] = { total: 0, children: {} };
        parsedData['신규인원'] = { total: 0, children: {} };
        parsedData['수료수강자'] = { total: 0, children: {} };

        baseMembers.forEach(m => {
            let groups = [];
            
            if (!['completed', 'trash', 'delete'].includes(m.status)) {
                groups.push('총인원');
                
                let isNew = false;
                if (m.registeredDate) {
                    const rDate = new Date(m.registeredDate);
                    if (rDate.getFullYear() === thisYear && rDate.getMonth() + 1 === thisMonth) isNew = true;
                } else if (m.start_date) {
                    const sDate = new Date(m.start_date);
                    if (sDate.getFullYear() === thisYear && sDate.getMonth() + 1 === thisMonth) isNew = true;
                }
                
                if (isNew) groups.push('신규인원');
            }

            if (m.status === 'completed') {
                let isCompletedThisMonth = false;
                if (m.completedDate) {
                    const cDate = new Date(m.completedDate);
                    if (cDate.getFullYear() === thisYear && cDate.getMonth() + 1 === thisMonth) isCompletedThisMonth = true;
                }
                if (isCompletedThisMonth) groups.push('수료수강자');
            }

            const courses = m.course ? m.course.split(',').map(c => c.split('(')[0].trim()).filter(c=>c) : ['미지정'];
            
            groups.forEach(ageGroup => {
                parsedData[ageGroup].total += 1;
                
                courses.forEach(c => {
                    if(!parsedData[ageGroup].children[c]) parsedData[ageGroup].children[c] = { total: 0, items: [] };
                    parsedData[ageGroup].children[c].total += 1;
                    
                    let remarks = '';
                    if (m.type === 'student') {
                        const schoolName = m.school || '';
                        const schoolLevel = m.school_level ? `(${m.school_level})` : '';
                        const gradeStrExt = m.grade ? `${m.grade}학년` : '';
                        remarks = `${schoolName} ${schoolLevel} ${gradeStrExt}`.trim();
                    } else {
                        remarks = m.job || '';
                    }
                    if (!remarks) remarks = '비고 없음';

                    parsedData[ageGroup].children[c].items.push({
                        name: m.name,
                        subText: `비고: ${remarks} | 연락처: ${m.phone || '없음'}`,
                        amountText: ''
                    });
                });
            });
        });

        // Remove empty groups to keep the UI clean if preferred, or leave them. Let's leave them.
        overallValue = parsedData['총인원'].total;
        document.getElementById('overallValue').innerText = overallValue + '명';
    }
    else if (type === 'grades') {
        // Only include active members to match the student register (exclude completed, hold, trash, delete)
        const baseMembers = globalMembers.filter(m => !['completed', 'hold', 'trash', 'delete'].includes(m.status));
        
        parsedData['일반인'] = { total: 0, children: {} };
        parsedData['대학생'] = { total: 0, children: {} };
        parsedData['고등학생'] = { total: 0, children: {} };
        parsedData['중학생'] = { total: 0, children: {} };
        parsedData['초등학생'] = { total: 0, children: {} };

        baseMembers.forEach(m => {
            let gradeType = '일반인'; // Default
            
            let remarks = '';
            if (m.type === 'student') {
                const schoolName = m.school || '';
                const schoolLevel = m.school_level ? `(${m.school_level})` : '';
                const gradeStrExt = m.grade ? `${m.grade}학년` : '';
                remarks = `${schoolName} ${schoolLevel} ${gradeStrExt}`.trim();
            } else {
                remarks = m.job || '';
            }
            if (!remarks) remarks = '비고 없음';
            
            // VERY robust classification based on the actual text displayed
            if (remarks.includes('초등') || remarks.match(/초(\s|[0-9]학년|$)/)) {
                gradeType = '초등학생';
            } else if (remarks.includes('중등') || remarks.includes('중학교') || remarks.match(/중(\s|[0-9]학년|$)/)) {
                gradeType = '중학생';
            } else if (remarks.includes('고등') || remarks.includes('고교') || remarks.includes('고등학교') || remarks.match(/고(\s|[0-9]학년|$)/)) {
                gradeType = '고등학생';
            } else if (remarks.includes('대학') || remarks.match(/대(\s|[0-9]학년|$)/)) {
                gradeType = '대학생';
            } else if (m.type === 'general') {
                // Only if no student keywords are found do we respect the general type
                gradeType = '일반인';
            } else {
                // If it's a student but has no identifiable school name, try age
                if (m.age) {
                    const ageNum = parseInt(m.age);
                    if (ageNum < 14) gradeType = '초등학생';
                    else if (ageNum < 17) gradeType = '중학생';
                    else if (ageNum < 20) gradeType = '고등학생';
                    else gradeType = '대학생';
                } else {
                    gradeType = '일반인';
                }
            }

            const courses = m.course ? m.course.split(',').map(c => c.split('(')[0].trim()).filter(c=>c) : ['미지정'];
            courses.forEach(c => {
                overallValue++;
                if (!parsedData[gradeType]) parsedData[gradeType] = { total: 0, children: {} };
                parsedData[gradeType].total++;
                
                if (!parsedData[gradeType].children[c]) parsedData[gradeType].children[c] = { total: 0, items: [] };
                parsedData[gradeType].children[c].total++;
                
                parsedData[gradeType].children[c].items.push({
                    name: m.name,
                    subText: `비고: ${remarks} | 연락처: ${m.phone || '없음'}`,
                    amount: 1
                });
            });
        });
        document.getElementById('overallValue').innerText = overallValue + '명';
    }
    else if (type === 'courses') {
        const courseSet = new Set();
        activeMembers.forEach(m => {
            const courses = m.course ? m.course.split(',').map(c => c.split('(')[0].trim()).filter(c=>c) : [];
            courses.forEach(c => {
                courseSet.add(c);
                const category = categorizeCourse(c);
                
                if(!parsedData[category]) parsedData[category] = { total: 0, children: {} };
                
                if(!parsedData[category].children[c]) parsedData[category].children[c] = { total: 0, items: [] };
                
                // To avoid double counting total for category, we just use the children's items length later
                parsedData[category].children[c].items.push({
                    name: m.name,
                    subText: m.phone || '',
                    amountText: ''
                });
            });
        });
        
        // Recalculate totals
        Object.keys(parsedData).forEach(cat => {
            parsedData[cat].total = Object.keys(parsedData[cat].children).length; // number of subcourses
            Object.keys(parsedData[cat].children).forEach(c => {
                parsedData[cat].children[c].total = parsedData[cat].children[c].items.length;
            });
        });
        
        document.getElementById('overallValue').innerText = courseSet.size + '개';
    }
    else if (type === 'vehicles') {
        activeMembers.forEach(m => {
            const note = m.notes || m.note || '';
            let vehicleMatch = note.match(/(\d+)호차/);
            
            if (vehicleMatch) {
                overallValue++;
                const category = '통학차량';
                const vehicleName = vehicleMatch[0];
                
                if(!parsedData[category]) parsedData[category] = { total: 0, children: {} };
                parsedData[category].total += 1;
                
                if(!parsedData[category].children[vehicleName]) parsedData[category].children[vehicleName] = { total: 0, items: [] };
                parsedData[category].children[vehicleName].total += 1;
                
                parsedData[category].children[vehicleName].items.push({
                    name: m.name,
                    subText: m.phone || '',
                    amountText: ''
                });
            }
        });
        document.getElementById('overallValue').innerText = overallValue + '명';
        if(overallValue === 0) {
            document.getElementById('tier1List').innerHTML = `<div class="empty-state"><span class="material-icons">info</span><span>차량 이용 수강생이 없습니다.<br><small>(명부의 비고란에 '1호차', '2호차' 등을 적어주세요)</small></span></div>`;
            return;
        }
    }
    else if (type === 'missed_calls') {
        document.getElementById('overallValue').innerText = '준비 중';
        document.getElementById('tier1List').innerHTML = `<div class="empty-state"><span class="material-icons">construction</span><span>부재중 전화 기록 연동 기능 준비 중입니다.</span></div>`;
        return;
    }

    renderTier1();
}

function getAgeGroup(age) {
    if(!age) return '성인';
    const num = parseInt(age);
    if(num >= 20) return '성인';
    if(num >= 14) return '중고등학생';
    return '초등학생/유아';
}

function categorizeCourse(c) {
    if(c.includes('제과') || c.includes('제빵') || c.includes('케이크') || c.includes('베이킹')) return '제과제빵과정';
    if(c.includes('조리') || c.includes('한식') || c.includes('양식') || c.includes('중식') || c.includes('일식')) return '조리과정';
    if(c.includes('바리스타') || c.includes('커피')) return '바리스타과정';
    return '기타과정';
}

function renderTier1() {
    const list = document.getElementById('tier1List');
    list.innerHTML = '';
    
    // Custom sort order for grades, default descending for others
    let keys = Object.keys(parsedData);
    if (new URLSearchParams(window.location.search).get('type') === 'grades') {
        const gradeOrder = ['일반인', '대학생', '고등학생', '중학생', '초등학생'];
        keys.sort((a, b) => {
            const indexA = gradeOrder.indexOf(a);
            const indexB = gradeOrder.indexOf(b);
            if (indexA !== -1 && indexB !== -1) return indexA - indexB;
            if (indexA !== -1) return -1;
            if (indexB !== -1) return 1;
            return b > a ? 1 : -1;
        });
    } else {
        keys.sort((a,b) => (b>a ? 1 : -1));
    }
    
    if(keys.length === 0) {
        list.innerHTML = `<div class="empty-state"><span class="material-icons">inbox</span><span>데이터가 없습니다.</span></div>`;
        return;
    }

    keys.forEach(k => {
        const div = document.createElement('div');
        div.className = 'drill-item';
        div.innerHTML = `<span class="di-label">${k}</span><span class="di-val">${formatVal(parsedData[k].total)}</span>`;
        div.onclick = () => {
            document.querySelectorAll('#tier1List .drill-item').forEach(el => el.classList.remove('active'));
            div.classList.add('active');
            renderTier2(k);
        };
        list.appendChild(div);
    });
}

function renderTier2(key1) {
    const list = document.getElementById('tier2List');
    list.innerHTML = '';
    
    document.getElementById('tier3List').innerHTML = `<div class="empty-state"><span class="material-icons">touch_app</span><span id="tier3EmptyMsg">${curConfig.t3Empty}</span></div>`;
    
    const children = parsedData[key1].children;
    const keys = Object.keys(children).sort((a,b) => (b>a ? 1 : -1));

    keys.forEach(k => {
        const div = document.createElement('div');
        div.className = 'drill-item';
        div.innerHTML = `<span class="di-label">${k}</span><span class="di-val">${formatVal(children[k].total, true)}</span>`;
        div.onclick = () => {
            document.querySelectorAll('#tier2List .drill-item').forEach(el => el.classList.remove('active'));
            div.classList.add('active');
            renderTier3(key1, k);
        };
        list.appendChild(div);
    });
}

function renderTier3(key1, key2) {
    const list = document.getElementById('tier3List');
    list.innerHTML = '';
    
    const node = parsedData[key1].children[key2];
    
    // If it's payment or unpaid, node contains days
    if(type === 'payment' || type === 'unpaid') {
        const days = Object.keys(node.children).sort((a,b) => parseInt(b)-parseInt(a));
        days.forEach(d => {
            const dayNode = node.children[d];
            const group = document.createElement('div');
            group.className = 'day-group';
            
            let itemsHtml = dayNode.items.map(item => `
                <div class="day-item">
                    <div class="day-item-name">${item.name} <span class="sub-badge">${item.subText}</span></div>
                    <div class="day-item-amount">${item.amount.toLocaleString()}원</div>
                </div>
            `).join('');
            
            group.innerHTML = `
                <div class="day-header">
                    <span>${d}일</span>
                    <span class="day-total">${dayNode.total.toLocaleString()}원</span>
                </div>
                ${itemsHtml}
            `;
            list.appendChild(group);
        });
    } else {
        // Direct items array
        const group = document.createElement('div');
        group.className = 'day-group';
        
        let itemsHtml = node.items.map(item => `
            <div class="day-item">
                <div class="day-item-name">${item.name} <span class="sub-badge">${item.subText}</span></div>
                <div class="day-item-amount">${item.amount !== undefined ? (item.amount === '' ? '' : item.amount.toLocaleString() + '명') : item.amountText}</div>
            </div>
        `).join('');
        
        group.innerHTML = `
            <div class="day-header" style="background:#eff6ff;">
                <span>${key2} 전체 목록</span>
                <span class="day-total" style="color:#0f172a;">${formatVal(node.total, true)}</span>
            </div>
            ${itemsHtml}
        `;
        list.appendChild(group);
    }
}

function formatVal(val, isTier2 = false) {
    if(type === 'payment' || type === 'unpaid') return val.toLocaleString() + '원';
    if(type === 'students' || type === 'vehicles') return val + '명';
    if(type === 'courses') return isTier2 ? val + '명' : val + '개';
    return val;
}

// Auto-sync listener (if DB changes from other tabs)
const statSyncChannel = new BroadcastChannel('sejong_sync');
statSyncChannel.onmessage = (event) => {
    if (event.data.action === 'updated') {
        console.log("DB Updated, reloading stat details...");
        location.reload();
    }
};
