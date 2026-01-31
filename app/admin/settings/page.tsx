'use client';

import { useState } from 'react';
import { Settings, Save } from 'lucide-react';

export default function SettingsPage() {
    const [url, setUrl] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('NEXT_PUBLIC_SUPABASE_URL') || '';
        }
        return '';
    });
    const [key, setKey] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('NEXT_PUBLIC_SUPABASE_ANON_KEY') || '';
        }
        return '';
    });

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();

        localStorage.setItem('NEXT_PUBLIC_SUPABASE_URL', url);
        localStorage.setItem('NEXT_PUBLIC_SUPABASE_ANON_KEY', key);

        // Reload to apply changes after a short delay
        setTimeout(() => {
            alert('설정이 저장되었습니다. 페이지를 새로고침합니다.');
            window.location.reload();
        }, 500);
    };

    const handleReset = () => {
        if (confirm('설정을 초기화하시겠습니까? 기본 환경변수값이 사용됩니다.')) {
            localStorage.removeItem('NEXT_PUBLIC_SUPABASE_URL');
            localStorage.removeItem('NEXT_PUBLIC_SUPABASE_ANON_KEY');
            alert('초기화되었습니다. 페이지를 새로고침합니다.');
            window.location.reload();
        }
    };

    return (
        <div className="max-w-4xl mx-auto py-8">
            <div className="flex items-center gap-3 mb-8 pb-4 border-b border-gray-200">
                <div className="p-3 bg-indigo-100 rounded-lg text-indigo-600">
                    <Settings size={28} />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">환경 설정</h1>
                    <p className="text-gray-500">Supabase 연결 설정을 관리합니다.</p>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                <form onSubmit={handleSave} className="space-y-6">
                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold text-gray-800 border-l-4 border-indigo-500 pl-3">
                            Supabase 연결 정보
                        </h2>
                        <p className="text-sm text-gray-500 bg-gray-50 p-4 rounded-lg">
                            ⚠️ 이곳에 입력된 정보는 브라우저(localStorage)에 저장되며, 배포된 환경변수보다 우선순위를 가집니다.
                            API Key는 반드시 <strong>Anon (Public) Key</strong>만 입력해주세요.
                        </p>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Project URL</label>
                            <input
                                type="text"
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-mono text-sm"
                                placeholder="https://your-project.supabase.co"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Publishable API Key (Anon)</label>
                            <div className="relative">
                                <input
                                    type="password"
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-mono text-sm pr-10"
                                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                                    value={key}
                                    onChange={(e) => setKey(e.target.value)}
                                    required
                                />
                            </div>
                            <p className="text-xs text-gray-400 mt-1">보안을 위해 마스킹 처리됩니다.</p>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-gray-100 flex items-center justify-between gap-4">
                        <button
                            type="button"
                            onClick={handleReset}
                            className="px-6 py-3 text-red-600 font-bold hover:bg-red-50 rounded-lg transition-colors text-sm"
                        >
                            설정 초기화
                        </button>
                        <button
                            type="submit"
                            className="flex items-center gap-2 px-8 py-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-colors shadow-md hover:shadow-lg transform active:scale-95 duration-200"
                        >
                            <Save size={20} />
                            저장 및 적용
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
