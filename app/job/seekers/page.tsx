'use client';

import JobSidebar from "@/components/JobSidebar";
import BoardList from "@/components/BoardList";

// Generic Post type for BoardList compatibility
interface Post {
    id: string;
    title: string;
    author: string;
    date: string;
    hit: string;
    content?: string;
}

// Mock Data for Seekers - Replace with real data logic later
// Or migrate from sub0502 if needed. Currently unchecked in task.md
const mockSeekers: Post[] = [
    { id: "1", title: "구직합니다 1", author: "홍길동", date: "2024-01-24", hit: "15" },
    { id: "2", title: "조리사 자격증 보유 구직", author: "김철수", date: "2024-01-23", hit: "22" },
];

export default function JobSeekersPage() {
    return (
        <div className="modern-container" style={{ padding: '40px 0' }}>
            <div className="flex flex-col xl:flex-row gap-10">
                <div className="w-full xl:w-[250px] flex-shrink-0">
                    <JobSidebar />
                </div>

                <div style={{ flexGrow: 1, minWidth: 0 }}>
                    <div className="sub_title_381227_" style={{ marginBottom: '20px' }}>
                        <h1 className="text-2xl font-bold">구직정보 (인재정보)</h1>
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <span className="solid_line_381231_" style={{ display: 'block', width: '100%', height: '2px', background: '#000' }}></span>
                    </div>

                    <BoardList
                        boardCode="seekers"
                        boardName="구직정보"
                        posts={mockSeekers} // Using mock for now as instructed to just "enable write functionality as I add"
                        basePath="/job"
                    />
                </div>
            </div>
        </div>
    );
}
