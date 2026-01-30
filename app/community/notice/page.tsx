import BoardList from "@/components/BoardList";
import { promises as fs } from 'fs';
import path from 'path';

interface Post {
    id: string;
    title: string;
    author: string;
    date: string;
    hit: string;
    content?: string;
}

// Ensure data exists, otherwise return empty
async function getNotices() {
    const filePath = path.join(process.cwd(), 'data', 'notice_data.json');
    try {
        const fileContents = await fs.readFile(filePath, 'utf8');
        const data: Post[] = JSON.parse(fileContents);
        return data.reverse();
    } catch (e) {
        // Create dummy data if file missing for demo
        return [
            { id: '1', title: '홈페이지가 새롭게 단장되었습니다.', author: '관리자', date: '2026-01-20', hit: '105' },
            { id: '2', title: '2026년도 국비지원 과정 안내', author: '관리자', date: '2026-01-22', hit: '88' },
        ];
    }
}

export default async function NoticePage() {
    const notices = await getNotices();

    return (
        <BoardList
            boardCode="notice"
            boardName="공지사항"
            posts={notices}
        />
    );
}
