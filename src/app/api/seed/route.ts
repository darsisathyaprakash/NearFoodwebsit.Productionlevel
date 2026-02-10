import { NextRequest, NextResponse } from 'next/server';
import { insforge } from '@/lib/insforge';
import { createServerClient } from '@/lib/server-client';

// Simple in-memory rate limiter (for production, use Redis or similar)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 5;

function checkRateLimit(identifier: string): boolean {
    const now = Date.now();
    const record = rateLimitMap.get(identifier);

    if (!record || now > record.resetTime) {
        rateLimitMap.set(identifier, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
        return true;
    }

    if (record.count >= RATE_LIMIT_MAX_REQUESTS) {
        return false;
    }

    record.count++;
    return true;
}

export async function GET(request: NextRequest) {
    try {
        // Check authentication
        const insforgeServer = await createServerClient();
        const { data: sessionData, error: authError } = await insforgeServer.auth.getCurrentSession();

        if (authError || !sessionData?.session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Check rate limit
        const userId = sessionData.session.user.id;
        if (!checkRateLimit(userId)) {
            return NextResponse.json(
                { error: 'Too many requests. Please try again later.' },
                { status: 429 }
            );
        }

        const restaurants = [
            {
                name: 'Italian Delight',
                address: '123 Pasta Lane, Foodville',
                image_url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80',
                lat: 40.7128,
                lng: -74.0060,
                cuisine: 'Italian',
                rating: 4.8,
                delivery_time_min: 30,
                price_range: '$$',
                is_open: true,
            },
            {
                name: 'Spice Route',
                address: '45 Curry Ave, Flavor Town',
                image_url: 'https://images.unsplash.com/photo-1585937421612-70a008356f36?auto=format&fit=crop&w=800&q=80',
                lat: 40.7138,
                lng: -74.0070,
                cuisine: 'Indian',
                rating: 4.9,
                delivery_time_min: 45,
                price_range: '$$',
                is_open: true,
            },
            {
                name: 'Dragon Wok',
                address: '88 Dumpling St, Chinatown',
                image_url: 'https://images.unsplash.com/photo-1525755662778-989d0524087e?auto=format&fit=crop&w=800&q=80',
                lat: 40.7148,
                lng: -74.0080,
                cuisine: 'Chinese',
                rating: 4.5,
                delivery_time_min: 25,
                price_range: '$',
                is_open: true,
            },
            {
                name: 'Burger King',
                address: '99 Burger Blvd, Fastfood City',
                image_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80',
                lat: 40.7158,
                lng: -74.0090,
                cuisine: 'American',
                rating: 4.2,
                delivery_time_min: 20,
                price_range: '$',
                is_open: true,
            },
            {
                name: 'Taco Fiesta',
                address: '22 Salsa Rd, Mexico Way',
                image_url: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=800&q=80',
                lat: 40.7168,
                lng: -74.0100,
                cuisine: 'Mexican',
                rating: 4.7,
                delivery_time_min: 35,
                price_range: '$',
                is_open: true,
            },
            {
                name: 'Sushi Master',
                address: '10 Fish Market, Ocean Drive',
                image_url: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=800&q=80',
                lat: 40.7178,
                lng: -74.0110,
                cuisine: 'Japanese',
                rating: 4.9,
                delivery_time_min: 50,
                price_range: '$$$',
                is_open: true,
            },
            {
                name: 'Dessert Heaven',
                address: '7 Sweet St, Sugar Hill',
                image_url: 'https://images.unsplash.com/photo-1551024601-5629f97773b9?auto=format&fit=crop&w=800&q=80',
                lat: 40.7188,
                lng: -74.0120,
                cuisine: 'Desserts',
                rating: 4.6,
                delivery_time_min: 20,
                price_range: '$$',
                is_open: true,
            },
            {
                name: 'Vegan Vibes',
                address: '55 Green Way, Eco Park',
                image_url: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80',
                lat: 40.7198,
                lng: -74.0130,
                cuisine: 'Vegan',
                rating: 4.8,
                delivery_time_min: 30,
                price_range: '$$',
                is_open: true,
            }
        ];

        const menuItemsData: Record<string, Array<{ name: string; price: number; description: string; category: string; is_veg: boolean }>> = {
            'Italian Delight': [
                { name: 'Margherita Pizza', price: 12.99, description: 'Classic cheese and tomato pizza', category: 'Pizza', is_veg: true },
                { name: 'Pepperoni Pizza', price: 14.99, description: 'Spicy pepperoni topping', category: 'Pizza', is_veg: false },
                { name: 'Carbonara Pasta', price: 13.99, description: 'Creamy pasta with bacon', category: 'Pasta', is_veg: false },
                { name: 'Tiramisu', price: 6.99, description: 'Classic Italian dessert', category: 'Dessert', is_veg: true },
            ],
            'Spice Route': [
                { name: 'Butter Chicken', price: 15.99, description: 'Creamy tomato curry with chicken', category: 'Curry', is_veg: false },
                { name: 'Paneer Tikka', price: 13.99, description: 'Grilled cottage cheese with spices', category: 'Starters', is_veg: true },
                { name: 'Garlic Naan', price: 3.99, description: 'Soft bread with garlic butter', category: 'Breads', is_veg: true },
                { name: 'Mango Lassi', price: 4.99, description: 'Sweet mango yogurt drink', category: 'Drinks', is_veg: true },
            ],
            'Dragon Wok': [
                { name: 'Kung Pao Chicken', price: 13.99, description: 'Spicy stir-fry with peanuts', category: 'Main', is_veg: false },
                { name: 'Vegetable Spring Rolls', price: 5.99, description: 'Crispy rolls with veggies', category: 'Starters', is_veg: true },
                { name: 'Fried Rice', price: 10.99, description: 'Wok-tossed rice with vegetables', category: 'Rice', is_veg: true },
            ],
            'Burger King': [
                { name: 'Whopper', price: 5.99, description: 'Flame-grilled beef burger', category: 'Burgers', is_veg: false },
                { name: 'Chicken Fries', price: 4.99, description: 'Crispy chicken strips', category: 'Sides', is_veg: false },
                { name: 'Impossible Whopper', price: 6.99, description: 'Plant-based patty', category: 'Burgers', is_veg: true },
            ],
            'Taco Fiesta': [
                { name: 'Beef Tacos', price: 3.50, description: 'Soft shell taco with seasoned beef', category: 'Tacos', is_veg: false },
                { name: 'Chicken Burrito', price: 9.99, description: 'Rice, beans, chicken in tortilla', category: 'Burritos', is_veg: false },
                { name: 'Nachos Supreme', price: 11.99, description: 'Chips with cheese, guac, and salsa', category: 'Sides', is_veg: true },
            ],
            'Sushi Master': [
                { name: 'Salmon Roll', price: 8.99, description: 'Fresh salmon sushi roll', category: 'Rolls', is_veg: false },
                { name: 'Tuna Sashimi', price: 12.99, description: 'Sliced raw tuna', category: 'Sashimi', is_veg: false },
                { name: 'Miso Soup', price: 3.99, description: 'Traditional soy bean soup', category: 'Soups', is_veg: true },
            ],
            'Dessert Heaven': [
                { name: 'Chocolate Cake', price: 7.99, description: 'Rich chocolate fudge cake', category: 'Cakes', is_veg: true },
                { name: 'Cheesecake', price: 8.99, description: 'NY style cheesecake', category: 'Cakes', is_veg: true },
                { name: 'Ice Cream Sundae', price: 6.99, description: 'Vanilla ice cream with toppings', category: 'Ice Cream', is_veg: true },
            ],
            'Vegan Vibes': [
                { name: 'Buddha Bowl', price: 12.99, description: 'Quinoa, avocado, roasted veggies', category: 'Bowls', is_veg: true },
                { name: 'Vegan Burger', price: 11.99, description: 'Black bean patty with vegan cheese', category: 'Burgers', is_veg: true },
                { name: 'Smoothie', price: 5.99, description: 'Green detox smoothie', category: 'Drinks', is_veg: true },
            ]
        };

        const results = [];

        for (const restaurant of restaurants) {
            // Check if restaurant exists
            let upsertedRestaurant;

            const { data: existingRestaurant } = await insforge.database
                .from('restaurants')
                .select('id, name')
                .eq('name', restaurant.name)
                .single();

            if (existingRestaurant) {
                // Update or just use existing
                const { data, error } = await insforge.database
                    .from('restaurants')
                    .update(restaurant)
                    .eq('id', existingRestaurant.id)
                    .select()
                    .single();

                if (error) {
                    console.error('Error updating restaurant', restaurant.name, error);
                    continue;
                }
                upsertedRestaurant = data;
            } else {
                // Insert new
                const { data, error } = await insforge.database
                    .from('restaurants')
                    .insert(restaurant)
                    .select()
                    .single();

                if (error) {
                    console.error('Error inserting restaurant', restaurant.name, error);
                    continue;
                }
                upsertedRestaurant = data;
            }

            if (!upsertedRestaurant) continue;

            results.push({ restaurant: upsertedRestaurant.name, status: existingRestaurant ? 'updated' : 'inserted' });

            // Insert categories and items
            const items = menuItemsData[upsertedRestaurant.name] || [];

            // Group by category to create categories first
            const categories = [...new Set(items.map((i) => i.category))];

            for (const catName of categories) {
                const { data: category, error: cError } = await insforge.database
                    .from('menu_categories')
                    .upsert({
                        restaurant_id: upsertedRestaurant.id,
                        name: catName,
                        display_order: 1 // Default
                    }, { onConflict: 'restaurant_id,name' })
                    .select()
                    .single();

                // If creating category fails/duplicates, we might need to fetch it.
                // For simplicity, let's just use the ID if returned, or fetch it.
                let categoryId = category?.id;

                if (!categoryId) {
                    // Try fetching if upsert failed or didn't return
                    const { data: existingCat } = await insforge.database
                        .from('menu_categories')
                        .select('id')
                        .eq('restaurant_id', upsertedRestaurant.id)
                        .eq('name', catName)
                        .single();
                    categoryId = existingCat?.id;
                }

                if (categoryId) {
                    const catItems = items.filter((i) => i.category === catName);
                    for (const item of catItems) {
                        await insforge.database.from('menu_items').upsert({
                            restaurant_id: upsertedRestaurant.id,
                            category_id: categoryId,
                            name: item.name,
                            description: item.description,
                            price: item.price,
                            is_veg: item.is_veg,
                            is_available: true,
                            image_url: `https://placehold.co/400x300?text=${encodeURIComponent(item.name)}`
                        });
                    }
                }
            }
        }

        return NextResponse.json({ success: true, results });
    } catch (error) {
        console.error('Seed error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
