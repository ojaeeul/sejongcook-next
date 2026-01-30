
import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'data', 'members.json');

// Interface covering the fields in admin_member.html
interface Member {
    id: string; // ID (Username)
    username: string;
    email: string; // Email (Contact)
    status: 'approved' | 'pending'; // Status
    joinedAt: string;
}

const defaultMembers: Member[] = [
    { id: 'user1', username: 'student_kim', email: 'kim@example.com', status: 'approved', joinedAt: new Date().toISOString() },
    { id: 'user2', username: 'baker_lee', email: 'lee@bakery.com', status: 'pending', joinedAt: new Date().toISOString() },
];

export async function GET() {
    try {
        try {
            await fs.access(DATA_FILE);
        } catch {
            // Create default if not exists
            await fs.writeFile(DATA_FILE, JSON.stringify(defaultMembers, null, 2), 'utf-8');
            return NextResponse.json(defaultMembers);
        }

        const content = await fs.readFile(DATA_FILE, 'utf-8');
        const data = JSON.parse(content);
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch members' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        // Body is the new full array or updated item? 
        // Following previous pattern, we expect the full array or specific action.
        // Let's expect the FULL array for simplicity in this file-based system.

        await fs.writeFile(DATA_FILE, JSON.stringify(body, null, 2), 'utf-8');
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to save members' }, { status: 500 });
    }
}
