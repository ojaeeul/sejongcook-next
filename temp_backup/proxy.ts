
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
    const path = request.nextUrl.pathname;

    // 1. Sejong legacy redirects
    if (path === '/sejong' || path === '/sejong/') {
        return NextResponse.redirect(new URL('/sejong/index.html', request.url));
    }

    // 2. Auth Protection for /admin and /sejong (except student/login)
    const isAdminRoute = path.startsWith('/admin');
    const isSejongAdminRoute = path.startsWith('/sejong') && !path.startsWith('/sejong/student');

    if (isAdminRoute || isSejongAdminRoute) {
        // Handle trailingSlash: true cases
        const isLogin = path === '/admin/login' || path === '/admin/login/';
        if (isLogin) {
            return NextResponse.next();
        }

        const authCookie = request.cookies.get('admin_auth');
        if (!authCookie || authCookie.value !== 'true') {
            // Keep the trailing slash if that's what we expect
            const loginUrl = new URL('/admin/login/', request.url);
            loginUrl.searchParams.set('from', path);
            return NextResponse.redirect(loginUrl);
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/admin/:path*',
        '/sejong/:path*',
    ],
};
