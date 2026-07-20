'use client';

import { useState, useEffect } from 'react';
import { Save, Plus, Trash2, GripVertical, AlertCircle, RefreshCw } from 'lucide-react';
import Link from 'next/link';

interface Category {
  category: string;
  icon: string;
  courses: string[];
}

export default function InquirySettingsPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const res = await fetch('/api/admin/data/inquiry-courses?_t=' + Date.now());
            if (!res.ok) throw new Error('Failed to fetch data');
            const data = await res.json();
            setCategories(data);
        } catch (error) {
            console.error(error);
            setMessage({ text: '데이터를 불러오는데 실패했습니다.', type: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            setIsSaving(true);
            setMessage({ text: '', type: '' });
            
            const res = await fetch('/api/admin/data/inquiry-courses', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(categories),
            });
            
            if (!res.ok) throw new Error('Failed to save data');
            
            setMessage({ text: '성공적으로 저장되었습니다. (실제 페이지에 반영됩니다)', type: 'success' });
            
            setTimeout(() => setMessage({ text: '', type: '' }), 3000);
        } catch (error) {
            console.error(error);
            setMessage({ text: '저장하는데 실패했습니다.', type: 'error' });
        } finally {
            setIsSaving(false);
        }
    };

    const handleCategoryChange = (index: number, field: keyof Category, value: string) => {
        const newCategories = [...categories];
        if (field === 'category' || field === 'icon') {
             // @ts-ignore
             newCategories[index][field] = value;
        }
        setCategories(newCategories);
    };

    const handleCourseChange = (catIndex: number, courseIndex: number, value: string) => {
        const newCategories = [...categories];
        newCategories[catIndex].courses[courseIndex] = value;
        setCategories(newCategories);
    };

    const addCourse = (catIndex: number) => {
        const newCategories = [...categories];
        newCategories[catIndex].courses.push('새 과목');
        setCategories(newCategories);
    };

    const removeCourse = (catIndex: number, courseIndex: number) => {
        if (!confirm('이 과목을 삭제하시겠습니까?')) return;
        const newCategories = [...categories];
        newCategories[catIndex].courses.splice(courseIndex, 1);
        setCategories(newCategories);
    };

    const addCategory = () => {
        setCategories([
            ...categories,
            { category: '새 카테고리', icon: '✨', courses: ['새 과목'] }
        ]);
    };

    const removeCategory = (index: number) => {
        if (!confirm('이 카테고리와 포함된 모든 과목을 삭제하시겠습니까?')) return;
        const newCategories = [...categories];
        newCategories.splice(index, 1);
        setCategories(newCategories);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex justify-center items-center">
                <div className="flex flex-col items-center">
                    <RefreshCw className="animate-spin h-8 w-8 text-orange-500 mb-2" />
                    <p className="text-gray-500">데이터를 불러오는 중입니다...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6 md:p-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
                            ⚙️ 수강신청 과정 설정
                        </h1>
                        <p className="text-gray-500 mt-2 text-sm">
                            상담/수강신청 페이지에서 사용자가 선택할 수 있는 과정명(체크박스)을 동적으로 관리합니다.
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Link href="/" className="bg-gray-600 text-white px-4 py-2.5 rounded-lg hover:bg-gray-700 transition-colors">홈으로</Link>
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2.5 rounded-lg flex items-center gap-2 font-medium transition-colors shadow-sm disabled:opacity-50"
                        >
                            {isSaving ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                            {isSaving ? '저장 중...' : '변경사항 저장'}
                        </button>
                    </div>
                </div>

                {message.text && (
                    <div className={`mb-6 p-4 rounded-lg flex items-center gap-2 ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                        <AlertCircle className="w-5 h-5" />
                        <span>{message.text}</span>
                    </div>
                )}

                <div className="space-y-6">
                    {categories.map((cat, catIndex) => (
                        <div key={catIndex} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="bg-gray-50 p-4 border-b border-gray-200 flex items-center justify-between gap-4">
                                <div className="flex items-center gap-3 flex-1">
                                    <div className="flex items-center gap-2">
                                        <label className="text-xs text-gray-500 uppercase font-bold tracking-wider">아이콘</label>
                                        <input
                                            type="text"
                                            value={cat.icon}
                                            onChange={(e) => handleCategoryChange(catIndex, 'icon', e.target.value)}
                                            className="w-12 h-10 text-center border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white"
                                            placeholder="아이콘"
                                        />
                                    </div>
                                    <div className="flex-1 flex items-center gap-2">
                                        <label className="text-xs text-gray-500 uppercase font-bold tracking-wider whitespace-nowrap">카테고리명</label>
                                        <input
                                            type="text"
                                            value={cat.category}
                                            onChange={(e) => handleCategoryChange(catIndex, 'category', e.target.value)}
                                            className="w-full h-10 px-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white font-bold text-gray-800"
                                            placeholder="카테고리명"
                                        />
                                    </div>
                                </div>
                                <button
                                    onClick={() => removeCategory(catIndex)}
                                    className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                    title="카테고리 삭제"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="p-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
                                    {cat.courses.map((course, courseIndex) => (
                                        <div key={courseIndex} className="flex items-center gap-2 bg-gray-50 p-2 rounded-md border border-gray-100 group hover:border-gray-300 transition-colors">
                                            <GripVertical className="w-4 h-4 text-gray-400 cursor-move" />
                                            <input
                                                type="text"
                                                value={course}
                                                onChange={(e) => handleCourseChange(catIndex, courseIndex, e.target.value)}
                                                className="flex-1 min-w-0 bg-transparent border-none p-1 focus:ring-0 text-sm font-medium text-gray-700"
                                                placeholder="과목명"
                                            />
                                            <button
                                                onClick={() => removeCourse(catIndex, courseIndex)}
                                                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-white rounded transition-colors opacity-0 group-hover:opacity-100"
                                                title="과목 삭제"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                                
                                <button
                                    onClick={() => addCourse(catIndex)}
                                    className="flex items-center gap-1.5 text-sm font-medium text-orange-600 hover:text-orange-700 hover:bg-orange-50 px-3 py-1.5 rounded-md transition-colors"
                                >
                                    <Plus className="w-4 h-4" />
                                    과목 추가하기
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-6 flex justify-center">
                    <button
                        onClick={addCategory}
                        className="flex items-center gap-2 bg-white border-2 border-dashed border-gray-300 text-gray-600 hover:border-orange-500 hover:text-orange-600 px-6 py-3 rounded-xl font-medium transition-colors w-full justify-center"
                    >
                        <Plus className="w-5 h-5" />
                        새 카테고리 그룹 추가
                    </button>
                </div>
            </div>
        </div>
    );
}
