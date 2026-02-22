'use client';

import IntroSidebar from "@/components/IntroSidebar";
import ActionButtons from "@/components/ActionButtons";
import { useState, useEffect, Suspense } from "react";
import NextImage from "next/image";

interface Teacher {
    id: number;
    name: string;
    role: string;
    description: string;
    image: string;
    order: number;
}

function TeachersContent() {
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const url = '/api/admin/data/teachers';
        fetch(url)
            .then(res => res.json())
            .then(data => {
                setTeachers(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to fetch teachers:", err);
                setLoading(false);
            });
    }, []);

    return (
        <div className="container_2" style={{ flexGrow: 1 }}>
            <div className="sub_title_381227_">
                <h1 className="text-2xl font-bold mb-4">강사소개</h1>
            </div>
            <div style={{ marginBottom: '20px' }}>
                <span className="solid_line_381231_"></span>
            </div>

            {/* Styles for the cards */}
            <style jsx>{`
             .instructor-card {
                 background: #fff;
                 border-radius: 12px;
                 box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                 overflow: hidden;
                 border: 1px solid #e5e7eb;
                 transition: transform 0.3s ease, box-shadow 0.3s ease;
                 cursor: pointer;
                 height: 500px;
                 position: relative;
             }
             .instructor-card:hover {
                 transform: translateY(-12px);
                 box-shadow: 0 25px 30px -5px rgba(0, 0, 0, 0.15), 0 15px 15px -5px rgba(0, 0, 0, 0.08);
             }
             .instructor-photo-container {
                 height: 100%;
                 width: 100%;
                 background-color: #f0f0f0;
                 position: absolute;
                 top: 0;
                 left: 0;
             }
             .instructor-photo-container img {
                 width: 100%;
                 height: 100%;
                 object-fit: cover;
             }
             .instructor-info {
                 padding: 24px;
                 text-align: center;
                 transition: all 0.4s cubic-bezier(0.2, 0, 0.2, 1);
                 background: rgba(255, 255, 255, 0.95);
                 backdrop-filter: blur(5px);
                 position: absolute;
                 bottom: 0;
                 left: 0;
                 width: 100%;
                 opacity: 0;
                 transform: translateY(100%);
                 pointer-events: none;
                 padding-bottom: 30px;
                 z-index: 10;
                 min-height: 150px; 
             }
             .instructor-card:hover .instructor-info, 
             .instructor-card.active .instructor-info {
                 transform: translateY(0);
                 opacity: 1;
                 pointer-events: auto;
             }
             .instructor-card:hover .instructor-info {
                 transform: translateY(0); /* Ensure hover effect works */
             }
            `}</style>

            {/* Instructors Grid Area */}
            <div className="img_381272_">
                {loading ? (
                    <div className="py-10 text-center text-gray-500">데이터를 불러오는 중입니다...</div>
                ) : (
                    <div style={{ fontFamily: 'sans-serif', padding: '20px 0' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '40px' }}>
                            {teachers.map((teacher) => (
                                <div
                                    key={teacher.id}
                                    className="instructor-card"
                                    onClick={(e) => {
                                        const card = e.currentTarget;
                                        card.classList.toggle('active');
                                    }}
                                >
                                    <div className="instructor-photo-container">
                                        {teacher.image ? (
                                            <NextImage src={teacher.image} alt={teacher.name} fill className="object-cover" sizes="(max-width: 768px) 100vw, 300px" />
                                        ) : (
                                            <div className="flex items-center justify-center w-full h-full bg-gray-200 text-gray-400">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                </svg>
                                            </div>
                                        )}
                                    </div>
                                    <div className="instructor-info">
                                        <h3 style={{ fontWeight: 'bold', fontSize: '1.25rem', marginBottom: '6px', color: '#1f2937' }}>{teacher.name}</h3>
                                        <span style={{ color: '#f97316', fontWeight: 600, fontSize: '0.9rem', display: 'block', marginBottom: '12px', letterSpacing: '0.5px' }}>{teacher.role}</span>
                                        <p style={{ fontSize: '0.95rem', color: '#4b5563', lineHeight: '1.6' }}>{teacher.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Action Buttons */}
                <ActionButtons
                    listLink="/intro"
                    editLink="/admin/teachers"
                    onDelete={() => alert('관리자 페이지에서 삭제할 수 있습니다.')}
                />
                <div className="text-right mt-2">
                    <span className="text-xs text-gray-400">관리자 페이지에서 강사 정보를 수정할 수 있습니다.</span>
                </div>
            </div>
        </div>
    );
}

export default function TeachersPage() {
    return (
        <div className="modern-container" style={{ padding: '40px 0' }}>
            <div className="layout_381226_ grid_left flex flex-col lg:flex-row gap-10">
                {/* Sidebar */}
                <div className="w-full lg:w-[250px] flex-shrink-0">
                    <IntroSidebar />
                </div>

                <Suspense fallback={<div>Loading content...</div>}>
                    <TeachersContent />
                </Suspense>
            </div>
        </div>
    );
}

