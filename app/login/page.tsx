'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function LoginPage() {
    return (
        <div className="max-w-[1200px] mx-auto py-12 px-4 flex flex-col md:flex-row gap-10">
            {/* Left Sidebar (Reference: login.html submenu) */}
            <aside className="w-full md:w-[250px] flex-shrink-0">
                <div className="bg-white border-t-2 border-[#333]">
                    <h2 className="text-xl font-bold py-4 border-b border-[#eee]">이용약관</h2>
                    <ul className="text-sm text-gray-600">
                        <li className="border-b border-[#eee]">
                            <Link href="/terms" className="block py-3 px-2 hover:bg-gray-50 hover:text-orange-500 flex justify-between items-center group">
                                <span>이용약관</span>
                                <span className="text-gray-300 group-hover:text-orange-500">▶</span>
                            </Link>
                        </li>
                        <li className="border-b border-[#eee]">
                            <Link href="/privacy" className="block py-3 px-2 hover:bg-gray-50 hover:text-orange-500 flex justify-between items-center group">
                                <span>개인정보 취급방침</span>
                                <span className="text-gray-300 group-hover:text-orange-500">▶</span>
                            </Link>
                        </li>
                    </ul>
                </div>
            </aside>

            {/* Right Content */}
            <div className="flex-1">
                {/* Title Section */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-[#333] border-b-2 border-[#333] pb-4">로그인</h1>
                </div>

                {/* Login Form Container */}
                <div className="max-w-[600px] mx-auto mt-12 bg-white border border-[#eee] rounded-lg p-8 shadow-[0_5px_15px_rgba(0,0,0,0.03)]">

                    <h2 className="text-2xl font-bold text-[#333] mb-6 pb-2 border-b border-[#eee]">LOGIN</h2>

                    <form className="space-y-6">

                        {/* Options */}
                        <div className="flex gap-4 text-sm text-gray-600 mb-4">
                            <label className="flex items-center gap-1 cursor-pointer hover:text-black">
                                <input type="checkbox" className="w-4 h-4 accent-[#4a3b32]" />
                                <span>아이디 저장</span>
                            </label>
                            <label className="flex items-center gap-1 cursor-pointer hover:text-black">
                                <input type="checkbox" className="w-4 h-4 accent-[#4a3b32]" />
                                <span>자동 로그인</span>
                            </label>
                            <label className="flex items-center gap-1 cursor-pointer hover:text-black">
                                <input type="checkbox" className="w-4 h-4 accent-blue-500" defaultChecked />
                                <span className="font-bold text-blue-600">보안접속</span>
                            </label>
                        </div>

                        {/* Inputs */}
                        <div className="space-y-3">
                            <div>
                                <input
                                    type="text"
                                    placeholder="아이디"
                                    className="w-full px-4 py-3 border border-[#ddd] rounded focus:border-[#4a3b32] focus:ring-1 focus:ring-[#4a3b32] outline-none transition-colors"
                                />
                            </div>
                            <div>
                                <input
                                    type="password"
                                    placeholder="비밀번호"
                                    className="w-full px-4 py-3 border border-[#ddd] rounded focus:border-[#4a3b32] focus:ring-1 focus:ring-[#4a3b32] outline-none transition-colors"
                                />
                            </div>
                        </div>

                        {/* Login Button */}
                        <button
                            type="submit"
                            className="w-full bg-[#4a3b32] hover:bg-[#3d3029] text-white font-bold py-4 rounded transition-colors text-lg shadow-md"
                        >
                            로그인
                        </button>

                        {/* Links */}
                        <div className="flex justify-center gap-4 text-sm text-gray-500 pt-2">
                            <Link href="/find" className="hover:underline hover:text-black">아이디 · 비밀번호 찾기</Link>
                            <span className="w-[1px] bg-gray-300 h-3 self-center"></span>
                            <Link href="/join" className="text-[#f5a623] font-bold hover:underline">회원가입</Link>
                        </div>

                    </form>
                </div>
            </div>
        </div>
    );
}
