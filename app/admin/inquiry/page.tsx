'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
// ... (keep existing imports)

// ...


// import { Inquiry, InquiryStorage } from '@/utils/inquiryStorage'; // Deprecated

interface Inquiry {
    id: string;
    name: string;
    phone: string;
    courses: string[];
    date: string;
    isRead: boolean;
    marketingAgree?: boolean;
    content?: string;
}

export default function AdminInquiryPage() {
    const [inquiries, setInquiries] = useState<Inquiry[]>([]);

    const fetchData = async () => {
        try {
            const url = '/api/admin/data/inquiries?_t=' + Date.now();
            const res = await fetch(url);
            const json = await res.json();

            // Validate and sanitize fields
            const safeData = (Array.isArray(json) ? json : []).map((item: Record<string, unknown>) => ({
                id: String(item.id || ''),
                name: String(item.name || 'Unknown'),
                phone: String(item.phone || ''),
                date: String(item.date || new Date().toISOString()),
                // Ensure courses is an array even if missing or a single string
                courses: Array.isArray(item.courses)
                    ? (item.courses as string[])
                    : (typeof item.courses === 'string' && item.courses ? [item.courses] : []),
                isRead: !!item.isRead,
                marketingAgree: !!item.marketingAgree,
                content: String(item.content || '')
            }));

            setInquiries(safeData);
        } catch (error) {
            console.error('Failed to fetch inquiries', error);
        }
    };

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchData();
    }, []);

    const handleDelete = async (id: string) => {
        if (confirm('정말 삭제하시겠습니까?')) {
            try {
                const newData = inquiries.filter((item) => String(item.id) !== String(id));
                const url = '/api/admin/data/inquiries?_t=' + Date.now();
                await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(newData),
                });
                setInquiries(newData);
            } catch {
                alert('삭제 실패');
            }
        }
    };

    const handleDownloadConsent = (item: Inquiry) => {
        const textContent = `[개인정보 수집 및 이용, 마케팅 활용 동의서]

동의자 성명: ${item.name}
연락처: ${item.phone}
동의 일시: ${new Date(item.date).toLocaleString()}

--------------------------------------------------
[1. 개인정보의 수집 목적]
- 세종요리제과기술학원 사이트 내 서비스 제공 계약의 성립 및 유지 종료를 위한 본인 식별 및 실명확인, 가입의사 확인, 회원에 대한 고지 사항 전달 등
- 세종요리제과기술학원 사이트 내 서비스 제공을 위한 통합ID 제공, 고객센터 운영, 불량회원 부정이용 방지 및 비인가 사용방지, 이벤트 및 마케팅 기획관리, 서비스 개발을 위한 연구조사 등
- 세종요리제과기술학원 사이트 내 서비스 관련 각종 이벤트 및 행사 관련 정보안내를 위한 전화, SMS, 이메일 발송 등의 마케팅 활동 등
- 당사 및 제휴사 상품서비스에 대한 제반 마케팅(대행포함) 활동 관련 전화, SMS, 이메일 발송을 통한 마케팅, 판촉행사 및 이벤트 안내 등

[2. 수집하는 개인정보 항목]
[필수입력사항]
- 성명, 전화번호(휴대폰번호 포함), 관심 과정 등
[선택입력항목]
- 이메일/SMS/전화 수신동의 등 개인별 서비스 제공을 위해 필요한 항목
[서비스 이용 또는 사업처리 과정에서 생성 수집되는 각종 거래 및 개인 성향 정보]
- 서비스이용기록, 접속로그, 쿠키, 접속IP정보 등 단, 이용자의 기본적 인권 침해의 우려가 있는 민감한 개인정보는 수집하지 않습니다.

[3. 개인정보의 보유/이용기간 및 폐기]
당사는 수집된 회원의 개인정보는 수집 목적 또는 제공 받은 목적이 달성되면 지체없이 파기함을 원칙으로 합니다. 다만, 다음 각 호의 경우 일정기간 동안 예외적으로 수집한 회원정보의 전부 또는 일부를 보관할 수 있습니다.
- 고객요구사항 처리 및 A/S의 목적 : 수집한 회원정보를 회원탈퇴 후 30일간 보유
- 회원 자격 상실의 경우 : 세종요리제과기술학원 사이트 내 부정 이용 및 타 회원의 추가적인 피해 방지를 위해 수집한 회원정보를 회원 자격 상실일로부터 2년간 보유
- 상법 및 '전자상거래 등에서 소비자보호에 관한 법률'등 관련 법령의 규정에 의하여 일정기간 보유해야 할 필요가 있을 경우에는 관련 법령이 정한 기간 동안 보유할 수 있습니다.
  * 소비자의 불만 또는 분쟁처리에 관한 기록 : 3년
- 개인정보를 파기할 때에는 재생할 수 없는 방법을 사용하여 이를 삭제합니다.
--------------------------------------------------

▶ 본인은 귀 학원의 위와 같은 개인정보 수집 및 이용안내에 동의합니다. (필수 동의 완료)
▶ 본인은 마케팅 활용 동의 및 광고 수신에 동의합니다. (필수 동의 완료)`;

        const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${item.name}_개인정보_마케팅_동의서.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-800">📋 상담/수강신청 관리 (Admin)</h1>
                    <Link href="/" className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700">홈으로 이동</Link>
                </div>

                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-500">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3">신청일시</th>
                                    <th scope="col" className="px-6 py-3">이름</th>
                                    <th scope="col" className="px-6 py-3">연락처</th>
                                    <th scope="col" className="px-6 py-3">관심과정</th>
                                    <th scope="col" className="px-6 py-3">상담내용</th>
                                    <th scope="col" className="px-6 py-3 text-center">마케팅</th>
                                    <th scope="col" className="px-6 py-3 text-center">관리</th>
                                </tr>
                            </thead>
                            <tbody>
                                {inquiries.length > 0 ? (
                                    inquiries.map((item) => (
                                        <tr key={item.id} className="bg-white border-b hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {new Date(item.date).toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 font-bold text-gray-900">
                                                {item.name}
                                            </td>
                                            <td className="px-6 py-4">
                                                {item.phone}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-wrap gap-1">
                                                    {item.courses.map((course) => (
                                                        <span key={course} className="bg-orange-100 text-orange-800 text-xs font-medium px-2.5 py-0.5 rounded">
                                                            {course}
                                                        </span>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 truncate max-w-xs" title={item.content}>
                                                {item.content || '-'}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                {item.marketingAgree ? (
                                                    <button 
                                                        onClick={() => handleDownloadConsent(item)}
                                                        className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded border border-blue-400 hover:bg-blue-200 transition-colors"
                                                        title="클릭하여 동의서 다운로드"
                                                    >
                                                        동의 (다운로드)
                                                    </button>
                                                ) : (
                                                    <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded border border-gray-500">
                                                        미동의
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <button
                                                    onClick={() => handleDelete(item.id)}
                                                    className="font-medium text-red-600 hover:underline"
                                                >
                                                    삭제
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-10 text-center text-gray-500">
                                            아직 접수된 상담 내역이 없습니다.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
