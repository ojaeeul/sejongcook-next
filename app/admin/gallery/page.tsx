
'use client';

import { useEffect, useState } from 'react';
import { Upload, Trash2, ExternalLink, Copy } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import AlertModal from '@/components/AlertModal';

interface ImageItem {
    id: string; // Added id property
    name: string;
    url: string;
    path: string;
}

export default function GalleryPage() {
    const [images, setImages] = useState<ImageItem[]>([]);
    const [loading, setLoading] = useState(true);

    // Alert Modal State
    const [showAlert, setShowAlert] = useState(false);
    const [alertConfig, setAlertConfig] = useState({
        title: '알림',
        message: '',
        type: 'success' as 'success' | 'warning' | 'error' | 'info'
    });

    const triggerAlert = (message: string, type: 'success' | 'warning' | 'error' | 'info' = 'info', title: string = '알림') => {
        setAlertConfig({ title, message, type });
        setShowAlert(true);
    };


    const fetchImages = async () => {
        try {
            const url = '/api/admin/data/gallery';
            const res = await fetch(url);
            if (!res.ok) throw new Error('Failed to fetch images');
            const json = await res.json();
            setImages(json);
        } catch {
            console.error('Failed to fetch images');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchImages();
    }, []);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.length) return;
        alert('이미지 업로드 기능은 현재 서버 설정상 제한되어 있습니다. public/data/gallery_data.json 파일을 직접 편집해주세요.');
        e.target.value = '';
    };

    const handleDelete = async (id: string) => {
        if (!confirm('정말 삭제하시겠습니까?')) return;
        try {
            const url = `/api/admin/data/gallery?id=${id}`;
            const res = await fetch(url, { method: 'DELETE' });
            if (res.ok) {
                setImages(prev => prev.filter(img => img.id !== id));
                triggerAlert('삭제되었습니다.', 'success');
            } else {
                triggerAlert('삭제 실패', 'error');
            }
        } catch {
            triggerAlert('삭제 오류', 'error');
        }
    };



    const handleCopy = async (url: string) => {
        try {
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(url);
                triggerAlert('이미지 주소가 복사되었습니다.\nCtrl+V로 붙여넣기 하세요.', 'success');
            } else {
                throw new Error('Clipboard API unavailable');
            }
        } catch {
            // Fallback for non-secure contexts or older browsers
            try {
                const textArea = document.createElement("textarea");
                textArea.value = url;
                textArea.style.position = "fixed";
                textArea.style.left = "-9999px";
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                const successful = document.execCommand('copy');
                document.body.removeChild(textArea);
                if (successful) {
                    triggerAlert('이미지 주소가 복사되었습니다.\nCtrl+V로 붙여넣기 하세요.', 'success');
                    return;
                }
            } catch (err) {
                console.error('Fallback copy failed', err);
            }
            // Final fallback: simple prompt
            prompt('Ctrl+C를 눌러 주소를 복사하세요:', url);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-800">갤러리 / 이미지 관리</h1>
                <div className="relative">
                    <input
                        type="file"
                        id="file-upload"
                        className="hidden"
                        accept="image/*"
                        onChange={handleUpload}
                    />
                    <label
                        htmlFor="file-upload"
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors cursor-pointer"
                    >
                        <Upload size={16} />
                        이미지 업로드
                    </label>
                </div>
            </div>

            {loading ? (
                <div className="text-center p-8 text-gray-500">이미지 로딩 중...</div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {images.length === 0 ? (
                        <div className="col-span-full text-center p-8 text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                            이미지가 없습니다. 이미지를 업로드하세요.
                        </div>
                    ) : (
                        images.map((img, index) => (
                            <div key={img.id || `${img.name}-${index}`} className="group bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col hover:shadow-md transition-shadow">
                                <div className="relative aspect-square bg-gray-100">
                                    <Image
                                        src={img.url}
                                        alt={img.name}
                                        fill
                                        className="object-cover"
                                        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
                                    />
                                </div>

                                <div className="p-3 bg-white flex flex-col gap-3">
                                    <div className="text-sm font-medium text-gray-900 truncate" title={img.name}>
                                        {index + 1}. {img.name}
                                    </div>

                                    <div className="flex items-center justify-between pt-2 border-t border-gray-100 mt-auto">
                                        <div className="flex gap-1">
                                            <button
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    handleCopy(img.url);
                                                }}
                                                className="flex items-center gap-1.5 px-2 py-1.5 text-xs font-medium text-gray-600 bg-gray-50 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                                                title="주소 복사"
                                            >
                                                <Copy size={14} />
                                                <span>복사</span>
                                            </button>
                                            <Link
                                                href={img.url}
                                                target="_blank"
                                                className="flex items-center gap-1.5 px-2 py-1.5 text-xs font-medium text-gray-600 bg-gray-50 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                                                title="원본 보기"
                                            >
                                                <ExternalLink size={14} />
                                                <span>원본</span>
                                            </Link>
                                        </div>
                                        <button
                                            onClick={() => handleDelete(img.id)}
                                            className="flex items-center gap-1.5 px-2 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-md transition-colors"
                                            title="삭제"
                                        >
                                            <Trash2 size={14} />
                                            <span className="sr-only sm:not-sr-only">삭제</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            <div className="bg-blue-50 p-4 rounded-lg text-blue-800 text-sm">
                <strong>팁:</strong> 각 이미지 하단의 <strong>[복사]</strong> 버튼을 클릭하여 주소를 복사한 후, 게시글 작성 시 붙여넣기(Ctrl+V) 하세요.
            </div>

            <AlertModal
                isOpen={showAlert}
                onClose={() => setShowAlert(false)}
                title={alertConfig.title}
                message={alertConfig.message}
                type={alertConfig.type}
            />
        </div>
    );
}
