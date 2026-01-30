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

async function getHonorPosts() {
    const filePath = path.join(process.cwd(), 'data', 'honor_data.json');
    try {
        const fileContents = await fs.readFile(filePath, 'utf8');
        const data: Post[] = JSON.parse(fileContents);
        return data.reverse();
    } catch (e) {
        return [];
    }
}

export default async function HonorPage() {
    const honor = await getHonorPosts();

    return (
        <BoardList
            boardCode="honor"
            boardName="명예의 전당"
            posts={honor}
        />
    );
}
