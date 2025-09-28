# ProductGrid Component Documentation

The `ProductGrid` component is the core digital commerce showcase for Afilo, specifically optimized for software products, digital goods, and developer tools.

## Overview

The enhanced ProductGrid automatically transforms generic e-commerce product data into a professional software product showcase with intelligent tech stack detection, license management, and digital delivery indicators.

## Features

### 🎯 Digital Product Optimization

- **Smart Tech Stack Detection** - Automatically identifies technologies from product metadata
- **Product Type Classification** - Intelligent categorization (AI Tool, Template, Script, etc.)
- **License Management** - Clear license type indicators
- **Version Tracking** - Displays version numbers when available
- **Documentation Badges** - Shows when documentation is included
- **Demo Integration** - Live demo buttons for applicable products

### 🎨 Professional Design

- **Developer-Focused UI** - Clean, technical aesthetic
- **B2B Conversion Optimized** - Professional presentation for business buyers
- **Responsive Grid** - 1-4 columns based on screen size
- **Smooth Animations** - Framer Motion micro-interactions
- **Accessibility Compliant** - WCAG 2.1 AA standards

### ⚡ Performance Features

- **Lazy Loading** - Images load on demand
- **Error Handling** - Comprehensive error states with retry logic
- **Loading States** - Skeleton screens during data fetch
- **Optimized Rendering** - Efficient re-render patterns

## Usage

### Basic Implementation

```tsx
import ProductGrid from '@/components/ProductGrid';

export default function ProductsPage() {
  return (
    <ProductGrid
      searchQuery=""
      sortBy="UPDATED_AT"
      sortReverse={false}
      onProductClick={(product) => {
        // Navigate to product page
        router.push(`/products/${product.handle}`);
      }}
      onAddToCart={async (productId, variantId) => {
        // Add to cart logic
        await addToCart(productId, variantId);
      }}
      productsPerPage={16}
      showLoadMore={true}
    />
  );
}
```

### Advanced Configuration

```tsx
<ProductGrid
  initialProducts={preloadedProducts}
  searchQuery={searchTerm}
  sortBy="PRICE"
  sortReverse={true}
  className="custom-grid-styles"
  productsPerPage={12}
  showLoadMore={false}
  onProductClick={handleProductClick}
  onAddToCart={handleAddToCart}
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `initialProducts` | `ShopifyProduct[]` | `[]` | Pre-loaded products to display |
| `searchQuery` | `string` | `''` | Search filter for products |
| `sortBy` | `ProductSortKey` | `'UPDATED_AT'` | Sort criteria |
| `sortReverse` | `boolean` | `false` | Reverse sort order |
| `className` | `string` | `''` | Additional CSS classes |
| `showLoadMore` | `boolean` | `true` | Enable load more functionality |
| `productsPerPage` | `number` | `12` | Products per page/load |
| `onProductClick` | `function` | - | Product click handler |
| `onAddToCart` | `function` | - | Add to cart handler |

## Digital Commerce Features

### Tech Stack Detection

The component automatically detects technology stacks from product data:

```tsx
// Automatically detects from title, description, tags:
const techStack = getTechStackFromProduct(product);
// Returns: ['React', 'TypeScript', 'AI', 'Docker']
```

**Supported Technologies:**
- **Frontend**: React, Vue, Angular, Next.js, Svelte
- **Backend**: Python, Node.js, PHP, Java, Go, Rust
- **Technologies**: AI, ML, Web3, Docker, Kubernetes
- **Databases**: MongoDB, PostgreSQL
- **Cloud**: AWS, Firebase, Supabase
- **Styling**: Tailwind, Bootstrap, SCSS

### License Type Detection

Intelligent license classification based on content analysis:

```tsx
const licenseType = getLicenseType(product);
// Returns: 'Personal' | 'Commercial' | 'Extended' | 'Enterprise' | 'Developer' | 'Free'
```

**License Types:**
- **Free** - $0 products
- **Personal** - < $50, personal use
- **Commercial** - $50-$200, commercial use
- **Extended** - > $200, extended rights
- **Enterprise** - Enterprise licensing
- **Developer** - Developer-specific licenses

### Product Type Classification

Dynamic product categorization with visual indicators:

```tsx
const digitalType = getDigitalProductType(product);
// Returns: { type: 'AI Tool', color: 'bg-blue-100 text-blue-800', icon: '🤖' }
```

**Product Types:**
- **AI Tool** 🤖 - AI and machine learning products
- **Template** 📄 - Code templates and boilerplates
- **Script** ⚡ - Scripts and automation tools
- **Plugin** 🔌 - Extensions and plugins
- **Theme** 🎨 - UI themes and designs
- **Application** 📱 - Full applications
- **API/Service** 🔗 - APIs and services
- **Dataset** 📊 - Data and datasets
- **Software** 💻 - General software

### Feature Detection

Automatic detection of product features:

```tsx
const hasDoc = hasDocumentation(product);     // Documentation available
const hasDemo = hasDemo(product);             // Live demo available
const version = getVersionNumber(product);    // Version number
```

## Product Card Structure

Each product card displays:

### Header Section
- **Product Type Badge** - Dynamic badge with icon
- **Version Number** - When available
- **Sale Indicator** - For discounted products

### Image Section
- **Smart Placeholders** - Type-specific icons when no image
- **Image Hover** - Secondary image on hover
- **Instant Download Badge** - Green download indicator
- **Demo Button** - Appears on hover for applicable products

### Content Section
- **Vendor Information** - Brand/company name
- **Documentation Badge** - When docs are included
- **Product Title** - Clean, readable title
- **Tech Stack Badges** - Up to 4 technology indicators
- **Pricing Display** - Prominent price with license type
- **Digital Status** - "Digital" with "Instant Access"

### Action Section
- **Add to Cart** - Primary action button
- **View Details** - Secondary action button

## Styling & Themes

### CSS Classes

The component uses Tailwind CSS v4 classes for styling:

```css
/* Grid Layout */
.grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4

/* Card Hover Effects */
.hover:shadow-xl .hover:border-gray-300 .hover:scale-[1.02]

/* Badge Styling */
.bg-blue-100 .text-blue-800 .rounded-full

/* Button Styling */
.bg-black .text-white .hover:bg-gray-800
```

### Custom Gradients

Smart placeholder backgrounds use custom gradients:

```css
.bg-gradient-to-br .from-blue-50 .to-purple-50
```

## Error Handling

### Loading States

```tsx
// Skeleton loading
<ProductCardSkeleton />

// Loading indicators
<div className="animate-spin rounded-full h-4 w-4 border border-white border-t-transparent" />
```

### Error States

```tsx
// Connection errors
<div className="text-center">
  <svg className="w-12 h-12 text-gray-400" />
  <h3>Failed to load products</h3>
  <button onClick={retry}>Try Again</button>
</div>

// Empty states
<div className="text-center">
  <svg className="w-12 h-12 text-gray-400" />
  <h3>No products found</h3>
  <p>No products available at the moment</p>
</div>
```

## Performance Optimization

### Image Loading

```tsx
<Image
  src={imageUrl}
  alt={altText}
  fill
  className="object-cover"
  sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 25vw"
  loading="lazy"
  onError={() => setImageError(true)}
/>
```

### Memoization

```tsx
const queryParams = useMemo(() => ({
  first: productsPerPage,
  query: searchQuery || undefined,
  sortKey: sortBy,
  reverse: sortReverse,
  after: cursor || undefined
}), [searchQuery, sortBy, sortReverse, productsPerPage, cursor]);
```

### Efficient Updates

```tsx
const loadProducts = useCallback(async (isLoadMore = false) => {
  // Optimized loading logic
}, [queryParams, productsPerPage]);
```

## Accessibility

### ARIA Labels

```tsx
<div
  role="button"
  tabIndex={0}
  aria-label={`View ${product.title}`}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleProductClick();
    }
  }}
>
```

### Screen Reader Support

- Descriptive alt text for images
- Clear button labels
- Semantic HTML structure
- Keyboard navigation support

## Debug Features

### Development Mode

```tsx
{process.env.NODE_ENV === 'development' && (
  <div className="debug-info">
    Loading: {loading} | Products: {products.length} | Error: {error}
  </div>
)}
```

### Console Logging

```tsx
console.log('🎯 ProductCard rendering:', {
  title: product.title,
  techStack,
  licenseType,
  digitalType
});
```

## Integration Examples

### Homepage Featured Products

```tsx
<ProductGrid
  productsPerPage={8}
  showLoadMore={false}
  onProductClick={handleFeaturedClick}
  onAddToCart={handleQuickAdd}
/>
```

### Full Catalog Page

```tsx
<ProductGrid
  searchQuery={searchTerm}
  sortBy={sortBy}
  sortReverse={sortReverse}
  productsPerPage={16}
  showLoadMore={true}
  onProductClick={navigateToProduct}
  onAddToCart={addToCartWithNotification}
/>
```

### Category Pages

```tsx
<ProductGrid
  initialProducts={categoryProducts}
  showLoadMore={false}
  className="category-grid"
  onProductClick={handleCategoryProduct}
/>
```

## Best Practices

### Performance
- Use `initialProducts` prop for SSR/SSG
- Implement proper loading states
- Optimize image sizes and formats

### UX
- Provide clear feedback for all actions
- Use loading indicators for async operations
- Implement error boundaries

### Accessibility
- Test with screen readers
- Ensure keyboard navigation
- Provide descriptive labels

### SEO
- Use semantic HTML structure
- Implement proper meta tags
- Optimize for Core Web Vitals

## Troubleshooting

### Common Issues

1. **Products not loading**
   - Check Shopify API credentials
   - Verify network connectivity
   - Review console errors

2. **Images not displaying**
   - Check image URLs
   - Verify CORS settings
   - Use fallback placeholders

3. **Tech stack not detected**
   - Ensure product metadata includes tech keywords
   - Check product descriptions and tags
   - Verify detection logic

### Debug Tools

- Use `/test-shopify` page for API testing
- Enable development debug mode
- Check browser console for detailed logs

---

**The ProductGrid component is the foundation of Afilo's digital commerce experience, optimized for software product sales and developer engagement.**