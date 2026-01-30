import JobSidebar from "@/components/JobSidebar";
import BoardView from "@/components/BoardView";

// Mock Data duplicate from list page (Temporary solution)
const mockSeekers = [
    { id: "1", title: "구직합니다 1", author: "홍길동", date: "2024-01-24", hit: "15", content: "열심히 하겠습니다. 연락주세요." },
    { id: "2", title: "조리사 자격증 보유 구직", author: "김철수", date: "2024-01-23", hit: "22", content: "한식, 중식 자격증 보유하고 있습니다." },
];

export function generateStaticParams() {
    return mockSeekers.map((post) => ({
        id: post.id,
    }));
}

export default async function JobSeekerViewPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const post = mockSeekers.find(p => p.id === id);

    if (!post) {
        return <div className="p-20 text-center">Post not found</div>;
    }

    return (
        <div className="modern-container" style={{ padding: '40px 0' }}>
            <div className="flex flex-col lg:flex-row gap-10">
                <div className="w-full md:w-[250px] flex-shrink-0">
                    <JobSidebar />
                </div>

                <div style={{ flexGrow: 1, minWidth: 0 }}>
                    <div className="sub_title_381227_" style={{ marginBottom: '20px' }}>
                        <h1 className="text-2xl font-bold">구직정보 (인재정보)</h1>
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <span className="solid_line_381231_" style={{ display: 'block', width: '100%', height: '2px', background: '#000' }}></span>
                    </div>

                    <BoardView
                        boardCode="seekers"
                        initialPost={post}
                        basePath="/job"
                    />
                </div>
            </div>
        </div>
    );
}
