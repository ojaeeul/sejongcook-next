import { NextRequest } from 'next/server';
import { handleGet, handlePost, handlePut, handleDelete } from '@/lib/adminApiHandler';

export const GET = (req: NextRequest) => handleGet(req, 'sites');
export const POST = (req: NextRequest) => handlePost(req, 'sites');
export const PUT = (req: NextRequest) => handlePut(req, 'sites');
export const DELETE = (req: NextRequest) => handleDelete(req, 'sites');
