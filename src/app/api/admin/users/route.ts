// Admin users API
// GET: Fetch all user profiles
import { NextRequest, NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/admin-auth';
import { adminClient } from '@/lib/admin-client';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        const auth = await verifyAdmin();
        if (!auth.isAdmin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search') || '';

        let query = adminClient.database
            .from('user_profiles')
            .select('*')
            .order('created_at', { ascending: false });

        // Apply server-side search filter if provided
        if (search) {
            query = query.or(`email.ilike.%${search}%,name.ilike.%${search}%`);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Admin users fetch error:', error);
            return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
        }

        return NextResponse.json({ success: true, data: data || [] });
    } catch (error) {
        console.error('Admin users GET error:', error);
        return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
    }
}
