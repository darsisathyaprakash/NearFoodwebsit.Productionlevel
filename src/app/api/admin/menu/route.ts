// Admin menu items API
// GET: Fetch all menu items
// POST: Create a new menu item
import { NextRequest, NextResponse } from 'next/server';
import { verifyAdmin, logAdminAction } from '@/lib/admin-auth';
import { adminClient } from '@/lib/admin-client';
import { createMenuItemSchema } from '@/utils/admin-validation';
import { ZodError } from 'zod';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const auth = await verifyAdmin();
        if (!auth.isAdmin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { data, error } = await adminClient.database
            .from('menu_items')
            .select('*, menu_categories(name)')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Admin menu fetch error:', error);
            return NextResponse.json({ error: 'Failed to fetch menu items' }, { status: 500 });
        }

        return NextResponse.json({ success: true, data: data || [] });
    } catch (error) {
        console.error('Admin menu GET error:', error);
        return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const auth = await verifyAdmin();
        if (!auth.isAdmin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const validated = createMenuItemSchema.parse(body);

        const { data, error } = await adminClient.database
            .from('menu_items')
            .insert(validated)
            .select()
            .single();

        if (error) {
            console.error('Menu item create error:', error);
            return NextResponse.json({ error: 'Failed to create menu item' }, { status: 500 });
        }

        await logAdminAction(auth.userId!, 'created_menu_item', 'menu_item', data.id, {
            name: validated.name,
        });

        return NextResponse.json(data, { status: 201 });
    } catch (error) {
        if (error instanceof ZodError) {
            return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
        }
        console.error('Menu POST error:', error);
        return NextResponse.json({ error: 'Failed to create menu item' }, { status: 500 });
    }
}
