'use client';

import { useState, useEffect } from 'react';
import { Save, ShieldAlert, AlertCircle, CheckCircle } from 'lucide-react';

export default function ModeratorSettingsPage() {
    const [enabled, setEnabled] = useState(true);
    const [systemPrompt, setSystemPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState({ text: '', type: '' });

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const url = '/api/admin/data/moderator-settings?_t=' + Date.now();
                const res = await fetch(url);
                if (res.ok) {
                    const data = await res.json();
                    setEnabled(data.enabled ?? true);
                    setSystemPrompt(data.systemPrompt || '');
                }
            } catch (error) {
                console.error("Failed to load moderator settings", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const handleSave = async () => {
        setIsSaving(true);
        setSaveMessage({ text: '', type: '' });
        
        try {
            const res = await fetch('/api/admin/data/moderator-settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ enabled, systemPrompt })
            });
            
            if (res.ok) {
                setSaveMessage({ text: '설정이 성공적으로 저장되었습니다.', type: 'success' });
            } else {
                throw new Error('Failed to save');
            }
        } catch (error) {
            setSaveMessage({ text: '설정 저장 중 오류가 발생했습니다.', type: 'error' });
            console.error(error);
        } finally {
            setIsSaving(false);
            
            setTimeout(() => {
                setSaveMessage({ text: '', type: '' });
            }, 3000);
        }
    };

    if (isLoading) {
        return <div className="p-8 text-center text-gray-500">설정 데이터를 불러오는 중...</div>;
    }

    return (
        <div className="space-y-6 max-w-4xl">
            <div className="flex items-center gap-3">
                <div className="p-3 bg-red-100 rounded-lg">
                    <ShieldAlert className="w-6 h-6 text-red-600" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">AI 스팸 필터 (Moderator) 설정</h1>
                    <p className="text-sm text-gray-500">구인/구직, 질문게시판, 수강후기에 올라오는 악성 글을 실시간으로 차단하고 검열합니다.</p>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                    <h2 className="text-lg font-bold text-gray-800 mb-4">필터 작동 설정</h2>
                    <div className="flex items-center gap-4">
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                                type="checkbox" 
                                className="sr-only peer"
                                checked={enabled}
                                onChange={(e) => setEnabled(e.target.checked)}
                            />
                            <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-red-600"></div>
                            <span className="ml-3 text-sm font-medium text-gray-700">
                                {enabled ? '현재 작동 중 (ON)' : '작동 중지됨 (OFF)'}
                            </span>
                        </label>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">이 기능을 끄면 AI가 게시글을 검열하지 않고 모두 정상 등록시킵니다.</p>
                </div>

                <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-bold text-gray-800">분류 기준 (시스템 프롬프트)</h2>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">개발자 전용 옵션</span>
                    </div>
                    
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                        <div className="flex items-start">
                            <div className="flex-shrink-0">
                                <AlertCircle className="h-5 w-5 text-yellow-400" />
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-yellow-700 font-medium">주의사항</p>
                                <p className="text-sm text-yellow-600 mt-1">이 텍스트는 AI에게 검열 규칙을 설명하는 아주 중요한 지시문입니다. 아래 3가지 카테고리(SEVERE, MILD, SAFE)의 포맷을 임의로 삭제하거나 변경하면 시스템 오류가 발생할 수 있습니다.</p>
                            </div>
                        </div>
                    </div>

                    <textarea
                        value={systemPrompt}
                        onChange={(e) => setSystemPrompt(e.target.value)}
                        rows={16}
                        className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm font-mono"
                        placeholder="분류 기준을 입력하세요..."
                    />
                </div>

                <div className="p-6 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                    <div>
                        {saveMessage.text && (
                            <div className={`flex items-center gap-2 text-sm font-medium ${saveMessage.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                                {saveMessage.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                                {saveMessage.text}
                            </div>
                        )}
                    </div>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex items-center gap-2 px-6 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:bg-red-400"
                    >
                        <Save className="w-5 h-5" />
                        {isSaving ? '저장 중...' : '저장 및 적용'}
                    </button>
                </div>
            </div>
        </div>
    );
}
