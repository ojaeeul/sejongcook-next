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
                    // Set allowed time range for today comparison (in local time, NOT UTC!)
                    const year = now.getFullYear();
                    const month = String(now.getMonth() + 1).padStart(2, '0');
                    const day = String(now.getDate()).padStart(2, '0');
                    const currentDate = `${year}-${month}-${day}`; // YYYY-MM-DD in local time

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

                    // Sort popups: Image popups (like 여름방학) come first, newest image first. Template popups keep their original order.
                    const sortedPopups = visiblePopups.sort((a: Popup, b: Popup) => {
                        if (a.type === 'image' && b.type !== 'image') return -1;
                        if (a.type !== 'image' && b.type === 'image') return 1;
                        if (a.type === 'image' && b.type === 'image') return b.id - a.id;
                        return a.id - b.id;
                    });

                    setPopups(sortedPopups);
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
            <style dangerouslySetInnerHTML={{__html: `
                .popup-wrapper {
                    position: fixed;
                    inset: 0;
                    z-index: 9999;
                    pointer-events: none;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 1rem;
                    padding: 1rem;
                    overflow-y: auto;
                    overflow-x: hidden;
                }
                .popup-container-responsive {
                    pointer-events: auto;
                    position: relative !important;
                    width: 90vw !important;
                    max-width: var(--popup-width) !important;
                    height: var(--popup-height) !important;
                    max-height: 90vh !important;
                    display: flex !important;
                    flex-direction: column !important;
                    flex-shrink: 0;
                }
                @media (min-width: 1024px) {
                    .popup-wrapper {
                        flex-direction: row;
                        flex-wrap: wrap;
                        overflow-y: auto;
                    }
                    .popup-container-responsive {
                        width: var(--popup-width) !important;
                        height: var(--popup-height) !important;
                        max-height: 90vh !important;
                    }
                }
            `}} />
            
            {/* Backdrop for drawing attention to the popup first */}
            <div className="fixed inset-0 z-[9998] bg-black/50 transition-opacity" aria-hidden="true" />

            <div className="popup-wrapper">
                {popups.map((popup, index) => (
                    <div
                        key={popup.id}
                        style={{
                            '--popup-width': `${popup.size.width}px`,
                            '--popup-height': popup.type !== 'template' ? `${popup.size.height + 36}px` : `${popup.size.height}px`,
                            boxShadow: '0 4px 25px rgba(0,0,0,0.5)',
                            backgroundColor: 'white',
                            border: '1px solid #ddd',
                            borderRadius: '8px',
                            overflow: 'hidden'
                        } as React.CSSProperties}
                        className="popup-container-responsive popup-container"
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
                            <div className="relative flex-1 overflow-hidden bg-white">
                                {popup.link ? (
                                    <Link href={popup.link}>
                                        {popup.imageUrl ? (
                                            <Image
                                                src={popup.imageUrl}
                                                alt={popup.title}
                                                width={popup.size?.width || 500}
                                                height={popup.size?.height || 500}
                                                sizes="100vw"
                                                style={{
                                                    width: '100%',
                                                    height: '100%',
                                                    maxHeight: 'calc(90vh - 36px)',
                                                    objectFit: 'fill',
                                                    display: 'block'
                                                }}
                                            />
                                        ) : (
                                            <div style={{ width: '100%', height: '200px', backgroundColor: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <span className="text-gray-400 font-bold">이미지가 없습니다</span>
                                            </div>
                                        )}
                                    </Link>
                                ) : (
                                    <div 
                                        className="cursor-pointer" 
                                        onClick={() => closePopup(popup.id, false)}
                                        title="클릭하면 닫힙니다"
                                    >
                                        {popup.imageUrl ? (
                                            <Image
                                                src={popup.imageUrl}
                                                alt={popup.title}
                                                width={popup.size?.width || 500}
                                                height={popup.size?.height || 500}
                                                sizes="100vw"
                                                style={{
                                                    width: '100%',
                                                    height: '100%',
                                                    maxHeight: 'calc(90vh - 36px)',
                                                    objectFit: 'fill',
                                                    display: 'block'
                                                }}
                                            />
                                        ) : (
                                            <div style={{ width: '100%', height: '200px', backgroundColor: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <span className="text-gray-400 font-bold">이미지가 없습니다</span>
                                            </div>
                                        )}
                                    </div>
                                )}
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
            </div>
        </>
    );
}
