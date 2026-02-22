export const dynamic = "force-dynamic";
import { NextRequest } from 'next/server';
import { handleGet, handlePost, handlePut, handleDelete } from '@/lib/adminApiHandler';

export const GET = (req: NextRequest) => handleGet(req, 'footer');
export const POST = (req: NextRequest) => handlePost(req, 'footer');
export const PUT = (req: NextRequest) => handlePut(req, 'footer');
export const DELETE = (req: NextRequest) => handleDelete(req, 'footer');
