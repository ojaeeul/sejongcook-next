
'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';
import SuccessModal from '@/components/SuccessModal';
import ShinyLaurelBanner from '@/components/ShinyLaurelBanner';

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
        textScale: initialData?.textScale || 1,
        ...initialData // spread other fields if any
    });
    const [loading, setLoading] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const onImageUploadBefore = (files: File[], info: object, uploadHandler: (response: any) => void) => {
        // Use upload.php for handling file uploads (renames to safe ASCII)
        const isProd = process.env.NODE_ENV === 'production';
        // Local dev: usually runs on port 3000, PHP on 8000 or similar if separate.
        // Assuming PHP is served from public/ locally or via a proxy. 
        // If 'npm run dev' is Next.js only, purely static PHP file won't execute. 
        // Ideally, in production, /upload.php works. 
        // In local dev without PHP server, this might fail unless proxied.
        // However, for verify instructions, we assume User has PHP env or will deploy.

        const uploadEndpoint = '/upload.php';

        const formData = new FormData();
        formData.append('file', files[0]);

        fetch(uploadEndpoint, {
            method: 'POST',
            body: formData
        })
            .then(res => res.json())
            .then(data => {
                if (data.error) {
                    alert('Upload failed: ' + data.error);
                    uploadHandler({ errorMessage: data.error });
                } else {
                    // Success: SunEditor expects { result: [ { url: ..., name: ... } ] }
                    uploadHandler(data);
                }
            })
            .catch(err => {
                console.error(err);
                // Fallback for local dev if PHP not running: mock it
                if (!isProd) {
                    console.warn("Local PHP upload failed (likely no PHP server). Mocking success for UI test.");
                    // Mock success for testing UI flow only
                    const mockUrl = URL.createObjectURL(files[0]);
                    uploadHandler({
                        result: [{
                            url: mockUrl,
                            name: files[0].name,
                            size: files[0].size
                        }]
                    });
                    alert("로컬 개발 환경에서는 PHP가 실행되지 않아 '가상 업로드'로 처리되었습니다. 실제 서버에서는 정상적으로 저장됩니다.");
                } else {
                    alert('Upload error. Check network or server.');
                    uploadHandler({ errorMessage: "Network Error" });
                }
            });

        return undefined; // mandatory return for this handler
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const isProd = process.env.NODE_ENV === 'production';
            const endpoint = isProd ? `/api.php?board=${type}` : `/api/admin/data/${type}`;
            const method = initialData?.id ? 'PUT' : 'POST';

            const payload = {
                ...formData,
                id: initialData?.id,
            };

            const res = await fetch(endpoint, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || 'Failed to save via API');
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
                            <label className="text-sm font-medium text-gray-700">게시물 제목 (리스트 및 상세페이지 노출)</label>
                            <input
                                type="text"
                                required
                                value={formData.title}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                    setFormData((prev: any) => ({ ...prev, title: val }));
                                }}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="제목을 입력하세요"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">작성자</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={formData.author}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                        setFormData((prev: any) => ({ ...prev, author: val }));
                                    }}
                                    className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    placeholder="작성자 입력 또는 우측 선택"
                                />
                                <select
                                    className="w-32 px-2 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 text-sm"
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        if (val) {
                                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                            setFormData((prev: any) => ({ ...prev, author: val }));
                                        }
                                    }}
                                    value=""
                                >
                                    <option value="" disabled>선택</option>
                                    <option value="Admin">Admin</option>
                                    <option value="관리자">관리자</option>
                                    <option value="학원장">학원장</option>
                                    <option value="대표">대표</option>
                                    <option value="세종요리제과기술학원">세종요리학원</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">작성일 (YYYY-MM-DD)</label>
                            <input
                                type="date"
                                value={formData.date}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                    setFormData((prev: any) => ({ ...prev, date: val }));
                                }}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>

                        {type === 'baking' && (
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">카테고리</label>
                                <select
                                    value={formData.category || '갤러리'}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                        setFormData((prev: any) => ({ ...prev, category: val }));
                                    }}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="갤러리">갤러리</option>
                                    <option value="수업뉴스">수업뉴스</option>
                                </select>
                            </div>
                        )}

                        {type === 'qna' && (
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">상태</label>
                                <select
                                    value={formData.status || '대기중'}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                        setFormData((prev: any) => ({ ...prev, status: val }));
                                    }}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="대기중">대기중</option>
                                    <option value="답변완료">답변완료</option>
                                </select>
                            </div>
                        )}

                        {type === 'honor' && (
                            <>
                                <div className="space-y-4 md:col-span-2">
                                    <label className="text-sm font-medium text-gray-700 block">미리보기</label>
                                    <div className="w-full max-w-sm mx-auto border border-gray-200 rounded-lg overflow-hidden bg-black">
                                        <ShinyLaurelBanner
                                            stars={formData.stars || 5}
                                            name={formData.name}
                                            textScale={formData.textScale || 1}
                                        />
                                    </div>
                                    <p className="text-xs text-center text-gray-500">실제 화면과 동일한 비율의 미리보기입니다.</p>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">수상자 이름 (사진 오버레이)</label>
                                    <input
                                        type="text"
                                        value={formData.name || ''}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                            setFormData((prev: any) => ({ ...prev, name: val }));
                                        }}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        placeholder="사진 위에 표시될 이름을 입력하세요"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">추천 별 개수 (1-8성)</label>
                                    <div className="flex items-center gap-4">
                                        <input
                                            type="range"
                                            min="1"
                                            max="8"
                                            value={formData.stars || 5}
                                            onChange={(e) => {
                                                const val = parseInt(e.target.value);
                                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                                setFormData((prev: any) => ({ ...prev, stars: val }));
                                            }}
                                            className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                        />
                                        <span className="text-lg font-bold text-indigo-600 w-12 text-right">{formData.stars || 5}성</span>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">이름 크기 조절 (기본: 100%)</label>
                                    <div className="flex items-center gap-4">
                                        <input
                                            type="range"
                                            min="0.5"
                                            max="2.0"
                                            step="0.1"
                                            value={formData.textScale || 1}
                                            onChange={(e) => {
                                                const val = parseFloat(e.target.value);
                                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                                setFormData((prev: any) => ({ ...prev, textScale: val }));
                                            }}
                                            className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                        />
                                        <span className="text-lg font-bold text-indigo-600 w-12 text-right">{Math.round((formData.textScale || 1) * 100)}%</span>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">게시물 제목 (리스트 및 상세페이지 노출)</label>
                        <input
                            type="text"
                            required
                            value={formData.title}
                            onChange={(e) => {
                                const val = e.target.value;
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                setFormData((prev: any) => ({ ...prev, title: val }));
                            }}
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="제목을 입력하세요"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">내용</label>
                        <SunEditor
                            setContents={formData.content}
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            onChange={(content) => setFormData((prev: any) => ({ ...prev, content: content }))}
                            onImageUploadBefore={onImageUploadBefore}
                            setOptions={{
                                height: '400px',
                                defaultStyle: "font-family: 'Pretendard', sans-serif; font-size: 16px; line-height: 1.6;",
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
                                ],
                                // Critical for preserving tables and styles
                                mode: "classic",
                                // Bypass strict type checks for sanitation options which sometimes fail in CI
                                ...({
                                    allowedTags: null,
                                    allowedAttributes: null,
                                } as any),
                                iframe: false,
                                fullPage: false,
                            } as any}
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
