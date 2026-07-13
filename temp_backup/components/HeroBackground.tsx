'use client';

import { useState, useEffect, useMemo } from 'react';
import { DEFAULT_HERO_DATA } from '../app/data/defaultHeroData';

interface HeroBackgroundProps {
    images?: string[];
}

export default function HeroBackground({ images }: HeroBackgroundProps) {
    const [currentSlide, setCurrentSlide] = useState(0);

    // Fallback images if none provided
    const safeImages = useMemo(() => {
        if (images && images.length > 0) return images;
        // Fallback logic extracted from page.tsx legacy behavior
        return DEFAULT_HERO_DATA.photos.map(g => Array.isArray(g) ? g[0] : g as string);
    }, [images]);

    useEffect(() => {
        if (safeImages.length <= 1) return;

        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % safeImages.length);
        }, 5000);

        return () => clearInterval(timer);
    }, [safeImages, currentSlide]);

    const [touchStart, setTouchStart] = useState<number | null>(null);
    const [touchEnd, setTouchEnd] = useState<number | null>(null);

    // Minimum swipe distance (in px) 
    const minSwipeDistance = 50;

    const onTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
        setTouchEnd(null); // Reset touch end
        if ('touches' in e) {
            setTouchStart(e.targetTouches[0].clientX);
        } else {
            setTouchStart((e as React.MouseEvent).clientX);
        }
    };

    const onTouchMove = (e: React.TouchEvent | React.MouseEvent) => {
        if ('touches' in e) {
            setTouchEnd(e.targetTouches[0].clientX);
        } else {
            setTouchEnd((e as React.MouseEvent).clientX);
        }
    };

    const onTouchEnd = () => {
        if (!touchStart || !touchEnd) return;

        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > minSwipeDistance;
        const isRightSwipe = distance < -minSwipeDistance;

        if (isLeftSwipe || isRightSwipe) {
            if (isLeftSwipe) {
                // Next slide
                setCurrentSlide((prev) => (prev + 1) % safeImages.length);
            } else {
                // Prev slide
                setCurrentSlide((prev) => (prev - 1 + safeImages.length) % safeImages.length);
            }
        }
    };

    return (
        <div
            className="absolute inset-0 z-0 overflow-hidden cursor-grab active:cursor-grabbing"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
            onMouseDown={onTouchStart}
            onMouseMove={(e) => {
                // only record move if button is pressed
                if (e.buttons === 1) onTouchMove(e);
            }}
            onMouseUp={onTouchEnd}
            onMouseLeave={onTouchEnd}
        >
            {safeImages.map((img: string, index: number) => (
                <div
                    key={`${img}-${index}`}
                    className={`absolute inset-0 bg-cover bg-center bg-fixed transition-opacity duration-1000 ${index === currentSlide ? 'opacity-100' : 'opacity-0'}`}
                    style={{ backgroundImage: `url('${img}')` }}
                />
            ))}
            <div className="absolute inset-0 bg-black/50 z-10 pointer-events-none" />

            {/* Navigation Dots */}
            <div className="absolute bottom-8 left-0 right-0 z-30 flex justify-center gap-3">
                {safeImages.map((_, index) => (
                    <button
                        key={index}
                        onClick={(e) => {
                            e.stopPropagation(); // Prevent drag triggering
                            setCurrentSlide(index);
                        }}
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${index === currentSlide
                            ? 'bg-white scale-125 shadow-lg ring-2 ring-white/50'
                            : 'bg-white/40 hover:bg-white/70'
                            }`}
                        aria-label={`Go to slide ${index + 1}`}
                    />
                ))}
            </div>
        </div>
    );
}
