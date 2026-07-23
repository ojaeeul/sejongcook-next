export const dynamic = 'force-dynamic';
import { NextRequest } from 'next/server';
import { handleGet, handlePost, handlePut, handleDelete } from '@/lib/adminApiHandler';

export const GET = (req: NextRequest) => handleGet(req, 'bot-settings');
export const POST = (req: NextRequest) => handlePost(req, 'bot-settings');
export const PUT = (req: NextRequest) => handlePut(req, 'bot-settings');
export const DELETE = (req: NextRequest) => handleDelete(req, 'bot-settings');
