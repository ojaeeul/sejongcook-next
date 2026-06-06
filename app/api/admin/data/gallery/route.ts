import { NextRequest } from 'next/server';
import { handleGet, handlePost, handlePut, handleDelete } from '@/lib/adminApiHandler';

export const GET = (req: NextRequest) => handleGet(req, 'gallery');
export const POST = (req: NextRequest) => handlePost(req, 'gallery');
export const PUT = (req: NextRequest) => handlePut(req, 'gallery');
export const DELETE = (req: NextRequest) => handleDelete(req, 'gallery');
