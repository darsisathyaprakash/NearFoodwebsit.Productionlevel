// Admin auth verification API
// GET: Check if current user is an admin
import { NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/admin-auth';
import { adminClient } from '@/lib/admin-client';

export const dynamic = 'force-dynamic';

const NO_CACHE_HEADERS = {
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
};

export async function GET() {
    try {
        const auth = await verifyAdmin();
        if (!auth.isAdmin) {
            return NextResponse.json(
                { error: auth.error || 'Unauthorized' },
                { status: 401, headers: NO_CACHE_HEADERS }
            );
        }

        return NextResponse.json({
            isAdmin: true,
            user: auth.user,
        }, { headers: NO_CACHE_HEADERS });
    } catch (error) {
        console.error('Admin auth check error:', error);
        return NextResponse.json(
            { error: 'Authentication failed' },
            { status: 500, headers: NO_CACHE_HEADERS }
        );
    }
}

// POST: Admin login — verifies credentials then checks admin role
export async function POST(request: Request) {
    try {
        const { email, password } = await request.json();

        if (!email || !password) {
            return NextResponse.json(
                { error: 'Email and password required' },
                { status: 400, headers: NO_CACHE_HEADERS }
            );
        }

        // Sign in with InsForge auth using admin client
        const INSFORGE_URL = process.env.NEXT_PUBLIC_INSFORGE_BASE_URL || '';
        const response = await fetch(`${INSFORGE_URL}/api/auth/sessions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
            return NextResponse.json(
                { error: 'Invalid email or password' },
                { status: 401, headers: NO_CACHE_HEADERS }
            );
        }

        const data = await response.json();
        const user = data.user;
        const accessToken = data.accessToken;

        if (!user || !accessToken) {
            return NextResponse.json(
                { error: 'Invalid email or password' },
                { status: 401, headers: NO_CACHE_HEADERS }
            );
        }

        const userId = user.id;

        // Check admin role — use admin client for full DB access
        const { data: profile } = await adminClient.database
            .from('user_profiles')
            .select('role, is_blocked')
            .eq('user_id', userId)
            .maybeSingle();

        if (!profile || profile.role !== 'admin') {
            return NextResponse.json(
                { error: 'Access denied. Admin privileges required.' },
                { status: 403, headers: NO_CACHE_HEADERS }
            );
        }

        if (profile.is_blocked) {
            return NextResponse.json(
                { error: 'Your account has been blocked' },
                { status: 403, headers: NO_CACHE_HEADERS }
            );
        }

        return NextResponse.json({
            success: true,
            session: data,
            user: {
                id: userId,
                email: user.email,
                name: user.profile?.name || email.split('@')[0],
                role: 'admin',
            },
        }, { headers: NO_CACHE_HEADERS });
    } catch (error) {
        console.error('Admin login error:', error);
        return NextResponse.json(
            { error: 'Login failed' },
            { status: 500, headers: NO_CACHE_HEADERS }
        );
    }
}
