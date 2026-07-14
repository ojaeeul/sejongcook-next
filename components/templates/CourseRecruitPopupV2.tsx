import Link from 'next/link';
import Image from 'next/image';
import { CourseRecruitContent } from './CourseRecruitPopup';

interface Props {
    content: CourseRecruitContent;
    onClose: (dontShowToday: boolean) => void;
    link?: string;
}

export default function CourseRecruitPopupV2({ content, onClose, link }: Props) {
    const handleBackgroundClick = () => {
        onClose(false);
    };

    const showText = content.textVisible !== false;

    const getStyle = (style?: any, defaultColor?: string, defaultSize?: number, defaultWeight?: string, fontFamily?: string) => ({
        color: style?.color || defaultColor,
        fontSize: style?.fontSize ? `${style.fontSize}px` : (defaultSize ? `${defaultSize}px` : undefined),
        fontWeight: style?.fontWeight || defaultWeight,
        fontFamily: fontFamily || '"Pretendard", "Noto Sans KR", sans-serif'
    });

    return (
        <div
            className="w-full h-full relative flex flex-col font-sans select-none overflow-hidden bg-white text-gray-800 shadow-2xl group"
            onClick={handleBackgroundClick}
        >
            {/* {link && <Link href={link} className="absolute inset-0 z-10" />} */}

            {/* Background Image */}
            <div className="absolute inset-0 z-0">
                <Image
                    src={content.mainImage}
                    alt="Background"
                    fill
                    className="object-cover"
                    priority
                />
            </div>

            {/* Content Container */}
            {showText && (
                <div className="absolute inset-0 z-20 flex flex-col p-6 pointer-events-none">
                    
                    {/* Badge */}
                    {content.badgeText && (
                        <div className="inline-block pointer-events-auto mb-4 self-start">
                            <span
                                className="bg-[#384358] text-white px-4 py-1.5 rounded-full text-sm shadow-md"
                                style={getStyle(content.badgeStyle, '#ffffff', 13, '600')}
                            >
                                {content.badgeText}
                            </span>
                        </div>
                    )}

                    {/* Titles */}
                    <div className="pointer-events-auto flex flex-col gap-1 sm:gap-2 mb-4 sm:mb-6 mt-2 sm:mt-4">
                        <h2
                            className="leading-snug whitespace-pre-line tracking-tight text-[#1e293b] text-[clamp(24px,7vw,34px)]"
                            style={getStyle({...content.titleStyle, fontSize: undefined}, '#1e293b', undefined, '800', '"Nanum Myeongjo", "Batang", serif')}
                        >
                            {content.title}
                        </h2>
                        <p
                            className="whitespace-pre-line text-[#475569] text-[clamp(13px,3.5vw,15px)]"
                            style={getStyle({...content.subTextStyle, fontSize: undefined}, '#475569', undefined, '500')}
                        >
                            {content.subText}
                        </p>
                    </div>

                    {/* Schedules White Box */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-auto bg-white/95 backdrop-blur-md rounded-xl p-4 sm:p-5 shadow-lg border border-white/50 w-[calc(100%-2rem)] sm:w-[calc(100%-3rem)] flex flex-col gap-3 sm:gap-4">
                        {/* Schedule A */}
                        {content.scheduleA && (content.scheduleA.label || content.scheduleA.period) && (
                            <div className="flex items-start gap-3 sm:gap-4">
                                <div 
                                    className="w-[60px] sm:w-[72px] shrink-0 text-[#0369a1] pt-0.5 whitespace-nowrap text-right text-[clamp(13px,3.5vw,16px)]"
                                    style={getStyle({...content.scheduleALabelStyle, fontSize: undefined}, '#0369a1', undefined, '800')}
                                >
                                    {content.scheduleA.label}
                                </div>
                                <div className="w-[1px] bg-gray-300 self-stretch my-0.5 rounded-full" />
                                <div className="flex-1 flex flex-col gap-0.5 sm:gap-1">
                                    <div 
                                        className="text-gray-900 leading-tight whitespace-pre-line text-[clamp(14px,4vw,17px)]"
                                        style={getStyle({...content.scheduleAPeriodStyle, fontSize: undefined}, '#111827', undefined, '800')}
                                        dangerouslySetInnerHTML={{ __html: content.scheduleA.period }}
                                    />
                                    {content.scheduleA.time && (
                                        <div 
                                            className="text-gray-700 leading-tight whitespace-pre-line text-[clamp(12px,3.5vw,15px)]"
                                            style={getStyle({...content.scheduleATimeStyle, fontSize: undefined}, '#374151', undefined, '600')}
                                            dangerouslySetInnerHTML={{ __html: content.scheduleA.time }}
                                        />
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Schedule B */}
                        {content.scheduleB && (content.scheduleB.label || content.scheduleB.period) && (
                            <div className="flex items-start gap-3 sm:gap-4">
                                <div 
                                    className="w-[60px] sm:w-[72px] shrink-0 text-[#0369a1] pt-0.5 whitespace-nowrap text-right text-[clamp(13px,3.5vw,16px)]"
                                    style={getStyle({...content.scheduleBLabelStyle, fontSize: undefined}, '#0369a1', undefined, '800')}
                                >
                                    {content.scheduleB.label}
                                </div>
                                <div className="w-[1px] bg-gray-300 self-stretch my-0.5 rounded-full" />
                                <div className="flex-1 flex flex-col gap-0.5 sm:gap-1">
                                    <div 
                                        className="text-gray-900 leading-tight whitespace-pre-line text-[clamp(14px,4vw,17px)]"
                                        style={getStyle({...content.scheduleBPeriodStyle, fontSize: undefined}, '#111827', undefined, '800')}
                                        dangerouslySetInnerHTML={{ __html: content.scheduleB.period }}
                                    />
                                    {content.scheduleB.time && (
                                        <div 
                                            className="text-gray-700 leading-tight whitespace-pre-line text-[clamp(12px,3.5vw,15px)]"
                                            style={getStyle({...content.scheduleBTimeStyle, fontSize: undefined}, '#374151', undefined, '600')}
                                            dangerouslySetInnerHTML={{ __html: content.scheduleB.time }}
                                        />
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Schedule C */}
                        {content.scheduleC && (content.scheduleC.label || content.scheduleC.period) && (
                            <div className="flex items-start gap-3 sm:gap-4">
                                <div 
                                    className="w-[60px] sm:w-[72px] shrink-0 text-[#0369a1] pt-0.5 whitespace-nowrap text-right text-[clamp(13px,3.5vw,16px)]"
                                    style={getStyle({...content.scheduleCLabelStyle, fontSize: undefined}, '#0369a1', undefined, '800')}
                                >
                                    {content.scheduleC.label}
                                </div>
                                <div className="w-[1px] bg-gray-300 self-stretch my-0.5 rounded-full" />
                                <div className="flex-1 flex flex-col gap-0.5 sm:gap-1">
                                    <div 
                                        className="text-gray-900 leading-tight whitespace-pre-line text-[clamp(14px,4vw,17px)]"
                                        style={getStyle({...content.scheduleCPeriodStyle, fontSize: undefined}, '#111827', undefined, '800')}
                                        dangerouslySetInnerHTML={{ __html: content.scheduleC.period }}
                                    />
                                    {content.scheduleC.time && (
                                        <div 
                                            className="text-gray-700 leading-tight whitespace-pre-line text-[clamp(12px,3.5vw,15px)]"
                                            style={getStyle({...content.scheduleCTimeStyle, fontSize: undefined}, '#374151', undefined, '600')}
                                            dangerouslySetInnerHTML={{ __html: content.scheduleC.time }}
                                        />
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Footer Control Bar */}
            <div className="absolute bottom-0 w-full z-50 h-[48px] sm:h-[52px] flex justify-between items-center bg-[#25282f] text-white pointer-events-auto">
                <div className="flex items-center h-full px-3 z-10 bg-[#25282f]">
                    <label className="flex items-center gap-1.5 sm:gap-2 cursor-pointer hover:text-gray-300 transition-colors group/check shrink-0">
                        <input
                            type="checkbox"
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => {
                                if (e.target.checked) onClose(true);
                            }}
                            className="rounded bg-white/10 border-white/30 text-white focus:ring-0 focus:ring-offset-0 w-3.5 h-3.5 sm:w-4 sm:h-4 cursor-pointer"
                        />
                        <span className="text-[11px] sm:text-xs text-gray-300 font-medium group-hover/check:text-white pt-0.5">하루 안보기</span>
                    </label>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onClose(false);
                        }}
                        className="text-[11px] sm:text-xs text-gray-300 hover:text-white font-bold px-2 py-1 ml-1 sm:ml-2 transition-all hover:bg-white/10 rounded shrink-0"
                    >
                        [X] 닫기
                    </button>
                </div>

                {/* Footer Branding - Hidden on mobile to prevent overlap */}
                {showText && (
                    <div className="hidden sm:flex flex-1 flex-col items-end justify-center pr-4 h-full bg-[#1b1e24] skew-x-[-15deg] origin-bottom-right w-full">
                        <div className="skew-x-[15deg] flex flex-col items-end leading-tight text-right pt-0.5">
                            <div className="flex items-center gap-1.5 font-bold text-sm tracking-wide">
                                <span>031-986-1933</span>
                            </div>
                            <div className="text-[10px] text-gray-400 mt-0.5 tracking-wider">
                                김포시 김포대로 841, 6층
                            </div>
                        </div>
                    </div>
                )}
            </div>
            
            {/* Logo in footer overlay */}
            {showText && (
                <div className="absolute bottom-0 left-0 w-full z-50 h-[48px] sm:h-[52px] pointer-events-none flex justify-end sm:justify-center items-center pr-3 sm:pr-0 overflow-hidden">
                    {/* Centered logo area (Right-aligned on mobile, centered on desktop) */}
                    <div className="flex items-center gap-1.5 sm:gap-2 sm:-ml-8 opacity-70 sm:opacity-100">
                        <div className="w-4 h-4 sm:w-6 sm:h-6 rounded-full bg-white text-[#25282f] flex items-center justify-center font-black text-[8px] sm:text-[10px]">
                            세종
                        </div>
                        <span className="font-bold tracking-tight text-white/90 text-[11px] sm:text-base">세종요리제과기술학원</span>
                    </div>
                </div>
            )}
        </div>
    );
}
