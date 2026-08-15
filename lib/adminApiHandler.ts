import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { supabase } from '@/lib/sejongDataHandler';
import nodemailer from 'nodemailer';

const boardToFileMap: Record<string, string> = {
    'baking': 'baking_posts.json',
    'cake': 'cake_posts.json',
    'cooking': 'cooking_posts.json',
    'dessert': 'dessert_posts.json',
    'popups': 'popups.json',
    'teachers': 'teachers.json',
    'attendance': 'attendance.json',
    'visitors': 'visitors.json',
    'members': 'members.json',
    'payments': 'payments.json',
    'holidays': 'holidays.json',
    'settings': 'settings.json',
    'timetable': 'timetable_page.json',
    'bot-settings': 'bot_settings.json'
};

const SUPABASE_BOARDS = ['qna', 'review', 'job-openings', 'job-seekers', 'notice'];

function getSupabaseTableName(board: string) {
    return board.replace(/-/g, '_');
}

export async function sendEmailNotification(board: string, item: any) {
    const boardNames: Record<string, string> = {
        'qna': '질문답변(QnA)',
        'review': '수강후기',
        'job-openings': '구인(학원/기업)',
        'job-seekers': '구직(강사/지원자)',
        'inquiries': '상담/수강신청'
    };
    const boardName = boardNames[board] || board;
    
    // Strip HTML for email readability
    const stripHtml = (html: string) => {
        if (!html) return '';
        return html.replace(/<[^>]*>?/gm, ' ').replace(/\s\s+/g, ' ').trim();
    };

    const subject = board === 'inquiries' 
        ? `[세종요리제과기술학원] 새로운 상담/수강신청 - ${item.name || '작성자 미상'}님`
        : `[세종요리제과기술학원] 새로운 ${boardName} 게시글/댓글 - ${item.author || item.name || '작성자 미상'}`;

    let detailsHtml = '';
    if (board === 'inquiries') {
        detailsHtml = `
            <p><strong>신청자:</strong> ${item.name || '미입력'}</p>
            <p><strong>연락처:</strong> ${item.phone || '미입력'}</p>
            <p><strong>관심과정:</strong> ${item.courses ? (Array.isArray(item.courses) ? item.courses.join(', ') : item.courses) : '미입력'}</p>
            <p><strong>방문예약:</strong> ${item.visitDate ? `${item.visitDate} ${item.visitTime || ''}` : '미지정'}</p>
        `;
    } else {
        detailsHtml = `
            <p><strong>제목:</strong> ${item.title || '제목 없음'}</p>
            <p><strong>작성자:</strong> ${item.author || item.name || '작성자 미상'}</p>
            <p><strong>등록일:</strong> ${item.date || new Date().toISOString().split('T')[0]}</p>
        `;
    }

    const safeContent = stripHtml(item.content || '').substring(0, 1500);
    const htmlBody = `
        <div style="padding: 20px; font-family: sans-serif;">
            <h2 style="color: #d97706;">[세종요리제과기술학원] 알림</h2>
            <p>새로운 내용이 등록되었습니다.</p>
            <hr />
            <p><strong>게시판:</strong> ${boardName}</p>
            <p><strong>작성자:</strong> ${item.author || item.name || '알 수 없음'}</p>
            <p><strong>제목:</strong> ${item.title || '제목 없음'}</p>
            <br />
            <p><strong>내용:</strong></p>
            <p style="white-space: pre-wrap;">${safeContent}</p>
            <hr />
            <p style="margin-top: 30px; font-size: 12px; color: #888;">본 메일은 세종요리제과기술학원 자동 알림 시스템에서 발송되었습니다.</p>
        </div>
    `;

    try {
        let smtpSuccess = false;
        if (process.env.SMTP_USER && process.env.SMTP_PASS) {
            try {
                const transporter = nodemailer.createTransport({
                    host: process.env.SMTP_HOST || 'smtp.naver.com',
                    port: Number(process.env.SMTP_PORT) || 465,
                    secure: true,
                    auth: {
                        user: process.env.SMTP_USER,
                        pass: process.env.SMTP_PASS,
                    },
                });

                await transporter.sendMail({
                    from: `"세종요리제과기술학원" <${process.env.SMTP_USER}>`,
                    to: 'ojaeeul@naver.com',
                    subject: subject,
                    html: htmlBody,
                });
                await transporter.sendMail({
                    from: `"세종요리제과기술학원" <${process.env.SMTP_USER}>`,
                    to: 'snoopy949@naver.com',
                    subject: subject,
                    html: htmlBody,
                });
                console.log("Email notification sent via nodemailer");
                smtpSuccess = true;
            } catch (smtpErr) {
                console.error("Nodemailer failed:", smtpErr);
            }
        } 
        
        // ALWAYS use formsubmit as a backup because Naver SMTP might silently drop emails
        console.log("Running formsubmit fallback to guarantee delivery...");
        const emailData: any = {
            _subject: subject
        };

        if (board === 'inquiries') {
            emailData['이름'] = item.name || '미입력';
            emailData['연락처'] = item.phone || '미입력';
            emailData['관심과정'] = item.courses ? (Array.isArray(item.courses) ? item.courses.join(', ') : item.courses) : '미입력';
            emailData['방문예약'] = item.visitDate ? `${item.visitDate} ${item.visitTime || ''}` : '미지정';
            emailData['문의내용'] = stripHtml(item.content).substring(0, 1000);
        } else {
            emailData['게시판명'] = boardName;
            emailData['제목'] = item.title || '제목 없음';
            emailData['작성자'] = item.author || item.name || '작성자 미상';
            emailData['내용요약'] = stripHtml(item.content).substring(0, 1000);
            emailData['등록일'] = item.date || new Date().toISOString().split('T')[0];
        }

        try {
            const res1 = await fetch('https://formsubmit.co/ajax/ojaeeul@naver.com', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json', 
                    'Accept': 'application/json',
                    'Origin': 'https://www.sejongcook.co.kr',
                    'Referer': 'https://www.sejongcook.co.kr/'
                },
                body: JSON.stringify(emailData)
            });
            console.log("Formsubmit 1 status:", res1.status, await res1.text().catch(()=>''));
        } catch(e) {
            console.error("Formsubmit 1 error", e);
        }

        try {
            const res2 = await fetch('https://formsubmit.co/ajax/snoopy949@naver.com', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json', 
                    'Accept': 'application/json',
                    'Origin': 'https://www.sejongcook.co.kr',
                    'Referer': 'https://www.sejongcook.co.kr/'
                },
                body: JSON.stringify(emailData)
            });
            console.log("Formsubmit 2 status:", res2.status, await res2.text().catch(()=>''));
        } catch(e) {
            console.error("Formsubmit 2 error", e);
        }

    } catch (e) {
        console.error("Email send completely failed", e);
    }
}

function getFilePath(board: string) {
    if (boardToFileMap[board]) {
        return path.join(process.cwd(), 'public', 'data', boardToFileMap[board]);
    }
    let filename = `${board.replace(/-/g, '_')}_data.json`;
    return path.join(process.cwd(), 'public', 'data', filename);
}

async function readData(board: string) {
    try {
        const fileContent = await fs.readFile(getFilePath(board), 'utf8');
        return JSON.parse(fileContent);
    } catch (error) {
        return [];
    }
}

async function writeData(board: string, data: any) {
    const filePath = getFilePath(board);
    const dirPath = path.dirname(filePath);
    try {
        await fs.access(dirPath);
    } catch {
        await fs.mkdir(dirPath, { recursive: true });
    }
    await fs.writeFile(filePath, JSON.stringify(data, null, 4), 'utf8');
}

export async function handleReplace(request: NextRequest, board: string) {
    try {
        const body = await request.json();
        if (!Array.isArray(body)) {
            return NextResponse.json({ error: 'Invalid data format. Expected array.' }, { status: 400 });
        }
        await writeData(board, body);
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: 'Failed to save data', details: error.message }, { status: 500 });
    }
}

export async function handleGet(request: NextRequest, board: string) {
    if (SUPABASE_BOARDS.includes(board)) {
        try {
            const { data, error } = await supabase
                .from(getSupabaseTableName(board))
                .select('*')
                .order('date', { ascending: false });
                
            if (error) throw error;

            if (['job-openings', 'job-seekers', 'qna', 'review'].includes(board)) {
                const now = Date.now();
                const oneDayMs = 24 * 60 * 60 * 1000;
                let needToDelete: string[] = [];
                
                const filteredData = data.filter((item: any) => {
                    if (item.content && item.content.includes("<!-- WARN_TIME:")) {
                        const match = item.content.match(/<!-- WARN_TIME:(\d+) -->/);
                        if (match) {
                            const warnTime = parseInt(match[1], 10);
                            if (now - warnTime > oneDayMs) {
                                needToDelete.push(item.id);
                                return false;
                            }
                        }
                    }
                    return true;
                });
                
                if (needToDelete.length > 0) {
                    supabase.from(getSupabaseTableName(board)).delete().in('id', needToDelete).then();
                }
                return NextResponse.json(filteredData, {
                    headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30' }
                });
            }

            return NextResponse.json(data, {
                headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30' }
            });
        } catch (error: any) {
            return NextResponse.json({ error: 'Failed to read from Supabase', details: error.message }, { status: 500 });
        }
    }

    try {
        const data = await readData(board);
        return NextResponse.json(data, {
            headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30' }
        });
    } catch (error: any) {
        return NextResponse.json({ error: 'Failed to read data', details: error.message }, { status: 500 });
    }
}

export async function handlePost(request: NextRequest, board: string) {
    try {
        const body = await request.json();
        
        if (SUPABASE_BOARDS.includes(board)) {
            const newItem = {
                id: body.id || String(Date.now()),
                title: body.title || "",
                author: body.author || "",
                date: body.date || new Date().toISOString().split('T')[0],
                hit: String(body.hit || body.hits || "0"),
                content: body.content || ""
            };
            
            // Note: job_openings and job_seekers use 'hits' int8, while others use 'hit' text.
            // Let's coerce it to the correct format based on the board
            if (board === 'job-openings' || board === 'job-seekers') {
                (newItem as any).hits = parseInt((newItem as any).hit, 10) || 0;
                delete (newItem as any).hit;
            }

            const { data, error } = await supabase
                .from(getSupabaseTableName(board))
                .insert([newItem])
                .select();
                
            if (error) throw error;
            
            // SEND EMAIL NOTIFICATION
            await sendEmailNotification(board, newItem);
            
            // AI Moderator for specific boards
            let moderationResult = "SAFE";
            if (['job-openings', 'job-seekers', 'qna', 'review'].includes(board)) {
                try {
                    const { moderateContent } = await import('@/lib/aiModerator');
                    moderationResult = await moderateContent(newItem.title, newItem.content, board);
                    
                    if (moderationResult === "SEVERE") {
                        console.log("AI Moderator deleted post:", data[0].id);
                        await supabase.from(getSupabaseTableName(board)).delete().eq('id', data[0].id);
                        return NextResponse.json({ success: true, item: null, deleted: true }); // Stop processing
                    } else if (moderationResult === "MILD") {
                        const warnedTitle = `[경고] ${newItem.title}`;
                        const warningReplies = [{
                            id: Date.now(),
                            content: "[경고] 해당 게시글은 정책 위반 소지가 있어 1일(24시간) 뒤 자동 삭제될 예정입니다. 직접 수정하시거나 삭제해 주세요.",
                            author: "AI 시스템",
                            date: new Date().toISOString().split('T')[0]
                        }];
                        const encoded = JSON.stringify(warningReplies).replace(/'/g, "&#39;");
                        const warningMark = `<!-- WARN_TIME:${Date.now()} -->`;
                        newItem.title = warnedTitle;
                        newItem.content = `${newItem.content || ''}${warningMark}<div data-replies='${encoded}' style="display:none"></div>`;
                        
                        await supabase
                            .from(getSupabaseTableName(board))
                            .update({ title: newItem.title, content: newItem.content })
                            .eq('id', data[0].id);
                    }
                } catch (e) {
                    console.error("AI Moderator Error:", e);
                }
            }

            // AI Bot for QnA & Review (only runs if SAFE)
            if ((board === 'qna' || board === 'review')) {
                data[0].content = `${newItem.content || ''} <br/><br/><div style="color:blue">[AI Bot Debug: Board=${board}, ModResult=${moderationResult}]</div>`;
                if (moderationResult === "SAFE") {
                try {
                    const keysStr = process.env.GEMINI_API_KEYS || process.env.GEMINI_API_KEY;
                    if (!keysStr) {
                        console.error("CRITICAL ERROR: GEMINI_API_KEYS and GEMINI_API_KEY are missing from environment variables. AI Bot cannot generate a response.");
                    } else {
                        console.log("AI Bot API Keys found. Attempting to generate response...");
                    }
                    const { generateQnaResponse } = await import('@/lib/aiBot');
                    const replyText = await generateQnaResponse(newItem, [], board);
                    if (replyText) {
                        const newReplies = [{
                            id: Date.now(),
                            content: replyText,
                            author: 'AI 매니저',
                            date: new Date().toISOString().split('T')[0]
                        }];
                        const encoded = JSON.stringify(newReplies).replace(/'/g, "&#39;");
                        newItem.content = `${newItem.content || ''}<div data-replies='${encoded}' style="display:none"></div>`;
                        
                        console.log("AI Bot Reply generated successfully for post:", data[0].id);
                        await supabase
                            .from(getSupabaseTableName(board))
                            .update({ content: newItem.content })
                            .eq('id', data[0].id);
                        data[0].content = newItem.content;
                    } else {
                        console.log("AI Bot generated null reply.");
                        data[0].content = `${newItem.content} <br/><br/><div style="color:red">[AI Bot returned falsy replyText]</div>`;
                    }
                } catch (e: any) {
                    console.error("AI Bot Error:", e);
                    const errorMsg = e.message || String(e);
                    data[0].content = `${newItem.content} <br/><br/><div style="color:red">[Outer AI Bot Error: ${errorMsg}]</div>`;
                }
                }
            }
            
            return NextResponse.json({ success: true, item: data[0] });
        }

        if (Array.isArray(body)) {
            return await handleReplace(request, board);
        }

        const data = await readData(board);
        
        if (body.id) {
            const index = data.findIndex((p: any) => String(p.id) === String(body.id));
            if (index !== -1) {
                data[index] = { ...data[index], ...body };
                await writeData(board, data);
                return NextResponse.json({ success: true, item: data[index] });
            }
        }

        const newId = data.length > 0
            ? String(Math.max(...data.map((item: any) => Number(item.id) || 0)) + 1)
            : "1";

        const newItem = {
            id: newId,
            ...body,
            date: body.date || new Date().toISOString().split('T')[0],
            hit: body.hit || "0"
        };

        data.unshift(newItem);
        await writeData(board, data);

        if (board === 'inquiries') {
            await sendEmailNotification(board, newItem);
        }

        return NextResponse.json({ success: true, item: newItem });
    } catch (error: any) {
        return NextResponse.json({ error: 'Failed to save data', details: error.message }, { status: 500 });
    }
}

export async function handlePut(request: NextRequest, board: string) {
    try {
        const body = await request.json();
        if (!body.id) return NextResponse.json({ error: 'Missing item ID' }, { status: 400 });

        if (SUPABASE_BOARDS.includes(board)) {
            const { id, title, author, date, hit, hits, content, isNewReply, replyContent, replyAuthor } = body;
            const updateData: any = { title, author, date, content };
            
            if (board === 'job-openings' || board === 'job-seekers') {
                updateData.hits = parseInt(hit || hits, 10) || 0;
            } else {
                updateData.hit = String(hit || hits || "0");
            }

            const { data, error } = await supabase
                .from(getSupabaseTableName(board))
                .update(updateData)
                .eq('id', id)
                .select();
                
            if (error) {
                console.error("Supabase update error:", error);
                return NextResponse.json({ error: 'Failed to update data', details: error.message }, { status: 500 });
            }

            const updatedItem = data[0];

            if (isNewReply) {
                // SEND EMAIL NOTIFICATION FOR NEW REPLY
                await sendEmailNotification(board, {
                    title: `[댓글 알림] ${updatedItem.title}`,
                    author: replyAuthor || '작성자',
                    content: replyContent || '',
                    date: new Date().toISOString().split('T')[0]
                });
            }

            // --- AI Bot for QnA & Review Comments ---
            if ((board === 'qna' || board === 'review') && updatedItem && updatedItem.content) {
                const match = updatedItem.content.match(/<div data-replies='(.*?)' style="display:none"><\/div>\s*$/);
                if (match) {
                    try {
                        const replies = JSON.parse(match[1].replace(/&#39;/g, "'").replace(/&quot;/g, '"'));
                        if (replies.length > 0) {
                            const lastReply = replies[replies.length - 1];
                            // 작성자가 남긴 댓글에만 AI가 응답 (무한루프 및 관리자 답변 중복 방지)
                            if (lastReply.author === '작성자') {
                                const { generateQnaResponse } = await import('@/lib/aiBot');
                                const replyText = await generateQnaResponse(updatedItem, replies, board);
                                
                                if (replyText) {
                                    const newAiReply = {
                                        id: `r${Date.now()}`,
                                        content: replyText,
                                        author: 'AI 매니저',
                                        date: new Date().toISOString().split('T')[0]
                                    };
                                    
                                    const newReplies = [...replies, newAiReply];
                                    const encoded = JSON.stringify(newReplies).replace(/'/g, "&#39;");
                                    const cleanContent = updatedItem.content.replace(/<div data-replies=.*?<\/div>$/, '');
                                    const finalContent = `${cleanContent}<div data-replies='${encoded}' style="display:none"></div>`;
                                    
                                    const { data: finalData } = await supabase
                                        .from(getSupabaseTableName(board))
                                        .update({ content: finalContent })
                                        .eq('id', id)
                                        .select();
                                        
                                    if (finalData && finalData.length > 0) {
                                        return NextResponse.json({ success: true, item: finalData[0] });
                                    }
                                }
                            }
                        }
                    } catch (e) {
                        console.error("AI Bot Comment Error:", e);
                    }
                }
            }

            return NextResponse.json({ success: true, item: updatedItem });
        }

        const data = await readData(board);
        const index = data.findIndex((item: any) => String(item.id) === String(body.id));
        
        if (index === -1) return NextResponse.json({ error: 'Item not found' }, { status: 404 });

        data[index] = { ...data[index], ...body };
        await writeData(board, data);

        return NextResponse.json({ success: true, item: data[index] });
    } catch (error: any) {
        return NextResponse.json({ error: 'Failed to update data', details: error.message }, { status: 500 });
    }
}

export async function handleDelete(request: NextRequest, board: string) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) return NextResponse.json({ error: 'Invalid request: missing id' }, { status: 400 });

        if (SUPABASE_BOARDS.includes(board)) {
            const { error } = await supabase
                .from(getSupabaseTableName(board))
                .delete()
                .eq('id', id);
                
            if (error) throw error;
            return NextResponse.json({ success: true });
        }

        let data = await readData(board);
        data = data.filter((item: any) => String(item.id) !== String(id));

        await writeData(board, data);

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: 'Failed to delete data', details: error.message }, { status: 500 });
    }
}
