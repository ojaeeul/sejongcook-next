import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const dataPath = path.join(process.cwd(), 'app/data/teachers_data.json');

// Helper to read data
function getTeachersData() {
    if (!fs.existsSync(dataPath)) {
        return [];
    }
    const fileContent = fs.readFileSync(dataPath, 'utf-8');
    try {
        return JSON.parse(fileContent);
    } catch (error) {
        return [];
    }
}

// GET handler
export async function GET() {
    const data = getTeachersData();
    // Sort by 'order' property
    data.sort((a: any, b: any) => (a.order || 0) - (b.order || 0));
    return NextResponse.json(data);
}

// POST handler
export async function POST(request: Request) {
    try {
        const newData = await request.json();

        // Safety check: ensure it's an array
        if (!Array.isArray(newData)) {
            return NextResponse.json({ error: 'Invalid data format' }, { status: 400 });
        }

        fs.writeFileSync(dataPath, JSON.stringify(newData, null, 2), 'utf-8');
        return NextResponse.json({ success: true, message: 'Data saved successfully' });
    } catch (error) {
        console.error('Error saving teachers data:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
