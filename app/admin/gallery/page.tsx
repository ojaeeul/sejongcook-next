
'use client';

import { useState } from 'react';
import { Upload, Trash2, ExternalLink, Copy } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import AlertModal from '@/components/AlertModal';
import { useAdminData } from '@/lib/hooks/useAdminData';

interface ImageItem {
    id: string; // Added id property
    name: string;
    url: string;
    path: string;
}

export default function GalleryPage() {
    const { data: images, loading, mutate } = useAdminData<ImageItem[]>('/api/admin/data/gallery');

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

    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState('');
    const [isDragging, setIsDragging] = useState(false);

    const processUpload = async (files: FileList) => {
        const imageFiles = Array.from(files).filter(file => file.type.startsWith('image/') || /\.(png|jpe?g|gif|webp)$/i.test(file.name));
        if (imageFiles.length === 0) {
            triggerAlert('업로드할 이미지 파일이 없습니다.', 'warning');
            return;
        }

        setUploading(true);
        let successCount = 0;
        const newUploadedItems: ImageItem[] = [];

        for (let i = 0; i < imageFiles.length; i++) {
            const file = imageFiles[i];
            setUploadProgress(`업로드 중... (${i + 1}/${imageFiles.length}): ${file.name}`);
            
            try {
                // 1. Upload file to server
                const formData = new FormData();
                formData.append('file', file);
                
                const uploadRes = await fetch('/api/admin/upload', {
                    method: 'POST',
                    body: formData
                });
                
                if (!uploadRes.ok) {
                    throw new Error('서버 업로드 실패');
                }
                
                const uploadData = await uploadRes.json();
                if (!uploadData.url) {
                    throw new Error('서버 반환 오류');
                }
                
                // 2. Save image metadata to gallery db
                const dbRes = await fetch('/api/admin/data/gallery', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: file.name,
                        url: uploadData.url,
                        path: uploadData.url.replace(/^\//, '') // strip leading slash
                    })
                });
                
                if (dbRes.ok) {
                    const dbData = await dbRes.json();
                    if (dbData.success && dbData.item) {
                        newUploadedItems.push(dbData.item);
                        successCount++;
                    }
                }
            } catch (err) {
                console.error(`File upload failed: ${file.name}`, err);
            }
        }

        if (newUploadedItems.length > 0) {
            if (images) {
                mutate([...newUploadedItems, ...images]);
            } else {
                mutate(newUploadedItems);
            }
        }

        setUploading(false);
        setUploadProgress('');
        
        if (successCount === imageFiles.length) {
            triggerAlert(`${successCount}개의 이미지가 성공적으로 업로드되었습니다.`, 'success');
        } else {
            triggerAlert(`${successCount}개 이미지 업로드 완료 (실패: ${imageFiles.length - successCount}개)`, successCount > 0 ? 'warning' : 'error');
        }
    };

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.length) return;
        await processUpload(e.target.files);
        e.target.value = '';
    };

    const handleFolderUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.length) return;
        await processUpload(e.target.files);
        e.target.value = '';
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            await processUpload(e.dataTransfer.files);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('정말 삭제하시겠습니까?')) return;
        try {
            const url = `/api/admin/data/gallery?id=${id}`;
            const res = await fetch(url, { method: 'DELETE' });
            if (res.ok) {
                if (images) {
                    mutate(images.filter(img => img.id !== id));
                }
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
        <div 
            className={`relative min-h-[500px] space-y-6 transition-all duration-200 ${isDragging ? 'bg-indigo-50/50 outline-dashed outline-2 outline-indigo-400 rounded-xl p-4' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            {isDragging && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-xl border-2 border-dashed border-indigo-500 pointer-events-none">
                    <div className="text-center">
                        <Upload className="w-16 h-16 text-indigo-500 mx-auto mb-4 animate-bounce" />
                        <h3 className="text-xl font-bold text-indigo-900">여기에 파일이나 폴더를 놓으세요</h3>
                        <p className="text-sm text-indigo-600 mt-2">마우스를 놓으면 자동으로 업로드됩니다.</p>
                    </div>
                </div>
            )}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h1 className="text-2xl font-bold text-gray-800">갤러리 / 이미지 관리</h1>
                <div className="flex flex-wrap items-center gap-3">
                    {/* Multi-file upload */}
                    <div className="relative">
                        <input
                            type="file"
                            id="file-upload"
                            className="hidden"
                            accept="image/*"
                            multiple
                            onChange={handleUpload}
                            disabled={uploading}
                        />
                        <label
                            htmlFor="file-upload"
                            className={`flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors cursor-pointer text-sm font-medium ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            <Upload size={16} />
                            파일 다중 업로드
                        </label>
                    </div>

                    {/* Folder upload */}
                    <div className="relative">
                        <input
                            type="file"
                            id="folder-upload"
                            className="hidden"
                            {...{ webkitdirectory: "", directory: "" }}
                            multiple
                            accept="image/*"
                            onChange={handleFolderUpload}
                            disabled={uploading}
                        />
                        <label
                            htmlFor="folder-upload"
                            className={`flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors cursor-pointer text-sm font-medium ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            <Upload size={16} />
                            폴더 업로드
                        </label>
                    </div>
                </div>
            </div>

            {/* Upload progress banner */}
            {uploading && (
                <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-between animate-pulse">
                    <div className="flex items-center gap-3">
                        <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-sm font-semibold text-indigo-700">{uploadProgress}</span>
                    </div>
                </div>
            )}

            {loading ? (
                <div className="text-center p-8 text-gray-500">이미지 로딩 중...</div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {(images || []).length === 0 ? (
                        <div className="col-span-full text-center p-8 text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                            이미지가 없습니다. 이미지를 업로드하세요.
                        </div>
                    ) : (
                        (images || []).map((img, index) => (
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
