'use client';

import { useState, useEffect } from 'react';
import { Settings, Save, Bot } from 'lucide-react';

export default function BotSettingsPage() {
    const [enabled, setEnabled] = useState(true);
    const [systemPrompt, setSystemPrompt] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await fetch('/data/bot_settings.json?_t=' + Date.now());
                if (res.ok) {
                    const data = await res.json();
                    setEnabled(data.enabled ?? true);
                    setSystemPrompt(data.systemPrompt || "");
                }
            } catch (err) {
                console.error("Failed to load bot settings", err);
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            // Save settings by sending POST to an API route, but we don't have a specific API route for bot settings yet.
            // Let's use handleReplace via a new API route or adminApiHandler for 'settings' maybe?
            // Actually, we can use the existing /api/admin/data/bot_settings route if we configure it, but it might not exist.
            // Wait, we need an API route for this.
            const res = await fetch('/api/admin/data/bot-settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify([{ enabled, systemPrompt }])
            });
            if (res.ok) {
                alert('자동 봇 설정이 성공적으로 저장되었습니다.');
            } else {
                const errData = await res.json();
                alert('저장 실패: ' + (errData.error || '알 수 없는 오류'));
            }
        } catch (err) {
            console.error(err);
            alert('설정 저장 중 오류가 발생했습니다.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-10 text-center">Loading...</div>;

    return (
        <div className="max-w-5xl mx-auto py-8">
            <div className="flex items-center gap-3 mb-8 pb-4 border-b border-gray-200">
                <div className="p-3 bg-amber-100 rounded-lg text-amber-600">
                    <Bot size={28} />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Q&A 자동 봇 설정</h1>
                    <p className="text-gray-500">질문게시판에 자동으로 답변을 달아주는 AI 매니저를 설정합니다.</p>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                <form onSubmit={handleSave} className="space-y-6">
                    <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <label className="text-lg font-bold text-gray-800">AI 자동 봇 사용 여부</label>
                        <div className="flex items-center gap-2 ml-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input 
                                    type="radio" 
                                    name="bot_enabled" 
                                    checked={enabled === true} 
                                    onChange={() => setEnabled(true)} 
                                    className="w-5 h-5 accent-amber-500" 
                                />
                                <span className="text-gray-700 font-medium">사용함</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer ml-4">
                                <input 
                                    type="radio" 
                                    name="bot_enabled" 
                                    checked={enabled === false} 
                                    onChange={() => setEnabled(false)} 
                                    className="w-5 h-5 accent-red-500" 
                                />
                                <span className="text-gray-700 font-medium">사용 안함</span>
                            </label>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold text-gray-800 border-l-4 border-amber-500 pl-3">
                            AI 매니저 기본 지시사항 (프롬프트)
                        </h2>
                        <p className="text-sm text-gray-500">
                            AI가 고객의 질문을 읽고 참고할 학원 정보와 지침을 작성해주세요. 
                            여기에 작성된 정보(수강료, 시간표 등)를 바탕으로 답변이 자동으로 생성됩니다.
                        </p>

                        <div>
                            <textarea
                                className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none transition-all font-mono text-sm leading-relaxed"
                                rows={25}
                                value={systemPrompt}
                                onChange={(e) => setSystemPrompt(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="pt-6 border-t border-gray-100 flex items-center justify-end gap-4">
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex items-center gap-2 px-8 py-3 bg-amber-500 text-white font-bold rounded-lg hover:bg-amber-600 transition-colors shadow-md disabled:opacity-50"
                        >
                            <Save size={20} />
                            {saving ? "저장 중..." : "저장 및 적용"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
