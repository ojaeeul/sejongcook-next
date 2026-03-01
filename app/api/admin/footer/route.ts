export const dynamic = "force-static";
import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const DATA_FILE_PATH = path.join(process.cwd(), 'app', 'data', 'footer_data.json');

const DEFAULT_FOOTER_DATA = [{
    academyName: "세종요리제과기술학원",
    ceo: "오재을",
    address: "경기도 김포시 김포대로 841, 6층 (사우동,제우스프라자)",
    tel: "031-986-1933",
    fax: "031-986-1966",
    email: "sejongcooking@naver.com",
    bizNum: "604-96-28050",
    copyright: "Copyright © 2024 Sejong Culinary & Baking Academy. All rights reserved."
}];

export async function GET() {
    try {
        const fileContent = await fs.readFile(DATA_FILE_PATH, 'utf-8');
        const data = JSON.parse(fileContent);
        return NextResponse.json(data);
    } catch {
        // If file doesn't exist, return default data
        return NextResponse.json(DEFAULT_FOOTER_DATA);
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        // Ensure body is an array or wrap it
        const dataToSave = Array.isArray(body) ? body : [body];

        await fs.writeFile(DATA_FILE_PATH, JSON.stringify(dataToSave, null, 2), 'utf-8');
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Failed to save footer data:', error);
        return NextResponse.json({ error: 'Failed to save data' }, { status: 500 });
    }
}
