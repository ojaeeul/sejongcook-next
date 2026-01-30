import ActionButtons from "@/components/ActionButtons";
import BakingSubNav from "@/components/BakingSubNav";
import { promises as fs } from 'fs';
import path from 'path';
import { notFound } from 'next/navigation';
import Link from 'next/link';

interface Post {
    id: string;
    category: string;
    title: string;
    author: string;
    date: string;
    hit: string;
    content?: string;
}

async function getPost(id: string) {
    const filePath = path.join(process.cwd(), 'data', 'dessert_posts.json');
    try {
        const fileContents = await fs.readFile(filePath, 'utf8');
        const data: Post[] = JSON.parse(fileContents);
        return data.find(p => p.id === id);
    } catch (e) {
        console.error("Failed to load dessert post:", e);
        return null;
    }
}

// Force rebuild for new route
export default async function DessertPostDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const post = await getPost(id);

    if (!post) {
        notFound();
    }

    return (
        <div className="modern-container" style={{ padding: '40px 0' }}>
            <div style={{ flexGrow: 1, minWidth: 0 }}>
                {/* Header Section */}
                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 border-b-2 border-[#3e2723] pb-2 inline-block">디저트 소식 & 레시피</h2>
                </div>

                <BakingSubNav />

                <div className="bg-white border border-gray-200 shadow-sm rounded-lg overflow-hidden mt-6">
                    {/* Post Header */}
                    <div className="p-6 md:p-10 border-b border-gray-100 bg-gray-50/50">
                        <div className="flex items-center gap-2 mb-4">
                            <span className="bg-[#3e2723] text-white text-[11px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                                {post.category}
                            </span>
                            <span className="text-gray-400 text-sm">|</span>
                            <span className="text-gray-500 text-sm">{post.date}</span>
                        </div>
                        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 leading-tight">
                            {post.title}
                        </h1>
                        <div className="mt-6 flex items-center justify-between text-sm text-gray-500 border-t border-gray-100 pt-4">
                            <div className="flex items-center gap-4">
                                <span>작성자: <span className="text-gray-900 font-medium">{post.author}</span></span>
                            </div>
                            <div className="flex items-center gap-4">
                                <span>조회수: <span className="text-gray-900 font-medium">{post.hit}</span></span>
                            </div>
                        </div>
                    </div>

                    {/* Post Content */}
                    <div className="p-6 md:p-10 min-h-[400px]">
                        <style dangerouslySetInnerHTML={{
                            __html: `
                            .info-box {
                                background: #f9fafb !important;
                                border: 1px solid #f3f4f6 !important;
                                border-radius: 12px !important;
                                padding: 1.5rem !important;
                                margin: 1.5rem 0 !important;
                            }
                            .info-box p {
                                margin: 0.5rem 0 !important;
                                color: #374151 !important;
                                font-size: 0.95rem !important;
                            }
                            .info-box strong {
                                color: #111827 !important;
                                display: inline-block !important;
                                width: 100px !important;
                            }
                        ` }} />
                        <div
                            className="prose max-w-none text-gray-700 leading-relaxed"
                            dangerouslySetInnerHTML={{ __html: post.content || '' }}
                        />
                    </div>

                    {/* Footer Nav / Buttons */}
                    <div className="px-6 md:px-10 pb-10">
                        <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                            <Link
                                href="/course/dessert"
                                className="inline-flex items-center px-6 py-2.5 bg-gray-100 text-gray-700 font-bold rounded-lg hover:bg-gray-200 transition-colors"
                            >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                                목록으로
                            </Link>

                            {/* Assuming we might want ActionButtons or just basic functionality. 
                                ActionButtons usually requires an editLink. 
                                Since this is a new feature, I'll add a dummy edit link or omit if no edit page exists yet?
                                The user didn't ask for admin edit, but let's include for consistency if easy.
                                I'll point edit to a non-existent page or just leave it out? 
                                Cooking used ActionButtons. I'll use it but point to # for now.
                            */}
                            {/* <ActionButtons
                                listLink="/course/dessert"
                                editLink={`/admin/dessert/edit/${post.id}`} 
                            /> */}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
