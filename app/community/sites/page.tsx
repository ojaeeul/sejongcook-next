'use client';

import BoardList, { Post } from "@/components/BoardList";
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function SitesPage() {
    const [posts, setPosts] = useState<Post[]>([]);

    useEffect(() => {
        const fetchSites = async () => {
            try {
                const { data: items, error } = await supabase
                    .from('posts')
                    .select('*')
                    .eq('board_type', 'sites')
                    .order('created_at', { ascending: false });

                if (error) throw error;
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                setPosts(items as any[] || []);
            } catch (e) {
                console.error("Failed to load sites:", e);
            }
        };
        fetchSites();
    }, []);

    return (
        <>
            <div className="sub_title_381227_" style={{ marginBottom: '20px' }}>
                <h1 className="text-2xl font-bold">관련사이트</h1>
            </div>
            <div style={{ marginBottom: '20px' }}>
                <span className="solid_line_381231_" style={{ display: 'block', width: '100%', height: '2px', background: '#000' }}></span>
            </div>

            <BoardList
                boardCode="sites"
                boardName="관련사이트"
                posts={posts}
                showWriteButton={false}
            />
        </>
    );
}
