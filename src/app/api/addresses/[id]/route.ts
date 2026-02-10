import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/server-client';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

// Validation schema for address update
const addressUpdateSchema = z.object({
    address_line1: z.string().min(1, 'Address line 1 is required').optional(),
    address_line2: z.string().optional(),
    city: z.string().min(1, 'City is required').optional(),
    state: z.string().min(1, 'State is required').optional(),
    postal_code: z.string().min(1, 'Postal code is required').optional(),
    country: z.string().optional(),
    phone: z.string().min(10, 'Phone number must be at least 10 digits').optional(),
    is_default: z.boolean().optional(),
});

// GET - Fetch a single address
export async function GET(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    const { id } = await context.params;
    try {
        const insforge = await createServerClient();
        const { data: sessionData, error: authError } = await insforge.auth.getCurrentSession();

        if (authError || !sessionData?.session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = sessionData.session.user;
        const addressId = id;

        const { data: address, error } = await insforge.database
            .from('user_addresses')
            .select('*')
            .eq('id', addressId)
            .eq('user_id', user.id)
            .single();

        if (error) {
            console.error('Address fetch error:', error);
            return NextResponse.json({ error: 'Failed to fetch address' }, { status: 500 });
        }

        if (!address) {
            return NextResponse.json({ error: 'Address not found' }, { status: 404 });
        }

        return NextResponse.json(address);
    } catch (error) {
        console.error('Address GET error:', error);
        return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
    }
}

// PATCH - Update an address
export async function PATCH(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    const { id } = await context.params;
    try {
        const insforge = await createServerClient();
        const { data: sessionData, error: authError } = await insforge.auth.getCurrentSession();

        if (authError || !sessionData?.session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = sessionData.session.user;
        const addressId = id;
        const body = await request.json();

        // Verify the address belongs to the user
        const { data: existingAddress, error: fetchError } = await insforge.database
            .from('user_addresses')
            .select('*')
            .eq('id', addressId)
            .eq('user_id', user.id)
            .single();

        if (fetchError || !existingAddress) {
            return NextResponse.json({ error: 'Address not found' }, { status: 404 });
        }

        // Validate request body
        const validated = addressUpdateSchema.parse(body);

        // Update address
        const { data: address, error } = await insforge.database
            .from('user_addresses')
            .update(validated)
            .eq('id', addressId)
            .select()
            .single();

        if (error) {
            console.error('Address update error:', error);
            return NextResponse.json({ error: 'Failed to update address' }, { status: 500 });
        }

        return NextResponse.json(address);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
        }
        console.error('Address PATCH error:', error);
        return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
    }
}

// DELETE - Delete an address
export async function DELETE(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    const { id } = await context.params;
    try {
        const insforge = await createServerClient();
        const { data: sessionData, error: authError } = await insforge.auth.getCurrentSession();

        if (authError || !sessionData?.session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = sessionData.session.user;
        const addressId = id;

        // Verify the address belongs to the user
        const { data: existingAddress, error: fetchError } = await insforge.database
            .from('user_addresses')
            .select('*')
            .eq('id', addressId)
            .eq('user_id', user.id)
            .single();

        if (fetchError || !existingAddress) {
            return NextResponse.json({ error: 'Address not found' }, { status: 404 });
        }

        // Delete address
        const { error } = await insforge.database
            .from('user_addresses')
            .delete()
            .eq('id', addressId);

        if (error) {
            console.error('Address delete error:', error);
            return NextResponse.json({ error: 'Failed to delete address' }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Address DELETE error:', error);
        return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
    }
}
