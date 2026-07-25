'use client';

import { useState, useEffect } from 'react';
import InfoSidebar from "@/components/InfoSidebar";
import { useRouter } from 'next/navigation';

interface Category {
  category: string;
  icon: string;
  courses: string[];
}

export default function InquiryPage() {
    const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoadingCourses, setIsLoadingCourses] = useState(true);

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
    const router = useRouter();

    useEffect(() => {
        // Fetch courses dynamically
        const fetchCourses = async () => {
            try {
                const res = await fetch('/api/admin/data/inquiry-courses?_t=' + Date.now());
                if (res.ok) {
                    const data = await res.json();
                    setCategories(data);
                }
            } catch (error) {
                console.error('Failed to fetch courses', error);
            } finally {
                setIsLoadingCourses(false);
            }
        };
        fetchCourses();
    }, []);

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
            // 1. Create new item
            const newItem = {
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

            // 2. Save new item
            const url = '/api/admin/data/inquiries';
            const saveRes = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newItem),
            });

            if (!saveRes.ok) {
                const errorText = await saveRes.text();
                throw new Error('저장 실패: ' + errorText);
            }

            // 3. Send email via FormSubmit directly from the client side
            const emailData = {
                name: newItem.name || '미입력',
                phone: newItem.phone || '미입력',
                courses: newItem.courses.join(', ') || '미입력',
                visitDate: newItem.visitDate ? `${newItem.visitDate} ${newItem.visitTime || ''}` : '미지정',
                content: newItem.content || '없음',
                _subject: `[세종요리제과기술학원] 새로운 수강/상담 신청 - ${newItem.name}님`
            };

            // Send to ojaeeul@naver.com
            fetch('https://formsubmit.co/ajax/ojaeeul@naver.com', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(emailData)
            }).catch(e => console.error('FormSubmit 1 Error:', e));

            // Send to snoopy949@naver.com
            fetch('https://formsubmit.co/ajax/snoopy949@naver.com', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(emailData)
            }).catch(e => console.error('FormSubmit 2 Error:', e));

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
        
        아래 [카카오톡 상담하기]를 누르시거나,
        학원(031-986-1933)으로 연락주시면
        빠른 상담이 가능합니다.
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

                                {isLoadingCourses ? (
                                    <div className="py-8 text-center text-gray-500">과정 목록을 불러오는 중입니다...</div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {categories.map((cat, index) => (
                                            <div key={index} className="bg-white border rounded-lg p-4 shadow-sm">
                                                <h4 className="font-bold text-lg mb-3 text-orange-600 bg-orange-50 p-2 rounded">
                                                    {cat.icon} {cat.category}
                                                </h4>
                                                <ul className="space-y-2">
                                                    {cat.courses.map(course => (
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
                                                    {cat.courses.length === 0 && (
                                                        <li className="text-sm text-gray-400 p-2 text-center">등록된 과정이 없습니다.</li>
                                                    )}
                                                </ul>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Step 3: User Info */}
                            <div className="mb-8 p-6 bg-gray-50 rounded-lg border border-gray-200">
                                <h3 className="text-xl font-bold border-l-4 border-orange-500 pl-3 mb-4">신청자 정보 입력</h3>

                                <div className="mb-6 space-y-2 text-sm text-gray-600">
                                    <p>입력하신 정보와 사실이 다를시에는 상담문의가 제한될 수 있습니다.</p>
                                    <p className="text-orange-600">* 입력하신 정보는 문의 목적 외에 다른 용도로 사용되지 않습니다.</p>
                                </div>

                                <div className="mb-6 bg-white border border-gray-300 rounded-lg p-4 h-48 overflow-y-auto text-xs text-gray-600 leading-relaxed shadow-inner">
                                    <p className="font-bold mb-2">[1. 개인정보의 수집 목적]</p>
                                    <ul className="list-disc pl-4 mb-4 space-y-1">
                                        <li>수강 상담 및 문의 내용 확인, 수강 과정 안내 및 등록 처리</li>
                                        <li>학원 내 새로운 수강 과정 안내, 원데이 클래스, 각종 이벤트 및 행사 관련 정보 안내(전화, SMS, 카카오톡 등)</li>
                                        <li>고객 불만 처리 및 기타 고객 서비스 제공</li>
                                    </ul>

                                    <p className="font-bold mb-2">[2. 수집하는 개인정보 항목]</p>
                                    <div className="mb-4">
                                        <p className="font-bold">[필수항목]</p>
                                        <p className="mb-1">- 성명, 전화번호(휴대폰 번호), 관심 과정</p>

                                        <p className="font-bold mt-2">[선택항목]</p>
                                        <p className="mb-1">- 방문예약 일시, 기타 상담 문의 내용</p>
                                    </div>

                                    <p className="font-bold mb-2">[3. 개인정보의 보유 및 이용기간]</p>
                                    <p className="mb-2">
                                        원칙적으로 개인정보 수집 및 이용 목적이 달성된 후에는 지체 없이 파기합니다. 단, 학원 내부 방침 또는 관계 법령의 규정에 의하여 보존할 필요가 있는 경우 아래와 같이 일정 기간 보관할 수 있습니다.
                                    </p>
                                    <ul className="list-disc pl-4 mb-4 space-y-1">
                                        <li>소비자의 불만 또는 분쟁 처리에 관한 기록: 3년 (전자상거래 등에서의 소비자보호에 관한 법률)</li>
                                        <li>학원 안내 및 마케팅 목적: 수집일로부터 2년 (이후 즉시 파기 또는 재동의 요청)</li>
                                    </ul>

                                    <p className="font-bold mb-2">[4. 개인정보의 파기 절차 및 방법]</p>
                                    <ul className="list-disc pl-4 mb-4 space-y-1">
                                        <li>전자적 파일 형태로 저장된 개인정보는 기록을 재생할 수 없는 기술적 방법을 사용하여 영구 삭제하며, 종이 문서인 경우 분쇄기로 분쇄하여 파기합니다.</li>
                                    </ul>

                                    <p className="font-bold mb-2">[5. 동의 거부권 안내]</p>
                                    <ul className="list-disc pl-4 space-y-1">
                                        <li>귀하는 개인정보 수집 및 이용에 대한 동의를 거부할 권리가 있으나, 필수 동의 거부 시 원활한 온라인 상담 및 수강 신청 서비스 이용이 제한됩니다.</li>
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
                                                required
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
                                                required
                                            />
                                            <label htmlFor="privacyAgree" className="cursor-pointer text-sm font-bold text-gray-800">
                                                위의 ‘개인정보 수집 및 이용안내’에 동의합니다. (필수)
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
                            <div className="mt-4 space-y-2">
                                {isSuccess && (
                                    <a
                                        href="https://open.kakao.com/o/gw4q3s9h"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={handleCloseModal}
                                        className="w-full flex items-center justify-center gap-2 bg-[#FEE500] hover:bg-[#F4DC00] text-[#191919] text-sm font-bold py-3 px-4 rounded focus:outline-none focus:shadow-outline transition-colors"
                                    >
                                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M12 3c-4.97 0-9 3.185-9 7.115 0 2.533 1.706 4.764 4.254 5.922-.162.61-1.042 3.948-1.077 4.095-.044.186.064.181.135.132.056-.039 3.424-2.28 4.793-3.195a9.638 9.638 9.638 0 0 0 .895.04c4.97 0 9-3.184 9-7.109C21 6.185 16.97 3 12 3z"/>
                                        </svg>
                                        카카오톡 1:1 상담하기
                                    </a>
                                )}
                                <button
                                    onClick={handleCloseModal}
                                    className={`w-full text-sm font-bold py-2.5 px-4 rounded focus:outline-none focus:shadow-outline transition-colors ${isSuccess ? 'bg-gray-200 hover:bg-gray-300 text-gray-700' : 'bg-gray-600 hover:bg-gray-700 text-white'
                                        }`}
                                >
                                    {isSuccess ? '닫기 (홈으로 이동)' : '확인'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
