-- Performance Optimization: Add Composite Indexes for Products
-- These indexes address the critical performance bottlenecks identified in the code review

-- 1. Composite index for most common product queries (status + available_for_sale + updated_at)
-- This index will speed up the main products listing page significantly
CREATE INDEX IF NOT EXISTS idx_products_status_available_updated
ON products (status, available_for_sale, updated_at DESC)
WHERE status = 'active' AND available_for_sale = true;

-- 2. Composite index for product type filtering with status
-- This helps when filtering by product type in the products grid
CREATE INDEX IF NOT EXISTS idx_products_type_status_featured
ON products (product_type, status, featured DESC, updated_at DESC)
WHERE status = 'active';

-- 3. Index on base_price for price range filtering
-- This enables efficient price-based sorting and filtering
CREATE INDEX IF NOT EXISTS idx_products_base_price
ON products (base_price ASC)
WHERE status = 'active' AND available_for_sale = true;

-- 4. Index on featured flag for featured product queries
-- This speeds up featured product lookups significantly
CREATE INDEX IF NOT EXISTS idx_products_featured_status
ON products (featured DESC, updated_at DESC)
WHERE status = 'active' AND available_for_sale = true AND featured = true;

-- 5. Full-text search index for title and description
-- This enables fast text search across product titles and descriptions
CREATE INDEX IF NOT EXISTS idx_products_search_text
ON products USING gin(to_tsvector('english', title || ' ' || description))
WHERE status = 'active';

-- 6. Composite index for vendor + status for vendor filtering
-- This helps when filtering products by vendor
CREATE INDEX IF NOT EXISTS idx_products_vendor_status
ON products (vendor, status, updated_at DESC)
WHERE status = 'active';

-- 7. Performance index for cart items user lookups
-- This speeds up cart operations significantly
CREATE INDEX IF NOT EXISTS idx_cart_items_user_status
ON cart_items (user_id, status, last_modified DESC)
WHERE status = 'active';

-- 8. Index for abandoned cart recovery queries
-- This helps with cart recovery analytics and processing
CREATE INDEX IF NOT EXISTS idx_cart_items_abandoned
ON cart_items (abandoned_at DESC, user_id)
WHERE status = 'abandoned' AND abandoned_at IS NOT NULL;

-- 9. Composite index for product variants performance
-- This speeds up variant lookups for products
CREATE INDEX IF NOT EXISTS idx_product_variants_product_available
ON product_variants (product_id, available_for_sale, position ASC)
WHERE available_for_sale = true;

-- 10. Index for Stripe product ID lookups (for webhook processing)
-- This speeds up Stripe webhook processing significantly
CREATE INDEX IF NOT EXISTS idx_products_stripe_product_id_status
ON products (stripe_product_id, status)
WHERE stripe_product_id IS NOT NULL AND status = 'active';

-- Update table statistics to help the query planner
ANALYZE products;
ANALYZE product_variants;
ANALYZE cart_items;