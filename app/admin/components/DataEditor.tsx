
'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';
import SuccessModal from '@/components/SuccessModal';
import { supabase } from '@/lib/supabase';

// Dynamically import SunEditor to avoid SSR issues
const SunEditor = dynamic(() => import('suneditor-react'), {
    ssr: false,
});
import 'suneditor/dist/css/suneditor.min.css';

interface DataEditorProps {
    title: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    initialData?: any;
    type: string; // 'notice', 'review', etc.
    backLink: string;
}

export default function DataEditor({ title, initialData, type, backLink }: DataEditorProps) {
    const router = useRouter();
    const [formData, setFormData] = useState({
        title: initialData?.title || '',
        author: initialData?.author || 'Admin',
        date: initialData?.date || new Date().toISOString().split('T')[0],
        content: initialData?.content || '',
        ...initialData // spread other fields if any
    });
    const [loading, setLoading] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const onImageUploadBefore = (files: File[], info: object, uploadHandler: (response: any) => void) => {
        // TODO: Implement Supabase Storage Upload
        // For now, alerting user that image upload requires storage setup
        alert("Image upload via Supabase Storage is not yet implemented.");
        uploadHandler({ errorMessage: "Not implemented" });
        return undefined;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (type === 'baking') {
                // Use JSON API for Baking
                const res = await fetch('/api/admin/data/baking', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        id: initialData?.id,
                        title: formData.title,
                        author: formData.author,
                        content: formData.content,
                        category: initialData?.category || '갤러리', // Default to Gallery
                    })
                });

                if (!res.ok) throw new Error("Failed to save via API");
            } else {
                // Legacy Supabase for others
                const postData = {
                    title: formData.title,
                    author: formData.author,
                    content: formData.content,
                    board_type: type,
                    updated_at: new Date().toISOString(),
                };

                let error;

                if (initialData?.id) {
                    const { error: updateError } = await supabase
                        .from('posts')
                        .update(postData)
                        .eq('id', initialData.id);
                    error = updateError;
                } else {
                    const { error: insertError } = await supabase
                        .from('posts')
                        .insert([{
                            ...postData,
                            created_at: new Date().toISOString(),
                            view_count: 0
                        }]);
                    error = insertError;
                }

                if (error) throw error;
            }

            setShowSuccessModal(true);
        } catch (error) {
            alert('저장에 실패했습니다: ' + (error as Error).message);
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmSuccess = () => {
        router.push(backLink);
        router.refresh();
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href={backLink} className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600">
                        <ArrowLeft size={20} />
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">제목</label>
                            <input
                                type="text"
                                required
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="제목을 입력하세요"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">작성자</label>
                            <input
                                type="text"
                                value={formData.author}
                                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>

                        {type === 'qna' && (
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">상태</label>
                                <select
                                    value={formData.status || '대기중'}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="대기중">대기중</option>
                                    <option value="답변완료">답변완료</option>
                                </select>
                            </div>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">내용</label>
                        <SunEditor
                            setContents={formData.content}
                            onChange={(content) => setFormData({ ...formData, content: content })}
                            onImageUploadBefore={onImageUploadBefore}
                            setOptions={{
                                height: '400px',
                                buttonList: [
                                    ['undo', 'redo'],
                                    ['font', 'fontSize', 'formatBlock'],
                                    ['bold', 'underline', 'italic', 'strike', 'subscript', 'superscript'],
                                    ['fontColor', 'hiliteColor', 'textStyle'],
                                    ['removeFormat'],
                                    ['outdent', 'indent'],
                                    ['align', 'horizontalRule', 'list', 'lineHeight'],
                                    ['table', 'link', 'image', 'video'],
                                    ['fullScreen', 'showBlocks', 'codeView']
                                ]
                            }}
                        />
                    </div>

                    <div className="flex justify-end pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50"
                        >
                            <Save size={18} />
                            {loading ? '저장 중...' : '변경사항 저장'}
                        </button>
                    </div>
                </form>
            </div>

            {/* Success Modal */}
            <SuccessModal
                isOpen={showSuccessModal}
                onClose={handleConfirmSuccess}
                title="저장이 완료되었습니다"
                message="작성하신 내용이 성공적으로 저장되었습니다."
            />
        </div>
    );
}
