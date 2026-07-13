export const dynamic = "force-static";
import { NextRequest } from 'next/server';
import { handleGet, handlePost, handlePut, handleDelete } from '@/lib/adminApiHandler';

export const GET = (req: NextRequest) => handleGet(req, 'review');
export const POST = (req: NextRequest) => handlePost(req, 'review');
export const PUT = (req: NextRequest) => handlePut(req, 'review');
export const DELETE = (req: NextRequest) => handleDelete(req, 'review');
