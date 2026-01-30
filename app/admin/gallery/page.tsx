
'use client';

import { useEffect, useState } from 'react';
import { Upload, Trash2, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export default function GalleryPage() {
    const [images, setImages] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);

    const fetchImages = async () => {
        try {
            const res = await fetch('/api/admin/images');
            const json = await res.json();
            // JSON is now the source of truth, no need to reverse if it's already sorted by user preference (or default newest)
            // But my API default logic added new items to BEGINNING. So default is Newest First.
            setImages(json);
        } catch (error) {
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

        setUploading(true);
        const file = e.target.files[0];
        const formData = new FormData();
        formData.append('file', file);

        try {
            // 1. Upload File
            const uploadRes = await fetch('/api/admin/upload', {
                method: 'POST',
                body: formData,
            });

            if (uploadRes.ok) {
                const uploadData = await uploadRes.json();

                // 2. Register to Gallery Data
                await fetch('/api/admin/images', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: uploadData.name,
                        url: uploadData.url
                    })
                });

                fetchImages(); // Refresh
            } else {
                alert('업로드 실패');
            }
        } catch (error) {
            alert('업로드 오류');
        } finally {
            setUploading(false);
            e.target.value = '';
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('정말 삭제하시겠습니까?')) return;
        try {
            const res = await fetch(`/api/admin/images?id=${id}`, { method: 'DELETE' });
            if (res.ok) {
                setImages(prev => prev.filter(img => img.id !== id));
            } else {
                alert('삭제 실패');
            }
        } catch (e) {
            alert('삭제 오류');
        }
    };

    const handleMove = async (index: number, direction: 'prev' | 'next') => {
        const newImages = [...images];
        if (direction === 'prev') {
            if (index === 0) return;
            [newImages[index - 1], newImages[index]] = [newImages[index], newImages[index - 1]];
        } else {
            if (index === newImages.length - 1) return;
            [newImages[index], newImages[index + 1]] = [newImages[index + 1], newImages[index]];
        }
        setImages(newImages); // Optimistic update

        // Save new order
        try {
            await fetch('/api/admin/images', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newImages),
            });
        } catch (error) {
            console.error('Failed to save order');
            fetchImages(); // Revert on error
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
                        disabled={uploading}
                    />
                    <label
                        htmlFor="file-upload"
                        className={`flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors cursor-pointer ${uploading ? 'opacity-50' : ''}`}
                    >
                        <Upload size={16} />
                        {uploading ? '업로드 중...' : '이미지 업로드'}
                    </label>
                </div>
            </div>

            {loading ? (
                <div className="text-center p-8 text-gray-500">이미지 로딩 중...</div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {images.length === 0 ? (
                        <div className="col-span-full text-center p-8 text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                            이미지가 없습니다. 이미지를 업로드하세요.
                        </div>
                    ) : (
                        images.map((img, index) => (
                            <div key={img.id || `${img.name}-${index}`} className="group relative bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden aspect-square">
                                <img
                                    src={img.url}
                                    alt={img.name}
                                    className="w-full h-full object-cover"
                                />
                                {/* Overlay Actions */}
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                                    <div className="flex gap-2">
                                        <Link
                                            href={img.url}
                                            target="_blank"
                                            className="p-2 bg-white/20 text-white hover:bg-white/40 rounded-full backdrop-blur-sm"
                                            title="원본 보기"
                                        >
                                            <ExternalLink size={16} />
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(img.id)}
                                            className="p-2 bg-red-500/80 text-white hover:bg-red-600 rounded-full backdrop-blur-sm"
                                            title="삭제"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={(e) => { e.preventDefault(); handleMove(index, 'prev'); }}
                                            disabled={index === 0}
                                            className="px-2 py-1 bg-white/20 text-white hover:bg-white/40 rounded text-xs disabled:opacity-30"
                                        >
                                            ◀
                                        </button>
                                        <button
                                            onClick={(e) => { e.preventDefault(); handleMove(index, 'next'); }}
                                            disabled={index === images.length - 1}
                                            className="px-2 py-1 bg-white/20 text-white hover:bg-white/40 rounded text-xs disabled:opacity-30"
                                        >
                                            ▶
                                        </button>
                                    </div>
                                </div>
                                <div className="absolute bottom-0 inset-x-0 bg-black/60 p-2 text-xs text-white truncate">
                                    {index + 1}. {img.name}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            <div className="bg-blue-50 p-4 rounded-lg text-blue-800 text-sm">
                <strong>팁:</strong> 이미지를 클릭하면 이동/삭제 버튼이 나타납니다. "원본 보기"를 눌러 이미지 주소를 복사할 수 있습니다.
            </div>
        </div>
    );
}
