export const dynamic = "force-static";
import { NextRequest } from 'next/server';
import { handleGet, handlePost, handlePut, handleDelete } from '@/lib/adminApiHandler';

export const GET = (req: NextRequest) => handleGet(req, 'notice');
export const POST = (req: NextRequest) => handlePost(req, 'notice');
export const PUT = (req: NextRequest) => handlePut(req, 'notice');
export const DELETE = (req: NextRequest) => handleDelete(req, 'notice');
