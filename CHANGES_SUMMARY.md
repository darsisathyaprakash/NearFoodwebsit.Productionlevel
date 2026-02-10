# Changes Summary - Address Form & Status Tracking

## Overview
This document summarizes all the changes made to fix the issues with toast notifications, payment success modal, and add address form functionality with database integration.

## Issues Fixed

### 1. Toast Notification Timing Issue
**Problem:** Toast notifications were too fast (3 seconds) and users couldn't read them properly.

**Solution:** Increased default toast duration from 3000ms to 5000ms in [`Toast.tsx`](src/components/ui/Toast.tsx:17).

**Files Modified:**
- `src/components/ui/Toast.tsx`

### 2. Payment Success Modal Size Issue
**Problem:** The payment success modal was too large and went beyond the screen.

**Solution:** Added `max-h-[90vh]` and `overflow-y-auto` to the modal container to ensure it fits within the viewport and scrolls if needed.

**Files Modified:**
- `src/components/ui/PaymentSuccessModal.tsx`

### 3. Address Form Functionality
**Problem:** No address form existed for users to add/edit delivery addresses.

**Solution:** Created a comprehensive address form component with the following features:
- Add new addresses
- Edit existing addresses
- Delete addresses
- Set default address
- Select address for delivery

**Files Created:**
- `src/components/ui/AddressForm.tsx` - Complete address management component

**Files Modified:**
- `src/app/cart/page.tsx` - Added address selection section and integrated AddressForm modal
- `src/components/PaymentButton.tsx` - Added `selectedAddress` prop and uses it when creating orders
- `src/components/ui/PaymentSuccessModal.tsx` - Added `deliveryAddress` prop to display actual address

### 4. Database Schema Updates
**Problem:** No table existed to store user addresses, and order status timestamps were not tracked.

**Solution:** Created database migration that adds:
- `user_addresses` table with full address details
- Status timestamp columns to `orders` table (`placed_at`, `preparing_at`, `out_for_delivery_at`, `delivered_at`, `cancelled_at`)
- Triggers to automatically update timestamps when status changes
- RLS policies for address management

**Files Created:**
- `src/db/migrations/add_addresses_and_status_tracking.sql`

### 5. API Endpoints for Address Management
**Problem:** No API endpoints existed to manage user addresses.

**Solution:** Created REST API endpoints for:
- GET all user addresses
- POST create new address
- PATCH update existing address
- DELETE address

**Files Created:**
- `src/app/api/addresses/route.ts` - GET and POST endpoints
- `src/app/api/addresses/[id]/route.ts` - PATCH and DELETE endpoints

### 6. API Endpoint for Order Updates
**Problem:** No endpoint existed to update individual orders.

**Solution:** Created REST API endpoint for:
- GET single order with items
- PATCH update order (status, payment status, delivery details)

**Files Created:**
- `src/app/api/orders/[id]/route.ts`

## Database Migration

To apply the database changes, run the migration SQL file:

```sql
-- Run this in your PostgreSQL database
\i src/db/migrations/add_addresses_and_status_tracking.sql
```

Or execute the SQL commands manually in your database management tool.

## New Database Schema

### user_addresses Table
```sql
CREATE TABLE user_addresses (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  address_line1 TEXT NOT NULL,
  address_line2 TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  country TEXT DEFAULT 'India',
  phone TEXT NOT NULL,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
```

### orders Table (New Columns)
```sql
ALTER TABLE orders ADD COLUMN placed_at TIMESTAMPTZ;
ALTER TABLE orders ADD COLUMN preparing_at TIMESTAMPTZ;
ALTER TABLE orders ADD COLUMN out_for_delivery_at TIMESTAMPTZ;
ALTER TABLE orders ADD COLUMN delivered_at TIMESTAMPTZ;
ALTER TABLE orders ADD COLUMN cancelled_at TIMESTAMPTZ;
```

## How to Use

### For Users:
1. Go to the Cart page
2. Click "Add Delivery Address" or "Change" to open the address form
3. Fill in the address details and save
4. Select the address for delivery
5. Proceed with payment

### For Developers:
- The address form is fully integrated with the cart page
- Selected address is automatically used when creating orders
- Order status timestamps are automatically updated via database triggers
- All address operations are protected by RLS policies

## Status Tracking

The order status flow is:
1. **PLACED** → `placed_at` timestamp is set
2. **PREPARING** → `preparing_at` timestamp is set
3. **OUT_FOR_DELIVERY** → `out_for_delivery_at` timestamp is set
4. **DELIVERED** → `delivered_at` timestamp is set
5. **CANCELLED** → `cancelled_at` timestamp is set

All timestamps are automatically updated via database triggers when the status changes.

## Testing Checklist

- [ ] Toast notifications now display for 5 seconds
- [ ] Payment success modal fits within the viewport
- [ ] Users can add new addresses
- [ ] Users can edit existing addresses
- [ ] Users can delete addresses
- [ ] Users can set a default address
- [ ] Users can select an address for delivery
- [ ] Selected address is saved with the order
- [ ] Order status timestamps are automatically updated
- [ ] Address form modal opens and closes properly
- [ ] Payment button is disabled until an address is selected

## Notes

- The migration file needs to be run manually in the database
- All address operations require user authentication
- Only one default address is allowed per user (enforced by database trigger)
- Order status updates automatically update the corresponding timestamp
