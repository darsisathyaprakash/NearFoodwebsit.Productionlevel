import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/server-client';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

// Validation schema for address
const addressSchema = z.object({
    address_line1: z.string().min(1, 'Address line 1 is required'),
    address_line2: z.string().optional(),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    postal_code: z.string().min(1, 'Postal code is required'),
    country: z.string().default('India'),
    phone: z.string().min(10, 'Phone number must be at least 10 digits'),
    is_default: z.boolean().default(false),
});

// GET - Fetch all addresses for the user
export async function GET(request: NextRequest) {
    try {
        const insforge = await createServerClient();
        const { data: sessionData, error: authError } = await insforge.auth.getCurrentSession();

        if (authError || !sessionData?.session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = sessionData.session.user;

        const { data: addresses, error } = await insforge.database
            .from('user_addresses')
            .select('*')
            .eq('user_id', user.id)
            .order('is_default', { ascending: false })
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Addresses fetch error:', error);
            return NextResponse.json({ error: 'Failed to fetch addresses' }, { status: 500 });
        }

        return NextResponse.json(addresses || []);
    } catch (error) {
        console.error('Addresses GET error:', error);
        return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
    }
}

// POST - Create a new address
export async function POST(request: NextRequest) {
    try {
        const insforge = await createServerClient();
        const { data: sessionData, error: authError } = await insforge.auth.getCurrentSession();

        if (authError || !sessionData?.session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = sessionData.session.user;
        const body = await request.json();

        // Validate request body
        const validated = addressSchema.parse(body);

        // Create address
        const { data: address, error } = await insforge.database
            .from('user_addresses')
            .insert({
                user_id: user.id,
                ...validated,
            })
            .select()
            .single();

        if (error) {
            console.error('Address creation error:', error);
            return NextResponse.json({ error: 'Failed to create address' }, { status: 500 });
        }

        return NextResponse.json(address, { status: 201 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
        }
        console.error('Address POST error:', error);
        return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
    }
}
