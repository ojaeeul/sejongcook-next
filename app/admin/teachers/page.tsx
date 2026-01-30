'use client';

import { useState, useEffect } from 'react';
import { Save, Plus, Trash2, ArrowUp, ArrowDown, Edit2, X, Image as ImageIcon } from 'lucide-react';

interface Teacher {
    id: number;
    name: string;
    role: string;
    description: string;
    image: string;
    order: number;
}

export default function AdminTeachersPage() {
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditing, setIsEditing] = useState<number | null>(null); // ID of teacher being edited, or -1 for new
    const [editForm, setEditForm] = useState<Partial<Teacher>>({});

    // Fetch teachers on mount
    useEffect(() => {
        fetchTeachers();
    }, []);

    const fetchTeachers = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/teachers');
            if (res.ok) {
                const data = await res.json();
                setTeachers(data);
            }
        } catch (error) {
            console.error("Failed to fetch teachers:", error);
            alert("강사 목록을 불러오는데 실패했습니다.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        if (!editForm.name || !editForm.role) {
            alert("이름과 직책은 필수 입력항목입니다.");
            return;
        }

        let newTeachers = [...teachers];

        if (isEditing === -1) {
            // Add new
            const newId = Math.max(...teachers.map(t => t.id), 0) + 1;
            const newOrder = Math.max(...teachers.map(t => t.order || 0), 0) + 1;
            newTeachers.push({
                id: newId,
                name: editForm.name || '',
                role: editForm.role || '',
                description: editForm.description || '',
                image: editForm.image || '',
                order: newOrder
            });
        } else {
            // Update existing
            newTeachers = newTeachers.map(t =>
                t.id === isEditing ? { ...t, ...editForm } as Teacher : t
            );
        }

        await saveTeachers(newTeachers);
        setIsEditing(null);
        setEditForm({});
    };

    const saveTeachers = async (updatedTeachers: Teacher[]) => {
        try {
            const res = await fetch('/api/teachers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedTeachers),
            });

            if (res.ok) {
                setTeachers(updatedTeachers);
            } else {
                alert("저장에 실패했습니다.");
            }
        } catch (error) {
            console.error("Save error:", error);
            alert("저장 중 오류가 발생했습니다.");
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("정말로 삭제하시겠습니까?")) return;
        const newTeachers = teachers.filter(t => t.id !== id);
        await saveTeachers(newTeachers);
    };

    const handleMove = async (index: number, direction: 'up' | 'down') => {
        if (direction === 'up' && index === 0) return;
        if (direction === 'down' && index === teachers.length - 1) return;

        const newTeachers = [...teachers];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;

        // Swap
        [newTeachers[index], newTeachers[targetIndex]] = [newTeachers[targetIndex], newTeachers[index]];

        // Update order property
        newTeachers.forEach((t, i) => t.order = i + 1);

        await saveTeachers(newTeachers);
    };

    const startEdit = (teacher: Teacher) => {
        setIsEditing(teacher.id);
        setEditForm({ ...teacher });
    };

    const startAdd = () => {
        setIsEditing(-1);
        setEditForm({ image: '' });
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setEditForm(prev => ({ ...prev, image: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="space-y-6 max-w-[1000px] mx-auto pb-20 p-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">강사 소개 관리</h1>
                    <p className="text-sm text-gray-500 mt-1">강사 프로필을 등록, 수정, 삭제하고 순서를 변경할 수 있습니다.</p>
                </div>
                <button
                    onClick={startAdd}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold transition-colors"
                    disabled={isEditing !== null}
                >
                    <Plus className="w-4 h-4" />
                    강사 추가
                </button>
            </div>

            {/* Editor Form */}
            {isEditing !== null && (
                <div className="bg-white rounded-xl shadow-lg border-2 border-blue-100 p-6 mb-8 animate-in fade-in slide-in-from-top-4">
                    <div className="flex justify-between items-center mb-6 border-b pb-4">
                        <h2 className="text-lg font-bold text-gray-800">
                            {isEditing === -1 ? '새 강사 등록' : '강사 정보 수정'}
                        </h2>
                        <button onClick={() => setIsEditing(null)} className="text-gray-400 hover:text-gray-600">
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Image Uploader */}
                        <div className="space-y-4">
                            <label className="block text-sm font-bold text-gray-700">프로필 사진</label>
                            <div className="aspect-[3/4] bg-gray-100 rounded-lg overflow-hidden border border-gray-200 relative group">
                                {editForm.image ? (
                                    <div className="relative w-full h-full">
                                        <img
                                            src={editForm.image}
                                            alt="Preview"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                                        <ImageIcon className="w-12 h-12 mb-2" />
                                        <span className="text-xs">이미지 없음</span>
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <label className="cursor-pointer px-4 py-2 bg-white text-gray-800 rounded font-bold text-sm hover:bg-gray-100">
                                        사진 변경
                                        <input type="file" hidden accept="image/*" onChange={handleImageChange} />
                                    </label>
                                </div>
                            </div>
                            <p className="text-xs text-gray-500 text-center">
                                권장 비율: 3:4 (세로형)<br />
                                권장 크기: 600x800px 이상
                            </p>
                        </div>

                        {/* Text Fields */}
                        <div className="md:col-span-2 space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">이름 (Name)</label>
                                <input
                                    type="text"
                                    value={editForm.name || ''}
                                    onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="예: 홍길동 (Hong Gil Dong)"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">직책/역할 (Role)</label>
                                <input
                                    type="text"
                                    value={editForm.role || ''}
                                    onChange={e => setEditForm({ ...editForm, role: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="예: 제과제빵 전임강사"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">소개글 (Description)</label>
                                <textarea
                                    value={editForm.description || ''}
                                    onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none h-32 resize-none"
                                    placeholder="강사 소개글을 입력하세요."
                                />
                            </div>
                            <div className="flex justify-end gap-2 pt-4">
                                <button
                                    onClick={() => setIsEditing(null)}
                                    className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg font-bold hover:bg-gray-200"
                                >
                                    취소
                                </button>
                                <button
                                    onClick={handleSave}
                                    className="px-6 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 flex items-center gap-2"
                                >
                                    <Save className="w-4 h-4" />
                                    저장하기
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* List */}
            <div className="grid gap-4">
                {isLoading ? (
                    <div className="text-center py-10 text-gray-500">로딩 중...</div>
                ) : teachers.length === 0 ? (
                    <div className="text-center py-20 bg-gray-50 rounded-xl border border-dashed border-gray-300 text-gray-500">
                        등록된 강사가 없습니다. &apos;강사 추가&apos; 버튼을 눌러 등록해주세요.
                    </div>
                ) : (
                    teachers.map((teacher, index) => (
                        <div
                            key={teacher.id}
                            className={`bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex items-center gap-6 transition-opacity ${isEditing !== null && isEditing !== teacher.id ? 'opacity-50 pointer-events-none' : ''}`}
                        >
                            <div className="w-[80px] h-[100px] bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 border border-gray-200">
                                {teacher.image ? (
                                    <img src={teacher.image} alt={teacher.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                                        <ImageIcon className="w-6 h-6" />
                                    </div>
                                )}
                            </div>

                            <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-lg text-gray-800">{teacher.name}</h3>
                                <p className="text-blue-600 font-medium text-sm mb-1">{teacher.role}</p>
                                <p className="text-gray-500 text-sm line-clamp-2">{teacher.description}</p>
                            </div>

                            <div className="flex items-center gap-2">
                                <div className="flex flex-col gap-1 mr-2">
                                    <button
                                        onClick={() => handleMove(index, 'up')}
                                        disabled={index === 0}
                                        className="p-1 text-gray-400 hover:text-blue-600 disabled:opacity-30 disabled:hover:text-gray-400"
                                    >
                                        <ArrowUp className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => handleMove(index, 'down')}
                                        disabled={index === teachers.length - 1}
                                        className="p-1 text-gray-400 hover:text-blue-600 disabled:opacity-30 disabled:hover:text-gray-400"
                                    >
                                        <ArrowDown className="w-5 h-5" />
                                    </button>
                                </div>

                                <button
                                    onClick={() => startEdit(teacher)}
                                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
                                    title="수정"
                                >
                                    <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => handleDelete(teacher.id)}
                                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-red-100"
                                    title="삭제"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
