import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'data', 'footer_data.json');

export async function GET() {
    try {
        if (!fs.existsSync(dataFilePath)) {
            // Default data if file doesn't exist
            const defaultData = [{
                id: "1",
                academyName: "세종요리제과기술학원",
                ceo: "오재을",
                address: "경기도 김포시 김포대로 841, 6층 (사우동,제우스프라자)",
                tel: "031-986-1933",
                fax: "031-986-1966",
                email: "sejongcooking@naver.com",
                bizNum: "604-96-28050",
                copyright: "Copyright © 2024 Sejong Culinary & Baking Academy. All rights reserved."
            }];
            return NextResponse.json(defaultData);
        }
        const fileContent = fs.readFileSync(dataFilePath, 'utf8');
        const data = JSON.parse(fileContent);
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to load data' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();

        // Ensure directory exists
        const dirPath = path.dirname(dataFilePath);
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
        }

        fs.writeFileSync(dataFilePath, JSON.stringify(body, null, 2), 'utf8');
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to save data' }, { status: 500 });
    }
}
