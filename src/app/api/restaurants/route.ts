import { NextRequest, NextResponse } from 'next/server';
import { insforge } from '@/lib/insforge';
import { getRestaurantsSchema } from '@/utils/api-validation';
import { ZodError } from 'zod';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;

        // Validate query parameters
        const validated = getRestaurantsSchema.parse({
            lat: searchParams.get('lat'),
            lng: searchParams.get('lng'),
            page: searchParams.get('page'),
            limit: searchParams.get('limit'),
        });

        const { page, limit } = validated;
        const offset = (page - 1) * limit;

        let query = insforge.database
            .from('restaurants')
            .select('*', { count: 'exact' });

        // Return only open restaurants by default
        query = query.eq('is_open', true);

        // Apply pagination
        query = query.range(offset, offset + limit - 1);

        // Order by rating
        query = query.order('rating', { ascending: false, nullsFirst: false });

        const { data, error, count } = await query;

        if (error) {
            console.error('Restaurants fetch error:', error);
            return NextResponse.json({ error: 'Failed to fetch restaurants' }, { status: 500 });
        }

        // If coordinates provided, valid implementations would use PostGIS.
        // For this MVP, we just return the list.
        return NextResponse.json({
            data: data || [],
            pagination: {
                page,
                limit,
                total: count || 0,
                totalPages: Math.ceil((count || 0) / limit),
            },
        });
    } catch (error) {
        if (error instanceof ZodError) {
            return NextResponse.json(
                { error: error.issues[0].message },
                { status: 400 }
            );
        }
        console.error('Restaurants GET error:', error);
        return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
    }
}
