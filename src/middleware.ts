import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'
import { cookies } from 'next/headers';
import { fetchVideosByQuestionIdsServer } from './app/_api/videos-server';

const restrictedRoutes = ['/auth/reset-password'];

export async function middleware(request: NextRequest) {
  // Attach pathname for tracing
  request.headers.set('pathname', request.nextUrl.pathname);

  // Initialize response and session
  const { response, user } = await updateSession(request);
  const pathname = request.nextUrl.pathname;

  // 1. Private Page OTP Verification
  if (pathname.startsWith('/private-page-patient/')) {
    const privatePageId = extractId(pathname);
    const otpVerified = request.cookies.get('otp-verified')?.value === 'true';

    // Allow access to /auth and related OTP pages
    if (pathname.includes('/auth')) return response;

    // Require OTP verification
    if (!otpVerified) {
      return NextResponse.redirect(
        new URL(`/private-page-patient/${privatePageId}/auth`, request.url)
      );
    }

    return response;
  }

  // 2. Global route restrictions (like /auth/reset-password)
  if (restrictedRoutes.includes(pathname) && !user) {
    const loginUrl = new URL('/auth/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

function extractId(pathname: string) {
  const match = pathname.match(/private-page-patient\/([^/]+)/);
  return match ? match[1] : '';
}

export const config = {
  matcher: [
    // Match all routes except static files, _next, api
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
