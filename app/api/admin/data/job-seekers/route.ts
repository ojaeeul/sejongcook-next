import { NextRequest } from 'next/server';
import { handleGet, handlePost, handlePut, handleDelete } from '@/lib/adminApiHandler';

export const GET = (req: NextRequest) => handleGet(req, 'job-seekers');
export const POST = (req: NextRequest) => handlePost(req, 'job-seekers');
export const PUT = (req: NextRequest) => handlePut(req, 'job-seekers');
export const DELETE = (req: NextRequest) => handleDelete(req, 'job-seekers');
