import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

// Check for reduced motion preference
const prefersReducedMotion =
  typeof window !== 'undefined'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;

// Initialize Lenis smooth scrolling
export function initLenis(): Lenis | null {
  if (prefersReducedMotion) {
    return null;
  }

  const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    wheelMultiplier: 1,
    touchMultiplier: 2,
  });

  lenis.on('scroll', ScrollTrigger.update);

  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });

  gsap.ticker.lagSmoothing(0);

  return lenis;
}

// Hero section entrance animation
export function initHeroAnimation(): void {
  const heroSection = document.querySelector('section');
  if (!heroSection) return;

  const heroElements = heroSection.querySelectorAll('.gsap-fade-up');
  const nav = document.getElementById('nav');

  // Set initial states immediately via GSAP (not CSS)
  gsap.set(heroElements, { opacity: 0, y: 30 });
  if (nav) gsap.set(nav, { opacity: 0, y: -20 });

  if (prefersReducedMotion) {
    gsap.set([nav, heroElements], { opacity: 1, y: 0 });
    return;
  }

  const tl = gsap.timeline({
    defaults: { ease: 'power2.out' },
  });

  // Nav entrance
  if (nav) {
    tl.to(nav, { opacity: 1, y: 0, duration: 0.6 });
  }

  // Hero elements stagger
  tl.to(
    heroElements,
    {
      opacity: 1,
      y: 0,
      duration: 0.6,
      stagger: 0.1,
    },
    nav ? '-=0.3' : 0
  );
}

// Initialize scroll-triggered animations
export function initAnimations(): void {
  if (prefersReducedMotion) {
    gsap.set('.gsap-fade-up, .gsap-scale-in, .gsap-fade-in', {
      opacity: 1,
      y: 0,
      scale: 1,
    });
    initCountUp(true);
    return;
  }

  // Get all sections except the first (hero)
  const sections = document.querySelectorAll('section');
  const nonHeroSections = Array.from(sections).slice(1);

  // Fade up animations for non-hero sections
  nonHeroSections.forEach((section) => {
    const elements = section.querySelectorAll<HTMLElement>('.gsap-fade-up');
    if (elements.length === 0) return;

    // Set initial state
    gsap.set(elements, { opacity: 0, y: 30 });

    // Animate on scroll
    ScrollTrigger.create({
      trigger: section,
      start: 'top 80%',
      once: true,
      onEnter: () => {
        gsap.to(elements, {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: 'power2.out',
          stagger: 0.08,
        });
      },
    });
  });

  // Scale in animations
  const scaleElements = document.querySelectorAll<HTMLElement>('.gsap-scale-in');
  scaleElements.forEach((element) => {
    gsap.set(element, { opacity: 0, scale: 0.95 });

    ScrollTrigger.create({
      trigger: element,
      start: 'top 85%',
      once: true,
      onEnter: () => {
        gsap.to(element, {
          opacity: 1,
          scale: 1,
          duration: 0.6,
          ease: 'power2.out',
        });
      },
    });
  });


  // Metric cards count-up animation
  initCountUp();
}

// Count-up animation for metric cards
function initCountUp(instant = false): void {
  const metricCards = document.querySelectorAll<HTMLElement>('.metric-card');

  metricCards.forEach((card) => {
    const valueElement = card.querySelector('.metric-value');
    const targetValue = parseInt(card.dataset.value || '0', 10);

    if (!valueElement) return;

    if (instant) {
      valueElement.textContent = targetValue.toString();
      return;
    }

    ScrollTrigger.create({
      trigger: card,
      start: 'top 85%',
      once: true,
      onEnter: () => {
        gsap.fromTo(
          { value: 0 },
          { value: targetValue },
          {
            duration: 2,
            ease: 'power2.out',
            onUpdate: function () {
              valueElement.textContent = Math.round(
                this.targets()[0].value
              ).toString();
            },
          }
        );
      },
    });
  });
}

// Image reveal animation
export function initImageReveal(): void {
  if (prefersReducedMotion) return;

  const images = document.querySelectorAll<HTMLImageElement>('.img-reveal');
  images.forEach((img) => {
    if (img.complete) {
      img.classList.add('loaded');
    } else {
      img.addEventListener('load', () => {
        img.classList.add('loaded');
      });
    }
  });
}

// Cleanup function
export function cleanup(): void {
  ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
  gsap.killTweensOf('*');
}
