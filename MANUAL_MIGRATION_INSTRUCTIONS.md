# Manual Cart Items Table Migration

## Issue
The automated migration script cannot connect to the Neon database. This is likely because:
- The database is in sleep mode (free tier sleeps after inactivity)
- Temporary network connectivity issue
- Connection pooling configuration

## Solution: Run Migration Manually via Neon Dashboard

### Step 1: Access Neon Dashboard
1. Go to https://console.neon.tech/
2. Sign in to your account
3. Select your project: **neondb** (ap-southeast-1)

### Step 2: Open SQL Editor
1. Click on **SQL Editor** in the left sidebar
2. Or go directly to the **Query** tab

### Step 3: Copy Migration SQL
Open the file: `prisma/migrations/create_cart_items.sql`

Or copy this SQL:

```sql
-- Create cart_items table
CREATE TABLE IF NOT EXISTS cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  product_id TEXT NOT NULL,
  variant_id TEXT NOT NULL,
  title TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  license_type TEXT NOT NULL CHECK (license_type IN ('personal', 'commercial')),
  image_url TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'purchased', 'abandoned')),
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_modified TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  abandoned_at TIMESTAMP WITH TIME ZONE,
  purchased_at TIMESTAMP WITH TIME ZONE,
  stripe_session_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_cart_items_user_status ON cart_items(user_id, status) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_cart_items_abandoned ON cart_items(user_id, abandoned_at) WHERE status = 'abandoned';
CREATE INDEX IF NOT EXISTS idx_cart_items_purchased ON cart_items(user_id, purchased_at) WHERE status = 'purchased';
CREATE INDEX IF NOT EXISTS idx_cart_items_product ON cart_items(product_id, variant_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_created_at ON cart_items(created_at DESC);

-- Triggers
CREATE OR REPLACE FUNCTION update_cart_items_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER cart_items_updated_at
  BEFORE UPDATE ON cart_items
  FOR EACH ROW
  EXECUTE FUNCTION update_cart_items_updated_at();

CREATE OR REPLACE FUNCTION update_cart_items_last_modified()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_modified = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER cart_items_last_modified
  BEFORE UPDATE ON cart_items
  FOR EACH ROW
  WHEN (OLD.quantity IS DISTINCT FROM NEW.quantity OR OLD.license_type IS DISTINCT FROM NEW.license_type)
  EXECUTE FUNCTION update_cart_items_last_modified();
```

### Step 4: Execute Migration
1. Paste the SQL into the editor
2. Click **Run** button
3. Wait for "Success" message

### Step 5: Verify Table Creation
Run this query to verify:

```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'cart_items'
ORDER BY ordinal_position;
```

You should see 17 columns listed.

### Step 6: Verify Indexes
Run this query:

```sql
SELECT indexname
FROM pg_indexes
WHERE tablename = 'cart_items';
```

You should see 6 indexes (including the primary key).

---

## Alternative: Wait and Retry Script

Neon databases automatically wake up when accessed. If you prefer to use the script:

1. **Wait 30-60 seconds** for the database to wake up
2. **Retry the migration**:
   ```bash
   pnpm tsx scripts/migrate-cart-table.ts
   ```

---

## After Migration Completes

Once the table is created (via dashboard or script), you can continue with:

1. ✅ Cart API endpoints (will work immediately)
2. ✅ Zustand cart store
3. ✅ Cart UI components

The application code will work once the table exists, regardless of how you create it!

---

## Troubleshooting

### "Table already exists" error
✅ Good! The table is already created. Skip migration.

### Permission denied
Check that your DATABASE_URL user has CREATE TABLE permissions.

### Cannot connect
- Check internet connection
- Verify DATABASE_URL in `.env.local`
- Confirm Neon project is active (not paused/deleted)

---

**Recommended**: Run migration via Neon dashboard for reliability, then continue development!
