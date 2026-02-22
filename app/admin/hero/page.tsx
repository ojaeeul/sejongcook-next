'use client';

import { useState, useRef, useEffect } from 'react';
import { Save, Image as ImageIcon, Phone, Search } from 'lucide-react';
import Image from 'next/image';
import { DEFAULT_HERO_DATA } from '../../data/defaultHeroData';
import ImageSelectorModal from '../../../components/ImageSelectorModal';

export default function AdminHeroPage() {
    const [heroData, setHeroData] = useState(DEFAULT_HERO_DATA);

    // Image Selector State
    const [isImageModalOpen, setIsImageModalOpen] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState<{ group: number, photo: number } | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const url = process.env.NODE_ENV === 'production' ? '/api.php?board=hero' : '/api/hero';
                const res = await fetch(url);
                if (res.ok) {
                    const data = await res.json();
                    setHeroData({ ...DEFAULT_HERO_DATA, ...data });
                }
            } catch (error) {
                console.error("Failed to fetch hero data", error);
            }
        };
        fetchData();
    }, []);

    const fileInputRefs = useRef<(HTMLInputElement | null)[][]>([]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        if (type === 'checkbox') {
            setHeroData(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
        } else {
            setHeroData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handlePhotoChange = (groupIndex: number, photoIndex: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const newPhotos = [...heroData.photos];
                // Ensure the group array exists (it should, but for safety)
                if (Array.isArray(newPhotos[groupIndex])) {
                    const newGroup = [...(newPhotos[groupIndex] as string[])];
                    newGroup[photoIndex] = reader.result as string;
                    newPhotos[groupIndex] = newGroup;
                    setHeroData(prev => ({ ...prev, photos: newPhotos }));
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handleImageSelect = (imageUrl: string) => {
        if (currentImageIndex) {
            const { group, photo } = currentImageIndex;
            const newPhotos = [...heroData.photos];
            if (Array.isArray(newPhotos[group])) {
                const newGroup = [...(newPhotos[group] as string[])];
                newGroup[photo] = imageUrl;
                newPhotos[group] = newGroup;
                setHeroData(prev => ({ ...prev, photos: newPhotos }));
            }
            setCurrentImageIndex(null);
        }
    };

    const openImageSelector = (groupIndex: number, photoIndex: number) => {
        setCurrentImageIndex({ group: groupIndex, photo: photoIndex });
        setIsImageModalOpen(true);
    };

    const triggerFileInput = (groupIndex: number, photoIndex: number) => {
        fileInputRefs.current[groupIndex]?.[photoIndex]?.click();
    };

    const handleSubmit = async () => {
        try {
            const url = process.env.NODE_ENV === 'production' ? '/api.php?board=hero' : '/api/hero';
            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(heroData),
            });

            if (res.ok) {
                alert('성공적으로 저장되었습니다.');
                // Also update localStorage for backup/immediate reflection if needed, 
                // but relying on API is better for the "bidirectional" requirement.
                localStorage.setItem('heroData', JSON.stringify(heroData));
            } else {
                alert('저장에 실패했습니다.');
            }
        } catch (error) {
            console.error('Save error:', error);
            alert('저장 중 오류가 발생했습니다.');
        }
    };

    return (
        <div className="space-y-6 max-w-[1200px] mx-auto pb-20">
            <ImageSelectorModal
                isOpen={isImageModalOpen}
                onClose={() => setIsImageModalOpen(false)}
                onSelect={handleImageSelect}
            />

            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-800">메인 히어로 섹션 관리</h1>
                <button onClick={handleSubmit} className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold transition-colors">
                    <Save className="w-4 h-4" />
                    저장 및 적용
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 space-y-8">
                <div className="border-l-4 border-blue-500 pl-4 mb-8">
                    <h2 className="text-xl font-bold text-gray-800">기본 설정</h2>
                    <p className="text-sm text-gray-500 mt-1">메인 화면 최상단 히어로 섹션의 텍스트와 내용을 설정합니다.</p>
                </div>

                <div className="grid gap-6">
                    {/* Badge Settings */}
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <label className="block text-sm font-bold text-gray-700 mb-2">히어로 배지 텍스트 (Badge)</label>
                        <input
                            type="text"
                            name="badge"
                            value={heroData.badge}
                            onChange={handleChange}
                            placeholder="예: Premium Culinary Academy"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all mb-3"
                        />
                        <div className="flex gap-4 items-center">
                            <div className="flex-1">
                                <label className="text-xs font-bold text-gray-500 mb-1 block">글자 크기 (Size)</label>
                                <input
                                    type="text"
                                    name="badgeSize"
                                    value={heroData.badgeSize || '1rem'}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded bg-white text-sm"
                                />
                            </div>
                            <label className="flex items-center gap-2 cursor-pointer pt-5">
                                <input
                                    type="checkbox"
                                    name="badgeBold"
                                    checked={heroData.badgeBold !== false}
                                    onChange={handleChange}
                                    className="w-4 h-4 accent-blue-600 rounded"
                                />
                                <span className="text-sm font-bold text-gray-700">굵게 (Bold)</span>
                            </label>
                        </div>
                    </div>

                    {/* Title Settings */}
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <label className="block text-sm font-bold text-gray-700 mb-2">히어로 메인 타이틀</label>
                        <input
                            type="text"
                            name="title"
                            value={heroData.title}
                            onChange={handleChange}
                            placeholder="예: 세종요리제과기술학원"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all mb-3"
                        />
                        <div className="flex gap-4 items-center">
                            <div className="flex-1">
                                <label className="text-xs font-bold text-gray-500 mb-1 block">글자 크기 (Size)</label>
                                <input
                                    type="text"
                                    name="titleSize"
                                    value={heroData.titleSize || '3.5rem'}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded bg-white text-sm"
                                />
                            </div>
                            <label className="flex items-center gap-2 cursor-pointer pt-5">
                                <input
                                    type="checkbox"
                                    name="titleBold"
                                    checked={heroData.titleBold !== false}
                                    onChange={handleChange}
                                    className="w-4 h-4 accent-blue-600 rounded"
                                />
                                <span className="text-sm font-bold text-gray-700">굵게 (Bold)</span>
                            </label>
                        </div>
                    </div>

                    {/* Subtitle Settings */}
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <label className="block text-sm font-bold text-gray-700 mb-2">히어로 서브 타이틀</label>
                        <input
                            type="text"
                            name="desc"
                            value={heroData.desc}
                            onChange={handleChange}
                            placeholder="예: 꿈을 향한 맛있는 도전"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all mb-3"
                        />
                        <div className="flex gap-4 items-center">
                            <div className="flex-1">
                                <label className="text-xs font-bold text-gray-500 mb-1 block">글자 크기 (Size)</label>
                                <input
                                    type="text"
                                    name="descSize"
                                    value={heroData.descSize || '0.6em'}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded bg-white text-sm"
                                />
                            </div>
                            <label className="flex items-center gap-2 cursor-pointer pt-5">
                                <input
                                    type="checkbox"
                                    name="descBold"
                                    checked={!!heroData.descBold}
                                    onChange={handleChange}
                                    className="w-4 h-4 accent-blue-600 rounded"
                                />
                                <span className="text-sm font-bold text-gray-700">굵게 (Bold)</span>
                            </label>
                        </div>
                    </div>

                    {/* Description Settings */}
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <label className="block text-sm font-bold text-gray-700 mb-2">히어로 설명 (Description)</label>
                        <textarea
                            name="longDesc"
                            value={heroData.longDesc}
                            onChange={handleChange}
                            placeholder="예: 최고의 강사진과 최신설비로..."
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all h-24 resize-none mb-3"
                        />
                        <div className="flex gap-4 items-center">
                            <div className="flex-1">
                                <label className="text-xs font-bold text-gray-500 mb-1 block">글자 크기 (Size)</label>
                                <input
                                    type="text"
                                    name="longDescSize"
                                    value={heroData.longDescSize || '1.2rem'}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded bg-white text-sm"
                                />
                            </div>
                            <label className="flex items-center gap-2 cursor-pointer pt-5">
                                <input
                                    type="checkbox"
                                    name="longDescBold"
                                    checked={heroData.longDescBold !== false}
                                    onChange={handleChange}
                                    className="w-4 h-4 accent-blue-600 rounded"
                                />
                                <span className="text-sm font-bold text-gray-700">굵게 (Bold)</span>
                            </label>
                        </div>
                    </div>
                </div>

                <div className="border-t border-gray-100 pt-8 mt-8">
                    <div className="border-l-4 border-green-500 pl-4 mb-8">
                        <h2 className="text-xl font-bold text-gray-800">액션 이미지 설정</h2>
                        <p className="text-sm text-gray-500 mt-1">히어로 섹션 배경에 롤링될 이미지를 설정합니다.</p>
                    </div>

                    <div className="grid gap-6">
                        {heroData.photos.map((group, groupIndex) => (
                            <div key={groupIndex} className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                                <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">
                                    {groupIndex === 0 && '1. 학원소개 (Intro)'}
                                    {groupIndex === 1 && '2. 제과제빵과정 (Baking)'}
                                    {groupIndex === 2 && '3. 조리교육과정 (Culinary)'}
                                    {groupIndex === 3 && '4. 자격증 & 진학 (Certification)'}
                                    {groupIndex === 4 && '5. 브런치 & 창업 (Brunch)'}
                                    {groupIndex === 5 && '6. 커뮤니티 (Community)'}
                                </h3>
                                <div className="space-y-6">
                                    {(Array.isArray(group) ? group : []).map((photo, photoIndex) => (
                                        <div key={`${groupIndex}-${photoIndex}`} className="flex gap-4 items-start">
                                            <div className="flex-1 space-y-2">
                                                <div className="flex gap-2">
                                                    <span className="flex items-center justify-center w-8 h-10 bg-gray-200 rounded text-sm font-bold text-gray-600">
                                                        {photoIndex + 1}
                                                    </span>
                                                    <input
                                                        type="text"
                                                        value={photo}
                                                        readOnly
                                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm bg-white text-gray-500"
                                                        placeholder="이미지 경로"
                                                    />
                                                    <input
                                                        type="file"
                                                        hidden
                                                        ref={el => {
                                                            if (!fileInputRefs.current[groupIndex]) fileInputRefs.current[groupIndex] = [];
                                                            fileInputRefs.current[groupIndex][photoIndex] = el;
                                                        }}
                                                        onChange={(e) => handlePhotoChange(groupIndex, photoIndex, e)}
                                                        accept="image/*"
                                                    />
                                                    <button
                                                        onClick={() => openImageSelector(groupIndex, photoIndex)}
                                                        className="px-4 py-2 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded-md text-sm font-bold transition-colors whitespace-nowrap flex items-center gap-1"
                                                    >
                                                        <Search className="w-4 h-4" />
                                                        사진 찾기
                                                    </button>
                                                    <button
                                                        onClick={() => triggerFileInput(groupIndex, photoIndex)}
                                                        className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-md text-sm font-bold transition-colors whitespace-nowrap"
                                                    >
                                                        파일 선택
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="relative w-[120px] h-[80px] bg-gray-200 rounded-md border border-gray-300 overflow-hidden flex-shrink-0">
                                                {photo ? (
                                                    <Image src={photo} alt={`Preview ${groupIndex + 1}-${photoIndex + 1}`} fill className="object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                        <ImageIcon className="w-6 h-6" />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="border-t border-gray-100 pt-8 mt-8">
                    <div className="border-l-4 border-purple-500 pl-4 mb-8">
                        <h2 className="text-xl font-bold text-gray-800">버튼 설정</h2>
                        <p className="text-sm text-gray-500 mt-1">메인 화면에 표시될 버튼을 설정합니다.</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                            <label className="block text-sm font-bold text-gray-700 mb-3">버튼 1 (Primary)</label>
                            <div className="space-y-4">
                                <input
                                    type="text"
                                    name="btn1Text"
                                    value={heroData.btn1Text}
                                    onChange={handleChange}
                                    placeholder="버튼 텍스트 (예: 과정리뷰하기)"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md"
                                />
                                <input
                                    type="text"
                                    name="btn1Link"
                                    value={heroData.btn1Link}
                                    onChange={handleChange}
                                    placeholder="링크 URL"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md"
                                />
                            </div>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                            <label className="block text-sm font-bold text-gray-700 mb-3">버튼 2 (Secondary)</label>
                            <div className="space-y-4">
                                <input
                                    type="text"
                                    name="btn2Text"
                                    value={heroData.btn2Text}
                                    onChange={handleChange}
                                    placeholder="버튼 텍스트 (예: 상담문의)"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md"
                                />
                                <input
                                    type="text"
                                    name="btn2Link"
                                    value={heroData.btn2Link}
                                    onChange={handleChange}
                                    placeholder="링크 URL"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="border-t border-gray-100 pt-8 mt-8">
                    <label className="flex items-center gap-2 mb-6">
                        <Phone className="w-6 h-6 text-orange-600" />
                        <span className="text-xl font-bold text-gray-800">상담 전화번호 표시 설정 (Phone Banner)</span>
                    </label>

                    <div className="bg-orange-50 p-6 rounded-xl border border-orange-100 grid md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="phoneVisible"
                                    checked={heroData.phoneVisible}
                                    onChange={handleChange}
                                    className="w-5 h-5 accent-blue-600 rounded"
                                />
                                <span className="font-bold text-gray-700">화면에 표시하기 (Visible)</span>
                            </label>
                        </div>

                        {/* New Alignment Controls */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-bold text-gray-700 mb-2">배너 위치 (Alignment)</label>
                            <div className="flex gap-4">
                                {['left', 'center', 'right'].map((align) => (
                                    <label key={align} className="flex items-center gap-2 cursor-pointer bg-white px-4 py-2 rounded-lg border border-orange-200">
                                        <input
                                            type="radio"
                                            name="phoneAlignment"
                                            value={align}
                                            checked={heroData.phoneAlignment === align}
                                            onChange={handleChange}
                                            className="w-4 h-4 accent-blue-600"
                                        />
                                        <span className="capitalize text-gray-700 font-medium">
                                            {align === 'left' ? '왼쪽 (Left)' : align === 'center' ? '중앙 (Center)' : '오른쪽 (Right)'}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">전화번호 (Number)</label>
                            <input
                                type="text"
                                name="phoneNumber"
                                value={heroData.phoneNumber}
                                onChange={handleChange}
                                placeholder="예: 031-983-9133"
                                className="w-full px-4 py-3 border border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none bg-white"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">글자 색상 (Text Color)</label>
                        <div className="flex gap-2 h-[50px]">
                            <input
                                type="color"
                                name="phoneTextColor"
                                value={heroData.phoneTextColor || '#333333'}
                                onChange={handleChange}
                                className="h-full w-20 p-1 border border-orange-200 rounded bg-white cursor-pointer"
                            />
                            <input
                                type="text"
                                value={heroData.phoneTextColor || '#333333'}
                                readOnly
                                className="flex-1 px-4 border border-orange-200 rounded-lg bg-gray-50 text-gray-600 font-mono"
                            />
                        </div>
                        <label className="flex items-center gap-2 mt-2 cursor-pointer">
                            <input
                                type="checkbox"
                                name="phoneBold"
                                checked={heroData.phoneBold !== false} // Default to true if undefined
                                onChange={handleChange}
                                className="w-4 h-4 accent-blue-600 rounded"
                            />
                            <span className="text-sm font-bold text-gray-700">글자 굵게 (Bold Text)</span>
                        </label>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">글자 크기 (Font Size)</label>
                        <input
                            type="text"
                            name="phoneSize"
                            value={heroData.phoneSize}
                            onChange={handleChange}
                            placeholder="예: 32px"
                            className="w-full px-4 py-3 border border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none bg-white"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">아이콘 (Icon/Image)</label>
                        <input
                            type="text"
                            name="phoneIcon"
                            value={heroData.phoneIcon}
                            onChange={handleChange}
                            placeholder="이모지 또는 이미지경로"
                            className="w-full px-4 py-3 border border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none bg-white"
                        />
                    </div>

                    {/* Background Color with Transparency support */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">배경 색상 (Background)</label>
                        <div className="flex gap-2">
                            <div className="relative w-full">
                                <input
                                    type="text"
                                    name="phoneBackgroundColor"
                                    value={heroData.phoneBackgroundColor}
                                    onChange={handleChange}
                                    placeholder="rgba(255, 255, 255, 0.95)"
                                    className="w-full px-4 py-3 border border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none bg-white"
                                />
                                <div
                                    className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded border border-gray-200 shadow-sm"
                                    style={{ background: heroData.phoneBackgroundColor || '#ffffff' }}
                                />
                            </div>
                            <button
                                onClick={() => setHeroData(prev => ({ ...prev, phoneBackgroundColor: 'rgba(0, 0, 0, 0)' }))}
                                className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs rounded-lg transition-colors whitespace-nowrap font-bold"
                            >
                                투명
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">테두리 색상 (Border Color)</label>
                        <div className="flex gap-2 h-[50px]">
                            <input
                                type="color"
                                name="phoneBorderColor"
                                value={heroData.phoneBorderColor}
                                onChange={handleChange}
                                className="h-full w-20 p-1 border border-orange-200 rounded bg-white cursor-pointer"
                            />
                            <input
                                type="text"
                                value={heroData.phoneBorderColor}
                                readOnly
                                className="flex-1 px-4 border border-orange-200 rounded-lg bg-gray-50 text-gray-600 font-mono"
                            />
                        </div>
                    </div>
                </div>


            </div>

            <div className="border-t border-gray-100 pt-8 mt-8">
                <div className="border-l-4 border-yellow-500 pl-4 mb-8">
                    <h2 className="text-xl font-bold text-gray-800">월계관 배너 설정 (Shiny Laurel Banner)</h2>
                    <p className="text-sm text-gray-500 mt-1">상단 월계관 배너의 별 개수(1~6개)와 이름을 설정합니다.</p>
                </div>

                <div className="bg-yellow-50 p-6 rounded-xl border border-yellow-100 grid md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                name="laurelBannerVisible"
                                checked={heroData.laurelBannerVisible}
                                onChange={handleChange}
                                className="w-5 h-5 accent-yellow-600 rounded"
                            />
                            <span className="font-bold text-gray-700">배너 표시하기 (Show Banner)</span>
                        </label>
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-sm font-bold text-gray-700 mb-3">별 개수 (Stars)</label>
                        <div className="flex gap-4 flex-wrap">
                            {[1, 2, 3, 4, 5, 6].map((num) => (
                                <label key={num} className="flex items-center gap-2 cursor-pointer bg-white px-4 py-2 rounded-lg border border-yellow-200 hover:border-yellow-400 transition-colors">
                                    <input
                                        type="radio"
                                        name="laurelStars"
                                        value={num}
                                        checked={Number(heroData.laurelStars) === num}
                                        onChange={handleChange}
                                        className="w-4 h-4 accent-yellow-600"
                                    />
                                    <span className="text-gray-700 font-medium">{num}개 {Array(num).fill('★').join('')}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-sm font-bold text-gray-700 mb-2">이름 / 직함 (Name)</label>
                        <input
                            type="text"
                            name="laurelName"
                            value={heroData.laurelName || ''}
                            onChange={handleChange}
                            placeholder="예: 강란기 대표"
                            className="w-full px-4 py-3 border border-yellow-200 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none bg-white text-lg font-bold text-center"
                        />
                    </div>
                </div>
            </div>

        </div>
    );
}
