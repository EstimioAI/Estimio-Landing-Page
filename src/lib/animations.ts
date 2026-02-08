// Lightweight animation system using Intersection Observer and CSS
// Replaces heavy GSAP + Lenis dependencies for better performance

// Reduced motion check
const prefersReducedMotion =
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ============================================
// INTERSECTION OBSERVER FOR SCROLL ANIMATIONS
// ============================================

export function initScrollAnimations(): void {
  if (prefersReducedMotion) {
    // Show all elements immediately
    document.querySelectorAll('[data-animate]').forEach((el) => {
      el.classList.add('is-visible');
    });
    return;
  }

  // Smaller rootMargin on mobile so elements reveal sooner
  const isMobile = window.innerWidth < 768;

  // Create a single observer for all animated elements
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          // Once visible, stop observing
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: isMobile ? 0.05 : 0.1,
      rootMargin: isMobile ? '0px 0px -20px 0px' : '0px 0px -50px 0px',
    }
  );

  // Observe all elements with data-animate attribute
  document.querySelectorAll('[data-animate]').forEach((el) => {
    observer.observe(el);
  });
}

// ============================================
// PAGE LOAD SEQUENCE (Simplified)
// ============================================

export function initPageLoadSequence(): void {
  if (prefersReducedMotion) {
    // Show all content immediately
    document.querySelectorAll('.fade-in, .fade-up').forEach((el) => {
      (el as HTMLElement).style.opacity = '1';
      (el as HTMLElement).style.transform = 'none';
    });
    return;
  }

  // Simple sequential fade-in using CSS animations
  const nav = document.querySelector('.nav-container');
  const heroElements = document.querySelectorAll('.fade-in, .fade-up');

  if (nav) {
    nav.classList.add('is-visible');
  }

  // Stagger hero elements with CSS
  heroElements.forEach((el, index) => {
    setTimeout(() => {
      el.classList.add('is-visible');
    }, index * 100); // 100ms stagger
  });

  // Initialize scroll animations after page load
  setTimeout(() => {
    initScrollAnimations();
  }, 300);
}

// ============================================
// IMAGE REVEAL (for lazy-loaded images)
// ============================================

export function initImageReveal(): void {
  if (prefersReducedMotion) return;

  const images = document.querySelectorAll<HTMLImageElement>('.img-reveal');
  images.forEach((img) => {
    if (img.complete) {
      img.classList.add('loaded');
    } else {
      img.addEventListener('load', () => img.classList.add('loaded'));
    }
  });
}

// ============================================
// PLACEHOLDER FUNCTIONS (for compatibility)
// ============================================

export function initLenis(): null {
  // Lenis removed for performance - using native scroll
  return null;
}

export function initMicroParallax(): void {
  // Parallax removed for performance
  return;
}

export function cleanup(): void {
  // No heavy libraries to clean up
  return;
}

export function initHeroAnimation(): void {
  // Legacy - handled by initPageLoadSequence
}

export function initAnimations(): void {
  // Legacy - handled by initPageLoadSequence
}
