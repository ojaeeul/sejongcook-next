import { NextRequest } from 'next/server';
import { handleGet, handlePost, handlePut, handleDelete } from '@/lib/adminApiHandler';

export const GET = (req: NextRequest) => handleGet(req, 'qna');
export const POST = (req: NextRequest) => handlePost(req, 'qna');
export const PUT = (req: NextRequest) => handlePut(req, 'qna');
export const DELETE = (req: NextRequest) => handleDelete(req, 'qna');
