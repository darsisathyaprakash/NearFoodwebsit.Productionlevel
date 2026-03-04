// Admin individual menu item API
// PATCH: Update menu item
// DELETE: Delete menu item
import { NextRequest, NextResponse } from 'next/server';
import { verifyAdmin, logAdminAction } from '@/lib/admin-auth';
import { adminClient } from '@/lib/admin-client';
import { updateMenuItemSchema } from '@/utils/admin-validation';
import { ZodError } from 'zod';

export const dynamic = 'force-dynamic';

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const auth = await verifyAdmin();
        if (!auth.isAdmin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const body = await request.json();
        const validated = updateMenuItemSchema.parse(body);

        const { data, error } = await adminClient.database
            .from('menu_items')
            .update(validated)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Menu item update error:', error);
            return NextResponse.json({ error: 'Failed to update menu item' }, { status: 500 });
        }

        await logAdminAction(auth.userId!, 'updated_menu_item', 'menu_item', id, validated);

        return NextResponse.json(data);
    } catch (error) {
        if (error instanceof ZodError) {
            return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
        }
        console.error('Menu PATCH error:', error);
        return NextResponse.json({ error: 'Failed to update menu item' }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const auth = await verifyAdmin();
        if (!auth.isAdmin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;

        const { error } = await adminClient.database
            .from('menu_items')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Menu item delete error:', error);
            return NextResponse.json({ error: 'Failed to delete menu item' }, { status: 500 });
        }

        await logAdminAction(auth.userId!, 'deleted_menu_item', 'menu_item', id);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Menu DELETE error:', error);
        return NextResponse.json({ error: 'Failed to delete menu item' }, { status: 500 });
    }
}
