// Admin-specific validation schemas using Zod
import { z } from 'zod';

// ── Menu Item Validation ───────────────────────────────────────────────

export const createMenuItemSchema = z.object({
    restaurant_id: z.string().uuid('Invalid restaurant ID'),
    category_id: z.string().uuid('Invalid category ID').optional().nullable(),
    name: z.string().min(2, 'Name must be at least 2 characters').max(100),
    description: z.string().max(500).optional().nullable(),
    price: z.number().positive('Price must be positive').max(10000),
    image_url: z.string().url().optional().nullable(),
    is_veg: z.boolean().optional().default(false),
    is_available: z.boolean().optional().default(true),
});

export const updateMenuItemSchema = createMenuItemSchema.partial();

// ── Order Status Validation ────────────────────────────────────────────

export const updateOrderStatusSchema = z.object({
    status: z.enum(['PLACED', 'PREPARING', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED']),
});

// ── User Management Validation ─────────────────────────────────────────

export const updateUserRoleSchema = z.object({
    role: z.enum(['admin', 'user']),
});

export const updateUserBlockSchema = z.object({
    is_blocked: z.boolean(),
});

// ── Settings Validation ────────────────────────────────────────────────

export const updateSettingsSchema = z.object({
    restaurant_name: z.string().min(1, 'Restaurant name is required').max(100).optional(),
    logo_url: z.string().url().optional().nullable(),
    contact_email: z.string().email('Invalid email').optional().nullable(),
    phone: z.string().max(20).optional().nullable(),
    delivery_charge: z.number().min(0).max(1000).optional(),
});

// ── Type exports ───────────────────────────────────────────────────────

export type CreateMenuItemInput = z.infer<typeof createMenuItemSchema>;
export type UpdateMenuItemInput = z.infer<typeof updateMenuItemSchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
export type UpdateUserRoleInput = z.infer<typeof updateUserRoleSchema>;
export type UpdateUserBlockInput = z.infer<typeof updateUserBlockSchema>;
export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;
