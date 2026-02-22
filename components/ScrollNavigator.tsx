'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { ArrowUp, ArrowDown } from 'lucide-react';

export default function ScrollNavigator() {
    const [isAtTop, setIsAtTop] = useState(true);
    const pathname = usePathname();

    // Check scroll position to toggle visibility/state
    useEffect(() => {
        const handleScroll = () => {
            const scrollY = window.scrollY;
            // Consider "Top" if within top 100px
            setIsAtTop(scrollY < 100);
        };

        window.addEventListener('scroll', handleScroll);
        handleScroll(); // Initial check

        return () => window.removeEventListener('scroll', handleScroll);
    }, [pathname]);

    const handleClick = () => {
        if (isAtTop) {
            // Go to Bottom
            window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' });
        } else {
            // Go to Top
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    return (
        <div className="fixed bottom-8 right-8 z-[9999]">
            <button
                onClick={handleClick}
                className={`w-[60px] h-[60px] rounded-full shadow-lg flex flex-col items-center justify-center transition-all duration-300 hover:scale-105 border 
                ${isAtTop
                        ? 'bg-[#f5a623] text-white border-[#f5a623] hover:bg-[#ff8c00]' // Down style (Orange)
                        : 'bg-white text-[#333] border-[#eee] hover:text-[#f5a623] hover:border-[#f5a623]'   // Up style
                    }`}
                aria-label={isAtTop ? "Scroll to bottom" : "Scroll to top"}
            >
                {isAtTop ? (
                    <>
                        <span className="text-xs font-bold mb-[2px]">아래로</span>
                        <ArrowDown size={20} strokeWidth={2.5} />
                    </>
                ) : (
                    <>
                        <ArrowUp size={20} strokeWidth={2.5} className="mb-[2px]" />
                        <span className="text-xs font-bold">위로</span>
                    </>
                )}
            </button>
        </div>
    );
}
