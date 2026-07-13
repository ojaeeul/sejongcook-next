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
}

export default function AdminInquiryPage() {
    const [inquiries, setInquiries] = useState<Inquiry[]>([]);

    const fetchData = async () => {
        try {
            const url = process.env.NODE_ENV === 'production' ? '/api.php?board=inquiry' : '/api/admin/data/inquiries';
            const res = await fetch(url);
            const json = await res.json();
            setInquiries(Array.isArray(json) ? json : []);
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
                const url = process.env.NODE_ENV === 'production' ? '/api.php?board=inquiry' : '/api/admin/data/inquiries';
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
                                        <td colSpan={5} className="px-6 py-10 text-center text-gray-500">
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
