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
            const url = '/api/admin/data/inquiry?_t=' + Date.now();
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
                const url = '/api/admin/data/inquiry?_t=' + Date.now();
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
                                                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded border border-blue-400">
                                                        동의
                                                    </span>
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
