export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Define the path to the intro data file
const dataFilePath = path.join(process.cwd(), 'public', 'data', 'intro_data.json');

// Ensure the directory and file exist
if (!fs.existsSync(path.dirname(dataFilePath))) {
    fs.mkdirSync(path.dirname(dataFilePath), { recursive: true });
}

if (!fs.existsSync(dataFilePath)) {
    fs.writeFileSync(dataFilePath, JSON.stringify({
        location: `
        <div style="font-family: sans-serif;">
             <div style="margin-bottom: 30px; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; height: 450px; background-color: #f3f4f6; display: flex; align-items: center; justify-content: center;">
                 <!-- Google Map Embed -->
                 <iframe 
                    src="https://maps.google.com/maps?q=경기도+김포시+김포대로+841&output=embed"
                    width="100%" 
                    height="100%" 
                    style="border: 0;" 
                    allowFullScreen="" 
                    loading="lazy"
                 ></iframe>
             </div>
             <h3 style="font-size: 1.25rem; font-weight: bold; color: #1f2937; border-bottom: 2px solid #1f2937; padding-bottom: 8px; margin-bottom: 16px;">📍 Location Information</h3>
             <div style="display: flex; flex-direction: column; gap: 16px;">
                <div style="background-color: #f9fafb; padding: 24px; border-radius: 8px;">
                    <strong style="color: #ea580c; font-size: 1.125rem; display: block; margin-bottom: 8px;">🏢 주소</strong>
                    <p style="color: #1f2937; font-size: 1.125rem; margin: 0; font-weight: bold;">경기도 김포시 김포대로 841, 6층 (사우동, 제우스프라자)</p>
                    <p style="color: #1f2937; font-size: 1.125rem; margin-top: 4px;">세종요리제과기술요리학원</p>
                    <span style="color: #6b7280; font-size: 0.875rem; display: block; margin-top: 8px;">(사우역 3번 출구 도보 1분)</span>
                </div>
                <div style="background-color: #f9fafb; padding: 24px; border-radius: 8px;">
                    <strong style="color: #ea580c; font-size: 1.125rem; display: block; margin-bottom: 8px;">📞 문의전화</strong>
                    <p style="color: #1f2937; font-size: 1.25rem; font-weight: bold; margin: 0;">031-986-1933, 1966</p>
                    <p style="color: #6b7280; font-size: 0.9rem; margin-top: 4px;">궁금하신 점이 있으시면 언제든지 문의주세요.</p>
                </div>
             </div>
        </div>
        `
    }, null, 2));
}

// GET method configuration
export async function GET() {
    try {
        const fileData = fs.readFileSync(dataFilePath, 'utf8');
        return NextResponse.json(JSON.parse(fileData));
    } catch (error) {
        console.error('Error reading intro data:', error);
        return NextResponse.json({ error: 'Failed to read intro data' }, { status: 500 });
    }
}

// POST method configuration
export async function POST(request: Request) {
    try {
        const newData = await request.json();

        // Ensure pageKey and HTML content exists
        if (!newData.pageKey || typeof newData.content === 'undefined') {
            return NextResponse.json({ error: 'Invalid data format' }, { status: 400 });
        }

        // Read existing data
        let existingData: Record<string, string> = {};
        if (fs.existsSync(dataFilePath)) {
            const fileData = fs.readFileSync(dataFilePath, 'utf8');
            existingData = JSON.parse(fileData);
        }

        // Update the specific page
        existingData[newData.pageKey] = newData.content;

        fs.writeFileSync(dataFilePath, JSON.stringify(existingData, null, 2));

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error saving intro data:', error);
        return NextResponse.json({ error: 'Failed to save intro data' }, { status: 500 });
    }
}
