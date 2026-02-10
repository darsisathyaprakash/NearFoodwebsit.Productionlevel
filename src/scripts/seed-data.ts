import { adminClient } from './admin-client';

async function seedData() {
    console.log('Starting data seeding...');

    // 1. Fetch Restaurants
    // Note: Using adminClient.database.from because the client structure requires .database prefix for query builder
    const { data: restaurants, error: rError } = await adminClient.database.from('restaurants').select('*');
    if (rError) {
        console.error('Error fetching restaurants:', rError);
        return;
    }
    console.log(`Found ${restaurants.length} restaurants.`);

    // 2. Define Categories for each restaurant type
    const categoriesMap: Record<string, string[]> = {
        'Burger King': ['Burgers', 'Sides', 'Drinks'],
        'Pizza Hut': ['Pizzas', 'Sides', 'Drinks'],
        'Subway': ['Sandwiches', 'Salads', 'Drinks'],
        'Starbucks': ['Coffee', 'Snacks', 'Bakery']
    };

    for (const restaurant of restaurants) {
        const categories = categoriesMap[restaurant.name] || ['Main', 'Sides', 'Drinks'];
        console.log(`Processing ${restaurant.name}...`);

        for (const catName of categories) {
            // Check if category exists
            const { data: existingCat } = await adminClient.database.from('menu_categories')
                .select('id')
                .eq('restaurant_id', restaurant.id)
                .eq('name', catName)
                .single();

            let categoryId = existingCat?.id;

            if (!categoryId) {
                // Create category
                const { data: newCat, error: cError } = await adminClient.database.from('menu_categories')
                    .insert({
                        restaurant_id: restaurant.id,
                        name: catName,
                        display_order: categories.indexOf(catName)
                    })
                    .select('id')
                    .single();

                if (cError) {
                    console.error(`Error creating category ${catName}:`, cError);
                    continue;
                }
                categoryId = newCat.id;
                console.log(`Created category: ${catName}`);
            }

            // 3. Link existing menu items to this category
            // Fetch items for this restaurant
            const { data: items } = await adminClient.database.from('menu_items')
                .select('*')
                .eq('restaurant_id', restaurant.id);

            if (items) {
                for (const item of items) {
                    let shouldLink = false;
                    // Simple heuristic to link items to categories
                    if (catName === 'Burgers' && (item.name.includes('Burger') || item.name.includes('Whopper'))) shouldLink = true;
                    if (catName === 'Pizzas' && item.name.includes('Pizza')) shouldLink = true;
                    if (catName === 'Sandwiches' && item.name.includes('Subway') || item.name === 'Veggie Delite') shouldLink = true;
                    if (catName === 'Coffee' && (restaurant.name === 'Starbucks')) shouldLink = true;

                    // Fallback: put everything else in first category if not assigned
                    // We only do this if item.category_id is NULL
                    if (!item.category_id && categories.indexOf(catName) === 0 && !shouldLink) shouldLink = true;

                    if (shouldLink) {
                        const { error: uError } = await adminClient.database.from('menu_items')
                            .update({ category_id: categoryId })
                            .eq('id', item.id);
                        if (uError) console.error(`Failed to link item ${item.name}:`, uError);
                        else console.log(`Linked ${item.name} to ${catName}`);
                    }
                }
            }
        }
    }
    console.log('Seeding completed.');
}

seedData();
