'use client';

import { useState, useCallback } from 'react';
import { Plus, Minus } from 'lucide-react';
import { useAuth } from './AuthProvider';
import { useRouter } from 'next/navigation';
import { useToast } from './ui/Toast';
import { MenuItem as MenuItemType } from '@/types/types';
import { insforge } from '@/lib/insforge';

interface MenuItemProps {
    item: MenuItemType;
}

// Retry configuration
const MAX_RETRIES = 2;
const RETRY_DELAY = 1000; // 1 second

// Helper function to safely extract error message
const getErrorMessage = (error: unknown): string => {
    if (error instanceof Error) {
        return error.message;
    }
    if (typeof error === 'string') {
        return error;
    }
    if (error && typeof error === 'object' && 'message' in error) {
        return String(error.message);
    }
    return 'An unexpected error occurred';
};

// Helper function to check if error is a network error
const isNetworkError = (error: unknown): boolean => {
    const errorMsg = getErrorMessage(error).toLowerCase();
    return (
        errorMsg.includes('failed to fetch') ||
        errorMsg.includes('network') ||
        errorMsg.includes('connection') ||
        errorMsg.includes('timeout')
    );
};

// Helper function to delay execution
const delay = (ms: number): Promise<void> =>
    new Promise((resolve) => setTimeout(resolve, ms));

// Helper function to execute with retry logic
const withRetry = async <T,>(
    fn: () => Promise<T>,
    maxRetries: number = MAX_RETRIES,
    retryDelay: number = RETRY_DELAY
): Promise<T> => {
    let lastError: unknown;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error;

            // Don't retry on non-network errors
            if (!isNetworkError(error)) {
                throw error;
            }

            // Don't retry after the last attempt
            if (attempt < maxRetries) {
                await delay(retryDelay * (attempt + 1)); // Exponential backoff
            }
        }
    }

    throw lastError;
};

export function MenuItem({ item }: MenuItemProps) {
    const { user } = useAuth();
    const router = useRouter();
    const { showToast } = useToast();
    const [loading, setLoading] = useState(false);
    const [quantity, setQuantity] = useState(1);

    const addToCart = useCallback(async () => {
        if (!user) {
            showToast('Please login to add items to cart', 'info');
            router.push('/login');
            return;
        }

        setLoading(true);
        try {
            // 1. Get or create cart with retry logic
            const getOrCreateCart = async () => {
                let { data: cart, error: cartError } = await insforge.database
                    .from('carts')
                    .select('*')
                    .eq('user_id', user.id)
                    .single();

                // Handle error safely
                if (cartError) {
                    // PGRST116 means no rows returned - this is expected when cart doesn't exist
                    if (cartError.code !== 'PGRST116') {
                        const errorMsg = cartError.message || 'Failed to fetch cart';
                        throw new Error(errorMsg);
                    }
                }

                if (!cart) {
                    // Create new cart
                    const { data: newCart, error: createError } = await insforge.database
                        .from('carts')
                        .insert({ user_id: user.id, restaurant_id: item.restaurant_id })
                        .select()
                        .single();

                    if (createError) {
                        const errorMsg = createError.message || 'Failed to create cart';
                        throw new Error(errorMsg);
                    }
                    cart = newCart;
                } else if (cart.restaurant_id !== item.restaurant_id) {
                    // Switching restaurants - clear existing items
                    const { error: deleteError } = await insforge.database
                        .from('cart_items')
                        .delete()
                        .eq('cart_id', cart.id);

                    if (deleteError) {
                        const errorMsg = deleteError.message || 'Failed to clear cart';
                        throw new Error(errorMsg);
                    }

                    const { error: updateError } = await insforge.database
                        .from('carts')
                        .update({ restaurant_id: item.restaurant_id })
                        .eq('id', cart.id);

                    if (updateError) {
                        const errorMsg = updateError.message || 'Failed to update cart';
                        throw new Error(errorMsg);
                    }
                }

                return cart;
            };

            // Execute with retry logic
            const cart = await withRetry(getOrCreateCart);

            // 2. Check if item already exists
            const checkExistingItem = async () => {
                const { data: existingItem } = await insforge.database
                    .from('cart_items')
                    .select('*')
                    .eq('cart_id', cart.id)
                    .eq('menu_item_id', item.id)
                    .single();

                return existingItem;
            };

            const existingItem = await withRetry(checkExistingItem);

            if (existingItem) {
                // Update quantity
                const newQuantity = existingItem.quantity + quantity;
                if (newQuantity > 99) {
                    showToast('Maximum quantity exceeded', 'error');
                    setLoading(false);
                    return;
                }

                const updateQuantity = async () => {
                    const { error: updateError } = await insforge.database
                        .from('cart_items')
                        .update({ quantity: newQuantity })
                        .eq('id', existingItem.id);

                    if (updateError) {
                        const errorMsg = updateError.message || 'Failed to update cart item';
                        throw new Error(errorMsg);
                    }
                };

                await withRetry(updateQuantity);
            } else {
                // Add new item
                const addNewItem = async () => {
                    const { error: insertError } = await insforge.database
                        .from('cart_items')
                        .insert({ cart_id: cart.id, menu_item_id: item.id, quantity });

                    if (insertError) {
                        const errorMsg = insertError.message || 'Failed to add item to cart';
                        throw new Error(errorMsg);
                    }
                };

                await withRetry(addNewItem);
            }

            showToast(`${quantity}x ${item.name} added to cart!`, 'success');
            setQuantity(1);
        } catch (error) {
            console.error('Add to cart error:', error);

            const errorMessage = getErrorMessage(error);

            // Provide user-friendly error messages
            let userMessage = errorMessage;
            if (isNetworkError(error)) {
                userMessage = 'Network error. Please check your connection and try again.';
            } else if (errorMessage.includes('auth') || errorMessage.includes('unauthorized')) {
                userMessage = 'Session expired. Please login again.';
                router.push('/login');
            } else if (errorMessage.includes('timeout')) {
                userMessage = 'Request timed out. Please try again.';
            }

            showToast(userMessage, 'error');
        } finally {
            setLoading(false);
        }
    }, [user, item, quantity, router, showToast]);

    const incrementQuantity = useCallback(() => setQuantity((prev) => Math.min(prev + 1, 10)), []);
    const decrementQuantity = useCallback(() => setQuantity((prev) => Math.max(prev - 1, 1)), []);

    return (
        <div className="flex bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all">
            <div className="flex-grow p-4">
                <div className="flex items-center gap-2 mb-1">
                    <div
                        className={`w-4 h-4 border ${item.is_veg ? 'border-green-600' : 'border-red-600'
                            } flex items-center justify-center p-[2px] rounded-sm`}
                        aria-label={item.is_veg ? 'Vegetarian' : 'Non-vegetarian'}
                    >
                        <div
                            className={`w-full h-full rounded-full ${item.is_veg ? 'bg-green-600' : 'bg-red-600'
                                }`}
                        />
                    </div>
                    <h3 className="font-bold text-gray-900 leading-tight">{item.name}</h3>
                </div>
                <p className="text-gray-900 font-medium text-sm mb-2">${Number(item.price).toFixed(2)}</p>
                {item.description && (
                    <p className="text-gray-500 text-xs line-clamp-2">{item.description}</p>
                )}
            </div>
            <div className="w-32 h-32 relative flex-shrink-0 bg-gray-100">
                {item.image_url ? (
                    <img
                        src={item.image_url}
                        alt={item.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300 bg-gray-100 text-xs text-center p-2">
                        No Image
                    </div>
                )}
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-24 flex flex-col gap-1">
                    {/* Quantity Selector */}
                    <div className="flex items-center justify-center bg-white rounded-md shadow-md border border-gray-200">
                        <button
                            onClick={decrementQuantity}
                            className="p-1 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={quantity <= 1 || loading}
                            aria-label="Decrease quantity"
                            type="button"
                        >
                            <Minus className="w-3 h-3 text-gray-600" />
                        </button>
                        <span className="px-2 text-sm font-bold text-gray-900">{quantity}</span>
                        <button
                            onClick={incrementQuantity}
                            className="p-1 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={quantity >= 10 || loading}
                            aria-label="Increase quantity"
                            type="button"
                        >
                            <Plus className="w-3 h-3 text-gray-600" />
                        </button>
                    </div>
                    {/* Add Button */}
                    <button
                        onClick={addToCart}
                        disabled={loading}
                        className="w-full bg-white text-green-600 border border-gray-200 font-bold text-xs py-1.5 rounded-md shadow-md hover:bg-gray-50 uppercase disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
                        aria-label={`Add ${quantity} ${item.name} to cart`}
                        type="button"
                    >
                        {loading ? 'Adding...' : 'ADD'}
                    </button>
                </div>
            </div>
        </div>
    );
}
