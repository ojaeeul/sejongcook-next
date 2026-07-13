'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function FindPage() {
    const [mode, setMode] = useState<'id' | 'password'>('id');
    const [step, setStep] = useState<1 | 2>(1); // 1: Input, 2: Result
    const [inputValue, setInputValue] = useState('');

    const handleNext = () => {
        if (!inputValue.trim()) {
            alert('정보를 입력해 주세요.');
            return;
        }
        setStep(2);
    };

    const resetProcess = (newMode: 'id' | 'password') => {
        setMode(newMode);
        setStep(1);
        setInputValue('');
    };

    return (
        <div className="max-w-[1200px] mx-auto py-12 px-4 flex flex-col md:flex-row gap-10 font-sans">
            <aside className="w-full md:w-[250px] flex-shrink-0">
                <div className="bg-white border-t-2 border-[#333]">
                    <h2 className="text-xl font-bold py-4 border-b border-[#eee] text-[#333] tracking-tight">약관 및 정책</h2>
                    <ul className="text-sm text-gray-600">
                        <li className="border-b border-[#eee]">
                            <Link href="/terms" className="block py-3 px-2 hover:bg-gray-50 hover:text-orange-500 flex justify-between items-center group transition-colors">
                                <span>이용약관</span>
                                <span className="text-gray-300 group-hover:text-orange-500">▶</span>
                            </Link>
                        </li>
                        <li className="border-b border-[#eee]">
                            <Link href="/privacy" className="block py-3 px-2 hover:bg-gray-50 hover:text-orange-500 flex justify-between items-center group transition-colors">
                                <span>개인정보 취급방침</span>
                                <span className="text-gray-300 group-hover:text-orange-500">▶</span>
                            </Link>
                        </li>
                    </ul>
                </div>
            </aside>
            <div className="flex-1">
                {/* Tabs */}
                <div className="max-w-[600px] mx-auto mb-8">
                    <div className="flex border-b border-gray-200">
                        <button
                            onClick={() => resetProcess('id')}
                            className={`flex-1 py-4 text-center font-bold text-lg transition-all relative ${mode === 'id' ? 'text-[#00c73c]' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            아이디 찾기
                            {mode === 'id' && <span className="absolute bottom-[-1px] left-0 w-full h-[3px] bg-[#00c73c]"></span>}
                        </button>
                        <button
                            onClick={() => resetProcess('password')}
                            className={`flex-1 py-4 text-center font-bold text-lg transition-all relative ${mode === 'password' ? 'text-[#00c73c]' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            비밀번호 찾기
                            {mode === 'password' && <span className="absolute bottom-[-1px] left-0 w-full h-[3px] bg-[#00c73c]"></span>}
                        </button>
                    </div>
                </div>

                <div className="max-w-[600px] mx-auto">
                    {/* Content Card */}
                    <div className="bg-white border border-gray-200 rounded-xl p-10 shadow-sm min-h-[460px] flex flex-col justify-between">
                        {step === 1 ? (
                            // STEP 1: Input Form
                            mode === 'id' ? (
                                <div className="space-y-8 flex-1 flex flex-col">
                                    <div>
                                        <h3 className="text-2xl font-bold text-[#333] mb-2">아이디 찾기</h3>
                                        <p className="text-gray-500 text-sm">전화번호나 이메일을 입력해 주세요.</p>
                                    </div>
                                    <div className="space-y-3 flex-1">
                                        <input
                                            type="text"
                                            value={inputValue}
                                            onChange={(e) => setInputValue(e.target.value)}
                                            placeholder="전화번호 또는 본인확인 이메일"
                                            className="w-full px-4 py-4 border border-[#00c73c] rounded-md text-base outline-none focus:ring-2 focus:ring-[#00c73c]/20 transition-all placeholder-gray-400"
                                        />
                                        <div className="text-left">
                                            <button onClick={() => alert('본인인증 서비스는 준비중입니다.')} className="text-sm text-gray-600 hover:text-black font-medium border-b border-gray-500 pb-0.5">휴대폰 본인인증으로 찾기</button>
                                        </div>
                                    </div>
                                    <div className="space-y-6">
                                        <button onClick={handleNext} className="w-full bg-[#00c73c] hover:bg-[#00b035] text-white font-bold py-4 rounded-md text-lg transition-colors shadow-md hover:shadow-lg transform active:scale-[0.99] transition-all">
                                            다음
                                        </button>
                                        <div className="text-center">
                                            <Link href="/login" className="text-sm text-gray-500 hover:underline border-b border-gray-300 pb-0.5">로그인 하러 가기</Link>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-8 flex-1 flex flex-col">
                                    <div>
                                        <h3 className="text-2xl font-bold text-[#333] mb-2">비밀번호 찾기</h3>
                                        <p className="text-gray-500 text-sm">아이디를 입력해 주세요.</p>
                                    </div>
                                    <div className="space-y-3 flex-1">
                                        <input
                                            type="text"
                                            value={inputValue}
                                            onChange={(e) => setInputValue(e.target.value)}
                                            placeholder="아이디"
                                            className="w-full px-4 py-4 border border-[#00c73c] rounded-md text-base outline-none focus:ring-2 focus:ring-[#00c73c]/20 transition-all placeholder-gray-400"
                                        />
                                    </div>
                                    <div className="space-y-6">
                                        <button onClick={handleNext} className="w-full bg-[#00c73c] hover:bg-[#00b035] text-white font-bold py-4 rounded-md text-lg transition-colors shadow-md hover:shadow-lg transform active:scale-[0.99] transition-all">
                                            다음
                                        </button>
                                        <div className="text-center">
                                            <button onClick={() => resetProcess('id')} className="text-sm text-gray-500 hover:underline border-b border-gray-300 pb-0.5">아이디가 기억나지 않나요?</button>
                                        </div>
                                    </div>
                                </div>
                            )
                        ) : (
                            // STEP 2: Result Mock
                            <div className="flex flex-col items-center justify-center h-full text-center space-y-8 flex-1">
                                <div className="w-20 h-20 bg-[#f0fdf4] rounded-full flex items-center justify-center text-[#00c73c] text-4xl mb-2">
                                    ✓
                                </div>
                                {mode === 'id' ? (
                                    <div className="space-y-2">
                                        <h3 className="text-2xl font-bold text-[#333]">회원님의 아이디를 찾았습니다.</h3>
                                        <p className="text-gray-600">
                                            회원님의 아이디는 <br /><strong className="text-[#00c73c] text-2xl mt-2 block">test***</strong> 입니다.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <h3 className="text-2xl font-bold text-[#333]">임시 비밀번호 발송 완료</h3>
                                        <p className="text-gray-600">
                                            회원님의 이메일로 임시 비밀번호를 발송했습니다.<br />
                                            <span className="text-sm text-gray-500 mt-2 block">이메일을 확인해 주세요.</span>
                                        </p>
                                    </div>
                                )}
                                <div className="flex flex-col w-full gap-3 pt-4">
                                    <Link href="/login" className="w-full bg-[#333] hover:bg-black text-white font-bold py-4 rounded-md text-center transition-colors shadow-md">
                                        로그인 하러 가기
                                    </Link>
                                    {mode === 'id' && (
                                        <button onClick={() => resetProcess('password')} className="w-full border border-gray-300 hover:bg-gray-50 text-gray-600 font-bold py-4 rounded-md transition-colors">
                                            비밀번호 찾기
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
