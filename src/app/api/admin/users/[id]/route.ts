// Admin individual user API
// PATCH: Update user role or block status
// DELETE: Delete user profile
import { NextRequest, NextResponse } from 'next/server';
import { verifyAdmin, logAdminAction } from '@/lib/admin-auth';
import { adminClient } from '@/lib/admin-client';
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

        // Only allow role and is_blocked updates
        const updateData: Record<string, unknown> = {};
        if (body.role && ['admin', 'user'].includes(body.role)) {
            updateData.role = body.role;
        }
        if (typeof body.is_blocked === 'boolean') {
            updateData.is_blocked = body.is_blocked;
        }

        if (Object.keys(updateData).length === 0) {
            return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
        }

        const { data, error } = await adminClient.database
            .from('user_profiles')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('User update error:', error);
            return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
        }

        await logAdminAction(auth.userId!, 'updated_user', 'user_profile', id, updateData);

        return NextResponse.json(data);
    } catch (error) {
        console.error('User PATCH error:', error);
        return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
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

        // Fetch the profile to check if it's the current admin
        const { data: profile } = await adminClient.database
            .from('user_profiles')
            .select('user_id')
            .eq('id', id)
            .single();

        if (profile && profile.user_id === auth.userId) {
            return NextResponse.json(
                { error: 'You cannot delete your own account' },
                { status: 400 }
            );
        }

        const { error } = await adminClient.database
            .from('user_profiles')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('User delete error:', error);
            return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
        }

        await logAdminAction(auth.userId!, 'deleted_user', 'user_profile', id);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('User DELETE error:', error);
        return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
    }
}
