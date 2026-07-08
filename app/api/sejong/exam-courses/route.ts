import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

const defaultCourses = [
    {
        category: "전체과정",
        courses: []
    },
    {
        category: "조리과정",
        courses: ["한식기능사", "양식기능사", "가정요리", "브런치", "일식기능사", "복어기능사", "취미요리", "쿠킹클래스", "산업기사"]
    },
    {
        category: "제과제빵",
        courses: ["제과제빵기능사", "제빵기능사", "제과기능사", "케익디자이너", "베이킹 원데이"]
    }
];

function getFilePath(baseDir: string) {
    return path.join(process.cwd(), baseDir, 'exam_courses.json');
}

export async function GET() {
    try {
        const filePath = getFilePath('Sejong/SejongAttendance/public');
        if (!fs.existsSync(filePath)) {
            return NextResponse.json(defaultCourses);
        }
        let data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        
        // Migrate old flat array format to new nested format on the fly
        if (Array.isArray(data) && data.length > 0 && typeof data[0] === 'string') {
            data = [
                {
                    category: "조리과정",
                    courses: data
                }
            ];
        }
        
        // Ensure all courses are objects: { name: string, exams: [{name, key}] }
        if (Array.isArray(data)) {
            data.forEach((cat: any) => {
                if (cat.courses && Array.isArray(cat.courses)) {
                    cat.courses = cat.courses.map((c: any) => {
                        if (typeof c === 'string') {
                            let prefix = c.replace("기능사", "");
                            if (c === "제과제빵기능사") prefix = "제과제빵";
                            let exams: any[] = [];
                            if (!["산업기사", "가정요리", "브런치", "쿠킹클래스", "베이킹 원데이", "취미요리"].includes(c)) {
                                for (let y = 2021; y <= 2026; y++) {
                                    exams.push({ name: `${y}년 ${prefix}`, key: `${prefix}_${y}` });
                                }
                            }
                            return { name: c, exams: exams };
                        }
                        return c; // Already an object
                    });
                }
            });
        }
        
        return NextResponse.json(data);
    } catch (e: any) {
        console.error("GET Exam Courses Error:", e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const data = await req.json();

        // Write to the master source
        const masterPath = getFilePath('Sejong/SejongAttendance/public');
        fs.writeFileSync(masterPath, JSON.stringify(data, null, 4), 'utf-8');

        // Also write to the next.js public directory
        const publicPath = getFilePath('public/sejong');
        if (fs.existsSync(path.dirname(publicPath))) {
            fs.writeFileSync(publicPath, JSON.stringify(data, null, 4), 'utf-8');
        }
        
        // Also write to Python server public directory
        const pyPublicPath = getFilePath('Sejong/public');
        if (fs.existsSync(path.dirname(pyPublicPath))) {
            fs.writeFileSync(pyPublicPath, JSON.stringify(data, null, 4), 'utf-8');
        }

        return NextResponse.json({ success: true });
    } catch (e: any) {
        console.error("POST Exam Courses Error:", e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
