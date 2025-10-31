# Afilo Digital Products Module

**Load this when working on: Product catalog, cart, digital delivery**

## Product Architecture

### Database-First Approach
- Products stored in Neon PostgreSQL
- Synced with Stripe Product/Price catalog
- Prisma ORM for type-safe queries
- Row-Level Security (RLS) enabled

### Product Data Structure
```typescript
interface Product {
  id: string;
  stripeProductId: string;
  stripePriceId: string;
  name: string;
  description: string | null;
  price: number;
  currency: string;
  interval?: 'month' | 'year' | null;
  intervalCount?: number | null;
  type: 'one_time' | 'subscription';
  active: boolean;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}
```

## Key Files

### Database Layer
```
lib/db/
├── products.ts              # Product CRUD operations
└── cart.ts                  # Cart management

prisma/
└── schema.prisma            # Database schema
```

### API Routes
```
app/api/products/
├── route.ts                 # GET /api/products (list)
├── [handle]/route.ts        # GET /api/products/:handle
└── sync-stripe/route.ts     # POST /api/products/sync-stripe

app/api/cart/
├── items/route.ts           # POST /api/cart/items (add)
└── items/[id]/route.ts      # DELETE /api/cart/items/:id
```

### Frontend Components
```
components/
├── ProductGrid.tsx          # Product listing
├── DigitalCartWidget.tsx    # Cart slideout
└── payments/
    └── CheckoutButton.tsx   # Stripe checkout

hooks/
└── useDigitalCart.ts        # Cart operations
```

## Stripe Integration

### Product Sync
- Manual sync via `/api/products/sync-stripe`
- Fetches all Stripe products/prices
- Updates local database
- Handles both one-time and subscription products

### Payment Flow
1. User adds product to cart (Zustand store)
2. Cart persisted in localStorage
3. Checkout creates Stripe Checkout Session
4. Redirect to Stripe hosted checkout
5. Webhook handles successful payment
6. Digital delivery triggered

## Cart System

### State Management (Zustand)
```typescript
interface CartStore {
  items: CartItem[];
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
  total: number;
}
```

### Features
- Real-time cart updates
- Persistent across sessions (localStorage)
- Optimistic UI updates
- Server-side validation
- Stripe checkout integration

## Digital Delivery

### Post-Purchase Flow
1. Stripe webhook confirms payment
2. Generate license key/download link
3. Send email via Resend
4. Update user's purchases in database
5. Enable access to digital content

## Environment Variables

```env
# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# Database
DATABASE_URL=
DIRECT_URL=
```

## Common Operations

### Sync Products from Stripe
```bash
curl -X POST http://localhost:3000/api/products/sync-stripe
```

### List All Products
```bash
curl http://localhost:3000/api/products
```

### Add to Cart (Client-side)
```typescript
import { useDigitalCart } from '@/hooks/useDigitalCart';

const { addItem } = useDigitalCart();
addItem(product);
```

---

**Related Modules:**
- Enterprise features: `.claude/CLAUDE-ENTERPRISE.md`
- Development workflows: `.claude/CLAUDE-WORKFLOWS.md`
