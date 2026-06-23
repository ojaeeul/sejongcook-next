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
            className="cursor-pointer w-full h-full relative flex flex-col font-sans select-none overflow-hidden bg-white text-gray-800 shadow-2xl group"
            onClick={handleBackgroundClick}
        >
            {link && <Link href={link} className="absolute inset-0 z-10" />}

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
                    <div className="pointer-events-auto flex flex-col gap-2 mb-6 mt-4">
                        <h2
                            className="leading-snug whitespace-pre-line tracking-tight text-[#1e293b]"
                            style={getStyle(content.titleStyle, '#1e293b', 34, '800', '"Nanum Myeongjo", "Batang", serif')}
                        >
                            {content.title}
                        </h2>
                        <p
                            className="whitespace-pre-line text-[#475569]"
                            style={getStyle(content.subTextStyle, '#475569', 15, '500')}
                        >
                            {content.subText}
                        </p>
                    </div>

                    {/* Schedules White Box */}
                    <div className="pointer-events-auto bg-white/95 backdrop-blur-md rounded-xl p-5 shadow-lg border border-white/50 w-full my-auto flex flex-col gap-4">
                        {/* Schedule A */}
                        {content.scheduleA && (content.scheduleA.label || content.scheduleA.period) && (
                            <div className="flex items-start gap-4">
                                <div 
                                    className="w-16 shrink-0 text-[#0369a1] pt-0.5 whitespace-nowrap text-right"
                                    style={getStyle(content.scheduleALabelStyle, '#0369a1', 14, '800')}
                                >
                                    {content.scheduleA.label}
                                </div>
                                <div className="w-[1px] bg-gray-300 self-stretch my-0.5 rounded-full" />
                                <div className="flex-1 flex flex-col gap-1">
                                    <div 
                                        className="text-gray-900 leading-tight"
                                        style={getStyle(content.scheduleAPeriodStyle, '#111827', 15, '800')}
                                    >
                                        {content.scheduleA.period}
                                    </div>
                                    {content.scheduleA.time && (
                                        <div 
                                            className="text-gray-700 leading-tight"
                                            style={getStyle(content.scheduleATimeStyle, '#374151', 13, '600')}
                                        >
                                            {content.scheduleA.time}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Schedule B */}
                        {content.scheduleB && (content.scheduleB.label || content.scheduleB.period) && (
                            <div className="flex items-start gap-4">
                                <div 
                                    className="w-16 shrink-0 text-[#0369a1] pt-0.5 whitespace-nowrap text-right"
                                    style={getStyle(content.scheduleBLabelStyle, '#0369a1', 14, '800')}
                                >
                                    {content.scheduleB.label}
                                </div>
                                <div className="w-[1px] bg-gray-300 self-stretch my-0.5 rounded-full" />
                                <div className="flex-1 flex flex-col gap-1">
                                    <div 
                                        className="text-gray-900 leading-tight"
                                        style={getStyle(content.scheduleBPeriodStyle, '#111827', 15, '800')}
                                    >
                                        {content.scheduleB.period}
                                    </div>
                                    {content.scheduleB.time && (
                                        <div 
                                            className="text-gray-700 leading-tight"
                                            style={getStyle(content.scheduleBTimeStyle, '#374151', 13, '600')}
                                        >
                                            {content.scheduleB.time}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Schedule C */}
                        {content.scheduleC && (content.scheduleC.label || content.scheduleC.period) && (
                            <div className="flex items-start gap-4">
                                <div 
                                    className="w-16 shrink-0 text-[#0369a1] pt-0.5 whitespace-nowrap text-right"
                                    style={getStyle(content.scheduleCLabelStyle, '#0369a1', 14, '800')}
                                >
                                    {content.scheduleC.label}
                                </div>
                                <div className="w-[1px] bg-gray-300 self-stretch my-0.5 rounded-full" />
                                <div className="flex-1 flex flex-col gap-1">
                                    <div 
                                        className="text-gray-900 leading-tight"
                                        style={getStyle(content.scheduleCPeriodStyle, '#111827', 15, '800')}
                                    >
                                        {content.scheduleC.period}
                                    </div>
                                    {content.scheduleC.time && (
                                        <div 
                                            className="text-gray-700 leading-tight"
                                            style={getStyle(content.scheduleCTimeStyle, '#374151', 13, '600')}
                                        >
                                            {content.scheduleC.time}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Footer Control Bar */}
            <div className="absolute bottom-0 w-full z-50 h-[52px] flex justify-between items-center bg-[#25282f] text-white pointer-events-auto">
                <div className="flex-1 flex items-center h-full px-3">
                    <label className="flex items-center gap-2 cursor-pointer hover:text-gray-300 transition-colors group/check shrink-0">
                        <input
                            type="checkbox"
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => {
                                if (e.target.checked) onClose(true);
                            }}
                            className="rounded bg-white/10 border-white/30 text-white focus:ring-0 focus:ring-offset-0 w-4 h-4 cursor-pointer"
                        />
                        <span className="text-xs text-gray-300 font-medium group-hover/check:text-white pt-0.5">하루 안보기</span>
                    </label>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onClose(false);
                        }}
                        className="text-xs text-gray-300 hover:text-white font-bold px-2 py-1 ml-2 transition-all hover:bg-white/10 rounded shrink-0"
                    >
                        [X] 닫기
                    </button>
                </div>

                {/* Footer Branding */}
                {showText && (
                    <div className="flex-1 flex flex-col items-end justify-center pr-4 h-full bg-[#1b1e24] skew-x-[-15deg] origin-bottom-right w-full">
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
            
            {/* Logo in footer overlay (since skew can be tricky) */}
            {showText && (
                <div className="absolute bottom-0 left-0 w-full z-50 h-[52px] pointer-events-none flex justify-center items-center">
                    {/* Centered logo area */}
                    <div className="flex items-center gap-2 -ml-8">
                        <div className="w-6 h-6 rounded-full bg-white text-[#25282f] flex items-center justify-center font-black text-[10px]">
                            세종
                        </div>
                        <span className="font-bold tracking-tight text-white/90">세종요리제과기술학원</span>
                    </div>
                </div>
            )}
        </div>
    );
}
