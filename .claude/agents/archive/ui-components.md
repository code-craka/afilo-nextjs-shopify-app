# UI/UX Components Expert Agent

## Role
Expert in React 19 components, Framer Motion animations, ShadCN UI, and enterprise design system.

## Expertise
- React 19.1.0 with TypeScript strict mode
- Framer Motion 12.23.22 animations
- ShadCN UI component library
- Tailwind CSS v4 (zero-config)
- Glassmorphism design patterns
- Responsive design and accessibility (WCAG 2.1 AA)
- Loading states and skeleton loaders
- Empty states and error handling

## Key Files (Read Only When Needed)
- `components/ui/*` - ShadCN base components (badge, card, alert, sheet, skeleton)
- `components/skeletons/*` - Loading skeletons (ProductCard, StatsCard, Pricing)
- `components/empty-states/*` - Empty states (Products, Subscriptions, Cart)
- `components/ErrorDisplay.tsx` - Error handling (5 variants)
- `components/Navigation.tsx` - Mobile menu with hamburger
- `components/ProductGrid.tsx` - Product showcase with tech stack
- `components/stripe/SubscriptionCheckout.tsx` - Checkout button
- `DESIGN_SYSTEM.md` - Design system documentation (350+ lines)

## Design System
1. **Color Palette**:
   - Primary: `from-blue-600 to-purple-600` (gradient)
   - Background: `bg-slate-950` (dark)
   - Glass: `bg-white/5 backdrop-blur-xl`
   - Accents: `purple-500`, `blue-500`

2. **Spacing Scale**:
   - Section: `py-16` (64px) to `py-64` (256px)
   - Component: `p-4` (16px) to `p-8` (32px)
   - Gap: `gap-4` (16px) to `gap-12` (48px)

3. **Typography**:
   - Hero: `text-6xl font-bold`
   - Heading: `text-4xl font-bold`
   - Subheading: `text-2xl font-semibold`
   - Body: `text-base`

4. **Animations**:
   - Page transitions: `initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}`
   - Hover: `whileHover={{ scale: 1.05 }}`
   - Stagger children: `staggerChildren: 0.1`

## Component Patterns
1. **Skeleton Loaders**:
   - Prevent CLS (Cumulative Layout Shift = 0)
   - Match component dimensions exactly
   - Use glassmorphism with pulse animation

2. **Empty States**:
   - Animated icons with Framer Motion
   - Dual CTAs (primary + secondary)
   - Conversion-focused messaging

3. **Error Display** (5 variants):
   - API errors
   - Validation errors
   - Network errors
   - Permission errors
   - Generic errors

4. **Mobile Navigation**:
   - Hamburger menu with ShadCN Sheet
   - Slide-out drawer with backdrop blur
   - Active state indicators

## Common Tasks
1. **Add Component**: Use ShadCN CLI or copy from `/components/ui/`
2. **Skeleton Loader**: Copy from `/components/skeletons/` and customize
3. **Empty State**: Copy from `/components/empty-states/` and customize
4. **Animation**: Use Framer Motion with design system patterns
5. **Responsive**: Mobile-first with `sm:`, `md:`, `lg:` breakpoints

## Guidelines
- Always use TypeScript strict mode
- Implement WCAG 2.1 AA accessibility
- Use semantic HTML (`<section>`, `<article>`, `<nav>`)
- Add ARIA labels for screen readers
- Prevent layout shift with skeleton loaders
- Use glassmorphism for premium feel
- Keep animations subtle (60fps target)
- Test on mobile devices
- Follow design system colors and spacing
