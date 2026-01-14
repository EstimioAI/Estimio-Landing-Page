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

// Complex Hero Scrollytelling Animation
export function initHeroScrollytelling(): void {
  if (prefersReducedMotion || window.innerWidth < 768) return; // Disable on mobile/reduced motion

  const phoneContainer = document.getElementById('hero-phone-container');
  const howItWorksSection = document.getElementById('how-it-works');
  const glow = document.getElementById('hero-glow');
  const metricsLeft = document.getElementById('hero-metrics-left');
  const metricsRight = document.getElementById('hero-metrics-right');

  // Images
  const step2Image = document.getElementById('hero-phone-step-2');
  const step3Image = document.getElementById('hero-phone-step-3');
  const step4Image = document.getElementById('hero-phone-step-4');

  // Steps Text (Visible Sticky)
  const step1Text = document.getElementById('hiw-text-1');
  const step2Text = document.getElementById('hiw-text-2');
  const step3Text = document.getElementById('hiw-text-3');
  const step4Text = document.getElementById('hiw-text-4');

  // Steps Triggers (Invisible Ghost)
  const step1Trigger = document.getElementById('hiw-trigger-1');
  const step2Trigger = document.getElementById('hiw-trigger-2');
  const step3Trigger = document.getElementById('hiw-trigger-3');
  const step4Trigger = document.getElementById('hiw-trigger-4');

  if (!phoneContainer || !howItWorksSection || !step1Text || !step1Trigger) return;

  // 1. PINNING
  // Pin the phone container starting when it is centered in the viewport.
  // pinSpacing: false allows the next section (How It Works) to scroll 'under' the pinned element,
  // effectively creating an overlay effect.
  ScrollTrigger.create({
    trigger: phoneContainer,
    start: "center center",
    endTrigger: howItWorksSection,
    end: "bottom bottom",
    pin: true,
    pinSpacing: false,
  });

  // 2. HORIZONTAL MOVEMENT
  // Move the phone to the right as we scroll into the How It Works section
  gsap.fromTo(phoneContainer,
    { x: 0 },
    {
      // Move to roughly the center of the right column (which is 25% width + 50% left)
      // Move to roughly the center of the right column (max 250px offset) on desktop
      // Keep centered (x: 0) on mobile
      x: () => window.innerWidth < 1024 ? 0 : Math.min(window.innerWidth * 0.15, 250),
      ease: "none", // Linear ease for more direct 1:1 scroll control
      scrollTrigger: {
        trigger: howItWorksSection,
        start: "top bottom", // Start moving as soon as section enters view
        end: "top center",   // Finish moving when section is centered
        scrub: true,
        invalidateOnRefresh: true, // Recalculate x value on resize
      }
    }
  );

  // 3. CLEANUP HERO ELEMENTS
  // Fade out hero metrics and glow so they don't overlap the text
  // 3. CLEANUP HERO ELEMENTS
  // Fade out hero metrics so they don't overlap the text (glow persists)
  gsap.to([metricsLeft, metricsRight], {
    opacity: 0,
    scrollTrigger: {
      trigger: howItWorksSection,
      start: "top bottom",
      end: "top center",
      scrub: true
    }
  });


  // Step 1: Active
  ScrollTrigger.create({
    trigger: step1Trigger,
    start: "top center",
    end: "bottom center",
    onEnter: () => setActiveStep(1),
    onEnterBack: () => setActiveStep(1),
  });

  // Step 2: Active
  ScrollTrigger.create({
    trigger: step2Trigger,
    start: "top center",
    end: "bottom center",
    onEnter: () => setActiveStep(2),
    onEnterBack: () => setActiveStep(2),
  });

  // Step 3: Active
  ScrollTrigger.create({
    trigger: step3Trigger,
    start: "top center",
    end: "bottom center",
    onEnter: () => setActiveStep(3),
    onEnterBack: () => setActiveStep(3),
  });

  // Step 4: Active
  ScrollTrigger.create({
    trigger: step4Trigger,
    start: "top center",
    end: "bottom center",
    onEnter: () => setActiveStep(4),
    onEnterBack: () => setActiveStep(4),
  });


  // Initialize step images position
  gsap.set([step2Image, step3Image, step4Image], { y: 100, opacity: 0 });

  function setActiveStep(index: number) {
    // Text Stacking Logic
    const steps = [step1Text, step2Text, step3Text, step4Text];
    steps.forEach((step, i) => {
      if (!step) return;

      if (i + 1 === index) {
        // Current Step: Fully Visible & Highlighted
        gsap.to(step, { opacity: 1, y: 0, duration: 0.5 });
      } else if (i + 1 < index) {
        // Previous Steps: Visible but Dimmed (stacked)
        gsap.to(step, { opacity: 0.4, y: 0, duration: 0.5 });
      } else {
        // Future Steps: Hidden and pushed down
        gsap.to(step, { opacity: 0, y: 20, duration: 0.5 });
      }
    });

    // Image Switching
    if (index === 1) {
      gsap.to(step2Image, { y: 100, opacity: 0, duration: 0.5 });
      gsap.to(step3Image, { y: 100, opacity: 0, duration: 0.5 });
      gsap.to(step4Image, { y: 100, opacity: 0, duration: 0.5 });
    } else if (index === 2) {
      gsap.to(step2Image, { y: 0, opacity: 1, duration: 0.5 });
      gsap.to(step3Image, { y: 100, opacity: 0, duration: 0.5 });
      gsap.to(step4Image, { y: 100, opacity: 0, duration: 0.5 });
    } else if (index === 3) {
      gsap.to(step2Image, { y: 0, opacity: 1, duration: 0.5 });
      gsap.to(step3Image, { y: 0, opacity: 1, duration: 0.5 });
      gsap.to(step4Image, { y: 100, opacity: 0, duration: 0.5 });
    } else if (index === 4) {
      gsap.to(step2Image, { y: 0, opacity: 1, duration: 0.5 });
      gsap.to(step3Image, { y: 0, opacity: 1, duration: 0.5 });
      gsap.to(step4Image, { y: 0, opacity: 1, duration: 0.5 });
    }
  }
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
    // Skip if inside How It Works on tablet/desktop (handled by scrollytelling)
    if (section.id === 'how-it-works' && window.innerWidth >= 768) return;

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
    // Skip hero phone if we are doing scrollytelling (tablet/desktop)
    if (element.id && (element.id === 'hero-phone-step-1') && window.innerWidth >= 768) return;

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
