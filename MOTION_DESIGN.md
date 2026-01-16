# Motion Design System

A comprehensive guide to the animation patterns, easing curves, and motion design principles used in the Estimio landing page.

## Design Philosophy

This motion system is inspired by **Apple/iOS** and **Linear** design principles:

- **Subtle over flashy**: Animations reinforce content hierarchy, never distract
- **Natural deceleration**: Ease-out curves that mimic physical momentum
- **60fps performance**: Optimized for mid-range devices
- **Accessibility first**: Respects `prefers-reduced-motion`
- **One-time triggers**: Scroll animations fire once, no looping

---

## Easing Curves

### CSS Custom Properties

```css
/* Natural iOS-style deceleration */
--ease-out-quint: cubic-bezier(0.22, 1, 0.36, 1);   /* Primary - most animations */
--ease-out-quart: cubic-bezier(0.25, 1, 0.5, 1);   /* Secondary - faster feel */
--ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);    /* Dramatic - hero entrances */
--ease-out-cubic: cubic-bezier(0.33, 1, 0.68, 1);  /* Subtle - small movements */
--ease-ios: cubic-bezier(0.25, 0.1, 0.25, 1);      /* iOS standard */
--ease-ios-decel: cubic-bezier(0, 0, 0.2, 1);      /* iOS deceleration */
```

### GSAP Equivalents

```typescript
const EASING = {
  outQuint: 'power3.out',    // Natural deceleration
  outCubic: 'power2.out',    // Smooth entrance
  outBack: 'back.out(1.2)',  // Subtle overshoot (interactive)
  linear: 'none',            // Scroll-linked
};
```

### When to Use Each

| Curve | Use Case |
|-------|----------|
| `outQuint` | Hero entrances, section reveals, card animations |
| `outCubic` | Button hovers, icon transitions |
| `outBack` | Interactive elements needing emphasis |
| `linear` | Scroll-linked parallax |

---

## Timing Guidelines

### Duration Scale

```css
--duration-fast: 200ms;     /* Hovers, micro-interactions */
--duration-normal: 400ms;   /* Card transitions, toggles */
--duration-slow: 600ms;     /* Section entrances, reveals */
--duration-slower: 800ms;   /* Hero animations, emphasis */
```

### Stagger Timings

```typescript
const STAGGER = {
  tight: 0.06,    // 60ms - Dense lists, icons
  normal: 0.08,   // 80ms - Cards, features (default)
  relaxed: 0.12,  // 120ms - Hero elements, emphasis
};
```

---

## Animation Patterns

### 1. Fade Up (Primary Pattern)

The default entrance animation for most content.

```astro
<!-- Using the class directly -->
<div class="gsap-fade-up">Content</div>

<!-- Using the ScrollReveal component -->
<ScrollReveal>
  <div>Content</div>
</ScrollReveal>

<!-- With stagger delay -->
<ScrollReveal delay={1}>First</ScrollReveal>
<ScrollReveal delay={2}>Second</ScrollReveal>
```

**Behavior:**
- Initial: `opacity: 0; y: 12px`
- Final: `opacity: 1; y: 0`
- Duration: 600ms
- Trigger: When section enters 82% of viewport

### 2. Scale In (Emphasis Pattern)

For CTAs, cards, and elements needing visual weight.

```astro
<div class="gsap-scale-in">CTA Card</div>

<!-- Or with component -->
<ScrollReveal animation="scale">
  <div>Content</div>
</ScrollReveal>
```

**Behavior:**
- Initial: `opacity: 0; scale: 0.97`
- Final: `opacity: 1; scale: 1`
- Duration: 800ms
- Trigger: When element enters 85% of viewport

### 3. Card Hover (Interactive Pattern)

Applied automatically to cards with `feature-card` or `testimonial-card` class.

```astro
<div class="feature-card">
  Hover me
</div>
```

**Behavior:**
- Hover: `translateY(-4px)` + enhanced shadow
- Duration: 400ms
- Easing: `ease-out-quint`

### 4. Micro-Parallax (Depth Pattern)

Subtle movement tied to scroll position. Very restrained (1-3px).

```astro
<!-- Moves up as user scrolls down -->
<div data-parallax="0.1">Content</div>

<!-- Moves down as user scrolls -->
<div data-parallax="0.15" data-parallax-direction="down">Content</div>
```

**Speed Values:**
- `0.1` - Subtle (recommended for most elements)
- `0.15` - Moderate (backgrounds)
- `0.2` - Noticeable (hero gradients)
- `0.3` - Maximum (use sparingly)

---

## Section Guidelines

### Hero Section

```astro
<section class="relative overflow-hidden">
  <!-- Background with parallax -->
  <div class="bg-gradient-..." data-parallax="0.3" data-parallax-direction="down">
  </div>

  <!-- Content with staggered entrance -->
  <div class="gsap-fade-up">Pill/Badge</div>
  <h1 class="gsap-fade-up">Headline</h1>
  <p class="gsap-fade-up">Subheadline</p>
  <div class="gsap-fade-up">CTA</div>
</section>
```

**Timing:** 120ms stagger between elements

### Feature Sections

```astro
<div class="grid md:grid-cols-3 gap-6">
  {features.map((f, i) => (
    <div class="gsap-fade-up feature-card" data-animate-delay={i + 1}>
      {/* Card content */}
    </div>
  ))}
</div>
```

**Timing:** 80ms stagger, 60-360ms delays via `data-animate-delay`

### CTA Section

```astro
<div class="gsap-scale-in cta-glow">
  <!-- CTA content -->
</div>
```

**Timing:** 800ms scale-in with optional glow emphasis on hover

---

## Section Dividers

### Gradient Divider

```astro
<div class="section-divider"></div>
```

Renders a subtle horizontal line that fades at edges.

### Shadow Top

```astro
<section class="section-shadow-top">
  <!-- Content -->
</section>
```

Adds a soft shadow at the top of the section.

---

## Performance Best Practices

### 1. will-change Management

Animations automatically add and remove `will-change`:
- Added: Before animation starts
- Removed: After animation completes (via `onComplete` callback)

### 2. GPU Acceleration

For manual GPU acceleration:

```css
.gpu-accelerated {
  transform: translateZ(0);
  backface-visibility: hidden;
}
```

### 3. Mobile Optimizations

- Floating animations disabled on screens < 768px
- Parallax effects are subtle (max 20px movement)
- Smooth scroll uses reduced multipliers on touch

### 4. Reduced Motion

All animations automatically disable when:
```css
@media (prefers-reduced-motion: reduce) {
  /* Animations skip to final state */
}
```

---

## Component Reference

### ScrollReveal

```astro
---
import ScrollReveal from '@/components/ui/ScrollReveal.astro';
---

<!-- Basic usage -->
<ScrollReveal>
  <div>Content</div>
</ScrollReveal>

<!-- With options -->
<ScrollReveal
  animation="scale"
  delay={2}
  class="my-custom-class"
  as="article"
>
  <div>Content</div>
</ScrollReveal>
```

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `animation` | `'fade-up' \| 'scale' \| 'fade'` | `'fade-up'` | Animation type |
| `delay` | `1-6` | - | Stagger delay index |
| `class` | `string` | - | Additional CSS classes |
| `as` | `'div' \| 'section' \| 'article' \| 'aside' \| 'span'` | `'div'` | HTML tag |

---

## CSS Classes Reference

| Class | Purpose |
|-------|---------|
| `gsap-fade-up` | Fade + translateY entrance |
| `gsap-scale-in` | Fade + scale entrance |
| `gsap-fade-in` | Fade only entrance |
| `feature-card` | Enhanced hover for feature cards |
| `testimonial-card` | Enhanced hover for testimonials |
| `cta-glow` | Glow effect on hover |
| `section-divider` | Gradient line divider |
| `section-shadow-top` | Soft shadow at section top |
| `parallax-slow` | Manual parallax class |
| `gpu-accelerated` | Force GPU acceleration |
| `no-scrollbar` | Hide scrollbar for overflow |

---

## Initialization

Animations are initialized in `src/pages/index.astro`:

```typescript
import {
  initLenis,          // Smooth scroll
  initHeroAnimation,  // Hero entrance
  initAnimations,     // Scroll triggers
  initImageReveal,    // Lazy image reveal
  initMicroParallax,  // Parallax effects
  cleanup,            // Cleanup on unmount
} from "../lib/animations";

document.addEventListener("DOMContentLoaded", () => {
  const lenis = initLenis();
  initHeroAnimation();
  initAnimations();
  initImageReveal();
  initMicroParallax();

  window.addEventListener("beforeunload", () => {
    cleanup();
    lenis?.destroy();
  });
});
```

---

## Adding New Animations

1. Define in `src/lib/animations.ts` following existing patterns
2. Use consistent easing from `EASING` constant
3. Use timing from `TIMING` constant
4. Always check `prefersReducedMotion`
5. Clean up `will-change` after animation
6. Export and initialize in `index.astro`

---

## Dependencies

- **GSAP 3.14.2** - Core animation library
- **ScrollTrigger** - GSAP plugin for scroll-based triggers
- **Lenis 1.3.17** - Smooth scroll implementation

Bundle size: ~50KB gzipped (combined)
