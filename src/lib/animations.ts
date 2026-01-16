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

const DURATION = {
  fast: 0.3,
  medium: 0.5,
  slow: 0.7,
  heroStagger: 0.15,
  sectionStagger: 0.1,
} as const;

// Reduced motion check
const prefersReducedMotion =
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ============================================
// LENIS SMOOTH SCROLL
// ============================================

export function initLenis(): Lenis | null {
  if (prefersReducedMotion) return null;

  const lenis = new Lenis({
    duration: 1.0,
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

  // Set initial states - animate the nav container content, not the nav wrapper
  if (navContainer) gsap.set(navContainer, { opacity: 0, y: -10 });
  if (heroPill) gsap.set(heroPill, { opacity: 0, y: 16 });
  if (heroHeadline) gsap.set(heroHeadline, { opacity: 0, y: 20 });
  if (heroSubtext) gsap.set(heroSubtext, { opacity: 0, y: 16 });
  if (heroCTA) gsap.set(heroCTA, { opacity: 0, y: 16 });

  // Phone and HowItWorks initial states
  if (phoneImage) gsap.set(phoneImage, { opacity: 0, y: 40, scale: 0.95 });
  if (phoneGlow) gsap.set(phoneGlow, { opacity: 0, scale: 0.8 });
  if (stepCards) gsap.set(stepCards, { opacity: 0, x: -20 });

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
  if (phoneGlow) {
    tl.to(phoneGlow, { opacity: 1, scale: 1, duration: DURATION.slow }, '-=0.2');
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
      '-=0.5'
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
  // Get sections that need scroll animations (skip hero and how-it-works)
  const sectionsToAnimate = ['features', 'testimonials'];

  sectionsToAnimate.forEach((sectionId) => {
    const section = document.getElementById(sectionId);
    if (!section) return;

    const elements = section.querySelectorAll<HTMLElement>('.gsap-fade-up');
    if (elements.length === 0) return;

    // Set initial state
    gsap.set(elements, { opacity: 0, y: 24 });

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
    gsap.set(faqElements, { opacity: 0, y: 24 });

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

  // Footer CTA - scale in animation
  const footerCTA = document.querySelector<HTMLElement>('.gsap-scale-in');
  if (footerCTA) {
    gsap.set(footerCTA, { opacity: 0, scale: 0.96, y: 20 });

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
  if (prefersReducedMotion) return;

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
