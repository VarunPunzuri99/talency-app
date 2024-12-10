import IsAuthenticated from '@/hooks/Auth';
import { NextResponse } from 'next/server';
const roleBasedRoutes = {
    freelancer: ['jobs/lists', 'jobs/application-form', 'settings/profile'],
    company: ['sales', 'jobs', 'settings', 'internals', 'email'],
    agency: ['sales', 'jobs', 'settings', 'internals', 'email'],
};

export async function middleware(request: any) {
    try {
        const cookie = request.cookies.get('talency_id_token');
        if (!cookie || !cookie.value) {
            return NextResponse.redirect(new URL('/auth/login', request.nextUrl));
        }

        const { authenticated, userRole } = await IsAuthenticated(cookie.value);

        if (authenticated) {
            const allowedRoutes = roleBasedRoutes[userRole];
            if (!allowedRoutes) {
                return NextResponse.json(
                    { message: 'This Page is not available' },
                    { status: 401 }
                );
                // return NextResponse.redirect(new URL('/auth/login', request.nextUrl));
            }

            const isRouteAllowed = allowedRoutes.some((route) =>
                request.nextUrl.pathname.startsWith(`/${route}`)
            );
            if (!isRouteAllowed) {
                return NextResponse.json(
                    { message: 'This Page is not available' },
                    { status: 401 }
                );
                // return NextResponse.redirect(new URL('/auth/login', request.nextUrl));
            }

            // Continue to the requested route if everything is fine
            return NextResponse.next();
        } else {
            // Redirect to login if authentication fails
            return NextResponse.redirect(new URL('/auth/login', request.nextUrl));
        }
    } catch {
        // console.error('Error in authentication middleware:', error.message);
        if (!(request.nextUrl.pathname === '/error')) {
            return NextResponse.redirect(new URL('/error', request.nextUrl));
        } else {
            return NextResponse.next();
        }
    }
}

export const config = {
    matcher: [
        // '/email/:path*',
        // '/internals/:path*',
        // '/jobs/:path*',
        // '/sales/:path*',
        // '/settings/:path*',
    ],
};
