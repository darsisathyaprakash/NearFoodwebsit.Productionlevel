// Core type definitions for the NearFood application

export interface User {
    id: string;
    email: string;
    created_at: string;
    user_metadata?: Record<string, unknown>;
}

export interface Restaurant {
    id: string;
    name: string;
    address: string;
    image_url?: string | null;
    lat: number;
    lng: number;
    cuisine?: string | null;
    rating?: number | null;
    delivery_time_min?: number | null;
    price_range?: '$' | '$$' | '$$$' | null;
    is_open: boolean;
    created_at: string;
}

export interface MenuCategory {
    id: string;
    restaurant_id: string;
    name: string;
    display_order: number;
    created_at: string;
}

export interface MenuItem {
    id: string;
    restaurant_id: string;
    category_id?: string | null;
    name: string;
    description?: string | null;
    price: number;
    image_url?: string | null;
    is_veg?: boolean | null;
    is_available: boolean;
    created_at: string;
    menu_categories?: MenuCategory | MenuCategory[];
}

export interface Cart {
    id: string;
    user_id: string;
    restaurant_id?: string | null;
    created_at: string;
    updated_at: string;
    cart_items?: CartItem[];
}

export interface CartItem {
    id: string;
    cart_id: string;
    menu_item_id: string;
    quantity: number;
    created_at: string;
    menu_items?: MenuItem | MenuItem[];
}

export type OrderStatus = 'PLACED' | 'PREPARING' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export interface Order {
    id: string;
    user_id?: string | null;
    restaurant_id?: string | null;
    status: OrderStatus;
    total_amount: number;
    delivery_address?: string | null;
    delivery_phone?: string | null;
    delivery_name?: string | null;
    delivery_fee?: number | null;
    tax_amount?: number | null;
    payment_id?: string | null;
    payment_status?: PaymentStatus;
    tracking_number?: string | null;
    estimated_delivery_time?: string | null;
    actual_delivery_time?: string | null;
    cancelled_at?: string | null;
    cancellation_reason?: string | null;
    placed_at?: string | null;
    preparing_at?: string | null;
    out_for_delivery_at?: string | null;
    delivered_at?: string | null;
    created_at: string;
    updated_at: string;
    order_items?: OrderItem[];
}

export interface OrderItem {
    id: string;
    order_id: string;
    menu_item_id?: string | null;
    name: string;
    price: number;
    quantity: number;
    created_at: string;
}

// API Response types
export interface ApiResponse<T> {
    data?: T;
    error?: string;
}

export interface AuthResponse {
    user: User | null;
    error?: string;
}

// Toast notification types
export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
    id: string;
    type: ToastType;
    message: string;
    duration?: number;
}
