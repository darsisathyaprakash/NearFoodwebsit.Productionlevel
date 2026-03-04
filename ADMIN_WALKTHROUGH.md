# NearFood Admin Dashboard - Walkthrough Documentation

## Overview

The NearFood Admin Dashboard is a comprehensive management interface for the food delivery platform. It provides administrators with tools to manage menu items, orders, users, and system settings.

---

## Admin Pages

### 1. Admin Login (`/admin/login`)

**URL:** `http://localhost:3000/admin/login`

**Purpose:** Secure authentication for administrators.

**Features:**
- Email/password login form
- Error handling for invalid credentials
- Redirects to dashboard upon successful login
- Session management via InsForge Auth

**Usage:**
1. Enter admin email and password
2. Click "Sign In" button
3. On success, redirected to `/admin` dashboard
4. On failure, error message displayed

---

### 2. Admin Dashboard (`/admin`)

**URL:** `http://localhost:3000/admin`

**Purpose:** Central hub showing key business metrics and quick actions.

**Features:**
- **Stats Cards:** Display total orders, revenue, active users, and restaurants
- **Revenue Chart:** Visual representation of daily revenue (last 7 days)
- **Quick Actions:** Links to manage menu, view orders, manage users
- **Recent Orders:** Preview of latest orders with status

**Stats Displayed:**
- Total Orders: Count of all orders
- Total Revenue: Sum of all order amounts
- Active Users: Count of non-blocked users
- Restaurants: Count of registered restaurants

---

### 3. Menu Management (`/admin/menu`)

**URL:** `http://localhost:3000/admin/menu`

**Purpose:** CRUD operations for restaurant menu items.

**Features:**
- **Menu Items Table:**
  - Columns: Image, Name, Restaurant, Category, Price, Available, Actions
  - Sortable by name, price, restaurant
  - Filterable by restaurant and availability

- **Add Menu Item:**
  - Modal form with fields:
    - Name (required)
    - Description
    - Price (required)
    - Restaurant (dropdown, required)
    - Category (dropdown: Main, Side, Drink, Dessert)
    - Image URL
    - Available toggle

- **Edit Menu Item:**
  - Click edit icon to open modal
  - Pre-populated form fields
  - Update button saves changes

- **Delete Menu Item:**
  - Click delete icon
  - Confirmation modal appears
  - Confirm deletes item from database

**API Endpoints:**
- `GET /api/admin/menu` - List all menu items
- `POST /api/admin/menu` - Create new menu item
- `PUT /api/admin/menu/[id]` - Update menu item
- `DELETE /api/admin/menu/[id]` - Delete menu item

---

### 4. Orders Management (`/admin/orders`)

**URL:** `http://localhost:3000/admin/orders`

**Purpose:** View and manage customer orders.

**Features:**
- **Orders Table:**
  - Columns: Order ID, User, Restaurant, Total, Status, Date, Actions
  - Sortable by date, status, total
  - Filterable by status (pending, processing, completed, cancelled)

- **Order Statuses:**
  - `pending` - Order placed, awaiting processing
  - `processing` - Order being prepared
  - `completed` - Order delivered/completed
  - `cancelled` - Order cancelled

- **Update Status:**
  - Click status badge to change
  - Dropdown shows available statuses
  - Instant update in database

- **Order Details:**
  - Click eye icon to view full order
  - Modal shows:
    - Order items with quantities
    - Delivery address
    - Payment status
    - Timestamps

- **Export Orders:**
  - Click "Export CSV" button
  - Downloads all orders as CSV file
  - Includes: Order ID, User, Restaurant, Items, Total, Status, Date

**API Endpoints:**
- `GET /api/admin/orders` - List all orders
- `GET /api/admin/orders/[id]` - Get single order details
- `PUT /api/admin/orders/[id]` - Update order status
- `GET /api/admin/orders/export` - Export orders as CSV

---

### 5. Settings (`/admin/settings`)

**URL:** `http://localhost:3000/admin/settings`

**Purpose:** Configure system-wide settings.

**Features:**
- **Restaurant Settings:**
  - Restaurant Name
  - Description
  - Logo URL
  - Cover Image URL
  - Minimum Order Amount
  - Delivery Fee
  - Delivery Radius (km)

- **Operating Hours:**
  - Monday-Sunday with open/close times
  - Enable/disable each day
  - Closed days marked

- **Payment Settings:**
  - Enable/disable payment gateway
  - Currency symbol
  - Tax rate (%)

- **Save Button:**
  - Validates all fields
  - Saves to database
  - Shows success/error toast

**API Endpoints:**
- `GET /api/admin/settings` - Get current settings
- `PUT /api/admin/settings` - Update settings

---

### 6. User Management (`/admin/users`)

**URL:** `http://localhost:3000/admin/users`

**Purpose:** Manage registered users and their roles.

**Features:**
- **Users Table:**
  - Columns: Avatar, Name, Email, Role, Status, Joined, Actions
  - Sortable by name, email, join date
  - Filterable by role and status

- **User Roles:**
  - `customer` - Regular user (can place orders)
  - `restaurant` - Restaurant owner
  - `admin` - System administrator

- **User Actions:**
  - **View Profile:** Click eye icon
    - Shows user details
    - Order history
    - Addresses
    - Payment methods

  - **Edit Role:** Click role badge
    - Dropdown to change role
    - Requires admin confirmation

  - **Block/Unblock:** Click block icon
    - Blocked users cannot login
    - Can be unblocked by admin
    - Blocked users see "Your account has been blocked" error

- **Search:**
  - Search by name or email
  - Real-time filtering

**API Endpoints:**
- `GET /api/admin/users` - List all users
- `GET /api/admin/users/[id]` - Get user details
- `PUT /api/admin/users/[id]` - Update user (role, block status)

---

## Common UI Components

### Sidebar Navigation

Located on the left side of all admin pages (except login):

**Navigation Items:**
- Dashboard (`/admin`)
- Menu (`/admin/menu`)
- Orders (`/admin/orders`)
- Users (`/admin/users`)
- Settings (`/admin/settings`)
- Logout

**Features:**
- Collapsible on mobile
- Active page highlighted
- Hover effects on items

### Topbar

Located at the top of all admin pages:

**Contents:**
- Page title
- Search bar (contextual)
- User profile dropdown
- Notifications bell

### Toast Notifications

**Usage:**
- Success: Green background, checkmark icon
- Error: Red background, X icon
- Info: Blue background, info icon
- Auto-dismiss after 3 seconds

### Modal Dialogs

**Usage:**
- Add/Edit forms
- Delete confirmations
- Detail views
- Close via X button, backdrop click, or Escape key

### Loading States

**Indicators:**
- Skeleton loaders for tables
- Spinner for button actions
- Disabled buttons during submission

---

## Authentication Flow

1. **Login:**
   - User visits `/admin/login`
   - Enters email/password
   - API validates credentials via InsForge Auth
   - Checks user role in `user_profiles` table
   - If role === 'admin', grants access
   - Otherwise, shows "Access denied" error

2. **Session:**
   - Session stored in cookies
   - Verified on each page load via `/api/admin/auth`
   - Invalid/expired sessions redirect to login

3. **Logout:**
   - Click logout in sidebar
   - Clears session
   - Redirects to login page

---

## Error Handling

### Client-Side Errors
- Form validation errors shown inline
- Network errors show toast with retry option
- 401 errors redirect to login
- 403 errors show "Access denied" message

### Server-Side Errors
- Logged to console
- Return JSON error message
- 500 errors show generic "Something went wrong" message

---

## File Structure

```
NearFood/src/
├── app/
│   ├── admin/
│   │   ├── layout.tsx        # Admin layout with sidebar
│   │   ├── page.tsx          # Dashboard
│   │   ├── login/
│   │   │   └── page.tsx      # Login page
│   │   ├── menu/
│   │   │   └── page.tsx      # Menu management
│   │   ├── orders/
│   │   │   └── page.tsx      # Orders management
│   │   ├── settings/
│   │   │   └── page.tsx      # Settings page
│   │   └── users/
│   │       └── page.tsx      # User management
│   └── api/
│       └── admin/
│           ├── auth/
│           │   └── route.ts  # Auth verification
│           ├── menu/
│           │   ├── route.ts  # Menu CRUD
│           │   └── [id]/
│           │       └── route.ts
│           ├── orders/
│           │   ├── route.ts  # Orders list
│           │   ├── [id]/
│           │   │   └── route.ts
│           │   └── export/
│           │       └── route.ts
│           ├── settings/
│           │   └── route.ts
│           ├── users/
│           │   ├── route.ts
│           │   └── [id]/
│           │       └── route.ts
│           └── upload/
│               └── route.ts  # Image upload
├── components/
│   └── admin/
│       ├── AdminSidebar.tsx
│       ├── AdminTopbar.tsx
│       ├── ConfirmModal.tsx
│       ├── ImageUpload.tsx
│       ├── RevenueChart.tsx
│       ├── StatsCard.tsx
│       └── StatusBadge.tsx
└── lib/
    ├── admin-auth.ts         # Admin auth utilities
    ├── admin-client.ts       # InsForge admin client
    └── server-client.ts      # Server-side client
```

---

## Testing Checklist

### Build Verification
- [x] No TypeScript compilation errors
- [x] No ESLint errors
- [x] All pages build successfully

### Browser Testing
- [x] `/admin/login` - Login page loads
- [x] `/admin` - Dashboard loads with stats
- [x] `/admin/menu` - Menu management loads
- [x] `/admin/orders` - Orders management loads
- [x] `/admin/settings` - Settings page loads
- [x] `/admin/users` - User management loads

---

## Environment Variables Required

```env
NEXT_PUBLIC_INSFORGE_BASE_URL=https://your-app.region.insforge.app
INSFORGE_API_KEY=your-anon-key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
```

---

## Troubleshooting

### Common Issues

1. **Login fails with "Access denied":**
   - Verify user has `role = 'admin'` in `user_profiles` table
   - Check user is not blocked (`is_blocked = false`)

2. **Images not uploading:**
   - Verify `admin-images` bucket exists in InsForge storage
   - Check storage permissions

3. **Stats not showing:**
   - Verify database tables have data
   - Check API responses in browser dev tools

4. **Session expired:**
   - Clear browser cookies
   - Login again

---

## Summary

The NearFood Admin Dashboard provides a complete solution for managing a food delivery platform. All pages have been verified to load without errors and the build completes successfully. The dashboard is intuitive with a consistent UI across all pages, using Tailwind CSS for styling and InsForge for backend services.
