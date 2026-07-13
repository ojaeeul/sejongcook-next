export interface TimeTableData {
    cooking: {
        intro: string; // "1. 조리기능사반..."
        notes: string[]; // ["한식 · 양식 기능사반 : ...", ...]
        tableRows: {
            no: number;
            course: string;
            frequency: string;
            days: string;
            morning: string;
            afternoon1: string;
            afternoon2: string;
        }[];
        bottomNotes: {
            title: string;
            content: string;
        }[];
    };
    lifeCooking: {
        intro: string; // "2. 생활요리반"
        tableRows: {
            no: number;
            course: string;
            frequency: string;
            days: string;
            morning: string;
            afternoon: string;
        }[];
        bottomNotes: string[];
    };
    baking: {
        intro: string; // "II 제과 · 제빵과정"
        notes: string[]; // ["1. 제과기능사반...", ...]
        tableRows: {
            no: number;
            course: string;
            frequency: string;
            days: string;
            morning: string;
            afternoon1: string;
            afternoon2: string;
        }[];
    };
    cake: {
        intro: string; // "3. 케익디자인 / 디저트"
        targetAndSchedule: string[]; // List items for "교육 대상 및 일정"
        curriculum: string[]; // List items for "교육 내용"
    };
}

export const initialTimeTableData: TimeTableData = {
    cooking: {
        intro: "1. 조리기능사반 (한식, 양식, 일식, 중식, 복어)",
        notes: [
            "<span class=\"font-semibold\">한식 · 양식 기능사반 :</span> 교육비 월 27만원 (8회) / 성인 : (17회)",
            "<span class=\"font-semibold\">일식 · 중식 기능사반 :</span> 교육비 월 30만원 (8회) / 성인 : (6주과정)"
        ],
        tableRows: [
            { no: 1, course: "한식 기능사", frequency: "주 2회", days: "월, 수", morning: "10시", afternoon1: "5시", afternoon2: "7시 15분" },
            { no: 2, course: "양식 기능사", frequency: "주 2회", days: "화, 목", morning: "", afternoon1: "5시", afternoon2: "7시 15분" },
            { no: 3, course: "중식 기능사", frequency: "주 2회", days: "화, 목", morning: "", afternoon1: "5시", afternoon2: "" },
            { no: 4, course: "일식 기능사", frequency: "주 2회", days: "화, 목", morning: "", afternoon1: "", afternoon2: "7시 15분" },
            { no: 5, course: "복어 기능사", frequency: "주 1회", days: "조정", morning: "", afternoon1: "", afternoon2: "" },
        ],
        bottomNotes: [
            { title: "3) 복어 주 2회", content: "(상시시험 대비해서 3명이상 인원 충원 시 수업 실시함)" },
            { title: "▶", content: "<span class=\"font-semibold\">필기:</span> 식품위생학, 조리이론, 식품위생법, 원가계산, 공중보건, 식품학" },
            { title: "▶", content: "<span class=\"font-semibold\">실기:</span> 한식33가지, 양식30가지, 일식19가지, 중식20가지, 복어3가지" }
        ]
    },
    lifeCooking: {
        intro: "2. 생활요리반",
        tableRows: [
            { no: 1, course: "가정요리", frequency: "주 2회", days: "화, 목", morning: "10시", afternoon: "" },
            { no: 2, course: "브런치", frequency: "주 1회", days: "금", morning: "시간조절가능", afternoon: "" }
        ],
        bottomNotes: [
            "1) <span class=\"font-bold text-green-800\">가정요리반</span> (주 2회 / 화,목 / 오전10시 2개품목 진행) 2개월 과정 (한달 8회 )",
            "2) <span class=\"font-bold text-green-800\">브런치반</span> (주 1회 / 금요일 / 2가지품목 진행) 2개월 과정&nbsp;",
            "※ 수업시간 및 일정은 3명이상 충원시 수업실시함",
            "※ 수업시간 및 일정은 사정에 의해 변경 될 수 있음."
        ]
    },
    baking: {
        intro: "II 제과 · 제빵과정",
        notes: [
            "<span class=\"font-bold text-yellow-900\">1. 제과기능사반 :</span> 교육비 월 &nbsp;(8회) / <span class=\"font-bold text-yellow-900\">제빵기능사반 :</span> 교육비 월 (8회)",
            "<span class=\"font-bold text-yellow-900\">2. 제과 · 제빵기능사반 :</span> 교육비 월 &nbsp;(8회)"
        ],
        tableRows: [
            { no: 1, course: "제과 기능사", frequency: "주 2회", days: "월, 수", morning: "월,수 (10시)", afternoon1: "5시", afternoon2: "7시" },
            { no: 2, course: "제빵 기능사", frequency: "주 2회", days: "화, 목", morning: "화,목 (10시)", afternoon1: "5시", afternoon2: "7시" },
            { no: 3, course: "제과제빵 기능사", frequency: "주 2회", days: "월, 화, 수, 목", morning: "월~목 (10시)", afternoon1: "5시", afternoon2: "7시" },
        ]
    },
    cake: {
        intro: "3. 케익디자인 / 디저트",
        targetAndSchedule: [
            "<span class=\"font-semibold\">기간:</span> 1개월 과정",
            "<span class=\"font-semibold\">일정:</span> 주 1~2회 (상담 후 조정)",
            "<span class=\"font-semibold\">수강료:</span> 별도 문의"
        ],
        curriculum: [
            "· 케이크 데코레이션 (아이싱, 레터링 등)",
            "· 다양한 깍지 짜기 기법",
            "· 마카롱, 타르트, 구움과자 등 디저트 기초",
            "· 시즌별 카페 디저트 메뉴 실습"
        ]
    }
};

export function generateTimeTableHtml(data: TimeTableData): string {
    return `<div class="space-y-12 font-sans text-gray-700">

    <!-- Section I: Cooking -->
    <section class="bg-white rounded-2xl shadow-lg border border-orange-100 overflow-hidden">
        <!-- Header -->
        <div class="bg-gradient-to-r from-orange-50 to-white px-6 py-6 border-b border-orange-100">
            <h2 class="text-2xl md:text-3xl font-extrabold text-orange-900 mb-4 flex items-center gap-3">
                <span class="flex items-center justify-center w-10 h-10 rounded-full bg-orange-200 text-orange-800 text-lg shadow-sm">I</span>
                요리 · 조리과정
            </h2>
            
            <div class="space-y-2 text-sm md:text-base bg-white/60 p-4 rounded-xl border border-orange-50">
                <p class="font-bold text-orange-800 text-lg mb-2">${data.cooking.intro}</p>
                <ul class="list-disc list-inside space-y-1 text-gray-700 ml-1">
                    ${data.cooking.notes.map(note => `<li>${note}</li>`).join('')}
                </ul>
            </div>
        </div>

        <!-- Table 1: Cooking Craftsman (Orange) -->
        <div class="p-6 overflow-x-auto">
            <table class="w-full min-w-[600px] border-collapse text-center text-sm">
                <thead>
                    <tr class="bg-gray-50 text-gray-800 border-t-2 border-orange-500">
                        <th class="py-3 px-2">No</th>
                        <th class="py-3 px-2">종목</th>
                        <th class="py-3 px-2">주 / 일수</th>
                        <th class="py-3 px-2">수업 요일</th>
                        <th class="py-3 px-2">오전</th>
                        <th class="py-3 px-2" colspan="2">오후</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-200">
                    ${data.cooking.tableRows.map((row) => `
                        <tr class="hover:bg-orange-50 transition-colors ${row.no === 5 ? 'border-b-2 border-orange-100' : ''}">
                            <td class="py-3">${row.no}</td>
                            <td class="font-bold text-gray-900">${row.course}</td>
                            <td>${row.frequency}</td>
                            <td>${row.days}</td>
                            <td${!row.morning ? ' class="bg-gray-50/50"' : ''}>${row.morning || ''}</td>
                            <td${!row.afternoon1 ? ' class="bg-gray-50/50"' : ''}>${row.afternoon1 || ''}</td>
                            <td${!row.afternoon2 ? ' class="bg-gray-50/50"' : ''}>${row.afternoon2 || ''}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>

        <!-- Additional Info 1 -->
        <div class="px-6 pb-8 space-y-4">
            <div class="bg-gray-50 p-4 rounded-lg border border-gray-100 text-sm">
                 <p class="mb-2"><span class="font-bold text-orange-700">${data.cooking.bottomNotes[0].title}</span> ${data.cooking.bottomNotes[0].content}</p>
                <div class="grid md:grid-cols-2 gap-4">
                    <div class="flex gap-2">
                        <span class="text-orange-500 font-bold">${data.cooking.bottomNotes[1].title}</span>
                        <p>${data.cooking.bottomNotes[1].content}</p>
                    </div>
                    <div class="flex gap-2">
                        <span class="text-orange-500 font-bold">${data.cooking.bottomNotes[2].title}</span>
                         <p>${data.cooking.bottomNotes[2].content}</p>
                    </div>
                </div>
            </div>

            <!-- Life Cooking (Green Theme) -->
            <div class="mt-8 px-6">
                <h3 class="text-xl font-bold text-gray-800 mb-4 border-l-4 border-green-500 pl-3 flex items-center">
                    ${data.lifeCooking.intro}
                </h3>
                <div class="overflow-x-auto">
                    <table class="w-full min-w-[600px] border-collapse text-center text-sm mb-4">
                        <thead>
                            <tr class="bg-gray-50 text-gray-800 border-t-2 border-green-500">
                                <th class="py-3 px-2">No</th>
                                <th class="py-3 px-2">종목</th>
                                <th class="py-3 px-2">주 / 일수</th>
                                <th class="py-3 px-2">수업 요일</th>
                                <th class="py-3 px-2">오전</th>
                                <th class="py-3 px-2">오후</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-200">
                             ${data.lifeCooking.tableRows.map((row) => `
                                <tr class="hover:bg-green-50 transition-colors ${row.no === 2 ? 'border-b' : ''}">
                                    <td class="py-3">${row.no}</td>
                                    <td class="font-bold text-gray-900">${row.course}</td>
                                    <td>${row.frequency}</td>
                                    <td>${row.days}</td>
                                    <td ${row.no === 2 ? 'colspan="2" class="font-medium text-green-600"' : ''}>${row.morning}</td>
                                    ${row.no !== 2 ? `<td${!row.afternoon ? ' class="bg-gray-50/50"' : ''}>${row.afternoon || ''}</td>` : ''}
                                </tr>
                             `).join('')}
                        </tbody>
                    </table>
                </div>
                <ul class="text-sm text-gray-600 space-y-1 ml-2 bg-green-50/50 p-4 rounded-lg border border-green-100">
                    ${data.lifeCooking.bottomNotes.map((note, idx) => `
                        <li${idx >= 2 ? ' class="text-xs text-gray-500 ' + (idx === 2 ? 'mt-2 ' : '') + 'pl-2 border-l-2 border-green-300"' : ''}>${note}</li>
                    `).join('')}
                </ul>
            </div>
        </div>
    </section>

    <!-- Section II: Baking (Yellow) -->
    <section class="bg-white rounded-2xl shadow-lg border border-yellow-100 overflow-hidden">
        <!-- Header -->
        <div class="bg-gradient-to-r from-yellow-50 to-white px-6 py-6 border-b border-yellow-100">
            <h2 class="text-2xl md:text-3xl font-extrabold text-yellow-900 mb-4 flex items-center gap-3">
                <span class="flex items-center justify-center w-10 h-10 rounded-full bg-yellow-200 text-yellow-800 text-lg shadow-sm">II</span>
                ${data.baking.intro}
            </h2>
            
            <div class="space-y-1 text-sm md:text-base bg-white/60 p-4 rounded-xl border border-yellow-50">
                 ${data.baking.notes.map(note => `<p>${note}</p>`).join('')}
            </div>
        </div>

        <!-- Table 3: Baking -->
        <div class="p-6 overflow-x-auto">
            <table class="w-full min-w-[600px] border-collapse text-center text-sm">
                <thead>
                    <tr class="bg-gray-50 text-gray-800 border-t-2 border-yellow-500">
                        <th class="py-3 px-2">No</th>
                        <th class="py-3 px-2">종목</th>
                        <th class="py-3 px-2">주 / 일수</th>
                        <th class="py-3 px-2">수업 요일</th>
                        <th class="py-3 px-2">오전</th>
                        <th class="py-3 px-2" colspan="2">오후</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-200">
                    ${data.baking.tableRows.map((row) => `
                         <tr class="hover:bg-yellow-50 transition-colors ${row.no === 3 ? 'border-b-2 border-yellow-100' : ''}">
                            <td class="py-3">${row.no}</td>
                            <td class="font-bold text-gray-900">${row.course}</td>
                            <td>${row.frequency}</td>
                            <td>${row.days}</td>
                            <td>${row.morning}</td>
                            <td>${row.afternoon1}</td>
                            <td>${row.afternoon2}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
        
        <div class="px-6 pb-8 space-y-4">
            <div class="bg-yellow-50/50 p-6 rounded-lg border border-yellow-100 text-sm">
                <h3 class="font-bold text-xl text-gray-800 mb-4 border-l-4 border-yellow-500 pl-3 flex items-center">
                    ${data.cake.intro}
                </h3>
                
                <div class="grid md:grid-cols-2 gap-6">
                    <div class="space-y-3">
                        <h4 class="font-bold text-yellow-800 flex items-center gap-2">
                            <span class="block w-1.5 h-1.5 rounded-full bg-yellow-500"></span>
                            교육 대상 및 일정
                        </h4>
                        <ul class="text-gray-700 space-y-2 pl-2 border-l-2 border-yellow-200">
                            ${data.cake.targetAndSchedule.map(item => `<li>${item}</li>`).join('')}
                        </ul>
                    </div>
                    
                    <div class="space-y-3">
                        <h4 class="font-bold text-yellow-800 flex items-center gap-2">
                            <span class="block w-1.5 h-1.5 rounded-full bg-yellow-500"></span>
                             교육 내용
                        </h4>
                        <ul class="text-gray-700 space-y-1 pl-2 border-l-2 border-yellow-200">
                            ${data.cake.curriculum.map(item => `<li>${item}</li>`).join('')}
                        </ul>
                    </div>
                </div>

                <p class="text-xs text-gray-500 mt-6 pt-4 border-t border-yellow-100">
                    ※ 수강 인원 및 학원 사정에 따라 수업 시간과 일정은 변경될 수 있습니다.
                </p>
            </div>
        </div>
    </section>

</div>`;
}
