import { insforge } from '@/lib/insforge';
import { MenuItem } from '@/components/MenuItem';
import { Star, Clock, MapPin } from 'lucide-react';
import { MenuCategory as MenuCategoryType } from '@/types/types';

export const revalidate = 0;

interface MenuItemWithCategory {
    id: string;
    restaurant_id: string;
    name: string;
    description?: string | null;
    price: number;
    image_url?: string | null;
    is_veg?: boolean | null;
    is_available: boolean;
    created_at: string;
    menu_categories?: MenuCategoryType | MenuCategoryType[];
}

export default async function RestaurantMenuPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    // Fetch restaurant details
    const { data: restaurant, error: rError } = await insforge.database
        .from('restaurants')
        .select('*')
        .eq('id', id)
        .single();

    if (rError || !restaurant) {
        return <div className="container px-4 py-8 text-red-500">Restaurant not found or error loading.</div>;
    }

    // Fetch menu items with category relation
    // Note: InsForge/PostgREST join syntax
    const { data: menuItems } = await insforge.database
        .from('menu_items')
        .select('*, menu_categories(name)')
        .eq('restaurant_id', id)
        .eq('is_available', true);

    const items = (menuItems as MenuItemWithCategory[]) || [];

    // Group logic
    const categorized: Record<string, MenuItemWithCategory[]> = {};

    items.forEach((item) => {
        // Handle potential array or object for joined relation
        const cats = item.menu_categories;
        const catName = Array.isArray(cats) ? cats[0]?.name : cats?.name;

        const category = catName || 'Recommended';
        if (!categorized[category]) categorized[category] = [];
        categorized[category].push(item);
    });

    // Sort categories? Recommended first vs alphabetical. Object.keys order is not guaranteed but usually insertion order.

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Restaurant Header */}
            <div className="bg-white border-b sticky top-14 z-40 shadow-sm">
                <div className="container px-4 py-6 mx-auto">
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{restaurant.name}</h1>
                            <p className="text-gray-500 text-sm mb-4">{restaurant.cuisine || 'Multi-cuisine'} • {restaurant.address}</p>
                            <div className="flex flex-wrap items-center gap-4 text-sm font-medium">
                                <div className="flex items-center gap-1 bg-green-600 text-white px-2 py-0.5 rounded shadow-sm">
                                    <Star className="w-4 h-4 fill-current" /> {restaurant.rating || 'New'}
                                </div>
                                <div className="flex items-center gap-1 text-gray-700">
                                    <Clock className="w-4 h-4" /> {restaurant.delivery_time_min || 30} mins
                                </div>
                                <div className="flex items-center gap-1 text-gray-700">
                                    <MapPin className="w-4 h-4" /> {restaurant.address.split(',')[0]}
                                </div>
                            </div>
                        </div>
                        {restaurant.image_url && (
                            <div className="hidden md:block w-32 h-32 rounded-xl overflow-hidden shadow-md">
                                <img src={restaurant.image_url} alt={restaurant.name} className="w-full h-full object-cover" />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Menu Sections */}
            <div className="container px-4 py-8 max-w-4xl mx-auto">
                {Object.keys(categorized).length === 0 ? (
                    <div className="text-center py-20">
                        <p className="text-gray-500 text-lg">Menu is currently being updated.</p>
                    </div>
                ) : (
                    Object.entries(categorized).map(([category, items]) => (
                        <div key={category} className="mb-8 scroll-mt-32" id={category}>
                            <h2 className="text-xl font-bold mb-4 text-gray-800 border-b pb-2 flex items-center justify-between">
                                {category}
                                <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full">{items.length} items</span>
                            </h2>
                            <div className="grid md:grid-cols-2 gap-4">
                                {items.map(item => (
                                    <MenuItem key={item.id} item={item} />
                                ))}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
