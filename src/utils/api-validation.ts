// API validation schemas using Zod
import { z } from 'zod';

// Auth validation schemas
export const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const signupSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number')
        .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Password must contain at least one special character'),
});

// Cart validation schemas
export const addToCartSchema = z.object({
    restaurantId: z.string().uuid('Invalid restaurant ID'),
    menuItemId: z.string().uuid('Invalid menu item ID'),
    quantity: z.number().int().min(1, 'Quantity must be at least 1').max(99, 'Quantity cannot exceed 99'),
});

// Payment validation schemas
export const createPaymentOrderSchema = z.object({
    amount: z.number().positive('Amount must be positive').max(100000, 'Amount cannot exceed 100000'),
    currency: z.string().default('USD').optional(),
});

export const verifyPaymentSchema = z.object({
    session_id: z.string().min(1, 'Payment session ID is required'),
    cart_id: z.string().uuid('Invalid cart ID'),
    amount: z.number().positive('Amount must be positive'),
});

// Order validation schemas
export const createOrderSchema = z.object({
    delivery_address: z.string().min(10, 'Delivery address must be at least 10 characters'),
    delivery_phone: z.string().regex(/^[\d\s\-\+\(\)]{10,}$/, 'Invalid phone number'),
    delivery_name: z.string().min(2, 'Name must be at least 2 characters'),
});

// Restaurant validation schemas
export const getRestaurantsSchema = z.object({
    lat: z.coerce.number().optional(),
    lng: z.coerce.number().optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const getMenuItemsSchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(50),
});

// Type exports
export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type AddToCartInput = z.infer<typeof addToCartSchema>;
export type CreatePaymentOrderInput = z.infer<typeof createPaymentOrderSchema>;
export type VerifyPaymentInput = z.infer<typeof verifyPaymentSchema>;
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type GetRestaurantsInput = z.infer<typeof getRestaurantsSchema>;
export type GetMenuItemsInput = z.infer<typeof getMenuItemsSchema>;
