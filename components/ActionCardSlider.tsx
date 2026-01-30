'use client';

import { useState, useEffect } from "react";

interface ActionCardSliderProps {
    images: string[];
    alt: string;
    interval?: number;
    className?: string;
    style?: React.CSSProperties;
    imgStyle?: React.CSSProperties;
}

export default function ActionCardSlider({
    images,
    alt,
    interval = 3000,
    className = "",
    style,
    imgStyle
}: ActionCardSliderProps) {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        if (images.length <= 1) return;

        const timer = setInterval(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
        }, interval);

        return () => clearInterval(timer);
    }, [images.length, interval]);

    return (
        <div className={`relative overflow-hidden ${className}`} style={{ width: '100%', height: '100%', ...style }}>
            {images.map((img, index) => (
                <div
                    key={`${img}-${index}`}
                    className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
                        }`}
                >
                    <img
                        src={img}
                        alt={alt}
                        className="w-full h-full object-cover"
                        style={imgStyle}
                    />
                </div>
            ))}
        </div>
    );
}
