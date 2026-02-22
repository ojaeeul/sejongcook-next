
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Member {
    id: string;
    username: string;
    email: string;
    status: 'approved' | 'pending';
    joinedAt: string;
}

export default function MemberPage() {
    const [members, setMembers] = useState<Member[]>([]);
    const [loading, setLoading] = useState(true);
    const [autoApprove, setAutoApprove] = useState(false);
    const [showAuthLinks, setShowAuthLinks] = useState(true);

    const fetchSettings = async () => {
        try {
            const url = '/api/admin/data/settings?_t=' + Date.now();
            const res = await fetch(url, { cache: 'no-store' });
            const items = await res.json();
            const data = Array.isArray(items) && items.length > 0 ? items[0] : items;
            if (data && data.showAuthLinks !== undefined) setShowAuthLinks(data.showAuthLinks);
        } catch (error) {
            console.error('Failed to load settings', error);
        }
    };

    const toggleAuthLinks = async (checked: boolean) => {
        const newState = checked;
        setShowAuthLinks(newState); // Optimistic update
        try {
            const url = '/api/admin/data/settings?_t=' + Date.now();
            await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify([{ id: "1", showAuthLinks: newState }]),
            });
        } catch {
            console.error('Failed to save settings');
            setShowAuthLinks(!newState); // Revert on error
        }
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const url = '/api/admin/data/members?_t=' + Date.now();
            const res = await fetch(url);
            const json = await res.json();
            setMembers(json);
        } catch (error) {
            console.error('Failed to fetch members', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        fetchSettings();
    }, []);

    const handleSave = async (newData: Member[]) => {
        try {
            const url = '/api/admin/data/members?_t=' + Date.now();
            await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newData),
            });
            setMembers(newData);
        } catch {
            alert('저장 실패');
        }
    };

    const toggleStatus = (id: string) => {
        const newData = members.map(m => {
            if (m.id === id) {
                const newStatus: Member['status'] = m.status === 'approved' ? 'pending' : 'approved';
                return { ...m, status: newStatus };
            }
            return m;
        });
        handleSave(newData);
    };

    const handleDelete = (id: string) => {
        if (confirm('이 회원을 삭제하시겠습니까?')) {
            const newData = members.filter(m => m.id !== id);
            handleSave(newData);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between pb-6 border-b border-gray-800">
                <h1 className="text-2xl font-bold text-gray-800">👥 회원 관리 (Member Management)</h1>
                <Link href="/admin" className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors">
                    관리자 홈으로
                </Link>
            </div>

            <div className="flex justify-between items-center mb-6">
                <div className="bg-gray-50 px-5 py-3 rounded-full border border-gray-200 flex items-center gap-3">
                    <span className="text-sm font-bold text-gray-600">자동 승인 (Auto-Approve)</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={autoApprove}
                            onChange={(e) => setAutoApprove(e.target.checked)}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                    </label>
                </div>
                <div>
                    <button
                        onClick={fetchData}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-5 py-2.5 rounded shadow-sm transition-colors font-medium"
                    >
                        새로고침 (Refresh)
                    </button>
                </div>
            </div>

            {/* Global Settings Section (Toggle) */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                            홈페이지 로그인/회원가입 메뉴 표시
                            <span className={`text-xs px-2 py-0.5 rounded ${showAuthLinks ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>
                                {showAuthLinks ? 'ON' : 'OFF'}
                            </span>
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">OFF로 설정하면 메인 홈페이지 상단의 &apos;로그인&apos;, &apos;회원가입&apos; 메뉴가 숨겨집니다.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            checked={showAuthLinks}
                            onChange={(e) => toggleAuthLinks(e.target.checked)}
                            className="sr-only peer"
                        />
                        <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-4 font-medium text-gray-600">ID (Username)</th>
                            <th className="px-6 py-4 font-medium text-gray-600">Email (Contact)</th>
                            <th className="px-6 py-4 font-medium text-gray-600 text-center">Status</th>
                            <th className="px-6 py-4 font-medium text-gray-600 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading ? (
                            <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-500">로딩 중...</td></tr>
                        ) : members.length === 0 ? (
                            <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-500">회원이 없습니다.</td></tr>
                        ) : (
                            members.map((member) => (
                                <tr key={member.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-gray-900">{member.username}</td>
                                    <td className="px-6 py-4 text-gray-600">{member.email}</td>
                                    <td className="px-6 py-4 text-center">
                                        <span
                                            onClick={() => toggleStatus(member.id)}
                                            className={`inline-block px-3 py-1 rounded-full text-xs font-bold cursor-pointer select-none transition-colors ${member.status === 'approved'
                                                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                                : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                                                }`}
                                        >
                                            {member.status === 'approved' ? '승인됨' : '대기중'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <button
                                            onClick={() => handleDelete(member.id)}
                                            className="px-3 py-1.5 text-red-600 hover:bg-red-50 rounded transition-colors font-medium"
                                        >
                                            삭제 (Delete)
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div >
    );
}
