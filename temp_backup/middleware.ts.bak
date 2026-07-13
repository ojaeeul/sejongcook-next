
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname;

    // Define protected routes
    // 1. Existing Admin routes (though app/admin/layout also protects them client-side)
    const isAdminRoute = path.startsWith('/admin');

    // FIX: Redirect `/sejong` entirely to `/sejong/index.html` to avoid Next.js trailing slash fighting and fix relative asset paths.
    if (path === '/sejong' || path === '/sejong/') {
        return NextResponse.redirect(new URL('/sejong/index.html', request.url));
    }

    // 2. Sejong Admin routes (ALL /sejong/* EXCEPT /sejong/student/*)
    const isSejongAdminRoute = path.startsWith('/sejong') && !path.startsWith('/sejong/student');

    if (isAdminRoute || isSejongAdminRoute) {
        // Exception for login page
        if (path === '/admin/login') {
            // Optional: Redirect to dashboard if already logged in?
            // For now, let the page handle it or just pass through.
            return NextResponse.next();
        }

        // Check for auth cookie
        const authCookie = request.cookies.get('admin_auth');

        if (!authCookie || authCookie.value !== 'true') {
            // Redirect to login if not authenticated
            const loginUrl = new URL('/admin/login', request.url);
            // Add 'from' param so we can redirect back after login
            loginUrl.searchParams.set('from', path);
            return NextResponse.redirect(loginUrl);
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths under /admin/ and /sejong/ EXCEPT:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - All paths containing a dot (e.g., .css, .js, .html, .png, etc.)
         */
        '/((?!api|_next/static|_next/image|favicon.ico|.*\\.).*)',
        '/admin/:path*',
        '/sejong/:path*'
    ],
};
