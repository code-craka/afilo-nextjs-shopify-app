# Afilo Project Context & Architecture

**Last Updated**: 2025-10-13 | **Status**: Production-Ready ✅

---

## 🎯 Quick Start

### Essential Tech Stack
- **Frontend**: Next.js 15.5.4 (App Router), React 19.1.0, TypeScript 5.6 (Strict)
- **Styling**: Tailwind CSS v4, ShadCN UI, Framer Motion 12.23
- **State**: Zustand 5.0.8 (cart store with localStorage)
- **Auth**: Clerk (Google OAuth)
- **Database**: Neon PostgreSQL (@neondatabase/serverless)
- **Payments**: Stripe + Paddle
- **E-commerce**: Shopify Storefront API
- **Package Manager**: **pnpm 8.15.6** (REQUIRED - never npm)
- **Deployment**: Vercel (app.afilo.io)

### Critical Commands
```bash
# NEVER run automatically - always ask first
pnpm dev --turbopack         # Development server (port 3000)
pnpm build                   # Production build (Next.js 15 compatible)
pnpm lint                    # Linting
pnpm tsx scripts/*.ts        # Run TypeScript scripts
```

### Development Rules
1. **TypeScript Strict Mode**: Always enabled
2. **Package Manager**: Only pnpm (enforced in package.json)
3. **Next.js 15 Types**: Dynamic params are `Promise<{ param: string }>` (must await)
4. **File Operations**: Prefer editing over creating new files
5. **Dev Server**: Ask permission before running

---

## 🏗️ Architecture Overview

### Database Schema (Neon PostgreSQL)

#### `cart_items` Table (Production-Ready)
```sql
CREATE TABLE cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,                    -- Clerk user ID
  product_id TEXT NOT NULL,                 -- Shopify product ID
  variant_id TEXT NOT NULL,                 -- Shopify variant ID
  title TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  license_type TEXT NOT NULL CHECK (license_type IN ('personal', 'commercial')),
  image_url TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'purchased', 'abandoned')),
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_modified TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  abandoned_at TIMESTAMP WITH TIME ZONE,     -- Set after 30 min inactivity
  purchased_at TIMESTAMP WITH TIME ZONE,
  stripe_session_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_cart_items_user_status ON cart_items(user_id, status) WHERE status = 'active';
CREATE INDEX idx_cart_items_abandoned ON cart_items(user_id, abandoned_at) WHERE status = 'abandoned';
CREATE INDEX idx_cart_items_purchased ON cart_items(user_id, purchased_at) WHERE status = 'purchased';
CREATE INDEX idx_cart_items_product ON cart_items(product_id, variant_id);
CREATE INDEX idx_cart_items_created_at ON cart_items(created_at);
```

**Status**: ✅ Migrated and operational

---

## 📁 Project Structure

```
app/
├── page.tsx                          # Homepage
├── layout.tsx                        # Root layout (includes ToastProvider)
├── globals.css                       # Global styles + gradient animations
├── pricing/                          # Stripe pricing pages
├── dashboard/                        # User dashboard (all pages use DashboardLayout)
│   ├── page.tsx                     # Main dashboard
│   ├── products/page.tsx            # My products
│   ├── orders/page.tsx              # Order history
│   ├── downloads/page.tsx           # Digital downloads
│   ├── abandoned-carts/page.tsx     # Abandoned cart recovery
│   ├── settings/page.tsx            # User settings
│   └── premium/                     # Premium user dashboard
└── api/
    ├── cart/
    │   ├── items/route.ts           # GET/POST cart items
    │   ├── items/[id]/route.ts      # PATCH/DELETE individual items
    │   ├── sync/route.ts            # POST cart sync (30-min abandoned detection)
    │   ├── clear/route.ts           # POST clear cart
    │   └── abandoned/route.ts       # GET/POST abandoned cart operations
    ├── billing/                     # Stripe billing endpoints
    └── user/                        # User management

components/
├── dashboard/
│   ├── DashboardLayout.tsx          # Wrapper: Sidebar + Header + Cart
│   ├── Sidebar.tsx                  # Collapsible sidebar (desktop) + bottom nav (mobile)
│   ├── BillingSummaryWidget.tsx     # Billing overview
│   └── AbandonedCartWidget.tsx      # Abandoned cart display with restore
├── cart/
│   ├── CartSlideout.tsx             # Slide-in cart panel
│   └── CartBadge.tsx                # Cart icon with item count badge
├── ui/
│   ├── UserMenu.tsx                 # User dropdown with sign-out
│   └── Skeleton.tsx                 # Loading skeletons (enhanced with gradients)
└── providers/
    └── ToastProvider.tsx            # react-hot-toast configuration

store/
├── cart.ts                          # Zustand cart store (NEW - simplified)
│                                    # - localStorage persistence
│                                    # - Auto-sync every 30s
│                                    # - Toast notifications
│                                    # - Confetti on add
└── digitalCart.ts                   # Legacy cart store (complex license management)

lib/
├── stripe-server.ts                 # Stripe client (lazy initialization)
├── confetti.ts                      # Confetti utilities (canvas-confetti)
└── billing/
    └── stripe-payment-methods.ts   # Payment method setup (fixed SetupIntent)

prisma/migrations/
└── create_cart_items.sql            # Cart table migration (FIXED syntax)

scripts/
└── migrate-cart-table.ts            # Automated migration runner
```

---

## 🛒 Cart System Architecture

### State Management (Zustand)
**File**: `store/cart.ts`

```typescript
interface CartState {
  items: CartItem[];
  isOpen: boolean;
  isLoading: boolean;
  isSyncing: boolean;
  lastSyncedAt: Date | null;

  // Actions
  addItem: (item) => Promise<void>;        // ✅ Shows toast + confetti
  removeItem: (id) => Promise<void>;       // ✅ Shows toast
  updateQuantity: (id, qty) => Promise<void>;
  updateLicenseType: (id, type) => Promise<void>;
  clearCart: () => Promise<void>;

  // UI
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;

  // Sync
  syncWithServer: () => Promise<void>;     // Auto-runs every 30s
  loadFromServer: () => Promise<void>;     // On app mount

  // Computed
  itemCount: () => number;
  subtotal: () => number;
}
```

**Features**:
- ✅ localStorage persistence (survives page refresh)
- ✅ Auto-sync with server every 30 seconds
- ✅ Optimistic UI updates
- ✅ Toast notifications on all actions
- ✅ Success confetti on cart add
- ✅ Auto-opens cart after adding item

### API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/cart/items` | GET | Fetch user's active cart items |
| `/api/cart/items` | POST | Add item to cart (handles duplicates) |
| `/api/cart/items/[id]` | PATCH | Update quantity or license type |
| `/api/cart/items/[id]` | DELETE | Remove item from cart |
| `/api/cart/sync` | POST | Sync cart + mark abandoned (30+ min) |
| `/api/cart/clear` | POST | Clear all active cart items |
| `/api/cart/abandoned` | GET | Get abandoned cart items |
| `/api/cart/abandoned` | POST | Restore item to active cart |

**Next.js 15 Note**: Dynamic route params are `Promise` types and must be awaited:
```typescript
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params; // ✅ Must await
}
```

### Abandoned Cart Detection
- **Threshold**: 30 minutes of inactivity
- **Detection**: Server-side on `/api/cart/sync` endpoint
- **SQL**: `WHERE last_modified < NOW() - INTERVAL '30 minutes'`
- **Status Change**: `active` → `abandoned` (sets `abandoned_at` timestamp)
- **Recovery**: One-click restore via AbandonedCartWidget

---

## 🎨 UI/UX Enhancements

### Phase 5 Polish (Completed)

#### 1. Hover Micro-Interactions
```typescript
<motion.div
  whileHover={{ scale: 1.02, y: -4 }}
  transition={{ type: 'spring', stiffness: 300 }}
  className="hover:shadow-xl cursor-pointer"
>
  <motion.div
    whileHover={{ rotate: [0, -10, 10, -10, 0] }}
    transition={{ duration: 0.5 }}
  >
    <Icon /> {/* Icon wiggles on hover */}
  </motion.div>
</motion.div>
```

#### 2. Toast Notifications
```typescript
import toast from 'react-hot-toast';

toast.success('Added to cart!');
toast.error('Failed to add item');
```

#### 3. Celebration Confetti
```typescript
import { fireSuccessConfetti } from '@/lib/confetti';

fireSuccessConfetti(); // Green confetti burst
```

#### 4. Glassmorphism
```css
.upgrade-banner {
  background: linear-gradient(to right, purple, blue);
  position: relative;
}

.glassmorphism-overlay {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(sm);
}
```

#### 5. Loading Skeletons
```typescript
import { Skeleton, StatCardSkeleton } from '@/components/ui/Skeleton';

<Skeleton className="h-4 w-3/4" />
<StatCardSkeleton /> // Pre-built pattern
```

### Dependencies Added
```json
{
  "dependencies": {
    "react-hot-toast": "^2.6.0",
    "canvas-confetti": "^1.9.3"
  },
  "devDependencies": {
    "@types/canvas-confetti": "^1.9.0"
  }
}
```

---

## 🐛 Known Issues & Fixes

### 1. Stripe Payment Button (Production)
**Status**: ⚠️ Partially Fixed (Backend working, frontend may need env var)

**Issue**: "Failed to Load Form" error in production
**Root Cause**: Missing `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` in Vercel
**Fix**: Add to Vercel → Settings → Environment Variables

**Commits**:
- `d1851d7`: Fixed lazy Stripe initialization
- `d1851d7`: Fixed SetupIntent configuration conflict

**Diagnostic Guide**: See `PAYMENT_BUTTON_DIAGNOSTIC.md`

### 2. Next.js 15 Dynamic Routes
**Status**: ✅ Fixed

**Issue**: Type error with dynamic route params
**Fix**: Changed `{ params: { id: string } }` to `{ params: Promise<{ id: string }> }`

**Commit**: `e6907e3`

### 3. SQL Syntax Errors
**Status**: ✅ Fixed

**Issues**:
- Index with `DESC` in column list
- Trigger `WHEN` clause compatibility

**Commit**: `0c578e8`

---

## 📦 Deployment Checklist

### Vercel Environment Variables

**Required for Production**:
```bash
# Stripe (Public key for frontend)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_51Mvv...

# Stripe (Private key for backend)
STRIPE_SECRET_KEY=sk_live_51Mvv...

# Database
DATABASE_URL=postgresql://neondb_owner:***@ep-square-forest...

# Clerk Auth
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
```

### Database Migration
```bash
# Option 1: Via Neon Dashboard (Recommended)
# - Go to https://console.neon.tech/
# - Open SQL Editor
# - Paste contents of prisma/migrations/create_cart_items.sql
# - Click Run

# Option 2: Via Script
pnpm tsx scripts/migrate-cart-table.ts
```

### Build Validation
```bash
pnpm build  # Must succeed (Next.js 15.5.4)
```

---

## 🔄 Recent Changes (Last Session)

### Phase 1: Critical Fixes
- ✅ UserMenu component with sign-out
- ✅ Stripe lazy initialization
- ✅ Database schema for cart_items

### Phase 2: Cart System
- ✅ Zustand cart store with localStorage
- ✅ 5 API endpoints (items, sync, clear, abandoned)
- ✅ CartSlideout & CartBadge components
- ✅ Auto-sync every 30 seconds

### Phase 3: Sidebar & Layout
- ✅ Collapsible sidebar navigation
- ✅ Mobile bottom navigation
- ✅ Billing directly visible (no extra clicks)
- ✅ DashboardLayout wrapper

### Phase 4: Abandoned Cart Tracking
- ✅ AbandonedCartWidget with restore
- ✅ 30-minute threshold detection
- ✅ Time-ago display

### Phase 5: Final Polish
- ✅ Hover micro-interactions (scale, rotate, shadow)
- ✅ Toast notifications (react-hot-toast)
- ✅ Celebration confetti (canvas-confetti)
- ✅ Glassmorphism effects
- ✅ Loading skeletons

### Phase 6: Missing Pages Fix
- ✅ Created `/dashboard/products`
- ✅ Created `/dashboard/orders`
- ✅ Created `/dashboard/downloads`
- ✅ Created `/dashboard/abandoned-carts`
- ✅ Created `/dashboard/settings`

**All commits**: `6e20c39`, `8a0aa62`, `0c578e8`, `01e5889`, `7791567`, `e6907e3`, `8daaf64`, `9c10ca0`, `e4a8860`

---

## 🎯 Industry Standards Followed

### UX Patterns (Stripe, Vercel, Linear, Notion)
- ✅ Sidebar navigation with collapsible behavior
- ✅ Cart slideout (not full-page redirect)
- ✅ Toast notifications for feedback
- ✅ Loading skeletons for perceived performance
- ✅ Hover animations for interactivity
- ✅ Empty states with CTAs

### Code Quality
- ✅ TypeScript strict mode
- ✅ Next.js 15 best practices
- ✅ Zustand for state management
- ✅ Framer Motion for animations
- ✅ Responsive design (mobile-first)

---

## 📚 Additional Documentation

- `PAYMENT_BUTTON_DIAGNOSTIC.md` - Payment button troubleshooting
- `BILLING_PORTAL_TROUBLESHOOTING.md` - Billing portal guide
- `MANUAL_MIGRATION_INSTRUCTIONS.md` - Database migration steps
- `prisma/migrations/create_cart_items.sql` - Cart table schema

---

## 🚀 Next Steps (Future Enhancements)

1. **Connect Cart to Checkout**: Link cart to Stripe checkout flow
2. **Product Integration**: Connect cart to actual Shopify products
3. **Purchase Flow**: Mark cart items as "purchased" on successful payment
4. **Email Notifications**: Abandoned cart recovery emails
5. **Analytics**: Track cart abandonment rates
6. **Testing**: E2E tests with Playwright

---

**Status**: Production-Ready | **Last Tested**: 2025-10-13 | **Build**: ✅ Passing
