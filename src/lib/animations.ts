import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

// ============================================
// CONFIGURATION - Apple/Linear Quality
// ============================================

const EASE = {
  // Primary - iOS-style natural deceleration
  smooth: 'power3.out',
  // Soft entrance
  gentle: 'power2.out',
  // Crisp for UI elements
  crisp: 'power4.out',
} as const;

// Mobile detection
const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
const isTablet = typeof window !== 'undefined' && window.innerWidth >= 768 && window.innerWidth < 1024;

// Mobile-optimized durations (faster = less processing)
const DURATION = {
  fast: isMobile ? 0.2 : 0.3,
  medium: isMobile ? 0.3 : 0.5,
  slow: isMobile ? 0.4 : 0.7,
  heroStagger: isMobile ? 0.08 : 0.15,
  sectionStagger: isMobile ? 0.05 : 0.1,
} as const;

// Reduced motion check
const prefersReducedMotion =
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ============================================
// LENIS SMOOTH SCROLL
// ============================================

export function initLenis(): Lenis | null {
  // Disable Lenis on mobile for better native scroll performance
  // Mobile browsers have optimized native scrolling; Lenis adds overhead
  if (prefersReducedMotion || isMobile) return null;

  const lenis = new Lenis({
    duration: isTablet ? 0.8 : 1.0,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    wheelMultiplier: 0.9,
    touchMultiplier: 1.8,
  });

  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  return lenis;
}

// ============================================
// INITIAL PAGE LOAD SEQUENCE
// ============================================

export function initPageLoadSequence(): void {
  // Immediately hide all animated elements to prevent flash
  const allAnimatedElements = document.querySelectorAll('.gsap-fade-up, .gsap-scale-in');
  gsap.set(allAnimatedElements, { opacity: 0, y: 20 });

  if (prefersReducedMotion) {
    gsap.set(allAnimatedElements, { opacity: 1, y: 0 });
    return;
  }

  // Run hero animation, then set up scroll triggers
  animateHeroSequence(() => {
    initScrollAnimations();
  });
}

// ============================================
// HERO ENTRANCE SEQUENCE
// ============================================

function animateHeroSequence(onComplete: () => void): void {
  const nav = document.getElementById('nav');
  const navContainer = nav?.querySelector('.nav-container');
  const heroSection = document.querySelector('section');
  if (!heroSection) {
    onComplete();
    return;
  }

  // Hero elements
  const heroPill = heroSection.querySelector('.gsap-fade-up:first-of-type');
  const heroHeadline = heroSection.querySelector('h1');
  const heroSubtext = heroSection.querySelector('p.gsap-fade-up');
  const heroCTA = heroSection.querySelector('.flex.gsap-fade-up');

  // HowItWorks section (immediately following hero)
  const howItWorksSection = document.getElementById('how-it-works');
  const phoneContainer = howItWorksSection?.querySelector('#hiw-phone-container');
  const phoneImage = phoneContainer?.querySelector('.hiw-phone-image');
  const phoneGlow = howItWorksSection?.querySelector('.blur-\\[60px\\]');
  const stepCards = howItWorksSection?.querySelectorAll('.hiw-step-card');

  // Mobile-optimized: smaller transform distances = less GPU work
  const yOffset = isMobile ? 12 : 16;
  const yOffsetLarge = isMobile ? 16 : 20;
  const phoneYOffset = isMobile ? 20 : 40;
  const xOffset = isMobile ? 12 : 20;

  // Set initial states - animate the nav container content, not the nav wrapper
  if (navContainer) gsap.set(navContainer, { opacity: 0, y: isMobile ? -6 : -10 });
  if (heroPill) gsap.set(heroPill, { opacity: 0, y: yOffset });
  if (heroHeadline) gsap.set(heroHeadline, { opacity: 0, y: yOffsetLarge });
  if (heroSubtext) gsap.set(heroSubtext, { opacity: 0, y: yOffset });
  if (heroCTA) gsap.set(heroCTA, { opacity: 0, y: yOffset });

  // Phone and HowItWorks initial states - skip scale on mobile for performance
  if (phoneImage) gsap.set(phoneImage, { opacity: 0, y: phoneYOffset, scale: isMobile ? 1 : 0.95 });
  if (phoneGlow && !isMobile) gsap.set(phoneGlow, { opacity: 0, scale: 0.8 });
  else if (phoneGlow) gsap.set(phoneGlow, { opacity: 0 }); // Skip scale animation on mobile
  if (stepCards) gsap.set(stepCards, { opacity: 0, x: -xOffset });

  // Master timeline
  const tl = gsap.timeline({
    defaults: { ease: EASE.smooth },
    onComplete: () => {
      // Clean up will-change
      document.querySelectorAll('[style*="will-change"]').forEach((el) => {
        (el as HTMLElement).style.willChange = 'auto';
      });
      onComplete();
    },
  });

  // 1. Nav fades in first (quick)
  if (navContainer) {
    tl.to(navContainer, { opacity: 1, y: 0, duration: DURATION.fast });
  }

  // 2. Hero content staggered entrance
  if (heroPill) {
    tl.to(heroPill, { opacity: 1, y: 0, duration: DURATION.medium }, '-=0.1');
  }
  if (heroHeadline) {
    tl.to(heroHeadline, { opacity: 1, y: 0, duration: DURATION.slow }, '-=0.3');
  }
  if (heroSubtext) {
    tl.to(heroSubtext, { opacity: 1, y: 0, duration: DURATION.medium }, '-=0.4');
  }
  if (heroCTA) {
    tl.to(heroCTA, { opacity: 1, y: 0, duration: DURATION.medium }, '-=0.3');
  }

  // 3. Phone mockup rises up with glow (the hero moment)
  // On mobile, skip scale animation for glow to reduce GPU work
  if (phoneGlow) {
    tl.to(
      phoneGlow,
      isMobile
        ? { opacity: 1, duration: DURATION.medium }
        : { opacity: 1, scale: 1, duration: DURATION.slow },
      '-=0.2'
    );
  }
  if (phoneImage) {
    tl.to(
      phoneImage,
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: DURATION.slow,
        ease: EASE.crisp,
      },
      isMobile ? '-=0.2' : '-=0.5' // Less overlap on mobile for smoother animation
    );
  }

  // 4. Step cards slide in from left with stagger
  if (stepCards && stepCards.length > 0) {
    tl.to(
      stepCards,
      {
        opacity: 1,
        x: 0,
        duration: DURATION.medium,
        stagger: DURATION.sectionStagger,
        ease: EASE.gentle,
      },
      '-=0.3'
    );
  }
}

// ============================================
// SCROLL-TRIGGERED ANIMATIONS
// ============================================

function initScrollAnimations(): void {
  // Mobile: reduced y offset for less GPU work
  const scrollYOffset = isMobile ? 16 : 24;

  // Get sections that need scroll animations (skip hero and how-it-works)
  const sectionsToAnimate = ['features', 'testimonials'];

  sectionsToAnimate.forEach((sectionId) => {
    const section = document.getElementById(sectionId);
    if (!section) return;

    const elements = section.querySelectorAll<HTMLElement>('.gsap-fade-up');
    if (elements.length === 0) return;

    // Set initial state
    gsap.set(elements, { opacity: 0, y: scrollYOffset });

    ScrollTrigger.create({
      trigger: section,
      start: 'top 80%',
      once: true,
      onEnter: () => {
        gsap.to(elements, {
          opacity: 1,
          y: 0,
          duration: DURATION.medium,
          stagger: DURATION.sectionStagger,
          ease: EASE.smooth,
          onComplete: () => {
            elements.forEach((el) => (el.style.willChange = 'auto'));
          },
        });
      },
    });
  });

  // FAQ section
  const faqSection = document.getElementById('faq');
  if (faqSection) {
    const faqElements = faqSection.querySelectorAll<HTMLElement>('.gsap-fade-up');
    gsap.set(faqElements, { opacity: 0, y: scrollYOffset });

    ScrollTrigger.create({
      trigger: faqSection,
      start: 'top 80%',
      once: true,
      onEnter: () => {
        gsap.to(faqElements, {
          opacity: 1,
          y: 0,
          duration: DURATION.medium,
          stagger: DURATION.sectionStagger,
          ease: EASE.smooth,
        });
      },
    });
  }

  // Footer CTA - scale in animation (skip scale on mobile)
  const footerCTA = document.querySelector<HTMLElement>('.gsap-scale-in');
  if (footerCTA) {
    gsap.set(footerCTA, { opacity: 0, scale: isMobile ? 1 : 0.96, y: isMobile ? 12 : 20 });

    ScrollTrigger.create({
      trigger: footerCTA,
      start: 'top 85%',
      once: true,
      onEnter: () => {
        gsap.to(footerCTA, {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: DURATION.slow,
          ease: EASE.smooth,
        });
      },
    });
  }
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
// MICRO-PARALLAX (very subtle depth)
// ============================================

export function initMicroParallax(): void {
  // Completely disable parallax on mobile and tablets - it's expensive
  // The scrub animation triggers on every scroll event which kills mobile performance
  if (prefersReducedMotion || isMobile || isTablet) return;

  const parallaxElements = document.querySelectorAll<HTMLElement>('[data-parallax]');

  parallaxElements.forEach((element) => {
    const speed = parseFloat(element.dataset.parallax || '0.1');
    const direction = element.dataset.parallaxDirection || 'up';

    ScrollTrigger.create({
      trigger: element,
      start: 'top bottom',
      end: 'bottom top',
      scrub: 0.5,
      onUpdate: (self) => {
        const yOffset =
          direction === 'up'
            ? -self.progress * 30 * speed
            : self.progress * 30 * speed;
        gsap.set(element, { y: yOffset });
      },
    });
  });
}

// ============================================
// CLEANUP
// ============================================

export function cleanup(): void {
  ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
  gsap.killTweensOf('*');
}

// ============================================
// LEGACY EXPORTS (for compatibility)
// ============================================

export function initHeroAnimation(): void {
  // Now handled by initPageLoadSequence
}

export function initAnimations(): void {
  // Now handled by initPageLoadSequence
}
