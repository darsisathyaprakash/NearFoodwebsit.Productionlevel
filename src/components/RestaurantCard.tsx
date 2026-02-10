import Link from 'next/link';
import { Star, Clock } from 'lucide-react';

interface Restaurant {
    id: string;
    name: string;
    image_url?: string | null;
    cuisine?: string | null;
    rating?: number | null;
    delivery_time_min?: number | null;
    price_range?: string | null;
}

export function RestaurantCard({ restaurant }: { restaurant: Restaurant }) {
    return (
        <Link href={`/restaurants/${restaurant.id}`} className="group block h-full">
            <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 h-full flex flex-col">
                <div className="aspect-[16/9] bg-gray-200 relative overflow-hidden">
                    <img
                        src={restaurant.image_url || `https://placehold.co/600x400?text=${encodeURIComponent(restaurant.name)}`}
                        alt={restaurant.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    {/* Overlay gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                    <div className="absolute bottom-2 right-2 bg-white/90 backdrop-blur px-2 py-1 rounded-md shadow-sm text-xs font-bold text-gray-800 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {restaurant.delivery_time_min || 30} min
                    </div>
                </div>
                <div className="p-4 flex flex-col flex-grow">
                    <div className="flex justify-between items-start mb-1">
                        <h3 className="font-bold text-lg text-gray-900 group-hover:text-orange-600 transition-colors line-clamp-1">{restaurant.name}</h3>
                        <div className="flex items-center bg-green-600 text-white px-1.5 py-0.5 rounded text-xs font-bold shadow-sm">
                            {restaurant.rating || 'New'} <Star className="h-3 w-3 ml-0.5 fill-current" />
                        </div>
                    </div>
                    <p className="text-sm text-gray-500 mb-3 line-clamp-1">{restaurant.cuisine || 'Multi-cuisine'}</p>
                    <div className="mt-auto pt-3 border-t border-dashed border-gray-100 flex items-center justify-between text-xs text-gray-500 font-medium">
                        <span>{restaurant.price_range || '$$'}</span>
                        <span className="text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">Free Delivery</span>
                    </div>
                </div>
            </div>
        </Link>
    );
}
