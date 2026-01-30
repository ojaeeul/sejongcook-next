
'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';
import SuccessModal from '@/components/SuccessModal';

// Dynamically import SunEditor to avoid SSR issues
const SunEditor = dynamic(() => import('suneditor-react'), {
    ssr: false,
});
import 'suneditor/dist/css/suneditor.min.css';

interface DataEditorProps {
    title: string;
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

    const onImageUploadBefore = (files: File[], info: object, uploadHandler: (response: any) => void) => {
        // Implement image upload to our API
        const file = files[0];
        const formData = new FormData();
        formData.append('file', file);

        fetch('/api/admin/upload', {
            method: 'POST',
            body: formData,
        })
            .then(res => res.json())
            .then(data => {
                if (data.url) {
                    const response = {
                        result: [
                            {
                                url: data.url,
                                name: data.name,
                                size: file.size,
                            },
                        ],
                    };
                    uploadHandler(response);
                } else {
                    uploadHandler({ errorMessage: 'Upload failed' });
                }
            })
            .catch(err => {
                console.error(err);
                uploadHandler({ errorMessage: 'Upload failed' });
            });

        return undefined; // mandatory return for SunEditor handler
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();



        setLoading(true);

        try {
            // Fetch current data to append/update
            const res = await fetch(`/api/admin/data/${type}`);
            const currentData = await res.json();

            let newData;
            if (initialData?.id) {
                // Update
                newData = currentData.map((item: any) =>
                    item.id === initialData.id ? { ...item, ...formData } : item
                );
            } else {
                // Create
                const newId = Date.now().toString(); // Simple ID generation
                newData = [{ id: newId, hit: '0', ...formData }, ...currentData];
            }

            await fetch(`/api/admin/data/${type}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newData),
            });

            // Show success modal instead of immediate redirect
            setShowSuccessModal(true);
        } catch (error) {
            alert('저장에 실패했습니다');
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
