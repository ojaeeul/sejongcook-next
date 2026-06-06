import { NextRequest } from 'next/server';
import { handleGet, handlePost, handlePut, handleDelete } from '@/lib/adminApiHandler';

export const GET = (req: NextRequest) => handleGet(req, 'honor');
export const POST = (req: NextRequest) => handlePost(req, 'honor');
export const PUT = (req: NextRequest) => handlePut(req, 'honor');
export const DELETE = (req: NextRequest) => handleDelete(req, 'honor');
