
import Link from 'next/link';
import Image from 'next/image';

interface Schedule {
    label: string;
    period: string;
    time: string;
}

// Helper interface for style objects
export interface TextStyle {
    color?: string;
    fontSize?: number;
    fontWeight?: string;
}

export interface CourseRecruitContent {
    title: string;
    badgeText: string;
    subText: string;
    scheduleA: Schedule;
    scheduleB: Schedule;
    mainImage: string;
    subImage?: string;
    footerContact: string; // Left Text (Contact/Notice)
    textVisible?: boolean;
    // Granular Style configurations
    titleStyle?: TextStyle;
    subTextStyle?: TextStyle;
    badgeStyle?: TextStyle;
    scheduleALabelStyle?: TextStyle;
    scheduleAPeriodStyle?: TextStyle;
    scheduleATimeStyle?: TextStyle;
    scheduleBLabelStyle?: TextStyle;
    scheduleBPeriodStyle?: TextStyle;
    scheduleBTimeStyle?: TextStyle;
    footerStyle?: TextStyle;
}

interface Props {
    content: CourseRecruitContent;
    onClose: (dontShowToday: boolean) => void;
    link?: string;
}

export default function CourseRecruitPopup({ content, onClose, link }: Props) {
    const handleBackgroundClick = () => {
        // Prevent click from propagating
        // e.stopPropagation();
    };

    // Default to true if undefined. 
    // If False: Hide Title, SubText, Badge, Schedule Box, and Footer Contact Text.
    const showText = content.textVisible !== false;

    // Helper to generate style object safely
    const getStyle = (style?: TextStyle, defaultColor?: string, defaultSize?: number, defaultWeight?: string, fontFamily?: string) => ({
        color: style?.color || defaultColor,
        fontSize: style?.fontSize ? `${style.fontSize}px` : (defaultSize ? `${defaultSize}px` : undefined),
        fontWeight: style?.fontWeight || defaultWeight,
        fontFamily: fontFamily || '"Jua", sans-serif'
    });

    return (
        <div
            className="w-full h-full relative flex flex-col font-sans select-none overflow-hidden bg-black text-white shadow-2xl group"
            onClick={handleBackgroundClick}
        >
            {/* Link Wrapper */}
            {link && <Link href={link} className="absolute inset-0 z-10" />}

            {/* Background Layer */}
            <div className="absolute inset-0 z-0">
                <Image
                    src={content.mainImage}
                    alt="Background"
                    fill
                    className="object-cover transition-transform duration-[2s] group-hover:scale-110"
                    priority
                />
                {/* Cinematic Gradient: Only show if text is visible to improve readability */}
                {showText && <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 via-30% to-transparent"></div>}
            </div>

            {/* Badge (floating top left) */}
            {showText && (
                <div className="absolute top-5 left-5 z-20">
                    <div
                        className="bg-white/90 backdrop-blur text-black px-2.5 py-1 rounded-sm shadow-xl uppercase border-l-4 border-yellow-500"
                        style={getStyle(content.badgeStyle, 'black', 10, '900', 'sans-serif')}
                    >
                        {content.badgeText}
                    </div>
                </div>
            )}

            {/* Content Layer: Bottom Banner Style */}
            {showText && (
                <div className="absolute inset-0 z-20 flex flex-col justify-center items-center px-6 text-center pointer-events-none">
                    <div className="pointer-events-auto">

                        {/* Title Section (Hero Text) */}
                        <div className="mb-4">
                            <p
                                className="mb-1 uppercase drop-shadow-md tracking-widest"
                                style={getStyle(content.subTextStyle, '#facc15', 14, '700', 'sans-serif')}
                            >
                                {content.subText}
                            </p>
                            <h2
                                className="leading-none drop-shadow-xl"
                                style={getStyle(content.titleStyle, 'white', 36, '900')}
                            >
                                {content.title}
                            </h2>
                        </div>

                        {/* Unified Schedule Banner - Compact & Centered */}
                        <div className="bg-white/10 backdrop-blur-md rounded-lg border border-white/20 py-2 px-1 mb-1 mx-auto w-full max-w-[300px]">
                            <div className="flex divide-x divide-white/20">
                                {/* Schedule A */}
                                <div className="flex-1 px-1 flex flex-col justify-center items-center">
                                    <span
                                        className="bg-blue-500/80 px-1.5 py-0.5 rounded-full mb-0.5"
                                        style={getStyle(content.scheduleALabelStyle, '#eff6ff', 10, '700', 'sans-serif')}
                                    >
                                        {content.scheduleA.label}
                                    </span>
                                    <div
                                        className="leading-tight mb-0.5"
                                        style={getStyle(content.scheduleAPeriodStyle, 'white', 15, '700')}
                                    >
                                        {content.scheduleA.period}
                                    </div>
                                    <div
                                        className="tracking-wide drop-shadow-sm"
                                        style={getStyle(content.scheduleATimeStyle, '#fde047', 12, '800', 'sans-serif')}
                                    >
                                        {content.scheduleA.time}
                                    </div>
                                </div>

                                {/* Schedule B */}
                                <div className="flex-1 px-1 flex flex-col justify-center items-center">
                                    <span
                                        className="bg-purple-500/80 px-1.5 py-0.5 rounded-full mb-0.5"
                                        style={getStyle(content.scheduleBLabelStyle, '#faf5ff', 10, '700', 'sans-serif')}
                                    >
                                        {content.scheduleB.label}
                                    </span>
                                    <div
                                        className="leading-tight mb-0.5"
                                        style={getStyle(content.scheduleBPeriodStyle, 'white', 15, '700')}
                                    >
                                        {content.scheduleB.period}
                                    </div>
                                    <div
                                        className="tracking-wide drop-shadow-sm"
                                        style={getStyle(content.scheduleBTimeStyle, '#fde047', 12, '800', 'sans-serif')}
                                    >
                                        {content.scheduleB.time}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Footer Control Bar (Distinct Bottom Bar) */}
            <div className="absolute bottom-0 w-full z-50 h-10 px-3 flex justify-between items-center bg-black/60 backdrop-blur-sm border-t border-white/10">
                <label className="flex items-center gap-2 cursor-pointer hover:text-white transition-colors group/check">
                    <input
                        type="checkbox"
                        onClick={(e) => {
                            e.stopPropagation(); // Click checkbox only
                        }}
                        onChange={(e) => {
                            if (e.target.checked) {
                                onClose(true);
                            }
                        }}
                        className="rounded bg-white/20 border-white/40 text-yellow-500 focus:ring-0 focus:ring-offset-0 w-3.5 h-3.5 cursor-pointer"
                    />
                    <span className="text-[11px] text-gray-300 font-medium group-hover/check:text-white pt-0.5">오늘 하루 안보기</span>
                </label>

                {/* Footer Contact Text - Hidden if showText is false or empty */}
                {showText && content.footerContact && (
                    <div
                        className="mx-auto text-center truncate px-2"
                        style={getStyle(content.footerStyle, '#d1d5db', 11, '400', 'sans-serif')}
                    >
                        {content.footerContact}
                    </div>
                )}

                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onClose(false);
                    }}
                    className="text-[11px] text-gray-300 hover:text-white font-bold px-2 py-1 transition-all hover:bg-white/10 rounded"
                >
                    CLOSE X
                </button>
            </div>
        </div>
    );
}
