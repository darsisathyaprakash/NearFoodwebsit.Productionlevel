'use client';

import { useEffect, useState } from 'react';
import { insforge } from '@/lib/insforge';
import { RestaurantCard } from '@/components/RestaurantCard';
import { Restaurant } from '@/types/types';
import { RestaurantCardSkeleton } from '@/components/ui/LoadingSkeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { useDebounce } from '@/hooks/useDebounce';
import { Search, UtensilsCrossed } from 'lucide-react';

export default function RestaurantListPage() {
    const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
    const [filteredRestaurants, setFilteredRestaurants] = useState<Restaurant[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCuisine, setSelectedCuisine] = useState<string>('all');
    const debouncedSearch = useDebounce(searchQuery, 300);

    useEffect(() => {
        fetchRestaurants();
    }, []);

    const fetchRestaurants = async () => {
        try {
            const { data, error } = await insforge.database
                .from('restaurants')
                .select('*')
                .eq('is_open', true)
                .order('rating', { ascending: false });

            if (error) throw error;
            setRestaurants((data as Restaurant[]) || []);
            setFilteredRestaurants((data as Restaurant[]) || []);
        } catch (error) {
            console.error('Error loading restaurants:', error);
        } finally {
            setLoading(false);
        }
    };

    const filterRestaurants = () => {
        let filtered = [...restaurants];

        // Filter by search query
        if (debouncedSearch) {
            filtered = filtered.filter(
                (r) =>
                    r.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
                    r.cuisine?.toLowerCase().includes(debouncedSearch.toLowerCase())
            );
        }

        // Filter by cuisine
        if (selectedCuisine !== 'all') {
            filtered = filtered.filter((r) => r.cuisine === selectedCuisine);
        }

        setFilteredRestaurants(filtered);
    };

    useEffect(() => {
        fetchRestaurants();
    }, []);

    useEffect(() => {
        filterRestaurants();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debouncedSearch, selectedCuisine, restaurants]);

    const cuisines = ['all', ...new Set(restaurants.map((r) => r.cuisine).filter(Boolean))];

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="mb-8">
                    <div className="h-8 bg-gray-200 rounded w-64 mb-2 animate-pulse" />
                    <div className="h-5 bg-gray-200 rounded w-96 animate-pulse" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {[...Array(8)].map((_, i) => (
                        <RestaurantCardSkeleton key={i} />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="mb-8 max-w-2xl">
                <h1 className="text-3xl font-extrabold mb-2 text-gray-900">Restaurants Near You</h1>
                <p className="text-gray-500 text-lg">
                    Discover the best food from {restaurants.length} open restaurants in your area.
                </p>
            </div>

            {/* Search and Filters */}
            <div className="mb-8 space-y-4">
                {/* Search Bar */}
                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search restaurants or cuisines..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                    />
                </div>

                {/* Cuisine Filter Chips */}
                {cuisines.length > 1 && (
                    <div className="flex flex-wrap gap-2">
                        {cuisines.map((cuisine) => (
                            <button
                                key={cuisine}
                                onClick={() => setSelectedCuisine(cuisine as string)}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${selectedCuisine === cuisine
                                    ? 'bg-orange-600 text-white shadow-md'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                {cuisine === 'all' ? 'All Cuisines' : cuisine}
                            </button>
                        ))}
                    </div>
                )}

                {/* Results Count */}
                <p className="text-sm text-gray-600">
                    {filteredRestaurants.length} restaurant{filteredRestaurants.length !== 1 ? 's' : ''} found
                    {debouncedSearch && ` for "${debouncedSearch}"`}
                    {selectedCuisine !== 'all' && ` in ${selectedCuisine}`}
                </p>
            </div>

            {/* Restaurant Grid */}
            {filteredRestaurants.length === 0 ? (
                <EmptyState
                    icon={<UtensilsCrossed className="w-16 h-16" />}
                    title="No restaurants found"
                    description={
                        searchQuery || selectedCuisine !== 'all'
                            ? 'Try adjusting your search or filters'
                            : 'No open restaurants nearby at the moment'
                    }
                    actionLabel={searchQuery || selectedCuisine !== 'all' ? 'Clear Filters' : undefined}
                    onAction={
                        searchQuery || selectedCuisine !== 'all'
                            ? () => {
                                setSearchQuery('');
                                setSelectedCuisine('all');
                            }
                            : undefined
                    }
                />
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredRestaurants.map((restaurant) => (
                        <RestaurantCard key={restaurant.id} restaurant={restaurant} />
                    ))}
                </div>
            )}
        </div>
    );
}
