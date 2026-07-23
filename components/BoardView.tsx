'use client';

import Link from "next/link";
import { useRouter } from 'next/navigation';
import { useState, useEffect } from "react";
import Editor from "./Editor";
import { useAuth } from "@/context/AuthContext";
import ShinyLaurelBanner from "./ShinyLaurelBanner";
import AlertModal from "./AlertModal";

// Reusing Post interface (should ideally be shared)
export interface Post {
    id: string;
    title: string;
    author: string;
    date: string;
    hit: string;
    content?: string;
    category?: string; // Added to support category
    name?: string;
    stars?: number;
}

export interface BoardViewProps {
    boardCode: string;
    boardName?: string; // Added prop
    initialPost: Post;
    basePath?: string;
}

export default function BoardView({ boardCode, boardName, initialPost, basePath = '/community' }: BoardViewProps) {
    const router = useRouter();
    const { isAdmin } = useAuth();

    let apiBoardName = boardCode;
    if (boardCode === 'seekers') apiBoardName = 'job-seekers';
    if (boardCode === 'openings') apiBoardName = 'job-openings';

    // Mask name for non-admins
    const maskName = (name: string) => {
        if (!name) return '게스트';
        if (name === '관리자') return name;
        if (name.length <= 2) return name.charAt(0) + '*';
        return name.charAt(0) + '*'.repeat(name.length - 2) + name.charAt(name.length - 1);
    };

    const [post, setPost] = useState<Post>(initialPost);
    const [isEdit, setIsEdit] = useState(false);
    const [editValues, setEditValues] = useState({
        title: initialPost.title,
        content: initialPost.content || ''
    });

    // Alert Modal State
    const [showAlert, setShowAlert] = useState(false);
    const [alertConfig, setAlertConfig] = useState({
        title: '알림',
        message: '',
        type: 'warning' as 'success' | 'warning' | 'error' | 'info'
    });

    const [isAuthor, setIsAuthor] = useState(false);

    useEffect(() => {
        if (typeof window !== 'undefined' && initialPost?.id) {
            const myPosts = JSON.parse(localStorage.getItem('my_posts') || '[]');
            if (myPosts.includes(String(initialPost.id))) {
                setIsAuthor(true);
            }
        }
    }, [initialPost?.id]);

    const handleEditToggle = () => {
        if (isEdit) {
            // Cancel Edit
            setIsEdit(false);
            setEditValues({
                title: post.title,
                content: post.content || ''
            });
        } else {
            // Start Edit
            // Check if user is allowed (Mock: always allowed for demo)
            setIsEdit(true);
        }
    };

    // State for Success Modal
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    const handleSave = async () => {
        try {
            const res = await fetch(`/api/admin/data/${apiBoardName}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: post.id,
                    title: editValues.title,
                    content: editValues.content
                })
            });
            if (!res.ok) throw new Error('Save failed');
            
            setPost({
                ...post,
                title: editValues.title,
                content: editValues.content
            });

            setShowSuccessModal(true);
        } catch (error) {
            console.error('Save Error:', error);
            setAlertConfig({
                title: '저장 실패',
                message: "저장에 실패했습니다.",
                type: 'error'
            });
            setShowAlert(true);
        }
    };

    const handleConfirmSuccess = () => {
        setIsEdit(false);
        setShowSuccessModal(false);
        // Redirect to list
        router.push(`${basePath}/${boardCode}`);
    };

    const handleDelete = async () => {
        if (!confirm("정말 삭제하시겠습니까?")) return;

        try {
            const res = await fetch(`/api/admin/data/${apiBoardName}?id=${post.id}`, {
                method: 'DELETE'
            });
            if (!res.ok) throw new Error('Delete failed');
            
            alert('삭제되었습니다.');
            window.location.href = `${basePath}/${boardCode}`;
        } catch (error) {
            console.error('Delete Error:', error);
            setAlertConfig({
                title: '삭제 실패',
                message: "삭제에 실패했습니다.",
                type: 'error'
            });
            setShowAlert(true);
        }
    };

    const handlePrint = () => {
        window.print();
    };


    // Reply / Comment State
    interface Reply {
        id: string;
        author: string;
        date: string;
        content: string;
    }

    const [replies, setReplies] = useState<Reply[]>(() => {
        let extracted: Reply[] = [];
        const rawContent = initialPost.content || '';
        const match = rawContent.match(/<div data-replies='(.*?)' style="display:none"><\/div>$/);
        if (match) {
            try {
                extracted = JSON.parse(match[1].replace(/&#39;/g, "'").replace(/&quot;/g, '"'));
            } catch {}
        } else if (String(initialPost.id).startsWith('qna')) {
             // Mock initial reply for demo if Q&A
             extracted = [{
                 id: 'r1', author: '관리자', date: '2024-01-24', content: '문의주셔서 감사합니다. 전화로 상담 도와드리겠습니다.'
             }];
        }
        return extracted;
    });

    const [replyContent, setReplyContent] = useState("");
    const [editingReplyId, setEditingReplyId] = useState<string | null>(null);
    const [editingReplyContent, setEditingReplyContent] = useState("");

    useEffect(() => {
        setPost(initialPost);
        let extracted: Reply[] = [];
        const rawContent = initialPost.content || '';
        const match = rawContent.match(/<div data-replies='(.*?)' style="display:none"><\/div>$/);
        if (match) {
            try {
                extracted = JSON.parse(match[1].replace(/&#39;/g, "'").replace(/&quot;/g, '"'));
            } catch {}
        } else if (String(initialPost.id).startsWith('qna')) {
             extracted = [{
                 id: 'r1', author: '관리자', date: '2024-01-24', content: '문의주셔서 감사합니다. 전화로 상담 도와드리겠습니다.'
             }];
        }
        setReplies(extracted);
    }, [initialPost]);

    const handleReplySubmit = async () => {
        if (!replyContent.trim()) {
            setAlertConfig({
                title: '입력 오류',
                message: "내용을 입력해주세요.",
                type: 'warning'
            });
            setShowAlert(true);
            return;
        }

        const newReply: Reply = {
            id: `r${Date.now()}`,
            author: isAdmin ? "관리자" : "작성자",
            date: new Date().toISOString().split('T')[0],
            content: replyContent
        };

        const newReplies = [...replies, newReply];

        try {
            let cleanContent = (post.content || '').replace(/<div data-replies=.*?<\/div>$/, '');
            const encoded = JSON.stringify(newReplies).replace(/'/g, "&#39;");
            cleanContent += `<div data-replies='${encoded}' style="display:none"></div>`;

            const res = await fetch(`/api/admin/data/${apiBoardName}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...post, content: cleanContent })
            });

            if (!res.ok) throw new Error('Failed to save');
            
            const result = await res.json();
            if (result.success && result.item && result.item.content) {
                const finalContent = result.item.content;
                setPost({ ...post, content: finalContent });
                
                const finalMatch = finalContent.match(/<div data-replies='(.*?)' style="display:none"><\/div>$/);
                if (finalMatch) {
                    try {
                        const finalReplies = JSON.parse(finalMatch[1].replace(/&#39;/g, "'").replace(/&quot;/g, '"'));
                        setReplies(finalReplies);
                    } catch {
                        setReplies(newReplies);
                    }
                } else {
                    setReplies(newReplies);
                }
            } else {
                setPost({ ...post, content: cleanContent });
                setReplies(newReplies);
            }

            setReplyContent("");
            setAlertConfig({
                title: '등록 완료',
                message: "답변이 등록되었습니다.",
                type: 'success'
            });
            setShowAlert(true);
        } catch (error) {
            console.error('Reply save error:', error);
            setAlertConfig({
                title: '오류',
                message: "답변 등록에 실패했습니다.",
                type: 'error'
            });
            setShowAlert(true);
        }
    };

    const handleReplyDelete = async (id: string) => {
        if (confirm("정말 삭제하시겠습니까?")) {
            const newReplies = replies.filter(r => r.id !== id);
            
            try {
                let cleanContent = (post.content || '').replace(/<div data-replies=.*?<\/div>$/, '');
                if (newReplies.length > 0) {
                    const encoded = JSON.stringify(newReplies).replace(/'/g, "&#39;");
                    cleanContent += `<div data-replies='${encoded}' style="display:none"></div>`;
                }

                const res = await fetch(`/api/admin/data/${apiBoardName}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ...post, content: cleanContent })
                });

                if (!res.ok) throw new Error('Failed to save');

                setPost({ ...post, content: cleanContent });
                setReplies(newReplies);
            } catch {
                alert("삭제에 실패했습니다.");
            }
        }
    };

    const handleReplyUpdate = async (id: string) => {
        if (!editingReplyContent.trim()) {
            alert("내용을 입력해주세요.");
            return;
        }

        const newReplies = replies.map(r => r.id === id ? { ...r, content: editingReplyContent } : r);
        
        try {
            let cleanContent = (post.content || '').replace(/<div data-replies=.*?<\/div>$/, '');
            if (newReplies.length > 0) {
                const encoded = JSON.stringify(newReplies).replace(/'/g, "&#39;");
                cleanContent += `<div data-replies='${encoded}' style="display:none"></div>`;
            }

            const res = await fetch(`/api/admin/data/${apiBoardName}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...post, content: cleanContent })
            });

            if (!res.ok) throw new Error('Failed to save');

            setPost({ ...post, content: cleanContent });
            setReplies(newReplies);
            setEditingReplyId(null);
            setEditingReplyContent("");
        } catch {
            alert("수정에 실패했습니다.");
        }
    };

    return (
        <div className="w-full">
            {/* Header / Title Area */}
            <div className="border-b-2 border-black mb-0">
                <div className="py-4 px-2">
                    <span className="text-sm text-gray-500 font-bold block mb-1">
                        {boardName || (boardCode === 'qna' ? '질문&답변' :
                            boardCode === 'notice' ? '공지사항' :
                                boardCode === 'honor' ? '명예의 전당' :
                                    boardCode === 'sites' ? '관련사이트' :
                                        boardCode === 'openings' ? '구인정보' :
                                            boardCode === 'seekers' ? '구직정보' : '게시판')}
                    </span>
                    {isEdit ? (
                        <input
                            type="text"
                            className="w-full text-2xl font-bold text-gray-800 border-b border-gray-300 focus:outline-none focus:border-blue-500 py-1"
                            value={editValues.title}
                            onChange={(e) => setEditValues({ ...editValues, title: e.target.value })}
                        />
                    ) : (
                        <div>
                            <h3 className="text-2xl font-bold text-gray-800 break-words flex items-center">
                                {post.title.includes("[비밀글]") && <span className="text-amber-600 mr-2 text-xl" title="비밀글">🔒</span>}
                                {post.title.replace("[비밀글]", "").trim()}
                            </h3>
                            {/* Mobile Minimal Meta */}
                            <div className="lg:hidden flex items-center gap-3 text-xs text-gray-400 mt-2">
                                <span>{isAdmin ? post.author : maskName(post.author)}</span>
                                <span className="w-[1px] h-3 bg-gray-300"></span>
                                <span className="font-sans">{post.date}</span>
                                <span className="w-[1px] h-3 bg-gray-300"></span>
                                <span className="font-sans">조회 {post.hit}</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Meta Info - Desktop Only */}
            <div className="hidden lg:flex border-b border-gray-300 bg-gray-50 text-sm py-3 px-4 text-gray-600 gap-8">
                <div className="flex gap-2">
                    <span className="font-bold text-gray-700">작성자</span>
                    <span>{isAdmin ? post.author : (post.author && post.author.length > 1 ? post.author[0] + '**' : post.author)}</span>
                </div>
                <div className="flex gap-2">
                    <span className="font-bold text-gray-700">등록일</span>
                    <span className="font-sans">{post.date}</span>
                </div>
                <div className="flex gap-2">
                    <span className="font-bold text-gray-700">조회수</span>
                    <span className="font-sans">{post.hit}</span>
                </div>
            </div>

            {/* Content Area */}
            <div className="min-h-[400px] p-8 text-gray-800 leading-relaxed border-b border-gray-300 overflow-x-hidden">
                {boardCode === 'honor' && !isEdit && (
                    <div className="mb-8">
                        <ShinyLaurelBanner
                            stars={post.stars}
                            name={post.name}
                        />
                    </div>
                )}
                {isEdit ? (
                    <Editor
                        content={editValues.content}
                        onChange={(newContent) => setEditValues({ ...editValues, content: newContent })}
                    />
                ) : (
                    <div
                        className="view-content break-words break-all"
                        style={{ maxWidth: '100%' }}
                        dangerouslySetInnerHTML={{ __html: (() => {
                            let displayContent = (post.content || '').replace(/<div data-replies=.*?<\/div>$/, '');
                            if (!isAdmin && !isAuthor) {
                                displayContent = displayContent.replace(/<p><strong>연락처:<\/strong>.*?<\/p>(<br\/>)?/gi, '');
                                if (post.title.includes("[비밀글]")) {
                                    displayContent = `<div style="padding: 40px 20px; text-align: center; color: #666; background: #f9fafb; border-radius: 8px; border: 1px solid #e5e7eb;">
                                        <svg xmlns="http://www.w3.org/2000/svg" style="width: 48px; height: 48px; margin: 0 auto 16px; color: #9ca3af;" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                        </svg>
                                        <p style="font-weight: bold; font-size: 18px; margin-bottom: 8px; color: #374151;">비밀글로 보호된 게시물입니다.</p>
                                        <p style="font-size: 14px; color: #6b7280; line-height: 1.5;">작성자와 관리자만 내용을 확인할 수 있습니다.<br/>(등록된 관리자/AI 답변은 아래에서 확인하실 수 있습니다)</p>
                                    </div>`;
                                }
                            }
                            return displayContent;
                        })() }}
                    />
                )}
            </div>

            {/* Reply Section (Visible only for Q&A/Job Openings or Admins) */}
            {(() => {
                const isPublicReplyBoard = ['qna', 'openings'].includes(boardCode);
                if (!isPublicReplyBoard && !isAdmin) return null;

                return (
                    <div className="mt-8 bg-gray-50 p-6 rounded-lg border border-gray-200">
                        <h4 className="font-bold text-lg mb-4 text-gray-800 flex items-center gap-2">
                            답변/댓글
                            <span className="text-amber-600 text-sm font-normal">({replies.length})</span>
                        </h4>

                        {/* Reply List */}
                        <div className="space-y-4 mb-6">
                            {replies.length === 0 ? (
                                <p className="text-gray-500 text-sm py-4 text-center">등록된 답변이 없습니다.</p>
                            ) : (
                                replies.map(reply => (
                                    <div key={reply.id} className="bg-white p-4 rounded border border-gray-200 shadow-sm relative group">
                                        <div className="flex justify-between items-center mb-2 border-b border-gray-100 pb-2">
                                            <div className="flex gap-2 text-sm">
                                                <span className="font-bold text-gray-800">{reply.author}</span>
                                                <span className="text-gray-400">|</span>
                                                <span className="text-gray-500 font-sans">{reply.date}</span>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => {
                                                        setEditingReplyId(reply.id);
                                                        setEditingReplyContent(reply.content);
                                                    }}
                                                    className="text-gray-400 hover:text-blue-500 text-xs transition-colors"
                                                >
                                                    수정
                                                </button>
                                                <button
                                                    onClick={() => handleReplyDelete(reply.id)}
                                                    className="text-gray-400 hover:text-red-500 text-xs transition-colors"
                                                >
                                                    삭제
                                                </button>
                                            </div>
                                        </div>
                                        {editingReplyId === reply.id ? (
                                            <div className="mt-2">
                                                <textarea
                                                    className="w-full h-20 p-2 text-sm border border-gray-300 rounded outline-none resize-none focus:border-amber-500"
                                                    value={editingReplyContent}
                                                    onChange={(e) => setEditingReplyContent(e.target.value)}
                                                />
                                                <div className="flex justify-end gap-2 mt-2">
                                                    <button
                                                        onClick={() => setEditingReplyId(null)}
                                                        className="px-3 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
                                                    >
                                                        취소
                                                    </button>
                                                    <button
                                                        onClick={() => handleReplyUpdate(reply.id)}
                                                        className="px-3 py-1 text-xs bg-gray-800 text-white rounded hover:bg-black transition-colors"
                                                    >
                                                        저장
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            post.title.includes("[비밀글]") && !isAdmin && !isAuthor ? (
                                                <div className="mt-2 text-gray-500 text-sm whitespace-pre-wrap leading-relaxed flex items-center gap-2 bg-gray-50 p-3 rounded-md border border-gray-100">
                                                    <span className="text-gray-400">🔒</span>
                                                    <span>비밀글로 보호된 답변입니다. 작성자와 관리자만 내용을 확인할 수 있습니다.</span>
                                                </div>
                                            ) : (
                                                <div
                                                    className="mt-2 text-gray-700 text-sm whitespace-pre-wrap leading-relaxed"
                                                    dangerouslySetInnerHTML={{ __html: reply.content.replace(/\n/g, '<br/>') }}
                                                />
                                            )
                                        )}
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Reply Form */}
                        <div className="bg-white p-4 rounded border border-gray-300 focus-within:border-amber-500 focus-within:ring-1 focus-within:ring-amber-500 transition-colors">
                            <div className="mb-2 font-bold text-sm text-gray-700">답변 작성</div>
                            <textarea
                                className="w-full h-24 p-2 text-sm outline-none resize-none"
                                placeholder="답변 내용을 입력해주세요..."
                                value={replyContent}
                                onChange={(e) => setReplyContent(e.target.value)}
                            />
                            <div className="flex justify-end mt-2 pt-2 border-t border-gray-100">
                                <button
                                    onClick={handleReplySubmit}
                                    className="bg-gray-800 text-white px-4 py-1.5 text-sm font-bold rounded hover:bg-black transition-colors"
                                >
                                    등록
                                </button>
                            </div>
                        </div>
                    </div>
                );
            })()}

            {/* Buttons */}
            <div className="flex justify-end gap-2 py-6 mt-4 no-print">
                <Link href={`${basePath}/${boardCode}`} className="flex items-center gap-2 bg-gray-600 !text-white px-4 py-2 text-sm font-bold rounded hover:bg-gray-700 transition-colors shadow-sm">
                    목록
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-white">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                    </svg>
                </Link>

                {isAdmin && (
                    <>
                        {!isEdit && (
                            <button onClick={handlePrint} className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 text-sm font-bold rounded hover:bg-gray-700 transition-colors shadow-sm">
                                출력
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-white">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0 1 10.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 0 1-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0 0 21 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 0 0-1.913-.247M6.34 18H5.25A2.25 2.25 0 0 1 3 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 0 1 1.913-.247m10.5 0a48.536 48.536 0 0 0-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5Zm-3 0h.008v.008H15V10.5Z" />
                                </svg>
                            </button>
                        )}

                        {isEdit ? (
                            <>
                                <button onClick={handleEditToggle} className="flex items-center gap-2 bg-gray-400 text-white px-4 py-2 text-sm font-bold rounded hover:bg-gray-500 transition-colors shadow-sm">
                                    취소
                                </button>
                                <button onClick={handleSave} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 text-sm font-bold rounded hover:bg-blue-700 transition-colors shadow-sm">
                                    저장
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-white">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                                    </svg>
                                </button>
                            </>
                        ) : (
                            <button onClick={handleEditToggle} className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 text-sm font-bold rounded hover:bg-gray-700 transition-colors shadow-sm">
                                수정
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-white">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
                                </svg>
                            </button>
                        )}

                        <button onClick={handleDelete} className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 text-sm font-bold rounded hover:bg-red-700 transition-colors shadow-sm">
                            삭제
                            {/* Delete Icon */}
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-white">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                            </svg>
                        </button>
                    </>
                )}
            </div>

            {/* Success Modal */}
            {showSuccessModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-lg p-8 shadow-2xl max-w-sm w-full text-center transform scale-100 transition-all border-t-8 border-indigo-500">
                        <div className="mb-4 text-indigo-500">
                            <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">저장이 완료되었습니다</h3>
                        <p className="text-gray-500 mb-6">
                            게시글 내용이 성공적으로 수정되었습니다.
                        </p>
                        <button
                            onClick={handleConfirmSuccess}
                            className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-3 rounded-lg transition-colors text-lg"
                        >
                            확인
                        </button>
                    </div>
                </div>
            )}

            {/* General Alert Modal */}
            <AlertModal
                isOpen={showAlert}
                onClose={() => setShowAlert(false)}
                title={alertConfig.title}
                message={alertConfig.message}
                type={alertConfig.type}
            />
        </div>
    );
}
