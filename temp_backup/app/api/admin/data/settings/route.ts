export const dynamic = "force-dynamic";
import { NextRequest } from 'next/server';
import { handleGet, handlePost, handlePut, handleDelete } from '@/lib/adminApiHandler';

export const GET = (req: NextRequest) => handleGet(req, 'settings');
export const POST = (req: NextRequest) => handlePost(req, 'settings');
export const PUT = (req: NextRequest) => handlePut(req, 'settings');
export const DELETE = (req: NextRequest) => handleDelete(req, 'settings');
