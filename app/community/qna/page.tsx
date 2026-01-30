import BoardList from "@/components/BoardList";
import { promises as fs } from 'fs';
import path from 'path';

interface Post {
    id: string | number;
    title: string;
    author: string;
    date: string;
    hit: string | number;
    content?: string;
}

async function getQnaPosts() {
    const filePath = path.join(process.cwd(), 'data', 'qna_data.json');
    try {
        const fileContents = await fs.readFile(filePath, 'utf8');
        const data: Post[] = JSON.parse(fileContents);
        // Ensure IDs are strings for consistency with BoardList expectations if needed,
        // but BoardList likely handles what it's given. The main issue was ID mismatch.
        // Let's reverse to show newest first
        return data.reverse();
    } catch (e) {
        return [];
    }
}

export default async function QnaPage() {
    const qna = await getQnaPosts();

    return (
        <BoardList
            boardCode="qna"
            boardName="질문&답변"
            posts={qna}
        />
    );
}
