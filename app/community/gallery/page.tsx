'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import CommunitySidebar from '@/components/CommunitySidebar';

interface GalleryItem {
    id: string;
    name: string;
    url: string;
    path: string;
}

export default function GalleryPage() {
    const [images, setImages] = useState<GalleryItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const url = '/api/admin/data/gallery?_t=' + Date.now();
        fetch(url)
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setImages(data);
                }
            })
            .catch(err => console.error('Failed to load gallery:', err))
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="flex flex-col md:flex-row gap-6 max-w-[1200px] mx-auto p-4 md:p-8">
            <CommunitySidebar />
            <div className="flex-1">
                <div className="border-b-2 border-slate-800 pb-4 mb-6 flex justify-between items-end">
                    <h2 className="text-3xl font-bold text-slate-800">갤러리</h2>
                    <span className="text-sm text-gray-500">학원의 다양한 모습을 만나보세요.</span>
                </div>

                {loading ? (
                    <div className="py-20 text-center text-gray-500">로딩중...</div>
                ) : images.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {images.map((img, index) => (
                            <div key={img.id || index} className="group bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300">
                                <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                                    <Image
                                        src={img.url}
                                        alt={img.name}
                                        fill
                                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                    />
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                                </div>
                                <div className="p-4">
                                    <p className="text-gray-800 font-medium truncate group-hover:text-amber-600 transition-colors">
                                        {img.name.replace(/\.[^/.]+$/, "")}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="py-20 text-center bg-gray-50 rounded-lg text-gray-500 border border-dashed border-gray-200">
                        등록된 갤러리 이미지가 없습니다.
                    </div>
                )}
            </div>
        </div>
    );
}
