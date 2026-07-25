'use client';

import { useState, useEffect } from 'react';
import { UserCog } from 'lucide-react';

export default function AdminAccountPage() {
    const [currentId, setCurrentId] = useState('로딩중...');
    const [currentPw, setCurrentPw] = useState('');
    const [adminId, setAdminId] = useState('');
    const [adminPw, setAdminPw] = useState('');
    const [showPw, setShowPw] = useState(false);
    const [showCurrentPw, setShowCurrentPw] = useState(false);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await fetch('/api/sejong/settings', { cache: 'no-store' });
                if (res.ok) {
                    const data = await res.json();
                    if (data.adminAccount) {
                        setCurrentId(data.adminAccount.id || '없음');
                        setCurrentPw(data.adminAccount.pw || '');
                    } else {
                        setCurrentId('설정 안됨');
                        setCurrentPw('');
                    }
                }
            } catch (e) {
                console.error("Failed to load admin account", e);
                const stored = localStorage.getItem('adminAccount');
                if (stored) {
                    try {
                        const parsed = JSON.parse(stored);
                        setCurrentId(parsed.id || '없음');
                        setCurrentPw(parsed.pw || '');
                    } catch(e2) {}
                }
            }
        };
        fetchSettings();
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const id = adminId.trim() || currentId;
        const pw = adminPw.trim() || currentPw;
        
        if (!id || !pw || id === '로딩중...' || id === '없음') {
            alert("저장할 계정 정보가 유효하지 않습니다.");
            return;
        }
        
        try {
            localStorage.setItem('adminAccount', JSON.stringify({ id, pw }));
        } catch(e) {}
        
        try {
            const res = await fetch('/api/sejong/settings', { cache: 'no-store' });
            let currentSettings: any = {};
            if (res.ok) {
                currentSettings = await res.json();
            }
            
            currentSettings.adminAccount = { id, pw };
            
            const saveRes = await fetch('/api/sejong/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(currentSettings)
            });
            
            if (saveRes.ok) {
                alert("아이디와 비밀번호가 성공적으로 변경되었습니다.");
            } else {
                throw new Error("Save failed");
            }
        } catch (e) {
            console.error("Failed to save to API:", e);
            alert("로컬 저장소에는 저장되었으나, 서버 동기화에 실패했습니다.");
        }
    };

    return (
        <div className="flex justify-center items-center py-10 px-4">
            <div className="w-full max-w-[500px] bg-white rounded-2xl shadow-[0_10px_25px_rgba(0,0,0,0.05)] p-10">
                <h2 className="mt-0 mb-8 text-slate-900 text-center flex items-center justify-center gap-2 text-2xl font-bold">
                    <UserCog className="w-8 h-8 text-blue-500" />
                    관리자 아이디/비밀번호
                </h2>
                
                <div className="mb-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="flex justify-between items-center mb-2 border-b border-slate-200 pb-2">
                        <span className="text-sm font-semibold text-slate-500">현재 계정 정보</span>
                    </div>
                    <div className="flex flex-col gap-2 mt-2">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-slate-500">아이디</span>
                            <span className="text-lg font-bold text-slate-900">{currentId}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-slate-500">비밀번호</span>
                            <div className="flex items-center gap-3">
                                <span className="text-lg font-bold text-slate-900 tracking-wider">
                                    {currentId === '로딩중...' ? '로딩중...' : (currentPw ? (showCurrentPw ? currentPw : '•'.repeat(currentPw.length)) : '설정 안됨')}
                                </span>
                                <label className="flex items-center gap-1 font-normal text-slate-500 text-xs cursor-pointer m-0">
                                    <input 
                                        type="checkbox" 
                                        checked={showCurrentPw}
                                        onChange={(e) => setShowCurrentPw(e.target.checked)}
                                        className="w-3.5 h-3.5 m-0 p-0 cursor-pointer accent-blue-500"
                                    />
                                    보기
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
                
                <form onSubmit={handleSave}>
                    <div className="mb-6">
                        <label htmlFor="adminId" className="block mb-2.5 font-semibold text-slate-700">
                            변경할 아이디 <span className="text-sm font-normal text-slate-500">(변경하지 않으려면 비워두세요)</span>
                        </label>
                        <input 
                            type="text" 
                            id="adminId" 
                            autoComplete="off"
                            placeholder="새로운 아이디" 
                            value={adminId}
                            onChange={(e) => setAdminId(e.target.value)}
                            className="w-full p-3.5 border border-slate-300 rounded-xl text-base outline-none transition-colors focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        />
                    </div>
                    
                    <div className="mb-6">
                        <label htmlFor="adminPw" className="block mb-2.5 font-semibold text-slate-700">
                            변경할 비밀번호 <span className="text-sm font-normal text-slate-500">(변경하지 않으려면 비워두세요)</span>
                        </label>
                        <input 
                            type={showPw ? "text" : "password"} 
                            id="adminPw" 
                            autoComplete="new-password"
                            placeholder="새로운 비밀번호" 
                            value={adminPw}
                            onChange={(e) => setAdminPw(e.target.value)}
                            className="w-full p-3.5 border border-slate-300 rounded-xl text-base outline-none transition-colors focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        />
                        <label className="flex items-center gap-2 mt-3 font-normal text-slate-600 text-[0.95rem] cursor-pointer">
                            <input 
                                type="checkbox" 
                                checked={showPw}
                                onChange={(e) => setShowPw(e.target.checked)}
                                className="w-[18px] h-[18px] m-0 p-0 cursor-pointer accent-blue-500"
                            />
                            비밀번호 표시
                        </label>
                    </div>
                    
                    <button 
                        type="submit" 
                        className="w-full p-4 bg-blue-500 text-white border-none rounded-xl text-[1.1rem] font-bold cursor-pointer transition-colors hover:bg-blue-600 shadow-[0_4px_10px_rgba(59,130,246,0.3)] mt-2"
                    >
                        변경사항 저장
                    </button>
                </form>
            </div>
        </div>
    );
}
