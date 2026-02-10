
INSERT INTO restaurants (name, address, lat, lng, image_url, cuisine, rating, delivery_time_min, price_range, is_open)
VALUES 
('Burger King', '123 Main St', 12.9716, 77.5946, 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=800&q=80', 'American', 4.2, 25, '$$', true),
('Pizza Hut', '456 Elm St', 12.9716, 77.5946, 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&q=80', 'Pizza', 4.5, 30, '$$', true),
('Subway', '789 Oak St', 12.9716, 77.5946, 'https://images.unsplash.com/photo-1626074353765-517a681e40be?w=800&q=80', 'Healthy', 4.0, 15, '$', true),
('Starbucks', '101 Pine St', 12.9716, 77.5946, 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&q=80', 'Cafe', 4.7, 20, '$$$', true);

INSERT INTO menu_items (restaurant_id, name, description, price, image_url, is_veg, is_available)
SELECT id, 'Whopper', 'Flame-grilled beef patty', 5.99, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80', false, true
FROM restaurants WHERE name = 'Burger King';

INSERT INTO menu_items (restaurant_id, name, description, price, image_url, is_veg, is_available)
SELECT id, 'Chicken Royale', 'Crispy chicken breast', 6.49, 'https://images.unsplash.com/photo-1619250912185-7554a921d721?w=800&q=80', false, true
FROM restaurants WHERE name = 'Burger King';

INSERT INTO menu_items (restaurant_id, name, description, price, image_url, is_veg, is_available)
SELECT id, 'Veggie Burger', 'Plant-based patty', 5.49, 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=800&q=80', true, true
FROM restaurants WHERE name = 'Burger King';

INSERT INTO menu_items (restaurant_id, name, description, price, image_url, is_veg, is_available)
SELECT id, 'Pepperoni Pizza', 'Classic pepperoni', 12.99, 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=800&q=80', false, true
FROM restaurants WHERE name = 'Pizza Hut';

INSERT INTO menu_items (restaurant_id, name, description, price, image_url, is_veg, is_available)
SELECT id, 'Veggie Supreme', 'Loaded with veggies', 11.99, 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800&q=80', true, true
FROM restaurants WHERE name = 'Pizza Hut';
