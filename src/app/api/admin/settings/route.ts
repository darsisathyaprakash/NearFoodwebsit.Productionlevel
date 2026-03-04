// Admin settings API
// GET: Fetch current settings
// PUT: Update settings
import { NextRequest, NextResponse } from 'next/server';
import { verifyAdmin, logAdminAction } from '@/lib/admin-auth';
import { adminClient } from '@/lib/admin-client';
import { updateSettingsSchema } from '@/utils/admin-validation';
import { ZodError } from 'zod';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const auth = await verifyAdmin();
        if (!auth.isAdmin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { data, error } = await adminClient.database
            .from('site_settings')
            .select('*')
            .limit(1)
            .single();

        if (error) {
            console.error('Settings fetch error:', error);
            return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('Settings GET error:', error);
        return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    try {
        const auth = await verifyAdmin();
        if (!auth.isAdmin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const validated = updateSettingsSchema.parse(body);

        // Get the first (only) settings row
        const { data: existing } = await adminClient.database
            .from('site_settings')
            .select('id')
            .limit(1)
            .single();

        if (!existing) {
            return NextResponse.json({ error: 'Settings not found' }, { status: 404 });
        }

        const { data, error } = await adminClient.database
            .from('site_settings')
            .update({ ...validated, updated_at: new Date().toISOString() })
            .eq('id', existing.id)
            .select()
            .single();

        if (error) {
            console.error('Settings update error:', error);
            return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
        }

        await logAdminAction(auth.userId!, 'updated_settings', 'site_settings', existing.id, validated);

        return NextResponse.json(data);
    } catch (error) {
        if (error instanceof ZodError) {
            return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
        }
        console.error('Settings PUT error:', error);
        return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
    }
}
