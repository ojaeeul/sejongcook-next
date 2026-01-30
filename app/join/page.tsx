'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function JoinPage() {
    const [formData, setFormData] = useState({
        id: '',
        pw: '',
        pw_cf: '',
        name: '',
        phone: '',
        birthdate: '',
        address: '',
        email: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.pw !== formData.pw_cf) {
            alert('비밀번호가 일치하지 않습니다.');
            return;
        }

        // Simulating submission for now
        console.log('Join Data:', formData);
        alert('회원가입이 완료되었습니다! (Demo)');
        window.location.href = '/login';
    };

    return (
        <div className="min-h-screen bg-[#f4f6f8] flex items-center justify-center py-10 px-4">
            <div className="w-full max-w-[460px] bg-white rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.08)] p-8 md:p-10 border border-white/50">

                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-[28px] font-bold text-[#1a1a1a] tracking-tight mb-2">회원가입</h1>
                    <p className="text-sm text-gray-500">간편하게 가입하고 서비스를 이용하세요</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5">

                    {/* ID */}
                    <div className="relative">
                        <label htmlFor="id" className="absolute -top-2 left-3 bg-white px-1 text-xs font-medium text-gray-500">아이디</label>
                        <input
                            type="text"
                            name="id"
                            id="id"
                            required
                            placeholder="영문, 숫자 포함"
                            value={formData.id}
                            onChange={handleChange}
                            className="w-full px-4 py-3.5 border border-gray-200 rounded-lg bg-[#fafafa] text-[#333] focus:bg-white focus:border-[#f7bc5a] focus:ring-2 focus:ring-[#f7bc5a]/20 outline-none transition-all placeholder:text-gray-400"
                        />
                    </div>

                    {/* Password Group */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="relative">
                            <label htmlFor="pw" className="absolute -top-2 left-3 bg-white px-1 text-xs font-medium text-gray-500">비밀번호</label>
                            <input
                                type="password"
                                name="pw"
                                id="pw"
                                required
                                placeholder="8자 이상"
                                value={formData.pw}
                                onChange={handleChange}
                                className="w-full px-4 py-3.5 border border-gray-200 rounded-lg bg-[#fafafa] text-[#333] focus:bg-white focus:border-[#f7bc5a] focus:ring-2 focus:ring-[#f7bc5a]/20 outline-none transition-all placeholder:text-gray-400"
                            />
                        </div>
                        <div className="relative">
                            <label htmlFor="pw_cf" className="absolute -top-2 left-3 bg-white px-1 text-xs font-medium text-gray-500">비밀번호 확인</label>
                            <input
                                type="password"
                                name="pw_cf"
                                id="pw_cf"
                                required
                                placeholder="비밀번호 재입력"
                                value={formData.pw_cf}
                                onChange={handleChange}
                                className="w-full px-4 py-3.5 border border-gray-200 rounded-lg bg-[#fafafa] text-[#333] focus:bg-white focus:border-[#f7bc5a] focus:ring-2 focus:ring-[#f7bc5a]/20 outline-none transition-all placeholder:text-gray-400"
                            />
                        </div>
                    </div>

                    {/* Name */}
                    <div className="relative">
                        <label htmlFor="name" className="absolute -top-2 left-3 bg-white px-1 text-xs font-medium text-gray-500">이름</label>
                        <input
                            type="text"
                            name="name"
                            id="name"
                            required
                            placeholder="실명을 입력하세요"
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full px-4 py-3.5 border border-gray-200 rounded-lg bg-[#fafafa] text-[#333] focus:bg-white focus:border-[#f7bc5a] focus:ring-2 focus:ring-[#f7bc5a]/20 outline-none transition-all placeholder:text-gray-400"
                        />
                    </div>

                    {/* Phone */}
                    <div className="relative">
                        <label htmlFor="phone" className="absolute -top-2 left-3 bg-white px-1 text-xs font-medium text-gray-500">전화번호</label>
                        <input
                            type="text"
                            name="phone"
                            id="phone"
                            placeholder="010-0000-0000"
                            value={formData.phone}
                            onChange={handleChange}
                            className="w-full px-4 py-3.5 border border-gray-200 rounded-lg bg-[#fafafa] text-[#333] focus:bg-white focus:border-[#f7bc5a] focus:ring-2 focus:ring-[#f7bc5a]/20 outline-none transition-all placeholder:text-gray-400"
                        />
                    </div>

                    {/* Birthdate */}
                    <div className="relative">
                        <label htmlFor="birthdate" className="absolute -top-2 left-3 bg-white px-1 text-xs font-medium text-gray-500">생년월일</label>
                        <input
                            type="date"
                            name="birthdate"
                            id="birthdate"
                            required
                            value={formData.birthdate}
                            onChange={handleChange}
                            className="w-full px-4 py-3.5 border border-gray-200 rounded-lg bg-[#fafafa] text-[#333] focus:bg-white focus:border-[#f7bc5a] focus:ring-2 focus:ring-[#f7bc5a]/20 outline-none transition-all"
                        />
                    </div>

                    {/* Address */}
                    <div className="relative">
                        <label htmlFor="address" className="absolute -top-2 left-3 bg-white px-1 text-xs font-medium text-gray-500">주소</label>
                        <input
                            type="text"
                            name="address"
                            id="address"
                            required
                            placeholder="주소를 입력하세요"
                            value={formData.address}
                            onChange={handleChange}
                            className="w-full px-4 py-3.5 border border-gray-200 rounded-lg bg-[#fafafa] text-[#333] focus:bg-white focus:border-[#f7bc5a] focus:ring-2 focus:ring-[#f7bc5a]/20 outline-none transition-all placeholder:text-gray-400"
                        />
                    </div>

                    {/* Email */}
                    <div className="relative">
                        <label htmlFor="email" className="absolute -top-2 left-3 bg-white px-1 text-xs font-medium text-gray-500">이메일 (선택)</label>
                        <input
                            type="email"
                            name="email"
                            id="email"
                            placeholder="email@example.com"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full px-4 py-3.5 border border-gray-200 rounded-lg bg-[#fafafa] text-[#333] focus:bg-white focus:border-[#f7bc5a] focus:ring-2 focus:ring-[#f7bc5a]/20 outline-none transition-all placeholder:text-gray-400"
                        />
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className="w-full py-4 rounded-lg bg-gradient-to-br from-[#f7bc5a] to-[#f5a623] text-white text-base font-bold shadow-[0_4px_12px_rgba(245,166,35,0.3)] hover:-translate-y-0.5 hover:shadow-[0_6px_15px_rgba(245,166,35,0.4)] transition-all active:scale-[0.98]"
                    >
                        가입하기
                    </button>
                </form>

                {/* Footer Link */}
                <div className="text-center mt-6 text-sm text-gray-500">
                    이미 계정이 있으신가요?
                    <Link href="/login" className="text-[#f5a623] font-semibold ml-1 hover:underline">
                        로그인하기
                    </Link>
                </div>

            </div>
        </div>
    );
}
