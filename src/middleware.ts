import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Simple in-memory rate limiter for API routes
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const API_RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const API_RATE_LIMIT_MAX = 100; // max requests per window per IP
const MAX_BODY_SIZE = 1 * 1024 * 1024; // 1MB max body size

// CSRF token validation for mutation methods
const CSRF_TOKEN_HEADER = 'x-csrf-token';
const SAFE_METHODS = ['GET', 'HEAD', 'OPTIONS'];

function getClientIP(request: NextRequest): string {
    const forwardedFor = request.headers.get('x-forwarded-for');
    if (forwardedFor) {
        const ip = forwardedFor.split(',')[0].trim();
        if (ip !== '::1' && ip !== '127.0.0.1') {
            return ip;
        }
    }
    return request.headers.get('x-real-ip') || 'unknown';
}

function checkRateLimit(ip: string): boolean {
    const now = Date.now();
    const record = rateLimitMap.get(ip);

    if (!record || now > record.resetTime) {
        rateLimitMap.set(ip, { count: 1, resetTime: now + API_RATE_LIMIT_WINDOW });
        return true;
    }

    if (record.count >= API_RATE_LIMIT_MAX) {
        return false;
    }

    record.count++;
    return true;
}

function validateCSRF(request: NextRequest): boolean {
    // Skip CSRF for safe methods
    if (SAFE_METHODS.includes(request.method)) {
        return true;
    }

    // For mutations, require CSRF token in production
    if (process.env.NODE_ENV === 'production') {
        const csrfToken = request.headers.get(CSRF_TOKEN_HEADER);
        // In production, reject if no CSRF token (unless from same origin)
        const origin = request.headers.get('origin');
        const referer = request.headers.get('referer');
        const isSameOrigin = origin === referer?.split('?')[0];

        // Allow if same origin request (has matching origin/referer)
        if (isSameOrigin) {
            return true;
        }

        // For cross-origin, require explicit CSRF token
        return !!csrfToken;
    }

    return true;
}

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Check body size for mutations (Content-Length header)
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method)) {
        const contentLength = request.headers.get('content-length');
        if (contentLength) {
            const size = parseInt(contentLength, 10);
            if (size > MAX_BODY_SIZE) {
                return NextResponse.json(
                    { error: 'Request body too large. Maximum size is 1MB.' },
                    { status: 413 }
                );
            }
        }
    }

    // Only rate-limit API routes
    if (pathname.startsWith('/api/')) {
        const clientIP = getClientIP(request);

        if (!checkRateLimit(clientIP)) {
            return NextResponse.json(
                { error: 'Too many requests. Please try again later.' },
                { status: 429 }
            );
        }

        // Validate CSRF for mutations
        if (!validateCSRF(request)) {
            return NextResponse.json(
                { error: 'Invalid CSRF token' },
                { status: 403 }
            );
        }
    }

    // Block seed route in production
    if (
        pathname === '/api/seed' &&
        process.env.NODE_ENV === 'production'
    ) {
        return NextResponse.json(
            { error: 'This endpoint is disabled in production' },
            { status: 403 }
        );
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/api/:path*',
    ],
};
