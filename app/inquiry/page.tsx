'use client';

import { useState } from 'react';
import InfoSidebar from "@/components/InfoSidebar";
// import Link from 'next/link'; // Unused
import { useRouter } from 'next/navigation';

export default function InquiryPage() {
    // const [activeTab, setActiveTab] = useState('cert'); // Unused
    const [selectedCourses, setSelectedCourses] = useState<string[]>([]);

    // Form state
    const [name, setName] = useState('');
    const [phone1, setPhone1] = useState('010');
    const [phone2, setPhone2] = useState('');
    const [phone3, setPhone3] = useState('');
    const [visitDate, setVisitDate] = useState('');
    const [visitTime, setVisitTime] = useState('');
    const [content, setContent] = useState('');
    const [agreed, setAgreed] = useState(false);
    const [marketingAgreed, setMarketingAgreed] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [modalMessage, setModalMessage] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);
    const router = useRouter(); // Ensure useRouter is imported from 'next/navigation'

    const toggleCourse = (course: string) => {
        setSelectedCourses(prev =>
            prev.includes(course)
                ? prev.filter(c => c !== course)
                : [...prev, course]
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name) { setModalMessage('이름을 입력해 주세요.'); setIsSuccess(false); setShowModal(true); return; }
        if (!phone2 || !phone3) { setModalMessage('전화번호를 입력해 주세요.'); setIsSuccess(false); setShowModal(true); return; }
        if (!agreed) { setModalMessage('개인정보 수집 및 이용에 동의해야 합니다.'); setIsSuccess(false); setShowModal(true); return; }
        if (!marketingAgreed) { setModalMessage('마케팅 활용 동의 및 광고 수신 동의에 체크해주세요.'); setIsSuccess(false); setShowModal(true); return; }
        if (selectedCourses.length === 0) { setModalMessage('관심 과정을 1개 이상 선택해 주세요.'); setIsSuccess(false); setShowModal(true); return; }

        // Submit to Server API
        try {
            // 1. Get current data
            const getUrl = process.env.NODE_ENV === 'production' ? '/api.php?board=inquiry' : '/api/admin/data/inquiries';
            const res = await fetch(getUrl);
            const currentData = await res.json();

            // 2. Add new item
            const newItem = {
                id: Date.now().toString(),
                name,
                phone: `${phone1}-${phone2}-${phone3}`,
                courses: selectedCourses,
                visitDate,
                visitTime,
                content,
                date: new Date().toISOString(),
                marketingAgree: marketingAgreed,
                isRead: false
            };

            const newData = [newItem, ...(Array.isArray(currentData) ? currentData : [])];

            // 3. Save updated data
            const url = process.env.NODE_ENV === 'production' ? '/api.php?board=inquiry' : '/api/admin/data/inquiries';
            const saveRes = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newData),
            });

            if (!saveRes.ok) throw new Error('저장 실패');

        } catch (error) {
            console.error('Failed to submit inquiry', error);
            setModalMessage('상담 신청 처리 중 오류가 발생했습니다.');
            setIsSuccess(false);
            setShowModal(true);
            return;
        }

        const message = `
        ✅ 상담 신청이 완료되었습니다!
        
        [신청자] ${name}
        [연락처] ${phone1}-${phone2}-${phone3}
        [방문예약] ${visitDate ? `${visitDate} ${visitTime}` : '미지정'}
        [관심과정] ${selectedCourses.join(', ')}
        
        관리자 페이지에서 확인할 수 있습니다.
        (담당자가 확인 후 연락드립니다)
        `;

        setModalMessage(message);
        setIsSuccess(true);
        setShowModal(true);

        // Reset form
        setName('');
        setPhone2('');
        setPhone3('');
        setVisitDate('');
        setVisitTime('');
        setContent('');
        setSelectedCourses([]);
        setAgreed(false);
        setMarketingAgreed(false);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        if (isSuccess) {
            router.push('/');
        }
    };

    return (
        <div className="modern-container py-10">
            <div className="flex flex-col xl:flex-row gap-10">
                <div className="w-full xl:w-[250px] flex-shrink-0">
                    <InfoSidebar />
                </div>

                <div className="flex-grow">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 min-h-[600px]">
                        <div className="mb-6">
                            <h1 className="text-3xl font-bold mb-4 text-black">상담/수강신청</h1>
                        </div>
                        <div className="border-b-2 border-black mb-8 pb-2"></div>

                        <div className="inquiry-form-container max-w-3xl">

                            {/* Step 1 & 2 Combined Course Selection */}
                            <div className="mb-8">
                                <h3 className="text-xl font-bold border-l-4 border-orange-500 pl-3 mb-4">희망 과정 선택</h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Baking */}
                                    <div className="bg-white border rounded-lg p-4 shadow-sm">
                                        <h4 className="font-bold text-lg mb-3 text-orange-600 bg-orange-50 p-2 rounded">🥐 제과제빵 과정</h4>
                                        <ul className="space-y-2">
                                            {['제과제빵기능사', '제과기능사', '제빵기능사', '떡기능사', '케이크디자인', '디저트'].map(course => (
                                                <li key={course}
                                                    onClick={() => toggleCourse(course)}
                                                    className={`cursor-pointer p-3 rounded-lg border-2 transition-all flex items-center gap-3 ${selectedCourses.includes(course)
                                                        ? 'bg-orange-50 border-orange-500 text-orange-900 shadow-sm'
                                                        : 'bg-white border-gray-200 hover:border-orange-300 hover:shadow-sm'
                                                        }`}
                                                >
                                                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${selectedCourses.includes(course)
                                                        ? 'bg-orange-500 border-orange-500'
                                                        : 'bg-white border-gray-300'
                                                        }`}>
                                                        {selectedCourses.includes(course) && (
                                                            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                            </svg>
                                                        )}
                                                    </div>
                                                    <span className={`font-medium ${selectedCourses.includes(course) ? 'font-bold' : ''}`}>
                                                        {course}
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    {/* Cooking */}
                                    <div className="bg-white border rounded-lg p-4 shadow-sm">
                                        <h4 className="font-bold text-lg mb-3 text-orange-600 bg-orange-50 p-2 rounded">🍳 조리 과정</h4>
                                        <ul className="space-y-2">
                                            {['한식조리', '양식조리', '중식조리', '일식조리', '복어조리', '가정요리', '브런치'].map(course => (
                                                <li key={course}
                                                    onClick={() => toggleCourse(course)}
                                                    className={`cursor-pointer p-3 rounded-lg border-2 transition-all flex items-center gap-3 ${selectedCourses.includes(course)
                                                        ? 'bg-orange-50 border-orange-500 text-orange-900 shadow-sm'
                                                        : 'bg-white border-gray-200 hover:border-orange-300 hover:shadow-sm'
                                                        }`}
                                                >
                                                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${selectedCourses.includes(course)
                                                        ? 'bg-orange-500 border-orange-500'
                                                        : 'bg-white border-gray-300'
                                                        }`}>
                                                        {selectedCourses.includes(course) && (
                                                            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                            </svg>
                                                        )}
                                                    </div>
                                                    <span className={`font-medium ${selectedCourses.includes(course) ? 'font-bold' : ''}`}>
                                                        {course}
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            {/* Step 3: User Info */}
                            <div className="mb-8 p-6 bg-gray-50 rounded-lg border border-gray-200">
                                <h3 className="text-xl font-bold border-l-4 border-orange-500 pl-3 mb-4">신청자 정보 입력</h3>

                                <div className="mb-6 space-y-2 text-sm text-gray-600">
                                    <p>입력하신 정보와 사실이 다를시에는 상담문의가 제한될 수 있습니다.</p>
                                    <p className="text-orange-600">* 입력하신 정보는 문의 목적 외에 다른 용도로 사용되지 않습니다.</p>
                                </div>

                                {/* Privacy Policy Scroll Box */}
                                <div className="mb-6 bg-white border border-gray-300 rounded-lg p-4 h-48 overflow-y-auto text-xs text-gray-600 leading-relaxed shadow-inner">
                                    <p className="font-bold mb-2">[1. 개인정보의 수집 목적]</p>
                                    <ul className="list-disc pl-4 mb-4 space-y-1">
                                        <li>퍼스트요리아카데미학원 사이트 내 서비스 제공 계약의 성립 및 유지 종료를 위한 본인 식별 및 실명확인, 가입의사 확인, 회원에 대한 고지 사항 전달 등</li>
                                        <li>퍼스트요리아카데미학원 사이트 내 서비스 제공을 위한 통합ID 제공, 카드발급, 포인트 적립 및 사용,포인트 정산, 고객센터 운영, 불량회원 부정이용 방지 및 비인가 사용방지, 이벤트 및 마케팅 기획관리, 서비스 개발을 위한 연구조사, 물품 등의 배송 등</li>
                                        <li>퍼스트요리아카데미학원 사이트 내 서비스 관련 각종 이벤트 및 행사 관련 정보안내를 위한 전화, SMS, 이메일, DM 발송 등의 마케팅 활동 등</li>
                                        <li>당사 및 제휴사 상품서비스에 대한 제반 마케팅(대행포함) 활동 관련 전화, SMS, 이메일, DM 발송을 통한 마케팅, 판촉행사 및 이벤트, 사은행사 안내 등</li>
                                    </ul>

                                    <p className="font-bold mb-2">[2. 수집하는 개인정보 항목]</p>
                                    <div className="mb-4">
                                        <p className="font-bold">[필수입력사항]</p>
                                        <p className="mb-1">- 성명, 아이디, 비밀번호, 이메일주소, 주소, 우편물수령지, 전화번호(휴대폰번호 포함),이메일주소, 생일 등</p>
                                        <p className="text-gray-400 mb-2">(i-PIN을 통한 신규가입의 경우 주민등록번호가 아닌 본인 확인 기관이 제공한 정보를 수집합니다.)</p>

                                        <p className="font-bold">[선택입력항목]</p>
                                        <p className="mb-1">- 이메일/SMS/전화/DM 수신동의 ,결혼 여부, 결혼기념일, 기타 기념일, 선호 브랜드 등 개인별 서비스 제공을 위해 필요한 항목 및 추가 입력 사항</p>

                                        <p className="font-bold mt-2">[서비스 이용 또는 사업처리 과정에서 생성 수집되는 각종 거래 및 개인 성향 정보]</p>
                                        <p>- 서비스이용기록, 접속로그, 쿠키, 접속IP정보, 결제기록, 이용정지기록 등 단, 이용자의 기본적 인권 침해의 우려가 있는 민감한 개인정보(인종 및 민족, 사상 및 신조, 출신지 및 본적지, 정치적 성향 및 범죄기록, 건강상태 및 성생활 등)는 수집하지 않습니다.</p>
                                    </div>

                                    <p className="font-bold mb-2">[3. 개인정보의 보유/이용기간 및 폐기]</p>
                                    <p className="mb-2">
                                        당사(패밀리 사이트 내)는 수집된 회원의 개인정보는 수집 목적 또는 제공 받은 목적이 달성되면 지체없이 파기함을 원칙으로 합니다. 다만, 다음 각 호의 경우 일정기간 동안 예외적으로 수집한 회원정보의 전부 또는 일부를 보관할 수 있습니다.
                                    </p>
                                    <ul className="list-disc pl-4 mb-4 space-y-1">
                                        <li>고객요구사항 처리 및 A/S의 목적 : 수집한 회원정보를 회원탈퇴 후 30일간 보유</li>
                                        <li>당사가 지정한 쿠폰 서비스의 임의적인 악용을 방지 하기 위한 목적 : 수집한 회원정보 중 회원의 기념일 쿠폰 사용여부에 관한 정보를 회원 탈퇴 후 1년 간 보유</li>
                                        <li>회원 자격 상실의 경우 : 퍼스트요리아카데미학원 사이트 내 부정 이용 및 타 회원의 추가적인 피해 방지를 위해 수집한 회원정보를 회원 자격 상실일로부터 2년간 보유</li>
                                        <li>기타 당사 및 제휴사가 필요에 의해 별도로 동의를 득한 경우 : 별도 동의를 받은 범위 (회원정보 및 보유 기간) 내에서 보유</li>
                                    </ul>
                                    <p className="mb-2">
                                        상기 조항에도 불구하고 상법 및 &apos;전자상거래 등에서 소비자보호에 관한 법률&apos;등 관련 법령의 규정에 의하여 다음과 같이 일정기간 보유해야 할 필요가 있을 경우에는 관련 법령이 정한 기간 또는 다음 각 호의 기간 동안 회원정보를 보유할 수 있습니다.
                                    </p>
                                    <ul className="list-disc pl-4 mb-4 space-y-1">
                                        <li>계약 또는 청약철회 등에 관한 기록 : 5년</li>
                                        <li>대금결제 및 재화등의 공급에 관한 기록 : 5년</li>
                                        <li>소비자의 불만 또는 분쟁처리에 관한 기록 : 3년</li>
                                    </ul>

                                    <p className="mb-2">개인정보를 파기할 때에는 아래와 같이 재생할 수 없는 방법을 사용하여 이를 삭제합니다.</p>
                                    <ul className="list-disc pl-4 space-y-1">
                                        <li>종이에 출력된 개인정보 : 분쇄기로 분쇄하거나 소각</li>
                                        <li>전자적 파일 형태로 저장된 개인정보 : 기록을 재생할 수 없는 기술적 방법을 사용하여 삭제</li>
                                    </ul>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label className="block font-bold mb-1">이름</label>
                                        <input
                                            type="text"
                                            placeholder="이름 (한글/영문)"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="w-full p-2 border rounded focus:ring-2 focus:ring-orange-200 focus:border-orange-500 outline-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="block font-bold mb-1">연락처</label>
                                        <div className="flex gap-2">
                                            <select
                                                value={phone1}
                                                onChange={(e) => setPhone1(e.target.value)}
                                                className="p-2 border rounded w-24"
                                            >
                                                <option>010</option>
                                                <option>011</option>
                                                <option>016</option>
                                                <option>017</option>
                                                <option>018</option>
                                                <option>019</option>
                                            </select>
                                            <span className="self-center">-</span>
                                            <input
                                                type="text"
                                                maxLength={4}
                                                value={phone2}
                                                onChange={(e) => setPhone2(e.target.value.replace(/[^0-9]/g, ''))}
                                                className="w-full p-2 border rounded text-center focus:ring-2 focus:ring-orange-200 focus:border-orange-500 outline-none"
                                            />
                                            <span className="self-center">-</span>
                                            <input
                                                type="text"
                                                maxLength={4}
                                                value={phone3}
                                                onChange={(e) => setPhone3(e.target.value.replace(/[^0-9]/g, ''))}
                                                className="w-full p-2 border rounded text-center focus:ring-2 focus:ring-orange-200 focus:border-orange-500 outline-none"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block font-bold mb-1">방문일</label>
                                        <div className="flex gap-2">
                                            <div className="relative flex-1">
                                                <input
                                                    type="date"
                                                    value={visitDate}
                                                    onChange={(e) => setVisitDate(e.target.value)}
                                                    className="w-full p-2 border rounded focus:ring-2 focus:ring-orange-200 focus:border-orange-500 outline-none text-gray-600"
                                                />
                                            </div>
                                            <select
                                                value={visitTime}
                                                onChange={(e) => setVisitTime(e.target.value)}
                                                className="flex-1 p-2 border rounded focus:ring-2 focus:ring-orange-200 focus:border-orange-500 outline-none text-gray-600"
                                            >
                                                <option value="">예약시간을 선택해주세요.</option>
                                                {Array.from({ length: 11 }, (_, i) => i + 9).map(hour => (
                                                    <option key={hour} value={`${hour}:00`}>{`${hour}:00`}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block font-bold mb-1">상담내용</label>
                                        <textarea
                                            placeholder="상담 내용을 입력해주세요."
                                            value={content}
                                            onChange={(e) => setContent(e.target.value)}
                                            className="w-full p-3 border rounded-lg h-32 resize-none focus:ring-2 focus:ring-orange-200 focus:border-orange-500 outline-none"
                                        />
                                    </div>

                                    <div className="pt-4 space-y-3">
                                        {/* Marketing Consent */}
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                id="marketingAgree"
                                                checked={marketingAgreed}
                                                onChange={(e) => setMarketingAgreed(e.target.checked)}
                                                className="w-5 h-5 accent-orange-500 cursor-pointer"
                                            />
                                            <label htmlFor="marketingAgree" className="cursor-pointer text-sm font-medium text-gray-700">
                                                마케팅 활용 동의 및 광고 수신 동의합니다. (필수)
                                            </label>
                                        </div>

                                        {/* Privacy Consent (Required) */}
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                id="privacyAgree"
                                                checked={agreed}
                                                onChange={(e) => setAgreed(e.target.checked)}
                                                className="w-5 h-5 accent-orange-500 cursor-pointer"
                                            />
                                            <label htmlFor="privacyAgree" className="cursor-pointer text-sm font-bold text-gray-800">
                                                위의 ‘개인정보 수집 및 이용안내’에 동의합니다.
                                            </label>
                                        </div>

                                        <button
                                            type="submit"
                                            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 rounded-lg text-lg transition-colors shadow-md mt-4"
                                        >
                                            상담 신청 및 수강 등록하기
                                        </button>
                                    </div>
                                </form>
                            </div>

                        </div>
                    </div>
                </div>
            </div>

            {/* Generic Modal (Success or Error) */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-transparent">
                    <div className="bg-white rounded-lg p-5 max-w-xs w-full shadow-2xl transform transition-all scale-100 border border-gray-200">
                        <div className="text-center">
                            <div className={`mx-auto flex items-center justify-center h-10 w-10 rounded-full mb-3 ${isSuccess ? 'bg-green-100' : 'bg-red-100'}`}>
                                {isSuccess ? (
                                    <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                    </svg>
                                ) : (
                                    <svg className="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                )}
                            </div>
                            <h3 className="text-base leading-6 font-medium text-gray-900 mb-2">
                                {isSuccess ? '상담 신청 완료' : '입력 확인'}
                            </h3>
                            <div className="mt-2 text-left">
                                <p className="text-sm text-gray-500 whitespace-pre-line bg-gray-50 p-3 rounded bg-opacity-50 border border-gray-100">
                                    {modalMessage}
                                </p>
                            </div>
                            <div className="mt-4">
                                <button
                                    onClick={handleCloseModal}
                                    className={`w-full text-white text-sm font-bold py-2.5 px-4 rounded focus:outline-none focus:shadow-outline transition-colors ${isSuccess ? 'bg-orange-500 hover:bg-orange-600' : 'bg-gray-600 hover:bg-gray-700'
                                        }`}
                                >
                                    {isSuccess ? '확인 (홈으로 이동)' : '확인'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
