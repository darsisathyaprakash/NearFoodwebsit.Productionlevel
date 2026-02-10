import { NextRequest, NextResponse } from 'next/server';
import { insforge } from '@/lib/insforge';
import { getMenuItemsSchema } from '@/utils/api-validation';
import { ZodError } from 'zod';

export const dynamic = 'force-dynamic';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // Validate query parameters
        const searchParams = request.nextUrl.searchParams;
        const validated = getMenuItemsSchema.parse({
            page: searchParams.get('page'),
            limit: searchParams.get('limit'),
        });

        const { page, limit } = validated;
        const offset = (page - 1) * limit;

        const { data: menuItems, error, count } = await insforge.database
            .from('menu_items')
            .select('*, menu_categories(name, display_order)', { count: 'exact' })
            .eq('restaurant_id', id)
            .eq('is_available', true)
            .order('category_id', { ascending: true })
            .range(offset, offset + limit - 1);

        if (error) {
            console.error('Menu items fetch error:', error);
            return NextResponse.json({ error: 'Failed to fetch menu items' }, { status: 500 });
        }

        return NextResponse.json({
            data: menuItems || [],
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
        console.error('Menu items GET error:', error);
        return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
    }
}
