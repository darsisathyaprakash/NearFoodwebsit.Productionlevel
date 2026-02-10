import { insforge } from '@/lib/insforge';
import { HomePageClient } from '@/components/HomePageClient';

export const revalidate = 60; // Revalidate every minute

export default async function Home() {
  const { data } = await insforge.database
    .from('restaurants')
    .select('id, name, image_url, cuisine, rating')
    .eq('is_open', true)
    .limit(3);

  // Filter out null values and transform to match expected type
  const featuredRestaurants = (data || []).map((restaurant) => ({
    id: restaurant.id,
    name: restaurant.name,
    image_url: restaurant.image_url || undefined,
    cuisine: restaurant.cuisine || undefined,
    rating: restaurant.rating || undefined,
  }));

  return <HomePageClient featuredRestaurants={featuredRestaurants} />;
}
