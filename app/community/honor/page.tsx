'use client';

import BoardList, { Post } from "@/components/BoardList";
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function HonorPage() {
    const [honor, setHonor] = useState<Post[]>([]);

    useEffect(() => {
        const fetchHonor = async () => {
            try {
                const { data: posts, error } = await supabase
                    .from('posts')
                    .select('*')
                    .eq('board_type', 'honor')
                    .order('created_at', { ascending: false });

                if (error) throw error;
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                setHonor(posts as any[] || []);
            } catch (e) {
                console.error("Failed to load honor posts:", e);
            }
        };
        fetchHonor();
    }, []);

    return (
        <BoardList
            boardCode="honor"
            boardName="명예의 전당"
            posts={honor}
            showWriteButton={false}
        />
    );
}
