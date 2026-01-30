
import BoardView from "@/components/BoardView";
import { promises as fs } from 'fs';
import path from 'path';

interface Post {
    id: string;
    title: string;
    author: string;
    date: string;
    hit: string;
    content: string;
}

// Function to get specific post
async function getNotice(id: string): Promise<Post | null> {
    const filePath = path.join(process.cwd(), 'data', 'notice_data.json');
    try {
        const fileContents = await fs.readFile(filePath, 'utf8');
        const data: Post[] = JSON.parse(fileContents);
        return data.find(p => p.id === id) || null;
    } catch (e) {
        console.error("Failed to load notice:", e);
        return null;
    }
}

// Generate Static Params if static export is needed (optional, good for performance)
export async function generateStaticParams() {
    const filePath = path.join(process.cwd(), 'data', 'notice_data.json');
    try {
        const fileContents = await fs.readFile(filePath, 'utf8');
        const data: Post[] = JSON.parse(fileContents);
        return data.map((post) => ({
            idx: post.id,
        }));
    } catch {
        return [];
    }
}

export default async function NoticeViewPage({ params }: { params: Promise<{ idx: string }> }) {
    const { idx } = await params;
    const post = await getNotice(idx);

    if (!post) {
        return <div className="p-20 text-center">Post not found</div>;
    }

    return (
        <BoardView
            boardCode="notice"
            initialPost={post}
        />
    );
}
