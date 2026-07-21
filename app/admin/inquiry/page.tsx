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
- 수강 상담 및 문의 내용 확인, 수강 과정 안내 및 등록 처리
- 학원 내 새로운 수강 과정 안내, 원데이 클래스, 각종 이벤트 및 행사 관련 정보 안내(전화, SMS, 카카오톡 등)
- 고객 불만 처리 및 기타 고객 서비스 제공

[2. 수집하는 개인정보 항목]
- 필수항목: 성명, 전화번호(휴대폰 번호), 관심 과정
- 선택항목: 방문예약 일시, 기타 상담 문의 내용

[3. 개인정보의 보유 및 이용기간]
- 원칙적으로 개인정보 수집 및 이용 목적이 달성된 후에는 지체 없이 파기합니다.
- 단, 학원 내부 방침 또는 관계 법령의 규정에 의하여 보존할 필요가 있는 경우 아래와 같이 일정 기간 보관할 수 있습니다.
  * 소비자의 불만 또는 분쟁 처리에 관한 기록: 3년
  * 학원 안내 및 마케팅 목적: 수집일로부터 2년 (이후 파기 또는 재동의 요청)

[4. 개인정보의 파기 절차 및 방법]
- 전자적 파일 형태로 저장된 개인정보는 기록을 재생할 수 없는 기술적 방법을 사용하여 영구 삭제하며, 종이 문서인 경우 분쇄기로 분쇄하여 파기합니다.

[5. 동의 거부권 안내]
- 귀하는 개인정보 수집 및 이용에 대한 동의를 거부할 권리가 있으나, 필수 동의 거부 시 원활한 온라인 상담 및 수강 신청 서비스 이용이 제한됩니다.
--------------------------------------------------

▶ 본인은 세종요리제과기술학원의 위와 같은 개인정보 수집 및 이용에 동의합니다. (필수 동의 완료)
▶ 본인은 마케팅 활용 동의 및 광고(안내) 수신에 동의합니다. (필수 동의 완료)`;

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
