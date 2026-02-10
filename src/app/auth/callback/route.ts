import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * OAuth callback handler for Google Sign-in.
 * InsForge handles the session automatically via cookies.
 * This route just redirects to the appropriate page.
 */
export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');
    const next = searchParams.get('next') || '/';

    // Check for OAuth errors
    if (error) {
        console.error('OAuth error:', error, errorDescription);
        return NextResponse.redirect(
            new URL(`/login?error=${encodeURIComponent(errorDescription || error)}`, request.url)
        );
    }

    // Successful auth - InsForge sets cookies automatically
    // Redirect to intended destination
    return NextResponse.redirect(new URL(next, request.url));
}
