'use client';

import React, { useState, useEffect } from "react";
import Image from "next/image";

interface ActionCardSliderProps {
    images: string[];
    alt: string;
    interval?: number;
    className?: string;
    style?: React.CSSProperties;
    imgStyle?: React.CSSProperties;
}

function ActionCardSlider({
    images,
    alt,
    interval = 3000,
    className = "",
    style,
    imgStyle
}: ActionCardSliderProps) {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        if (!images || images.length <= 1) return;

        const timer = setInterval(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
        }, interval);

        return () => clearInterval(timer);
    }, [images, interval]);

    // Better empty state check
    if (!images || images.length === 0) {
        return (
            <div className={`relative overflow-hidden ${className}`} style={{ width: '100%', height: '100%', ...style }}>
                <div className="absolute inset-0 w-full h-full bg-gray-100 flex items-center justify-center">
                    {/* Placeholder or empty */}
                    <span className="text-gray-300 text-sm">No Image</span>
                </div>
            </div>
        )
    }

    return (
        <div className={`relative overflow-hidden ${className}`} style={{ width: '100%', height: '100%', ...style }}>
            {images.map((img, index) => (
                <div
                    key={`${img}-${index}`}
                    className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out`}
                    style={{
                        opacity: index === currentIndex ? 1 : 0,
                        zIndex: index === currentIndex ? 10 : 0
                    }}
                >
                    <Image
                        src={img}
                        alt={alt}
                        fill
                        className="object-cover"
                        style={imgStyle}
                        onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                            // Fallback if image fails to load
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.parentElement!.style.backgroundColor = '#f0f0f0';
                        }}
                    />
                </div>
            ))}
            {/* Preload next image logic implicit in browser cache, 
                but we ensure first image is forcefully visible via React state init 0 */}
        </div>
    );
}

export default React.memo(ActionCardSlider);
