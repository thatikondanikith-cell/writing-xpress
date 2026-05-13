import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const userAuth = request.cookies.get('userAuth');
    const adminAuth =
        request.cookies.get('adminAuth')?.value === 'true';

    const { pathname } = request.nextUrl;

    // Protect user dashboard
    if (pathname.startsWith('/user/dashboard') && !userAuth) {
        return NextResponse.redirect(new URL('/user/login', request.url));
    }

    // Protect admin routes
    if (
        pathname.startsWith('/admin') &&
        pathname !== '/admin/login' &&
        !adminAuth
    ) {
        return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/user/dashboard/:path*', '/admin/:path*'],
};