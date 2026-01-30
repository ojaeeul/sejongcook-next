
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

async function getReviewPost(id: string): Promise<Post | null> {
    const filePath = path.join(process.cwd(), 'data', 'review_data.json');
    try {
        const fileContents = await fs.readFile(filePath, 'utf8');
        const data: Post[] = JSON.parse(fileContents);
        return data.find(p => p.id === id) || null;
    } catch (e) {
        return null;
    }
}

export async function generateStaticParams() {
    const filePath = path.join(process.cwd(), 'data', 'review_data.json');
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

export default async function ReviewViewPage({ params }: { params: Promise<{ idx: string }> }) {
    const { idx } = await params;
    const post = await getReviewPost(idx);

    if (!post) {
        return <div className="p-20 text-center">Post not found</div>;
    }

    return (
        <>
            <div className="sub_title_381227_" style={{ marginBottom: '20px' }}>
                <h1 className="text-2xl font-bold">수강후기</h1>
            </div>
            <div style={{ marginBottom: '20px' }}>
                <span className="solid_line_381231_" style={{ display: 'block', width: '100%', height: '2px', background: '#000' }}></span>
            </div>

            <BoardView
                boardCode="review"
                initialPost={post}
            />
        </>
    );
}
