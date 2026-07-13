'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import SuccessModal from '@/components/SuccessModal';
// import ConfirmModal from '@/components/ConfirmModal'; // Reserved for future delete features

// Reuse types or define locally
interface Schedule {
    label: string;
    period: string;
    time: string;
}

interface TextStyle {
    color?: string;
    fontSize?: number;
    fontWeight?: string;
}

interface CourseRecruitContent {
    title: string;
    badgeText: string;
    subText: string;
    scheduleA: Schedule;
    scheduleB: Schedule;
    mainImage: string;
    subImage?: string;
    footerContact: string;
    textVisible?: boolean;
    // Style configurations
    titleStyle?: TextStyle;
    subTextStyle?: TextStyle;
}

interface Popup {
    id: number;
    title: string;
    type?: 'image' | 'template';
    templateId?: string;
    imageUrl?: string;
    content?: CourseRecruitContent;
    link: string;
    isActive: boolean;
    position: { top: number; left: number };
    size: { width: number; height: number };
    startDate?: string;
    endDate?: string;
}

export default function AdminPopupsPage() {
    const [popups, setPopups] = useState<Popup[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false); // New uploading state
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editForm, setEditForm] = useState<Popup | null>(null);

    useEffect(() => {
        fetchPopups();
    }, []);

    const fetchPopups = async () => {
        try {
            const url = process.env.NODE_ENV === 'production' ? '/api.php?board=popups' : `/api/admin/popups?t=${Date.now()}`;
            const res = await fetch(url, { cache: 'no-store' });
            if (res.ok) {
                const data = await res.json();
                setPopups(data);
            }
        } catch (error) {
            console.error('Failed to fetch popups', error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleActive = async (id: number, currentStatus: boolean) => {
        const updatedPopups = popups.map(p =>
            p.id === id ? { ...p, isActive: !currentStatus } : p
        );
        setPopups(updatedPopups);
        await savePopups(updatedPopups);
    };

    const savePopups = async (data: Popup[]) => {
        try {
            const url = process.env.NODE_ENV === 'production' ? '/api.php?board=popups' : '/api/admin/popups';
            await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
        } catch (error) {
            console.error('Failed to save', error);
            alert('저장 실패');
        }
    };

    // New Image Upload Handler
    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, targetField: string) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const url = process.env.NODE_ENV === 'production' ? '/api.php?board=upload' : '/api/admin/upload';
            const res = await fetch(url, {
                method: 'POST',
                body: formData,
            });

            if (!res.ok) throw new Error('Upload failed');

            const data = await res.json();
            handleEditChange(targetField, data.url); // Update the specific field with the new URL
        } catch (error) {
            console.error('Upload error', error);
            alert('이미지 업로드에 실패했습니다.');
        } finally {
            setUploading(false);
            // Reset input value to allow re-uploading same file if needed
            e.target.value = '';
        }
    };

    const startEdit = (popup: Popup) => {
        setEditingId(popup.id);
        // Deep copy needed for nested content
        // Initialize default empty styles if they don't exist
        const form = JSON.parse(JSON.stringify(popup));
        if (form.content) {
            if (!form.content.titleStyle) form.content.titleStyle = {};
            if (!form.content.subTextStyle) form.content.subTextStyle = {};
        }
        setEditForm(form);
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditForm(null);
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleEditChange = (field: string, value: any) => {
        if (!editForm) return;

        if (field.includes('.')) {
            const parts = field.split('.');
            // Handle simple nested (position.top) or deeper (content.scheduleA.time)
            setEditForm(prev => {
                const newState = JSON.parse(JSON.stringify(prev)); // deep copy
                let current = newState;
                for (let i = 0; i < parts.length - 1; i++) {
                    // Create object if it doesn't exist (for deep nesting like content.titleStyle.color)
                    if (!current[parts[i]]) current[parts[i]] = {};
                    current = current[parts[i]];
                }
                current[parts[parts.length - 1]] = value;
                return newState;
            });
        } else {
            setEditForm({ ...editForm, [field]: value });
        }
    };

    const [showSuccess, setShowSuccess] = useState(false);

    const saveEdit = async () => {
        if (!editForm) return;
        const updatedPopups = popups.map(p => p.id === editForm.id ? editForm : p);
        setPopups(updatedPopups);
        await savePopups(updatedPopups);
        setEditingId(null);
        setEditForm(null);
        setShowSuccess(true);
    };

    if (loading) return <div className="p-8">Loading...</div>;

    return (
        <div className="p-8 bg-gray-50 min-h-screen font-sans">
            <h1 className="text-3xl font-extrabold mb-8 text-gray-900 border-b pb-4">팝업 관리자</h1>

            <div className="space-y-8">
                {popups.map(popup => (
                    <div key={popup.id} className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200 ring-1 ring-black/5 hover:ring-blue-400 transition-all">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-gray-50 to-white px-6 py-4 border-b flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded text-xs font-mono font-bold">ID: {popup.id}</span>
                                <h3 className="font-bold text-xl text-gray-800">{popup.title}</h3>
                                <span className={`text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${popup.type === 'template' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                                    {popup.type === 'template' ? 'TEMAPLTE' : 'IMAGE'}
                                </span>
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => handleToggleActive(popup.id, popup.isActive)}
                                    className={`px-4 py-1.5 rounded-full text-xs font-extrabold transition-all shadow-sm ${popup.isActive ? 'bg-green-500 text-white hover:bg-green-600' : 'bg-gray-200 text-gray-500 hover:bg-gray-300'}`}
                                >
                                    {popup.isActive ? '현재 노출중 ON' : '비노출 OFF'}
                                </button>
                                {editingId !== popup.id && (
                                    <button onClick={() => startEdit(popup)} className="bg-blue-600 text-white border border-blue-600 px-4 py-1.5 rounded text-xs hover:bg-blue-700 font-bold shadow-sm transition-colors">
                                        수정하기
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Content / Edit Form */}
                        <div className="p-6">
                            {editingId === popup.id && editForm ? (
                                <div className="space-y-8 animate-fadeIn">
                                    {/* 1. Basic Settings */}
                                    <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
                                        <h4 className="text-sm font-black text-gray-500 uppercase mb-4 tracking-wide">기본 설정 (Basic Settings)</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 mb-1">팝업 제목 (관리자용)</label>
                                                <input type="text" value={editForm.title} onChange={(e) => handleEditChange('title', e.target.value)} className="w-full border p-2.5 rounded shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 mb-1">링크 URL (클릭 시 이동)</label>
                                                <input type="text" value={editForm.link} onChange={(e) => handleEditChange('link', e.target.value)} className="w-full border p-2.5 rounded shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
                                            </div>
                                        </div>

                                        {/* Date Scheduling */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-white rounded border border-gray-200">
                                            <div>
                                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">📅 게시 시작일 (Start Date)</label>
                                                <input
                                                    type="date"
                                                    value={editForm.startDate || ''}
                                                    onChange={(e) => handleEditChange('startDate', e.target.value)}
                                                    className="w-full border p-2 rounded shadow-sm focus:ring-blue-500 text-sm font-mono"
                                                />
                                                <p className="text-[10px] text-gray-400 mt-1">* 설정 안하면 즉시 노출</p>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">📅 게시 종료일 (End Date)</label>
                                                <input
                                                    type="date"
                                                    value={editForm.endDate || ''}
                                                    onChange={(e) => handleEditChange('endDate', e.target.value)}
                                                    className="w-full border p-2 rounded shadow-sm focus:ring-blue-500 text-sm font-mono"
                                                />
                                                <p className="text-[10px] text-gray-400 mt-1">* 설정 안하면 계속 노출</p>
                                            </div>
                                        </div>

                                        {/* Positioning Sliders for "Mouse Control" feel */}
                                        <div className="mt-8 bg-slate-100 p-6 rounded-xl border border-slate-200 shadow-inner">
                                            <h5 className="flex items-center gap-2 text-sm font-black text-slate-700 mb-5 uppercase tracking-wider border-b border-slate-200 pb-2">
                                                <span>🎛️ 레이아웃 정밀 제어 (Layout Control)</span>
                                            </h5>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                                                {/* Position Control Group */}
                                                <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 transition-shadow hover:shadow-md">
                                                    <div className="flex items-center justify-between mb-4">
                                                        <span className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1">📍 위치 (Position)</span>
                                                        <span className="text-xs font-mono text-blue-600 bg-blue-50 px-2 py-1 rounded font-bold border border-blue-100">
                                                            X: {editForm.position.left} / Y: {editForm.position.top}
                                                        </span>
                                                    </div>
                                                    <div className="space-y-6">
                                                        <div className="relative pt-1">
                                                            <div className="flex justify-between text-xs mb-2 font-bold text-slate-600">
                                                                <span>가로 이동 (Left)</span>
                                                                <span>{editForm.position.left}px</span>
                                                            </div>
                                                            <input
                                                                type="range"
                                                                min="0"
                                                                max="1600"
                                                                step="10"
                                                                value={editForm.position.left}
                                                                onChange={(e) => handleEditChange('position.left', Number(e.target.value))}
                                                                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600 hover:accent-blue-500 touch-none"
                                                            />
                                                            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                                                                <span>0</span>
                                                                <span>1600</span>
                                                            </div>
                                                        </div>
                                                        <div className="relative pt-1">
                                                            <div className="flex justify-between text-xs mb-2 font-bold text-slate-600">
                                                                <span>세로 이동 (Top)</span>
                                                                <span>{editForm.position.top}px</span>
                                                            </div>
                                                            <input
                                                                type="range"
                                                                min="0"
                                                                max="1000"
                                                                step="10"
                                                                value={editForm.position.top}
                                                                onChange={(e) => handleEditChange('position.top', Number(e.target.value))}
                                                                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600 hover:accent-blue-500 touch-none"
                                                            />
                                                            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                                                                <span>0</span>
                                                                <span>1000</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Size Control Group */}
                                                <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 transition-shadow hover:shadow-md">
                                                    <div className="flex items-center justify-between mb-4">
                                                        <span className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1">📐 크기 (Size)</span>
                                                        <span className="text-xs font-mono text-purple-600 bg-purple-50 px-2 py-1 rounded font-bold border border-purple-100">
                                                            {editForm.size.width} x {editForm.size.height}
                                                        </span>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div>
                                                            <label className="text-xs block mb-2 font-bold text-slate-600">너비 (Width)</label>
                                                            <div className="flex items-center gap-2 relative">
                                                                <input
                                                                    type="number"
                                                                    value={editForm.size.width}
                                                                    onChange={(e) => handleEditChange('size.width', Number(e.target.value))}
                                                                    className="w-full border-2 border-slate-100 p-2.5 rounded-lg text-center font-black text-slate-700 focus:border-purple-400 focus:ring-0 outline-none text-lg transition-colors"
                                                                />
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <label className="text-xs block mb-2 font-bold text-slate-600">높이 (Height)</label>
                                                            <div className="flex items-center gap-2 relative">
                                                                <input
                                                                    type="number"
                                                                    value={editForm.size.height}
                                                                    onChange={(e) => handleEditChange('size.height', Number(e.target.value))}
                                                                    className="w-full border-2 border-slate-100 p-2.5 rounded-lg text-center font-black text-slate-700 focus:border-purple-400 focus:ring-0 outline-none text-lg transition-colors"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="mt-4 text-center">
                                                        <p className="text-[11px] text-slate-400 bg-slate-50 py-2 rounded-lg">
                                                            px 단위로 입력하세요 (기본: 500x500)
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* 2. Content Editing */}
                                    {editForm.type === 'template' && editForm.content ? (
                                        <div className="bg-yellow-50/50 p-6 rounded-lg border border-yellow-200 ring-1 ring-yellow-100">
                                            <div className="flex justify-between items-center mb-4 border-b border-yellow-200 pb-2">
                                                <h4 className="text-sm font-black text-yellow-800 uppercase tracking-wide">템플릿 내용 상세 수정</h4>
                                                <label className="flex items-center gap-2 cursor-pointer bg-white px-3 py-1 rounded-full border border-yellow-300 shadow-sm hover:bg-yellow-100 transition-colors">
                                                    <input
                                                        type="checkbox"
                                                        checked={editForm.content.textVisible !== false}
                                                        onChange={(e) => handleEditChange('content.textVisible', e.target.checked)}
                                                        className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500"
                                                    />
                                                    <span className="text-xs font-bold text-gray-800">텍스트(제목/내용) 표시하기</span>
                                                </label>
                                            </div>

                                            <div className="grid md:grid-cols-2 gap-6 mb-6">
                                                <div>
                                                    <label className="block text-xs font-bold text-gray-600 mb-1">메인 타이틀 (큰 제목)</label>
                                                    <input type="text" value={editForm.content.title} onChange={(e) => handleEditChange('content.title', e.target.value)} className="w-full border p-2 rounded focus:ring-2 focus:ring-yellow-400 outline-none" />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-bold text-gray-600 mb-1">뱃지 텍스트 (좌측 상단)</label>
                                                    <input type="text" value={editForm.content.badgeText} onChange={(e) => handleEditChange('content.badgeText', e.target.value)} className="w-full border p-2 rounded focus:ring-2 focus:ring-yellow-400 outline-none" />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-bold text-gray-600 mb-1">서브 텍스트 (제목 위 강조)</label>
                                                    <input type="text" value={editForm.content.subText} onChange={(e) => handleEditChange('content.subText', e.target.value)} className="w-full border p-2 rounded focus:ring-2 focus:ring-yellow-400 outline-none" />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-bold text-gray-600 mb-1">배경 이미지 URL</label>
                                                    <div className="flex gap-2">
                                                        <input type="text" value={editForm.content.mainImage} onChange={(e) => handleEditChange('content.mainImage', e.target.value)} className="w-full border p-2 rounded focus:ring-2 focus:ring-yellow-400 outline-none" placeholder="/img/..." />
                                                        <label className={`whitespace-nowrap px-3 py-2 bg-yellow-500 text-white text-xs font-bold rounded cursor-pointer hover:bg-yellow-600 transition-colors flex items-center ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
                                                            {uploading ? '🔄' : '📁 내 PC에서 찾기'}
                                                            <input
                                                                type="file"
                                                                className="hidden"
                                                                accept="image/*"
                                                                onChange={(e) => handleImageUpload(e, 'content.mainImage')}
                                                            />
                                                        </label>
                                                    </div>
                                                    {editForm.content.mainImage && (
                                                        <div className="relative mt-2 h-20 w-32 border rounded overflow-hidden">
                                                            <Image
                                                                src={editForm.content.mainImage}
                                                                alt="Preview"
                                                                fill
                                                                className="object-cover"
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Style Controls */}
                                            <div className="bg-white p-5 rounded-lg border border-gray-200 mb-6 relative overflow-hidden">
                                                <div className="absolute top-0 right-0 p-2 opacity-10 pointer-events-none text-4xl">🎨</div>
                                                <h5 className="text-xs font-black text-slate-700 mb-4 uppercase tracking-wider border-b pb-2 flex items-center gap-2">
                                                    🎨 텍스트 스타일 상세 설정 (Text Style)
                                                </h5>

                                                <div className="grid md:grid-cols-2 gap-6">
                                                    {/* Title Style Control */}
                                                    <div className="space-y-3">
                                                        <label className="text-xs font-bold text-blue-600 bg-blue-50 inline-block px-2 py-0.5 rounded">메인 타이틀 스타일</label>
                                                        <div className="flex items-center gap-3">
                                                            <div className="flex-1">
                                                                <label className="text-[10px] text-gray-500 block mb-1">색상 (Color)</label>
                                                                <div className="flex items-center gap-2">
                                                                    <input
                                                                        type="color"
                                                                        value={editForm.content.titleStyle?.color || '#ffffff'}
                                                                        onChange={(e) => handleEditChange('content.titleStyle.color', e.target.value)}
                                                                        className="w-8 h-8 rounded border p-0.5 cursor-pointer"
                                                                    />
                                                                    <input
                                                                        type="text"
                                                                        value={editForm.content.titleStyle?.color || '#ffffff'}
                                                                        onChange={(e) => handleEditChange('content.titleStyle.color', e.target.value)}
                                                                        className="w-full text-xs border p-1.5 rounded uppercase font-mono"
                                                                    />
                                                                </div>
                                                            </div>
                                                            <div className="w-20">
                                                                <label className="text-[10px] text-gray-500 block mb-1">크기 (px)</label>
                                                                <input
                                                                    type="number"
                                                                    value={parseInt(String(editForm.content.titleStyle?.fontSize || 36))}
                                                                    onChange={(e) => handleEditChange('content.titleStyle.fontSize', parseInt(e.target.value))}
                                                                    className="w-full text-xs border p-1.5 rounded text-center font-bold"
                                                                />
                                                            </div>
                                                            <div className="w-auto flex flex-col items-center">
                                                                <label className="text-[10px] text-gray-500 block mb-1">굵게</label>
                                                                <input
                                                                    type="checkbox"
                                                                    checked={editForm.content.titleStyle?.fontWeight === 'bold' || editForm.content.titleStyle?.fontWeight === '900'}
                                                                    onChange={(e) => handleEditChange('content.titleStyle.fontWeight', e.target.checked ? '900' : 'normal')}
                                                                    className="w-5 h-5 accent-blue-600"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* SubText Style Control */}
                                                    <div className="space-y-3">
                                                        <label className="text-xs font-bold text-orange-600 bg-orange-50 inline-block px-2 py-0.5 rounded">서브 텍스트(강조) 스타일</label>
                                                        <div className="flex items-center gap-3">
                                                            <div className="flex-1">
                                                                <label className="text-[10px] text-gray-500 block mb-1">색상 (Color)</label>
                                                                <div className="flex items-center gap-2">
                                                                    <input
                                                                        type="color"
                                                                        value={editForm.content.subTextStyle?.color || '#facc15'}
                                                                        onChange={(e) => handleEditChange('content.subTextStyle.color', e.target.value)}
                                                                        className="w-8 h-8 rounded border p-0.5 cursor-pointer"
                                                                    />
                                                                    <input
                                                                        type="text"
                                                                        value={editForm.content.subTextStyle?.color || '#facc15'}
                                                                        onChange={(e) => handleEditChange('content.subTextStyle.color', e.target.value)}
                                                                        className="w-full text-xs border p-1.5 rounded uppercase font-mono"
                                                                    />
                                                                </div>
                                                            </div>
                                                            <div className="w-20">
                                                                <label className="text-[10px] text-gray-500 block mb-1">크기 (px)</label>
                                                                <input
                                                                    type="number"
                                                                    value={parseInt(String(editForm.content.subTextStyle?.fontSize || 14))}
                                                                    onChange={(e) => handleEditChange('content.subTextStyle.fontSize', parseInt(e.target.value))}
                                                                    className="w-full text-xs border p-1.5 rounded text-center font-bold"
                                                                />
                                                            </div>
                                                            <div className="w-auto flex flex-col items-center">
                                                                <label className="text-[10px] text-gray-500 block mb-1">굵게</label>
                                                                <input
                                                                    type="checkbox"
                                                                    checked={editForm.content.subTextStyle?.fontWeight !== 'normal'} // Default is bold, so checked if not 'normal'
                                                                    onChange={(e) => handleEditChange('content.subTextStyle.fontWeight', e.target.checked ? 'bold' : 'normal')}
                                                                    className="w-5 h-5 accent-orange-600"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Schedule Editors */}
                                            <div className="grid md:grid-cols-2 gap-6">
                                                {/* Schedule A */}
                                                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm relative overflow-hidden group">
                                                    <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                                                    <label className="font-bold text-sm text-blue-800 block mb-3 flex items-center gap-2">
                                                        <span className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-xs">A</span>
                                                        일정 A (좌측/상단)
                                                    </label>
                                                    <div className="space-y-3">
                                                        <div>
                                                            <label className="text-[10px] uppercase font-bold text-gray-400">라벨 (예: 오전반)</label>
                                                            <input type="text" value={editForm.content.scheduleA.label} onChange={(e) => handleEditChange('content.scheduleA.label', e.target.value)} className="w-full border p-2 rounded text-sm font-bold" />
                                                        </div>
                                                        <div>
                                                            <label className="text-[10px] uppercase font-bold text-gray-400">기간 (예: 1.29 ~ 2.10)</label>
                                                            <input type="text" value={editForm.content.scheduleA.period} onChange={(e) => handleEditChange('content.scheduleA.period', e.target.value)} className="w-full border p-2 rounded text-sm" />
                                                        </div>
                                                        <div>
                                                            <label className="text-[10px] uppercase font-bold text-gray-400">시간 (예: 월수금 9:00)</label>
                                                            <input type="text" value={editForm.content.scheduleA.time} onChange={(e) => handleEditChange('content.scheduleA.time', e.target.value)} className="w-full border p-2 rounded text-sm bg-yellow-50" />
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Schedule B */}
                                                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm relative overflow-hidden group">
                                                    <div className="absolute top-0 left-0 w-1 h-full bg-purple-500"></div>
                                                    <label className="font-bold text-sm text-purple-800 block mb-3 flex items-center gap-2">
                                                        <span className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center text-xs">B</span>
                                                        일정 B (우측/하단)
                                                    </label>
                                                    <div className="space-y-3">
                                                        <div>
                                                            <label className="text-[10px] uppercase font-bold text-gray-400">라벨 (예: 저녁반)</label>
                                                            <input type="text" value={editForm.content.scheduleB.label} onChange={(e) => handleEditChange('content.scheduleB.label', e.target.value)} className="w-full border p-2 rounded text-sm font-bold" />
                                                        </div>
                                                        <div>
                                                            <label className="text-[10px] uppercase font-bold text-gray-400">기간</label>
                                                            <input type="text" value={editForm.content.scheduleB.period} onChange={(e) => handleEditChange('content.scheduleB.period', e.target.value)} className="w-full border p-2 rounded text-sm" />
                                                        </div>
                                                        <div>
                                                            <label className="text-[10px] uppercase font-bold text-gray-400">시간</label>
                                                            <input type="text" value={editForm.content.scheduleB.time} onChange={(e) => handleEditChange('content.scheduleB.time', e.target.value)} className="w-full border p-2 rounded text-sm bg-yellow-50" />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="mt-6">
                                                <label className="block text-xs font-bold text-gray-600 mb-1">하단 문구 (연락처/안내)</label>
                                                <input type="text" value={editForm.content.footerContact} onChange={(e) => handleEditChange('content.footerContact', e.target.value)} className="w-full border p-2 rounded" />
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="bg-gray-50 p-6 rounded-lg border text-center">
                                            <label className="block text-sm font-bold text-gray-700 mb-2">이미지 URL</label>
                                            <div className="flex gap-2 mb-4">
                                                <input type="text" value={editForm.imageUrl} onChange={(e) => handleEditChange('imageUrl', e.target.value)} className="w-full border p-2 rounded" />
                                                <label className={`whitespace-nowrap px-3 py-2 bg-gray-600 text-white text-xs font-bold rounded cursor-pointer hover:bg-gray-700 transition-colors flex items-center ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
                                                    {uploading ? '🔄' : '📁 파일 선택'}
                                                    <input
                                                        type="file"
                                                        className="hidden"
                                                        accept="image/*"
                                                        onChange={(e) => handleImageUpload(e, 'imageUrl')}
                                                    />
                                                </label>
                                            </div>
                                            {editForm.imageUrl ? (
                                                <div className="relative h-64 mx-auto w-full">
                                                    <Image
                                                        src={editForm.imageUrl}
                                                        alt="Pop-up Preview"
                                                        fill
                                                        className="object-contain bg-gray-200 rounded shadow-sm"
                                                    />
                                                </div>
                                            ) : (
                                                <div className="h-40 bg-gray-200 rounded flex items-center justify-center text-gray-400">이미지 미리보기</div>
                                            )}
                                        </div>
                                    )}

                                    <div className="flex justify-end gap-3 pt-6 border-t">
                                        <button onClick={saveEdit} className="bg-blue-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-blue-700 shadow-lg transform active:scale-95 transition-all">
                                            저장 및 적용
                                        </button>
                                        <button onClick={cancelEdit} className="bg-white border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-bold hover:bg-gray-50 transition-all">
                                            취소
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                // View Mode
                                <div className="grid md:grid-cols-2 gap-8 items-center cursor-pointer group" onClick={() => startEdit(popup)}>
                                    <div className="bg-gray-100 p-2 rounded-lg border border-gray-200 flex items-center justify-center h-[200px] relative overflow-hidden group-hover:border-blue-300 transition-colors">
                                        {/* Preview Thumbnail */}
                                        {popup.type === 'template' && popup.content?.mainImage ? (
                                            <>
                                                <Image
                                                    src={popup.content.mainImage}
                                                    alt={popup.content.title}
                                                    fill
                                                    className="object-cover opacity-90"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-4 text-white z-10">
                                                    <div className="font-bold text-lg leading-tight">{popup.content.title}</div>
                                                    <div className="text-xs opacity-75 mt-1">{popup.content.badgeText}</div>
                                                </div>
                                            </>
                                        ) : popup.imageUrl ? (
                                            <Image
                                                src={popup.imageUrl}
                                                alt={popup.title}
                                                fill
                                                className="object-contain"
                                            />
                                        ) : (
                                            <div className="text-gray-400 font-bold">이미지 없음</div>
                                        )}
                                        {/* Edit Overlay */}
                                        <div className="absolute inset-0 bg-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <span className="bg-white text-blue-600 px-3 py-1 rounded-full font-bold shadow-sm text-xs border border-blue-200">클릭하여 수정</span>
                                        </div>
                                    </div>
                                    <div className="space-y-3 text-sm text-gray-600">
                                        <div className="flex justify-between border-b pb-2">
                                            <span className="font-bold text-gray-900">링크</span>
                                            <span className="text-blue-600 truncate max-w-[200px]">{popup.link}</span>
                                        </div>
                                        <div className="flex justify-between border-b pb-2">
                                            <span className="font-bold text-gray-900">위치</span>
                                            <span>Top: {popup.position.top}px / Left: {popup.position.left}px</span>
                                        </div>
                                        <div className="flex justify-between border-b pb-2">
                                            <span className="font-bold text-gray-900">크기</span>
                                            <span>{popup.size.width} x {popup.size.height}</span>
                                        </div>
                                        {popup.type === 'template' && (
                                            <div className="bg-yellow-50 p-2 rounded text-xs">
                                                <div className="font-bold text-yellow-800 mb-1">일정 미리보기</div>
                                                <div>A: {popup.content?.scheduleA?.period} ({popup.content?.scheduleA?.time})</div>
                                                <div>B: {popup.content?.scheduleB?.period} ({popup.content?.scheduleB?.time})</div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Floating Info */}
            <div className="fixed bottom-8 right-8 bg-white p-4 rounded-lg shadow-xl border border-gray-200 max-w-sm text-xs text-gray-600 z-50 animate-bounce-slow hidden md:block">
                <h6 className="font-bold text-gray-800 mb-2">💡 도움말</h6>
                <p className="mb-1">• 팝업 이미지를 클릭하면 바로 수정할 수 있습니다.</p>
                <p className="mb-1">• <strong>&quot;텍스트 표시하기&quot;</strong> 체크박스를 끄면, 글자 없이 이미지만 보여줄 수 있습니다.</p>
                <p>• 위치 조절 시 슬라이더를 사용하여 마우스로 쉽게 이동하세요.</p>
            </div>

            <SuccessModal
                isOpen={showSuccess}
                onClose={() => setShowSuccess(false)}
                title="저장 완료"
                message="팝업 설정이 성공적으로 저장되었습니다."
            />
        </div>
    );
}
