
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    // Check if it's an admin route
    if (request.nextUrl.pathname.startsWith('/admin')) {
        // allow login page pass through
        if (request.nextUrl.pathname === '/admin/login') {
            // If already logged in, redirect to dashboard
            const authCookie = request.cookies.get('admin_auth');
            if (authCookie?.value === 'true') {
                return NextResponse.redirect(new URL('/admin', request.url));
            }
            return NextResponse.next();
        }

        // Check for auth cookie
        const authCookie = request.cookies.get('admin_auth');

        if (!authCookie || authCookie.value !== 'true') {
            // Redirect to login if not authenticated
            const loginUrl = new URL('/admin/login', request.url);
            loginUrl.searchParams.set('from', request.nextUrl.pathname);
            return NextResponse.redirect(loginUrl);
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: '/admin/:path*',
};
