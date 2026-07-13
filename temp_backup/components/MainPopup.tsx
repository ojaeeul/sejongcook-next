'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import CourseRecruitPopup, { CourseRecruitContent } from './templates/CourseRecruitPopup';

export interface Popup {
    id: number;
    title: string;
    type?: 'image' | 'template';
    templateId?: string;
    imageUrl?: string;
    content?: CourseRecruitContent;
    link: string;
    startDate?: string; // YYYY-MM-DD
    endDate?: string;   // YYYY-MM-DD
    isActive?: boolean;
    position: { top: number; left: number };
    size: { width: number; height: number };
}

export default function MainPopup() {
    const [popups, setPopups] = useState<Popup[]>([]);
    // Prevent hydration mismatch by waiting for mount
    const [mounted, setMounted] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMounted(true);
        fetch(`/api/admin/popups?t=${Date.now()}`, { cache: 'no-store' })
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    // Filter out inactive ones first
                    const activePopups = data.filter((p: Popup) => p.isActive);

                    // Filter by Date (Time Check)
                    const now = new Date();
                    // Set allowed time range for today comparison
                    const currentDate = now.toISOString().split('T')[0]; // YYYY-MM-DD

                    const scheduledPopups = activePopups.filter((p: Popup) => {
                        // If no dates set, assume always visible
                        if (!p.startDate && !p.endDate) return true;

                        // Check start date (inclusive)
                        if (p.startDate && p.startDate > currentDate) return false;

                        // Check end date (inclusive)
                        if (p.endDate && p.endDate < currentDate) return false;

                        return true;
                    });

                    // Then filter out ones hidden by user "don't show today"
                    const visiblePopups = scheduledPopups.filter((p: Popup) => {
                        const hiddenUntil = localStorage.getItem(`popup_hidden_${p.id}`);
                        if (hiddenUntil) {
                            const nowInfo = new Date().getTime();
                            if (nowInfo < parseInt(hiddenUntil)) {
                                return false;
                            }
                        }
                        return true;
                    });
                    setPopups(visiblePopups);
                }
            })
            .catch(err => console.error(err));
    }, []);

    const closePopup = (id: number, dontShowToday: boolean) => {
        if (dontShowToday) {
            // Set expire time to 24 hours from now
            const expireTime = new Date().getTime() + 24 * 60 * 60 * 1000;
            localStorage.setItem(`popup_hidden_${id}`, expireTime.toString());
        }
        setPopups(prev => prev.filter(p => p.id !== id));
    };

    if (!mounted || popups.length === 0 || pathname !== '/') return null;

    return (
        <>
            {popups.map(popup => (
                <div
                    key={popup.id}
                    style={{
                        position: 'absolute',
                        top: `${popup.position.top}px`,
                        left: `${popup.position.left}px`,
                        width: `${popup.size.width}px`,
                        height: popup.type === 'template' ? `${popup.size.height}px` : 'auto',
                        zIndex: 9999, // High z-index to sit on top
                        boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                        backgroundColor: 'white',
                        border: '1px solid #ddd',
                        borderRadius: '8px',
                        overflow: 'hidden'
                    }}
                    className="hidden lg:block popup-container"
                >
                    {popup.type === 'template' && popup.content ? (
                        <CourseRecruitPopup
                            content={popup.content}
                            onClose={(dontShowToday) => closePopup(popup.id, dontShowToday)}
                            link={popup.link}
                        />
                    ) : (
                        // Fallback/Default Image Popup
                        <>
                            <div className="relative">
                                <Link href={popup.link}>
                                    <Image
                                        src={popup.imageUrl || ''}
                                        alt={popup.title}
                                        width={0}
                                        height={0}
                                        sizes="100vw"
                                        style={{
                                            width: '100%',
                                            height: 'auto',
                                            display: 'block'
                                        }}
                                    />
                                </Link>
                            </div>
                            <div className="bg-gray-800 text-white text-xs p-2 flex justify-between items-center">
                                <label className="flex items-center gap-2 cursor-pointer hover:text-gray-200">
                                    <input
                                        type="checkbox"
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                closePopup(popup.id, true);
                                            }
                                        }}
                                        className="accent-gray-500 w-4 h-4"
                                    />
                                    24시간 동안 열지 않음
                                </label>
                                <button
                                    onClick={() => closePopup(popup.id, false)}
                                    className="font-bold border px-2 py-0.5 rounded hover:bg-gray-700 transition-colors"
                                >
                                    닫기 [X]
                                </button>
                            </div>
                        </>
                    )}
                </div>
            ))}
        </>
    );
}
