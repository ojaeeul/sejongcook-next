import JobSidebar from "@/components/JobSidebar";
import BoardList from "@/components/BoardList";
import { promises as fs } from 'fs';
import path from 'path';

interface Post {
    id: string;
    title: string;
    author: string;
    date: string;
    hit: string; // Changed to string to match BoardList type compatibility if needed, or keeping number if BoardList supports it.
    // Looking at BoardList from previous turn: Post interface has 'hit: string'.
    // The JSON has hits as numbers. We need to map or change BoardList.
    // Let's assume BoardList expects string for now based on 'notice' implementation.
    content?: string;
}

async function getJobOpenings() {
    const filePath = path.join(process.cwd(), 'data', 'job_openings_data.json');
    try {
        const fileContents = await fs.readFile(filePath, 'utf8');
        const rawData = JSON.parse(fileContents);

        // Map raw data to Post interface (ensure types match)
        const data: Post[] = rawData.map((item: any) => ({
            id: item.id,
            title: item.title,
            author: item.author,
            date: item.date,
            hit: String(item.hits), // Convert number to string
            content: item.content
        }));

        return data;
    } catch (e) {
        console.error("Failed to load job openings:", e);
        return [];
    }
}

export default async function JobOpeningsPage() {
    const posts = await getJobOpenings();

    return (
        <div className="modern-container" style={{ padding: '40px 0' }}>
            <div className="flex flex-col xl:flex-row gap-10">
                <div className="w-full xl:w-[250px] flex-shrink-0">
                    <JobSidebar />
                </div>

                <div style={{ flexGrow: 1, minWidth: 0 }}>
                    <div className="sub_title_381227_" style={{ marginBottom: '20px' }}>
                        <h1 className="text-2xl font-bold">구인정보 (채용공고)</h1>
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <span className="solid_line_381231_" style={{ display: 'block', width: '100%', height: '2px', background: '#000' }}></span>
                    </div>

                    <BoardList
                        boardCode="openings"
                        boardName="구인정보"
                        posts={posts}
                        basePath="/job"
                    />
                </div>
            </div>
        </div>
    );
}
