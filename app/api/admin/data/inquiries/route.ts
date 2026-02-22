export const dynamic = "force-dynamic";
import { NextRequest } from 'next/server';
import { handleGet, handlePost, handlePut, handleDelete } from '@/lib/adminApiHandler';

export const GET = (req: NextRequest) => handleGet(req, 'inquiries');
export const POST = (req: NextRequest) => handlePost(req, 'inquiries');
export const PUT = (req: NextRequest) => handlePut(req, 'inquiries');
export const DELETE = (req: NextRequest) => handleDelete(req, 'inquiries');
