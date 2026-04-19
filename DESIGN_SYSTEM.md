# Premium UI - Design System Reference

## Color Palette

### Primary Colors
```css
--primary-bg: #0f1419;           /* Deep Navy - Main background */
--secondary-bg: #16202d;         /* Navy - Secondary surfaces */
--tertiary-bg: #1f2937;          /* Dark Gray - Tertiary surfaces */
```

### Accent Colors
```css
--accent-primary: #3b82f6;       /* Bright Blue - Primary CTA */
--accent-primary-dark: #1e40af;  /* Dark Blue - Hover state */
--accent-secondary: #10b981;     /* Emerald Green - Success */
```

### Status Colors
```css
--success: #10b981;              /* Green - Success state */
--warning: #f59e0b;              /* Amber - Warning state */
--error: #ef4444;                /* Red - Error state */
```

### Text Colors
```css
--text-primary: #f5f5f5;         /* Light text - Primary content */
--text-secondary: #9ca3af;       /* Gray text - Secondary content */
--border-color: #2d3748;         /* Gray - Border dividers */
--hover-bg: #1f2937;             /* Dark Gray - Hover background */
```

## Typography System

### Font Families
- **Headings**: Space Grotesk (600, 700 weights)
- **Body**: IBM Plex Sans (400, 500, 600 weights)
- **Monospace**: SF Mono (for code/data)

### Font Sizes & Line Heights
- **Heading 1**: 28px / 32px (1.14)
- **Heading 2**: 24px / 28px (1.17)
- **Heading 3**: 20px / 24px (1.2)
- **Body Large**: 16px / 24px (1.5)
- **Body Regular**: 14px / 20px (1.43)
- **Body Small**: 12px / 18px (1.5)
- **Caption**: 12px / 16px (1.33)

## Spacing System

All spacing follows an 8px baseline grid:

```css
--spacing-xs: 0.25rem (2px)
--spacing-sm: 0.5rem (4px)
--spacing-md: 1rem (8px)
--spacing-lg: 1.5rem (12px)
--spacing-xl: 2rem (16px)
--spacing-2xl: 3rem (24px)
```

## Border Radius System

```css
--radius-sm: 0.375rem (3px)      /* Minimal rounding */
--radius-md: 0.5rem (4px)        /* Standard buttons */
--radius-lg: 0.875rem (7px)      /* Cards & containers */
--radius-xl: 1.25rem (10px)      /* Large components */
```

## Shadow System

### Premium Shadows
```css
box-shadow: 0 1px 3px 0 rgba(0,0,0,0.02), 
            0 1px 2px 0 rgba(0,0,0,0.06);  /* Subtle */

box-shadow: 0 10px 15px -3px rgba(0,0,0,0.05),
            0 4px 6px -2px rgba(0,0,0,0.02);  /* Medium */

box-shadow: 0 0 20px rgba(59, 130, 246, 0.1);  /* Accent glow */
```

## Component Sizing

### Touch Targets (Mobile)
- Minimum size: 44x44px
- Button height: 44px
- Icon size: 24px

### Desktop Sizes
- Button height: 40px
- Input height: 36px
- Icon size: 20-24px

## Responsive Breakpoints

```css
xs: 0px         /* Mobile phones */
sm: 640px       /* Landscape phones, tablets */
md: 768px       /* Tablets */
lg: 1024px      /* Small laptops, desktops */
xl: 1280px      /* Large desktops */
2xl: 1536px     /* Ultra-wide screens */
```

## Component Specifications

### Stat Card
- Width: Responsive grid (1-4 columns)
- Padding: 20px
- Border: 1px solid --border-color
- Background: --secondary-bg
- Border Radius: --radius-lg
- Hover: Border changes to --accent-primary

### Header
- Height: 64px (4rem)
- Background: --secondary-bg
- Border Bottom: 1px solid --border-color
- Padding: 16px (4rem on desktop)

### Sidebar
- Width: 256px (16rem)
- Background: --secondary-bg
- Border Right: 1px solid --border-color
- Fixed on desktop, collapsible on mobile

### Main Content
- Padding: 32px (8rem on desktop)
- Background: --primary-bg
- Max Width: Responsive

## Animations

### Durations
- Quick: 150ms (hover, focus states)
- Standard: 300ms (page transitions, modals)
- Slow: 500ms (entrance animations)

### Easing Functions
- `ease-out`: Quick animations (0.3s)
- `ease-in-out`: Standard transitions (0.2s)
- `cubic-bezier(0.4, 0, 0.2, 1)`: Premium animations

### Keyframes
- **fadeIn**: Opacity 0→1 with slight Y offset
- **slideInLeft**: Transform -20px with fade
- **slideInRight**: Transform +20px with fade
- **pulseLight**: Subtle opacity pulsing
- **pulseSkeleton**: Shimmer loading effect

## Accessibility Guidelines

### Color Contrast
- Text on background: 7:1+ ratio (WCAG AAA)
- UI components: 4.5:1+ ratio (WCAG AA)

### Focus States
- Outline: 2px solid --accent-primary
- Outline Offset: 2px
- Box Shadow: 0 0 0 3px rgba(59, 130, 246, 0.1)

### Interactive Elements
- Minimum size: 44x44px (mobile)
- Clear visual feedback on hover
- Distinct focus indicator

## Responsive Design Patterns

### Grid Layouts
```
Mobile (1 column):
[ Full width ]

Tablet (2 columns):
[ 50% ] [ 50% ]

Desktop (3-4 columns):
[ 25% ] [ 25% ] [ 25% ] [ 25% ]
```

### Navigation
- **Mobile**: Hamburger menu, hidden sidebar
- **Tablet**: Visible sidebar, compact layout
- **Desktop**: Full sidebar, standard layout

### Cards
- **Mobile**: Full width, compact padding
- **Desktop**: Grid layout, standard padding

## Dark Mode Considerations

The entire design system is built for dark mode:
- High contrast text on dark backgrounds
- Subtle shadows and elevations
- Muted accent colors to prevent eye strain
- Consistent color temperature across components

## Usage Examples

### Creating a Button
```tsx
<Button variant="primary" size="md">
  Click Me
</Button>
```

### Creating a Card
```tsx
<Card title="Title" subtitle="Subtitle">
  Content goes here
</Card>
```

### Using Custom Colors
```css
/* In components */
className="bg-accent-primary text-text-primary"

/* In inline styles */
style={{ color: 'var(--text-secondary)' }}
```

## Performance Considerations

- CSS variables are GPU-accelerated
- Animations use transform and opacity only
- No layout thrashing
- Efficient media queries
- Hardware acceleration enabled

## Browser Rendering

### CSS Properties Used
- `transform`: For animations (GPU accelerated)
- `opacity`: For visibility transitions
- `box-shadow`: For depth
- `border`: For outlines
- `background`: For colors (CSS variables)

### Optimizations
- Minimal repaints
- No expensive calculations
- Efficient selector specificity
- No z-index wars

---

**This design system ensures consistency, performance, and professional quality across all components and pages.**
