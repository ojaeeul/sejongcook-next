import JobSidebar from "@/components/JobSidebar";
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
async function getJobOpening(id: string): Promise<Post | null> {
    const filePath = path.join(process.cwd(), 'data', 'job_openings_data.json');
    try {
        const fileContents = await fs.readFile(filePath, 'utf8');
        const rawData = JSON.parse(fileContents);
        const item = rawData.find((p: any) => p.id === id);

        if (item) {
            return {
                id: item.id,
                title: item.title,
                author: item.author,
                date: item.date,
                hit: String(item.hits),
                content: item.content
            };
        }
        return null;
    } catch (e) {
        console.error("Failed to load job opening:", e);
        return null;
    }
}

// Generate Static Params
export async function generateStaticParams() {
    const filePath = path.join(process.cwd(), 'data', 'job_openings_data.json');
    try {
        const fileContents = await fs.readFile(filePath, 'utf8');
        const data = JSON.parse(fileContents);
        return data.map((post: any) => ({
            idx: post.id,
        }));
    } catch {
        return [];
    }
}

export default async function JobOpeningViewPage({ params }: { params: Promise<{ idx: string }> }) {
    const { idx } = await params;
    const post = await getJobOpening(idx);

    if (!post) {
        return <div className="p-20 text-center">Post not found</div>;
    }

    return (
        <div className="modern-container" style={{ padding: '40px 0' }}>
            <div className="flex flex-col lg:flex-row gap-10">
                <div className="w-full lg:w-[250px] flex-shrink-0">
                    <JobSidebar />
                </div>

                <div style={{ flexGrow: 1, minWidth: 0 }}>
                    <div className="sub_title_381227_" style={{ marginBottom: '20px' }}>
                        <h1 className="text-2xl font-bold">구인정보 (채용공고)</h1>
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <span className="solid_line_381231_" style={{ display: 'block', width: '100%', height: '2px', background: '#000' }}></span>
                    </div>

                    <BoardView
                        boardCode="openings"
                        initialPost={post}
                        basePath="/job"
                    />
                </div>
            </div>
        </div>
    );
}
