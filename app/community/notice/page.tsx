'use client';

import BoardList, { Post } from "@/components/BoardList";
import { useEffect, useState } from "react";

export default function NoticePage() {
    const [notices, setNotices] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNotices = async () => {
            try {
                const url = '/api/admin/data/notice';
                const res = await fetch(url);
                const data = await res.json();

                // Ensure data is array
                if (Array.isArray(data)) {
                    // Data structure in JSON might be slightly different, check if mapping is needed
                    // Typically JSON has: { id, title, writer, date, hit, content } or similar
                    // Let's assume the JSON keys match standard or map them
                    // If existing JSON has 'writer', map to 'author'. 'date' is usually string.
                    // Let's stick to the JSON's structure or mapped Post interface
                    const mapped: Post[] = data.map((item: { id?: string | number, idx?: string | number, title: string, author?: string, writer?: string, date?: string, created_at?: string, hit?: string | number, view_count?: string | number, content?: string }) => ({
                        id: item.id || item.idx || 0, // handle distinct id keys
                        title: item.title,
                        author: item.author || item.writer || '관리자',
                        date: item.date || item.created_at || '',
                        hit: item.hit || item.view_count || '0',
                        content: item.content
                    }));
                    // Sort by date DESCENDING (Newest -> Oldest)
                    mapped.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
                    setNotices(mapped);
                }
            } catch (err) {
                console.error('Unexpected error:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchNotices();
    }, []);

    if (loading) {
        return <div className="p-10 text-center">Loading...</div>;
    }

    return (
        <BoardList
            boardCode="notice"
            boardName="공지사항"
            posts={notices}
            showWriteButton={false}
        />
    );
}
