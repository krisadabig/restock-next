import { type NextRequest, NextResponse } from 'next/server';
import { decrypt } from '@/lib/session';
import { ROUTES } from '@/lib/constants';

export async function proxy(request: NextRequest) {
	const protectedRoutes = [ROUTES.STOCK];
	const publicRoutes = [ROUTES.LOGIN, '/signup', '/api/auth'];

	const path = request.nextUrl.pathname;
	const isProtectedRoute = protectedRoutes.some((route) => path.startsWith(route));
	const isPublicRoute = publicRoutes.some((route) => path.startsWith(route));

	const cookie = request.cookies.get('session')?.value;
	let session = null;

	if (cookie) {
		session = await decrypt(cookie);
	}

	// 1. Redirect to /login if accessing protected route without session
	if (isProtectedRoute && !session?.userId) {
		return NextResponse.redirect(new URL(ROUTES.LOGIN, request.nextUrl));
	}

	// 2. Redirect to /app if accessing public route with active session
	if (isPublicRoute && session?.userId && !request.nextUrl.pathname.startsWith('/api/auth')) {
		return NextResponse.redirect(new URL(ROUTES.STOCK, request.nextUrl));
	}

	return NextResponse.next();
}

export const config = {
	matcher: [
		/*
		 * Match all request paths except for the ones starting with:
		 * - _next/static (static files)
		 * - _next/image (image optimization files)
		 * - favicon.ico (favicon file)
		 * Feel free to modify this pattern to include more paths.
		 */
		'/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
	],
};
