
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

async function getSites() {
    const filePath = path.join(process.cwd(), 'data', 'sites_data.json');
    try {
        const fileContents = await fs.readFile(filePath, 'utf8');
        const data: Post[] = JSON.parse(fileContents);
        return data; // Usually few items
    } catch (e) {
        return [];
    }
}

export default async function SitesPage() {
    const posts = await getSites();

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
            />
        </>
    );
}
