'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { X, Search } from 'lucide-react';

interface ImageSelectorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (imageUrl: string) => void;
}

interface ImageFile {
    name: string;
    url: string;
    path: string;
}

export default function ImageSelectorModal({ isOpen, onClose, onSelect }: ImageSelectorModalProps) {
    const [images, setImages] = useState<ImageFile[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (isOpen) {
            fetchImages();
        }
    }, [isOpen]);

    const fetchImages = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/images');
            const json = await res.json();
            setImages(json.reverse());
        } catch {
            console.error('Failed to fetch images');
        } finally {
            setLoading(false);
        }
    };

    const filteredImages = images.filter(img =>
        img.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[80vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">

                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-800">이미지 선택</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <X className="w-6 h-6 text-gray-500" />
                    </button>
                </div>

                {/* Search Bar */}
                <div className="p-4 border-b border-gray-100 bg-gray-50">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="이미지 이름 검색..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                {/* Grid */}
                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                    {loading ? (
                        <div className="flex items-center justify-center h-40 text-gray-500">
                            이미지 불러오는 중...
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {filteredImages.length === 0 ? (
                                <div className="col-span-full text-center py-10 text-gray-400">
                                    검색된 이미지가 없습니다.
                                </div>
                            ) : (
                                filteredImages.map((img) => (
                                    <div
                                        key={img.name}
                                        className="group relative aspect-square bg-gray-100 rounded-lg overflow-hidden border border-gray-200 cursor-pointer hover:border-blue-500 hover:ring-2 hover:ring-blue-200 transition-all"
                                        onClick={() => {
                                            onSelect(img.url);
                                            onClose();
                                        }}
                                    >
                                        <Image
                                            src={img.url}
                                            alt={img.name}
                                            fill
                                            className="object-cover transition-transform group-hover:scale-110"
                                            sizes="(max-width: 768px) 50vw, 20vw"
                                        />
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                                        <div className="absolute bottom-0 inset-x-0 bg-black/60 p-1 text-xs text-white truncate text-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            {img.name}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-100 bg-gray-50 text-right text-sm text-gray-500">
                    총 {filteredImages.length}개의 이미지
                </div>
            </div>
        </div>
    );
}
