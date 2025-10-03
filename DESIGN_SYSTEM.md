# Afilo Design System

Enterprise-grade digital marketplace design system with Fortune 500 aesthetic standards.

## Color System

### Primary Gradient
**Standard**: `from-blue-600 to-purple-600`
- Use for primary CTAs, hero sections, premium headers
- Hex values: `#2563EB` (blue-600) → `#9333EA` (purple-600)

**Hover States**: `from-blue-500 to-purple-500`
- Reserved for hover state transitions
- Creates subtle lightening effect on interaction
- Hex values: `#3B82F6` (blue-500) → `#A855F7` (purple-500)

**Subtle Backgrounds**: `from-blue-600/20 to-purple-600/20`
- Use for soft background gradients
- Maintains brand consistency with reduced opacity

### Text Colors
- **On Dark Backgrounds**: `text-white` or `text-white/90`
- **On Light Backgrounds**: `text-gray-900` or `text-slate-950`
- **Gradient Text**: `bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent`

### Background Gradients
- **Hero/Main Sections**: `from-slate-950 via-blue-950 to-purple-950`
- **Glassmorphism**: `backdrop-blur-xl bg-white/10` or `backdrop-blur-sm bg-white/5`

## Spacing Scale

### Vertical Section Spacing (py-*)

| Size | Class | Pixels | Use Case |
|------|-------|--------|----------|
| Small | `py-16` | 64px | Small content sections, compact layouts |
| Medium | `py-20` | 80px | Standard section spacing |
| Large | `py-32` | 128px | Major content sections, feature showcases |
| Hero | `py-40` | 160px | Hero sections, landing page headers |
| Extra Large | `py-64` | 256px | Special occasions, maximum visual impact |

### Application Guidelines

**Homepage Sections**:
- Hero: `py-40` (160px)
- Features/Products: `py-20` (80px)
- Authority Components: `py-20` (80px)
- CTA Sections: `py-32` (128px)

**Product Pages**:
- Header: `py-16` (64px)
- Product Grid: `py-20` (80px)
- Details: `py-16` (64px)

**Enterprise Portal**:
- Tab Content: `py-24` (96px)
- Pricing Cards: `py-16` (64px)
- Quote Builder: `py-20` (80px)

## Typography

### Font Family
- Primary: `font-[family-name:var(--font-geist-sans)]` (Geist Sans)
- All text should use this unless specified otherwise

### Font Weights
- Regular: `font-normal` (400)
- Medium: `font-medium` (500)
- Semibold: `font-semibold` (600)
- Bold: `font-bold` (700)
- Black: `font-black` (900) - for emphasis

### Heading Scale
- H1: `text-5xl` (48px) or `text-6xl` (60px) for heroes
- H2: `text-4xl` (36px) for section titles
- H3: `text-3xl` (30px) for subsection titles
- H4: `text-2xl` (24px) for card headers
- H5: `text-xl` (20px) for small headers
- H6: `text-lg` (18px) for list headers

## Button Components

### ShadCN Button Variants

**Primary CTA** (default):
```tsx
<Button variant="default">
  Get Started
</Button>
```
- Background: `bg-gradient-to-r from-blue-600 to-purple-600`
- Hover: Scale 1.05, shadow enhancement
- Use for: Primary actions, sign-ups, purchases

**Secondary**:
```tsx
<Button variant="secondary">
  Learn More
</Button>
```
- Background: Gray/outline style
- Use for: Secondary actions, navigation

**Ghost**:
```tsx
<Button variant="ghost">
  Cancel
</Button>
```
- Background: Transparent
- Use for: Tertiary actions, dismissals

**Destructive**:
```tsx
<Button variant="destructive">
  Delete
</Button>
```
- Background: Red gradient
- Use for: Delete, cancel, dangerous actions

### Framer Motion Integration

All buttons should include:
```tsx
<motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
  transition={{ type: "spring", stiffness: 300 }}
>
```

## Animation Guidelines

### Standard Transitions
- **Duration Fast**: `duration: 0.2` (200ms)
- **Duration Medium**: `duration: 0.5` (500ms)
- **Duration Slow**: `duration: 1.0` (1000ms)

### Spring Physics
```tsx
transition: { type: "spring", stiffness: 300, damping: 30 }
```

### Common Patterns

**Card Hover**:
```tsx
whileHover={{ scale: 1.05 }}
```

**Button Tap**:
```tsx
whileTap={{ scale: 0.95 }}
```

**Slide In**:
```tsx
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}
```

### Accessibility
- Always include `prefers-reduced-motion` support
- Framer Motion handles this automatically

## Layout Patterns

### Container Widths
- Standard: `max-w-7xl mx-auto`
- Narrow: `max-w-4xl mx-auto`
- Wide: `max-w-[1920px] mx-auto`

### Horizontal Padding
- Mobile: `px-4`
- Tablet: `sm:px-6`
- Desktop: `lg:px-8`

### Grid Layouts

**Product Grids**:
```tsx
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
```

**Feature Grids**:
```tsx
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
```

## Component Patterns

### Glassmorphism Cards
```tsx
className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl"
```

### Gradient Overlays
```tsx
<div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600" />
<div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
```

### Active State Indicators
```tsx
{isActive && (
  <motion.div
    className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full"
    layoutId="activeNav"
    transition={{ type: "spring", stiffness: 300, damping: 30 }}
  />
)}
```

## Accessibility Standards

### WCAG 2.1 AA Compliance

**ARIA Labels**:
- All icon-only buttons must have `aria-label`
- Form inputs must have associated labels
- Screen reader text: `className="sr-only"`

**Keyboard Navigation**:
- All interactive elements must be keyboard accessible
- Focus states: `focus:outline-none focus:ring-2 focus:ring-blue-500/50`
- Skip links for main content navigation

**Color Contrast**:
- Minimum 4.5:1 for normal text
- Minimum 3:1 for large text (18px+ or 14px+ bold)
- All gradients tested for readability

## Performance Guidelines

### Core Web Vitals Targets
- **LCP**: < 2.5s (Largest Contentful Paint)
- **FID**: < 100ms (First Input Delay)
- **CLS**: < 0.1 (Cumulative Layout Shift)

### Animation Performance
- All animations run at 60fps
- Use `transform` and `opacity` for smooth transitions
- Avoid animating `width`, `height`, `top`, `left`

### Bundle Optimization
- Main bundle: < 250KB gzipped
- Lazy load non-critical components
- Use Next.js Image component for all images

## Brand Voice

### Language Guidelines
- **Professional**: Enterprise-grade, Fortune 500 positioning
- **Technical**: Detailed specifications, clear feature descriptions
- **Confident**: "Built for enterprise scale" not "Suitable for"
- **Quantified**: "99.97% uptime" not "Highly reliable"

### Terminology
- Use "Enterprise" not "Business" for premium tiers
- Use "Professional" for mid-tier offerings
- Use "Dashboard" not "Portal" for user areas
- Use "Subscription" not "Plan" for pricing

## File Organization

### Component Structure
```
components/
├── ui/                    # ShadCN components
│   ├── button.tsx
│   ├── card.tsx
│   └── sheet.tsx
├── stripe/                # Payment components
├── [Feature]Component.tsx # Feature-specific components
└── Navigation.tsx         # Global components
```

### Naming Conventions
- Components: PascalCase (e.g., `ProductGrid.tsx`)
- Utilities: camelCase (e.g., `formatPrice.ts`)
- Constants: UPPER_SNAKE_CASE (e.g., `API_VERSION`)

## Testing Checklist

Before deploying design changes:

- [ ] TypeScript compilation passes (`pnpm build`)
- [ ] Visual regression tested on mobile (375px), tablet (768px), desktop (1440px)
- [ ] Lighthouse accessibility score ≥ 95
- [ ] Lighthouse performance score ≥ 90
- [ ] All interactive elements keyboard accessible
- [ ] Color contrast meets WCAG AA standards
- [ ] Animations respect `prefers-reduced-motion`
- [ ] No layout shift (CLS = 0) during loading

## Version History

- **v1.0.0** (2025-01-29): Initial design system documentation
  - Standardized gradient colors (blue-600 to purple-600)
  - Defined spacing scale (py-16 to py-64)
  - Documented button component patterns
  - Established animation guidelines
