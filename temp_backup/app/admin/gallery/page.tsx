
'use client';

import { useEffect, useState } from 'react';
import { Upload, Trash2, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface ImageItem {
    id: string; // Added id property
    name: string;
    url: string;
    path: string;
}

export default function GalleryPage() {
    const [images, setImages] = useState<ImageItem[]>([]);
    const [loading, setLoading] = useState(true);


    const fetchImages = async () => {
        try {
            const url = process.env.NODE_ENV === 'production' ? '/api.php?board=gallery' : '/api/admin/data/gallery';
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
            const res = await fetch(`/api/admin/data/gallery?id=${id}`, { method: 'DELETE' });
            if (res.ok) {
                setImages(prev => prev.filter(img => img.id !== id));
            } else {
                alert('삭제 실패');
            }
        } catch {
            alert('삭제 오류');
        }
    };

    const handleMove = async () => {
        alert('순서 변경 기능은 현재 지원되지 않습니다. JSON 파일을 직접 수정해주세요.');
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
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {images.length === 0 ? (
                        <div className="col-span-full text-center p-8 text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                            이미지가 없습니다. 이미지를 업로드하세요.
                        </div>
                    ) : (
                        images.map((img, index) => (
                            <div key={img.id || `${img.name}-${index}`} className="group relative bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden aspect-square">
                                <Image
                                    src={img.url}
                                    alt={img.name}
                                    fill
                                    className="object-cover"
                                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
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
                                            onClick={(e) => { e.preventDefault(); handleMove(); }}
                                            disabled={index === 0}
                                            className="px-2 py-1 bg-white/20 text-white hover:bg-white/40 rounded text-xs disabled:opacity-30"
                                        >
                                            ◀
                                        </button>
                                        <button
                                            onClick={(e) => { e.preventDefault(); handleMove(); }}
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
                <strong>팁:</strong> 이미지를 클릭하면 이동/삭제 버튼이 나타납니다. &quot;원본 보기&quot;를 눌러 이미지 주소를 복사할 수 있습니다.
            </div>
        </div>
    );
}
