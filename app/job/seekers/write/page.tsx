'use client';

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import SuccessModal from "@/components/SuccessModal";
import JobSidebar from "@/components/JobSidebar";
import Editor from "@/components/Editor";




function WriteForm() {
    const searchParams = useSearchParams();
    const idx = searchParams.get('idx');
    const isEdit = !!idx;

    const [subject, setSubject] = useState("");
    const [author, setAuthor] = useState("");
    const [phone, setPhone] = useState("");
    const [content, setContent] = useState("");
    const [consent1, setConsent1] = useState(false);
    const [consent2, setConsent2] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [loading, setLoading] = useState(false);

    // Email verification states
    const [email, setEmail] = useState("");
    const [verifyCode, setVerifyCode] = useState("");
    const [sentExp, setSentExp] = useState(0);
    const [sentSignature, setSentSignature] = useState("");
    const [isVerified, setIsVerified] = useState(false);
    const [sendingEmail, setSendingEmail] = useState(false);
    const [verifyingCode, setVerifyingCode] = useState(false);

    useEffect(() => {
        const load = async () => {
            if (isEdit && idx) {
                try {
                    // Fetch all data and find the specific post
                    const url = '/api/admin/data/job-seekers?_t=' + Date.now();
                    const res = await fetch(url);
                    const data = await res.json();

                    if (Array.isArray(data)) {
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        const found = data.find((item: any) => String(item.id) === String(idx) || String(item.idx) === String(idx));
                        if (found) {
                            setSubject(found.title);
                            setAuthor(found.author || "");
                            setContent(found.content || "");
                        } else {
                            console.error("Post not found");
                        }
                    }
                } catch (error) {
                    console.error("Error loading post:", error);
                }
            } else {
                setAuthor("");
                if (isEdit) {
                    setSubject("구직 희망합니다 (수정)");
                    setContent(`
                        <p>희망 근무 조건:</p>
                        <p>보유 자격증:</p>
                        <p>경력 사항:</p>
                    `);
                }
            }
        };
        load();
    }, [isEdit, idx]);

    const handleSendEmail = async () => {
        if (!email.includes('@')) {
            alert('유효한 이메일 주소를 입력해주세요.');
            return;
        }
        setSendingEmail(true);
        try {
            const res = await fetch('/api/email/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            const data = await res.json();
            if (data.success) {
                setSentExp(data.exp);
                setSentSignature(data.signature);
                alert('인증 번호가 발송되었습니다. 3분 이내에 입력해주세요.');
            } else {
                alert(data.error || '발송에 실패했습니다.');
            }
        } catch (error) {
            alert('이메일 발송 중 오류가 발생했습니다.');
        } finally {
            setSendingEmail(false);
        }
    };

    const handleVerifyCode = async () => {
        if (!verifyCode) {
            alert('인증 번호를 입력해주세요.');
            return;
        }
        setVerifyingCode(true);
        try {
            const res = await fetch('/api/email/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, code: verifyCode, exp: sentExp, signature: sentSignature })
            });
            const data = await res.json();
            if (data.success) {
                setIsVerified(true);
                alert('이메일 인증이 완료되었습니다.');
            } else {
                alert(data.error || '인증에 실패했습니다.');
            }
        } catch (error) {
            alert('인증 중 오류가 발생했습니다.');
        } finally {
            setVerifyingCode(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        if (author.trim().length < 3) {
            alert('이름(작성자)은 3글자 이상으로 실명을 입력해주세요.');
            setLoading(false);
            return;
        }

        if (!isEdit && !isVerified) {
            alert('이메일 인증을 진행해주세요.');
            setLoading(false);
            return;
        }

        try {
            const isProd = process.env.NODE_ENV === 'production';
            const endpoint = '/api/admin/data/job-seekers';

            // For PHP bridge, we use POST for new and PUT for edit if ID exists
            // But DataEditor logic suggests: initialData?.id ? 'PUT' : 'POST'
            // Here we mimic that.
            const method = isEdit ? 'PUT' : 'POST';

            let finalContent = content;
            if (phone || email) {
                const phoneStr = phone ? `<strong>연락처:</strong> ${phone}` : '';
                const emailStr = email ? `<strong>이메일:</strong> ${email}` : '';
                const divider = (phone && email) ? ' | ' : '';
                finalContent = `<p>${phoneStr}${divider}${emailStr}</p><br/>` + content;
            }

            const postData = {
                id: isEdit ? idx : undefined,
                title: subject,
                author: author,
                content: finalContent,
                date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
                hit: "0"
            };

            const res = await fetch(endpoint, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(postData)
            });

            if (!res.ok) {
                // If local static export prevents POST, we might get 405 or 404. 
                // But logic is correct for production.
                // Fallback for local testing visual
                if (!isProd) {
                    console.warn("Local POST might fail due to static export. Treating as success for UI.");
                } else {
                    const errorData = await res.json();
                    throw new Error(errorData.error || 'Failed to save via API');
                }
            }

            setShowSuccessModal(true);
        } catch (error) {
            console.error(error);
            alert('저장 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmSuccess = () => {
        window.location.href = "/job/seekers";
    };

    return (
        <div className="container_2" style={{ flexGrow: 1 }}>
            <div className="sub_title_381227_">
                <h1>구직정보 <span style={{ fontSize: '16px', fontWeight: 'normal', color: '#666' }}>- {isEdit ? "글수정" : "글쓰기"}</span></h1>
            </div>
            <div style={{ marginBottom: '20px' }}>
                <span className="solid_line_381231_" style={{ display: 'block', width: '100%', height: '2px', background: '#000' }}></span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex gap-4 items-center">
                    <label className="w-20 font-bold text-gray-700">제목</label>
                    <input
                        type="text"
                        className="flex-1 border border-gray-300 rounded px-3 py-2 focus:border-amber-500 outline-none"
                        placeholder="제목을 입력하세요"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        required
                    />
                </div>

                <div className="flex gap-4 items-center">
                    <label className="w-20 font-bold text-gray-700">이름(작성자)</label>
                    <input
                        type="text"
                        className="flex-1 border border-gray-300 rounded px-3 py-2 focus:border-amber-500 outline-none"
                        placeholder="이름"
                        value={author}
                        onChange={(e) => setAuthor(e.target.value)}
                        required
                    />
                </div>

                <div className="flex gap-4 items-center">
                    <label className="w-20 font-bold text-gray-700">전화번호</label>
                    <input
                        type="text"
                        className="flex-1 border border-gray-300 rounded px-3 py-2 focus:border-amber-500 outline-none"
                        placeholder="예: 010-1234-5678"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                    />
                </div>

                <div className="flex gap-4 items-center">
                    <label className="w-20 font-bold text-gray-700">이메일</label>
                    <div className="flex-1 flex gap-2">
                        <input
                            type="email"
                            className="flex-1 border border-gray-300 rounded px-3 py-2 focus:border-amber-500 outline-none disabled:bg-gray-100"
                            placeholder="이메일을 입력하세요"
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value);
                                setIsVerified(false);
                            }}
                            disabled={isVerified || isEdit}
                            required
                        />
                        {!isVerified && !isEdit && (
                            <button
                                type="button"
                                onClick={handleSendEmail}
                                disabled={sendingEmail || !email}
                                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 disabled:opacity-50 whitespace-nowrap"
                            >
                                {sendingEmail ? "발송 중..." : "인증번호 받기"}
                            </button>
                        )}
                    </div>
                </div>

                {sentSignature && !isVerified && !isEdit && (
                    <div className="flex gap-4 items-center">
                        <label className="w-20 font-bold text-gray-700">인증번호</label>
                        <div className="flex-1 flex gap-2">
                            <input
                                type="text"
                                className="flex-1 border border-gray-300 rounded px-3 py-2 focus:border-amber-500 outline-none"
                                placeholder="6자리 인증번호 입력"
                                value={verifyCode}
                                onChange={(e) => setVerifyCode(e.target.value)}
                            />
                            <button
                                type="button"
                                onClick={handleVerifyCode}
                                disabled={verifyingCode || !verifyCode}
                                className="px-4 py-2 bg-amber-500 text-white rounded hover:bg-amber-600 disabled:opacity-50 whitespace-nowrap"
                            >
                                {verifyingCode ? "확인 중..." : "인증 확인"}
                            </button>
                        </div>
                    </div>
                )}
                <div className="text-sm text-red-500 ml-24 font-bold">
                    ※ 이름과 전화번호는 관리자 외에는 볼 수 없도록 안전하게 블라인드 처리됩니다.
                </div>

                <div className="mt-4">
                    <Editor key={content ? 'loaded' : 'empty'} onChange={setContent} content={content} />
                </div>
                
                {/* Consents */}
                <div className="mt-6 space-y-4">
                    <div className="border border-gray-300 rounded p-4 bg-gray-50">
                        <div className="text-sm text-gray-600 h-24 overflow-y-auto mb-2 border border-gray-200 bg-white p-2">
                            [개인정보 수집 및 이용 동의]<br/>
                            1. 수집 목적: 구직 등록 확인 및 안내, 직업소개 업무 진행<br/>
                            2. 수집 항목: 이름, 전화번호<br/>
                            3. 보유 기간: 목적 달성 시 즉시 파기 (단, 관계법령에 의해 보존할 필요가 있는 경우 해당 기간까지 보존)
                        </div>
                        <label className="flex items-center gap-2 cursor-pointer w-fit">
                            <input type="checkbox" required checked={consent1} onChange={(e) => setConsent1(e.target.checked)} className="w-4 h-4 accent-amber-500" />
                            <span className="text-sm font-bold text-gray-700">개인정보 수집 및 이용에 동의합니다. (필수)</span>
                        </label>
                    </div>

                    <div className="border border-gray-300 rounded p-4 bg-gray-50">
                        <div className="text-sm text-gray-600 h-24 overflow-y-auto mb-2 border border-gray-200 bg-white p-2">
                            [개인정보 제3자 제공 동의]<br/>
                            1. 제공받는 자: 구인업체(학원 등) 관련 대상자<br/>
                            2. 제공 목적: 구직 관련 연락 및 면접 안내<br/>
                            3. 제공 항목: 이름, 전화번호<br/>
                            4. 보유 기간: 목적 달성 시 즉시 파기
                        </div>
                        <label className="flex items-center gap-2 cursor-pointer w-fit">
                            <input type="checkbox" required checked={consent2} onChange={(e) => setConsent2(e.target.checked)} className="w-4 h-4 accent-amber-500" />
                            <span className="text-sm font-bold text-gray-700">개인정보 제3자 제공에 동의합니다. (필수)</span>
                        </label>
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 mt-6">
                    <Link href="/job/seekers" className="px-6 py-2 border border-gray-300 rounded hover:bg-gray-50 text-gray-700">
                        취소
                    </Link>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-2 bg-amber-500 text-white font-bold rounded hover:bg-amber-600 shadow disabled:opacity-50"
                    >
                        {loading ? "저장 중..." : (isEdit ? "수정하기" : "저장하기")}
                    </button>
                </div>
            </form>

            <SuccessModal
                isOpen={showSuccessModal}
                onClose={handleConfirmSuccess}
                title={isEdit ? "수정이 완료되었습니다" : "저장이 완료되었습니다"}
                message={`게시글이 성공적으로 ${isEdit ? "수정" : "등록"}되었습니다.`}
            />
        </div>
    );
}

export default function JobSeekersWritePage() {
    return (
        <div className="modern-container" style={{ padding: '40px 0' }}>
            <div className="layout_381226_ grid_left" style={{ display: 'flex', gap: '40px' }}>
                <div style={{ width: '250px', flexShrink: 0 }}>
                    <JobSidebar />
                </div>
                <Suspense fallback={<div>Loading...</div>}>
                    <WriteForm />
                </Suspense>
            </div>
        </div>
    );
}
