import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'public', 'data', 'inquiry_courses.json');

const DEFAULT_DATA = [
  {
    "category": "제과제빵 과정",
    "icon": "🥐",
    "courses": ["제과제빵기능사", "제과기능사", "제빵기능사", "떡기능사", "케이크디자인", "디저트"]
  },
  {
    "category": "조리 과정",
    "icon": "🍳",
    "courses": ["한식조리", "양식조리", "중식조리", "일식조리", "복어조리", "가정요리", "브런치"]
  }
];

export async function GET() {
    try {
        const fileContents = await fs.readFile(DATA_FILE, 'utf8');
        return NextResponse.json(JSON.parse(fileContents));
    } catch (error: any) {
        if (error.code === 'ENOENT') {
            // If file doesn't exist, return default data
            return NextResponse.json(DEFAULT_DATA);
        }
        return NextResponse.json({ error: 'Failed to read data' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const data = await request.json();
        
        // Ensure the directory exists
        await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
        
        // Write the new data
        await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
        
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Save error:', error);
        return NextResponse.json({ error: 'Failed to save data' }, { status: 500 });
    }
}
