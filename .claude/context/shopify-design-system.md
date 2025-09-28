# Design System Context (.claude/context/shopify-design-system.md)

```markdown
# Afilo Shopify + Next.js Design System

## Project Context
- **Brand**: Afilo - Modern AI/software company
- **Domain**: app.afilo.io
- **Tech**: Next.js 15.5.4, Tailwind CSS v4, ShadCN UI
- **Goal**: Conversion-optimized e-commerce experience

## E-commerce Design Principles

### Conversion-Focused Design
- **Clear Visual Hierarchy**: Guide users toward purchase decisions
- **Trust Indicators**: Security badges, reviews, guarantees prominently displayed
- **Minimal Friction**: Streamlined path from discovery to checkout
- **Mobile Commerce**: Touch-optimized shopping experience
- **Performance First**: Fast loading for better conversion rates

### Afilo Brand Identity
- **Modern AI Aesthetic**: Clean, minimal, tech-forward design
- **Professional Colors**: High-contrast, accessible color scheme
- **Typography**: Clean, readable fonts optimized for software brands
- **Micro-interactions**: Subtle animations that enhance rather than distract
- **Premium Feel**: Quality design that justifies software/AI product pricing

## Tailwind CSS v4 Implementation

### No Configuration Approach
- Utilize Tailwind v4's built-in design system
- Leverage default color palette and spacing scale
- Take advantage of improved container queries
- Use built-in dark mode support

### Core Utility Patterns
```css
/* Product Cards */
.product-card {
  @apply bg-white dark:bg-gray-900 rounded-xl shadow-sm hover:shadow-lg transition-shadow;
  @apply border border-gray-200 dark:border-gray-800;
  @apply p-6 space-y-4;
}

/* Cart Components */
.cart-drawer {
  @apply fixed right-0 top-0 h-full w-full max-w-md;
  @apply bg-white dark:bg-gray-900 shadow-2xl z-50;
  @apply flex flex-col;
}

/* Button Variants */
.btn-primary {
  @apply bg-black dark:bg-white text-white dark:text-black;
  @apply px-6 py-3 rounded-lg font-medium;
  @apply hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors;
}

.btn-secondary {
  @apply bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white;
  @apply px-6 py-3 rounded-lg font-medium;
  @apply hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors;
}
```

## ShadCN Component Standards

### E-commerce Component Usage
- **Dialog**: Product quick view, cart drawer, confirmation modals
- **Select**: Variant selection, filtering options
- **Form**: Checkout forms, newsletter signup
- **Button**: CTAs with consistent variant system
- **Input**: Search, quantity selectors, form fields

### Accessibility Integration
- Leverage ShadCN's built-in accessibility features
- Ensure proper ARIA labels for e-commerce contexts
- Maintain keyboard navigation throughout shopping flow
- Support screen readers for product announcements

## Responsive Design Standards

### Breakpoint Strategy
- **Mobile First**: Start with mobile design, enhance for larger screens
- **Touch Targets**: Minimum 44px for all interactive elements
- **Content Strategy**: Ensure all content works across viewports
- **Performance**: Optimize for mobile Core Web Vitals

### E-commerce Responsive Patterns
```css
/* Product Grid */
.product-grid {
  @apply grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6;
}

/* Cart Layout */
.cart-mobile {
  @apply fixed inset-x-0 bottom-0 rounded-t-2xl;
}

.cart-desktop {
  @apply fixed right-0 top-0 w-96 h-full;
}
```

## Performance Standards

### Core Web Vitals for E-commerce
- **LCP (Largest Contentful Paint)**: < 2.5s for hero section or main product image
- **FID (First Input Delay)**: < 100ms for add to cart interactions
- **CLS (Cumulative Layout Shift)**: < 0.1 for stable product grids
- **TTFB (Time to First Byte)**: < 800ms for initial page load

### Shopify Integration Performance
- **Product Loading**: ISR for product pages, SSG for collections
- **Image Optimization**: Next.js Image with Shopify CDN integration
- **Bundle Size**: Code splitting for cart and checkout components
- **API Efficiency**: Minimal GraphQL queries with optimal caching

## Animation and Interaction Standards

### Micro-interactions
- **Hover States**: Subtle scale/shadow changes for product cards
- **Loading States**: Skeleton screens with shimmer effects
- **Cart Updates**: Smooth slide animations for drawer
- **Button Feedback**: Quick scale animation on press

### Performance Considerations
- Use CSS transforms for animations (GPU acceleration)
- Prefer opacity/transform over layout-affecting properties
- Implement reduced motion for accessibility
- Keep animations under 300ms for responsiveness

## Color System and Accessibility

### Modern AI Brand Colors
- **Primary**: Black/White high contrast system
- **Secondary**: Gray scale with sufficient contrast ratios
- **Accent**: Minimal use of color for CTAs and status indicators
- **Success/Error**: Green/Red with accessible contrast

### Accessibility Requirements
- **Color Contrast**: 4.5:1 minimum for normal text, 3:1 for large text
- **Focus Indicators**: Visible focus rings on all interactive elements
- **Color Independence**: Never rely solely on color to convey information
- **Dark Mode**: Full theme support with proper contrast maintenance

## Typography Scale

### Font System
- **Primary**: System font stack (SF Pro, Segoe UI, Inter)
- **Weights**: Regular (400), Medium (500), SemiBold (600), Bold (700)
- **Scale**: H1 (2rem), H2 (1.5rem), H3 (1.25rem), Body (1rem), Small (0.875rem)

### E-commerce Typography Patterns
- **Product Titles**: Clear hierarchy with consistent truncation
- **Pricing**: Bold, prominent display with currency formatting
- **Descriptions**: Readable line height and comfortable measure
- **CTAs**: Medium weight with adequate contrast

This design system ensures the Afilo e-commerce experience is modern, accessible, and optimized for conversion while maintaining the professional aesthetic appropriate for an AI/software company.
```