'use client';

import Link from 'next/link';

export default function InquirySettingsPage() {
    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-800">⚙️ 수강신청 설정</h1>
                    <Link href="/" className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700">홈으로 이동</Link>
                </div>
                
                <div className="bg-white rounded-lg shadow-md p-6">
                    <p className="text-gray-600">이곳에서 수강신청 관련 설정(이메일 알림, 기본 안내 문구 등)을 관리할 수 있습니다. (추후 개발 예정)</p>
                </div>
            </div>
        </div>
    );
}
