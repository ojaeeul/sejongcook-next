import { NextRequest } from 'next/server';
import { handleGet, handleReplace, handlePut, handleDelete } from '@/lib/adminApiHandler';

export const dynamic = 'force-static';

export const GET = (req: NextRequest) => handleGet(req, 'popups');
export const POST = (req: NextRequest) => handleReplace(req, 'popups');
export const PUT = (req: NextRequest) => handlePut(req, 'popups');
export const DELETE = (req: NextRequest) => handleDelete(req, 'popups');
