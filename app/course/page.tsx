'use client';

import CourseSidebar from "@/components/CourseSidebar";
import Link from "next/link";
import NextImage from "next/image";

function CourseListContent() {
    const courses = [
        { id: 'baking', title: '제과/제빵기능사반', desc: '국가기술자격증 취득을 위한 정규 과정', img: '/img_up/shop_pds/sejongcook/farm/p121585901350.png' },
        { id: 'cake', title: '케익디자인(데코레이션)반', desc: '다양한 케익 데코레이션 기술 습득', img: '/thum_img/sejongcook/farm/b35391732d8e9405142f92d7b4e6037d_water__c1_w700_h170.png' }, // Using header img as placeholder
        { id: 'hobby', title: '홈베이커리(취미)반', desc: '가정에서 즐기는 제과제빵', img: '/img_up/shop_pds/sejongcook/farm/ready0115839945951.jpg' },
        { id: 'job', title: '취업반', desc: '실무 중심의 제과제빵 기술', img: '/img_up/shop_pds/sejongcook/farm/ready0115839945952.jpg' },

    ];

    return (
        <div className="container_2" style={{ flexGrow: 1 }}>
            <div className="sub_title_381227_">
                <h1 className="text-2xl font-bold mb-4">제과제빵과정 목록</h1>
            </div>
            <div style={{ marginBottom: '20px' }}>
                <span className="solid_line_381231_"></span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {courses.map(course => (
                    <Link key={course.id} href={`/course/${course.id}`} className="block border rounded-lg overflow-hidden hover:shadow-lg transition-shadow bg-white">
                        <div className="h-40 bg-gray-100 relative overflow-hidden flex items-center justify-center">
                            {/* Simple image handling */}
                            <NextImage
                                src={course.img}
                                alt={course.title}
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) 100vw, 50vw"
                            />
                        </div>
                        <div className="p-4">
                            <h2 className="text-xl font-bold mb-2">{course.title}</h2>
                            <p className="text-gray-600 font-sans">{course.desc}</p>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}

export default function CourseListPage() {
    return (
        <div className="modern-container" style={{ padding: '40px 0' }}>
            <div className="layout_381226_ grid_left" style={{ display: 'flex', gap: '40px' }}>
                <div style={{ width: '250px', flexShrink: 0 }}>
                    <CourseSidebar />
                </div>
                <CourseListContent />
            </div>
        </div>
    );
}
