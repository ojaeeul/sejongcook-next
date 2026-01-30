'use client';

import { useState } from 'react';
import { TimeTableData, generateTimeTableHtml } from '@/utils/timetableGenerator';
import { Save, RefreshCw, Trash2 } from 'lucide-react';

interface TimeTableFormProps {
    initialData: TimeTableData;
    onSave: (html: string, rawData: TimeTableData) => Promise<void>;
    onCancel: () => void;
}

export default function TimeTableForm({ initialData, onSave, onCancel }: TimeTableFormProps) {
    const [data, setData] = useState<TimeTableData>(initialData);
    const [loading, setLoading] = useState(false);
    const [previewHtml, setPreviewHtml] = useState(generateTimeTableHtml(initialData));

    // Handler to update deep nested state
    const updateCookingRow = (index: number, field: string, value: string) => {
        const newRows = [...data.cooking.tableRows];
        newRows[index] = { ...newRows[index], [field]: value };
        setData({ ...data, cooking: { ...data.cooking, tableRows: newRows } });
    };

    const updateLifeCookingRow = (index: number, field: string, value: string) => {
        const newRows = [...data.lifeCooking.tableRows];
        newRows[index] = { ...newRows[index], [field]: value };
        setData({ ...data, lifeCooking: { ...data.lifeCooking, tableRows: newRows } });
    };

    const updateBakingRow = (index: number, field: string, value: string) => {
        const newRows = [...data.baking.tableRows];
        newRows[index] = { ...newRows[index], [field]: value };
        setData({ ...data, baking: { ...data.baking, tableRows: newRows } });
    };

    const handleGeneratePreview = () => {
        setPreviewHtml(generateTimeTableHtml(data));
    };

    const handleSubmit = async () => {
        setLoading(true);
        const html = generateTimeTableHtml(data);
        await onSave(html, data);
        setLoading(false);
    };

    return (
        <div className="flex gap-8 flex-col lg:flex-row">
            {/* Form Section */}
            <div className="w-full lg:w-1/2 space-y-8 h-[80vh] overflow-y-auto pr-4 border-r">
                <div className="sticky top-0 bg-white z-10 py-4 border-b flex justify-between items-center">
                    <h2 className="text-xl font-bold">시간표 데이터 입력</h2>
                    <div className="flex gap-2">
                        <button onClick={handleGeneratePreview} className="flex items-center gap-1 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded text-sm font-medium">
                            <RefreshCw size={14} /> 프리뷰 갱신
                        </button>
                    </div>
                </div>

                {/* Cooking Section */}
                <section className="space-y-4">
                    <h3 className="font-bold text-orange-600 text-lg border-b pb-2">1. 요리/조리 과정 (오렌지 테마)</h3>

                    <div className="bg-orange-50 p-4 rounded-lg space-y-3">
                        <label className="block text-sm font-medium">과정명 (Intro)</label>
                        <input
                            type="text"
                            className="w-full border rounded px-3 py-2"
                            value={data.cooking.intro}
                            onChange={e => setData({ ...data, cooking: { ...data.cooking, intro: e.target.value } })}
                        />

                        <label className="block text-sm font-medium">상단 안내 (HTML 태그 사용 가능)</label>
                        {data.cooking.notes.map((note, idx) => (
                            <input
                                key={idx}
                                type="text"
                                className="w-full border rounded px-3 py-2 mb-2"
                                value={note}
                                onChange={e => {
                                    const newNotes = [...data.cooking.notes];
                                    newNotes[idx] = e.target.value;
                                    setData({ ...data, cooking: { ...data.cooking, notes: newNotes } });
                                }}
                            />
                        ))}
                    </div>

                    <div className="space-y-4">
                        <h4 className="font-bold text-sm">시간표 행</h4>
                        {data.cooking.tableRows.map((row, idx) => (
                            <div key={idx} className="grid grid-cols-2 lg:grid-cols-4 gap-2 border p-3 rounded">
                                <div className="col-span-full font-semibold text-xs text-gray-500">행 {row.no}</div>
                                <input placeholder="종목" value={row.course} onChange={e => updateCookingRow(idx, 'course', e.target.value)} className="border p-1 text-sm rounded" />
                                <input placeholder="주/일수" value={row.frequency} onChange={e => updateCookingRow(idx, 'frequency', e.target.value)} className="border p-1 text-sm rounded" />
                                <input placeholder="요일" value={row.days} onChange={e => updateCookingRow(idx, 'days', e.target.value)} className="border p-1 text-sm rounded" />
                                <input placeholder="오전" value={row.morning} onChange={e => updateCookingRow(idx, 'morning', e.target.value)} className="border p-1 text-sm rounded" />
                                <input placeholder="오후1" value={row.afternoon1} onChange={e => updateCookingRow(idx, 'afternoon1', e.target.value)} className="border p-1 text-sm rounded" />
                                <input placeholder="오후2" value={row.afternoon2} onChange={e => updateCookingRow(idx, 'afternoon2', e.target.value)} className="border p-1 text-sm rounded" />
                            </div>
                        ))}
                    </div>
                </section>

                {/* Life Cooking Section */}
                <section className="space-y-4 pt-4 border-t">
                    <h3 className="font-bold text-green-600 text-lg border-b pb-2">2. 생활요리반 (그린 테마)</h3>

                    <div className="space-y-4">
                        <h4 className="font-bold text-sm">시간표 행</h4>
                        {data.lifeCooking.tableRows.map((row, idx) => (
                            <div key={idx} className="grid grid-cols-2 lg:grid-cols-3 gap-2 border p-3 rounded">
                                <div className="col-span-full font-semibold text-xs text-gray-500">행 {row.no}</div>
                                <input placeholder="종목" value={row.course} onChange={e => updateLifeCookingRow(idx, 'course', e.target.value)} className="border p-1 text-sm rounded" />
                                <input placeholder="주/일수" value={row.frequency} onChange={e => updateLifeCookingRow(idx, 'frequency', e.target.value)} className="border p-1 text-sm rounded" />
                                <input placeholder="요일" value={row.days} onChange={e => updateLifeCookingRow(idx, 'days', e.target.value)} className="border p-1 text-sm rounded" />
                                <input placeholder="오전" value={row.morning} onChange={e => updateLifeCookingRow(idx, 'morning', e.target.value)} className="border p-1 text-sm rounded" />
                                <input placeholder="오후" value={row.afternoon} onChange={e => updateLifeCookingRow(idx, 'afternoon', e.target.value)} className="border p-1 text-sm rounded" />
                            </div>
                        ))}
                    </div>

                    <div className="bg-green-50 p-4 rounded-lg space-y-3">
                        <label className="block text-sm font-medium">하단 안내 사항</label>
                        {data.lifeCooking.bottomNotes.map((note, idx) => (
                            <textarea
                                key={idx}
                                className="w-full border rounded px-3 py-2 mb-2 text-sm"
                                rows={2}
                                value={note}
                                onChange={e => {
                                    const newNotes = [...data.lifeCooking.bottomNotes];
                                    newNotes[idx] = e.target.value;
                                    setData({ ...data, lifeCooking: { ...data.lifeCooking, bottomNotes: newNotes } });
                                }}
                            />
                        ))}
                    </div>
                </section>

                {/* Baking Section */}
                <section className="space-y-4 pt-4 border-t">
                    <h3 className="font-bold text-yellow-600 text-lg border-b pb-2">II. 제과제빵 & 케익 (옐로우 테마)</h3>

                    <div className="bg-yellow-50 p-4 rounded-lg space-y-3">
                        <label className="block text-sm font-medium">상단 안내</label>
                        {data.baking.notes.map((note, idx) => (
                            <input
                                key={idx}
                                type="text"
                                className="w-full border rounded px-3 py-2 mb-2"
                                value={note}
                                onChange={e => {
                                    const newNotes = [...data.baking.notes];
                                    newNotes[idx] = e.target.value;
                                    setData({ ...data, baking: { ...data.baking, notes: newNotes } });
                                }}
                            />
                        ))}
                    </div>

                    <div className="space-y-4">
                        <h4 className="font-bold text-sm">시간표 행</h4>
                        {data.baking.tableRows.map((row, idx) => (
                            <div key={idx} className="grid grid-cols-2 lg:grid-cols-4 gap-2 border p-3 rounded">
                                <div className="col-span-full font-semibold text-xs text-gray-500">행 {row.no}</div>
                                <input placeholder="종목" value={row.course} onChange={e => updateBakingRow(idx, 'course', e.target.value)} className="border p-1 text-sm rounded" />
                                <input placeholder="주/일수" value={row.frequency} onChange={e => updateBakingRow(idx, 'frequency', e.target.value)} className="border p-1 text-sm rounded" />
                                <input placeholder="요일" value={row.days} onChange={e => updateBakingRow(idx, 'days', e.target.value)} className="border p-1 text-sm rounded" />
                                <input placeholder="오전" value={row.morning} onChange={e => updateBakingRow(idx, 'morning', e.target.value)} className="border p-1 text-sm rounded" />
                                <input placeholder="오후1" value={row.afternoon1} onChange={e => updateBakingRow(idx, 'afternoon1', e.target.value)} className="border p-1 text-sm rounded" />
                                <input placeholder="오후2" value={row.afternoon2} onChange={e => updateBakingRow(idx, 'afternoon2', e.target.value)} className="border p-1 text-sm rounded" />
                            </div>
                        ))}
                    </div>

                    <div className="bg-yellow-100 p-4 rounded-lg space-y-4 mt-4">
                        <h4 className="font-bold text-sm mb-2">3. 케익디자인 / 디저트</h4>

                        <div>
                            <label className="text-xs font-semibold text-gray-600 block mb-1">교육 대상 및 일정 (줄바꿈 구분)</label>
                            {data.cake.targetAndSchedule.map((item, idx) => (
                                <input
                                    key={`ts-${idx}`}
                                    className="w-full border rounded px-2 py-1 mb-1 text-sm"
                                    value={item}
                                    onChange={e => {
                                        const newItems = [...data.cake.targetAndSchedule];
                                        newItems[idx] = e.target.value;
                                        setData({ ...data, cake: { ...data.cake, targetAndSchedule: newItems } });
                                    }}
                                />
                            ))}
                            <button
                                onClick={() => setData({ ...data, cake: { ...data.cake, targetAndSchedule: [...data.cake.targetAndSchedule, "새 항목"] } })}
                                className="text-xs bg-white border px-2 py-1 rounded mt-1 hover:bg-gray-50"
                            >
                                + 항목 추가
                            </button>
                        </div>

                        <div>
                            <label className="text-xs font-semibold text-gray-600 block mb-1">교육 내용 (줄바꿈 구분)</label>
                            {data.cake.curriculum.map((item, idx) => (
                                <div key={`curr-${idx}`} className="flex gap-2 mb-1">
                                    <input
                                        className="w-full border rounded px-2 py-1 text-sm"
                                        value={item}
                                        onChange={e => {
                                            const newItems = [...data.cake.curriculum];
                                            newItems[idx] = e.target.value;
                                            setData({ ...data, cake: { ...data.cake, curriculum: newItems } });
                                        }}
                                    />
                                    <button
                                        onClick={() => {
                                            const newItems = data.cake.curriculum.filter((_, i) => i !== idx);
                                            setData({ ...data, cake: { ...data.cake, curriculum: newItems } });
                                        }}
                                        className="text-red-500 hover:text-red-700"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                            <button
                                onClick={() => setData({ ...data, cake: { ...data.cake, curriculum: [...data.cake.curriculum, "새 항목"] } })}
                                className="text-xs bg-white border px-2 py-1 rounded mt-1 hover:bg-gray-50"
                            >
                                + 항목 추가
                            </button>
                        </div>
                    </div>
                </section>

                <div className="h-20"></div> {/* Spacer */}
            </div>

            {/* Preview Section */}
            <div className="w-full lg:w-1/2 flex flex-col h-[80vh]">
                <div className="sticky top-0 bg-white z-10 py-4 border-b flex justify-between items-center px-4">
                    <h2 className="text-xl font-bold text-gray-500">미리보기 (자동 생성됨)</h2>
                    <div className="flex gap-2">
                        <button onClick={onCancel} className="px-4 py-2 border rounded hover:bg-gray-50 text-gray-600">취소</button>
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="bg-blue-600 text-white px-6 py-2 rounded font-bold hover:bg-blue-700 flex items-center gap-2"
                        >
                            <Save size={18} />
                            {loading ? '저장 중...' : '저장하기'}
                        </button>
                    </div>
                </div>
                <div className="flex-grow overflow-y-auto p-4 bg-gray-100 rounded-lg border m-2">
                    <div
                        className="bg-white p-8 shadow-sm rounded min-h-full"
                        dangerouslySetInnerHTML={{ __html: previewHtml }}
                    />
                </div>
            </div>
        </div>
    );
}
