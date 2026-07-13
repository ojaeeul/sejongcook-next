'use client';

import React from 'react';
import Image from 'next/image';

// ...
interface ShinyLaurelBannerProps {
    visible?: boolean;
    stars?: number;
    name?: string;
    textScale?: number;
}

export default function ShinyLaurelBanner({ visible = true, stars = 5, name, textScale = 1 }: ShinyLaurelBannerProps) {
    if (!visible) return null;
    // ... (rest of component) ...
    // ...
    if (!visible) return null;

    const starCount = Math.min(Math.max(Number(stars) || 1, 1), 8);

    // Percentage-based star positioning for responsiveness
    // Base image assumed to have wreath centered
    const getStarStyle = (index: number, total: number) => {
        // Single star: Center it like the reference (Reference 1)
        // Multi stars: Arc them (Reference 0)

        const isSingle = total === 1;

        // Arch spread matches the wreath curve
        // Adaptive spread: more stars = wider arc
        const angleRange = isSingle ? 0 : Math.min(total * 12, 100);

        const startAngle = -90 - angleRange / 2;
        const angleStep = isSingle ? 0 : angleRange / (total - 1);
        const currentAngle = startAngle + index * angleStep;

        // Radius as % of container width to scale with image
        // Adjusted to ~27% to fit the wreath in premium_base_v3.jpg
        const radiusPercent = 27;
        const rad = (currentAngle * Math.PI) / 180;

        const xPercent = Math.cos(rad) * radiusPercent;
        const yPercent = Math.sin(rad) * radiusPercent;

        // Vertical offset to move stars up/down relative to center
        // Uniform position for all cases as requested
        const yOffset = 8;

        // Star scale relative to container width?
        // Keep single star slightly larger for emphasis, but position is now uniform
        const starSizePercent = total === 1 ? 15 : 9;

        return {
            left: `${50 + xPercent}%`,
            top: `${50 + yPercent + yOffset}%`,
            width: `${starSizePercent}%`,
            transform: `translate(-50%, -50%) rotate(${currentAngle + 90}deg)`,
            zIndex: 20
        };
    };

    return (
        <div className="w-full relative flex justify-center items-center overflow-hidden select-none aspect-square md:aspect-[5/4] bg-black p-[5%]">
            <div className="relative w-full h-full flex justify-center items-center">
                {/* The ONLY visual centerpiece - High Resolution Base Image */}
                <div className="absolute inset-0 z-0">
                    <Image
                        src="/img/premium_base_v4.jpg"
                        alt="Premium Background"
                        fill
                        className="object-contain"
                        priority
                    />
                </div>

                {/* Overlays - Stars and Name centered on the base image */}
                <div className="relative w-full h-full flex justify-center items-center z-10 pointer-events-none">
                    {/* Responsive Star Overlays */}
                    <div className="absolute inset-0 z-20">
                        {Array.from({ length: starCount }).map((_, i) => (
                            <div
                                key={i}
                                className="absolute aspect-square flex items-center justify-center"
                                style={getStarStyle(i, starCount)}
                            >
                                {/* Added drop-shadow for 'shine' and to soften edges */}
                                <div
                                    className="w-full h-full"
                                    style={{
                                        filter: 'drop-shadow(0 0 8px rgba(255, 215, 0, 0.8)) brightness(1.2)',
                                    }}
                                >
                                    <div
                                        className="w-full h-full relative"
                                        style={{
                                            clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)'
                                        }}
                                    >
                                        <Image
                                            src="/img/premium_gold_star.png"
                                            alt="Gold Star"
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Name Overlay - Positioned under the stars */}
                    {name && (
                        <div className="absolute top-[68%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center z-30 w-full px-8">
                            <h3
                                className="text-white text-base sm:text-xl md:text-2xl lg:text-4xl font-extrabold tracking-[0.2em] drop-shadow-[0_4px_12px_rgba(0,0,0,1)] origin-center transition-transform duration-200"
                                style={{
                                    textShadow: '0 0 40px rgba(0, 0, 0, 1)',
                                    transform: `scale(${textScale})`
                                }}
                            >
                                {name}
                            </h3>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
