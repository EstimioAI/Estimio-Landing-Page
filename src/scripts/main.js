/**
 * Estimio Landing Page Scripts
 */

document.addEventListener('DOMContentLoaded', function () {
  // ==========================================================================
  // Navigation - Scroll Effect, Mobile Menu, Active States
  // ==========================================================================
  const nav = document.querySelector('.nav');
  const navHamburger = document.querySelector('.nav-hamburger');
  const navMobileMenu = document.querySelector('.nav-mobile-menu');
  const navLinks = document.querySelectorAll('.nav-link');
  const navMobileLinks = document.querySelectorAll('.nav-mobile-link');
  const sections = document.querySelectorAll('section[id]');

  // Scroll effect - add blur enhancement when scrolled
  let lastScrollY = 0;
  let ticking = false;

  function updateNavOnScroll() {
    const scrollY = window.scrollY;

    // Add/remove scrolled class for enhanced blur
    if (scrollY > 50) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }

    // Update active section
    let currentSection = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 120;
      const sectionHeight = section.offsetHeight;
      if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
        currentSection = section.getAttribute('id');
      }
    });

    // Update active link
    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${currentSection}`) {
        link.classList.add('active');
      }
    });

    ticking = false;
  }

  window.addEventListener('scroll', function () {
    lastScrollY = window.scrollY;
    if (!ticking) {
      window.requestAnimationFrame(updateNavOnScroll);
      ticking = true;
    }
  });

  // Mobile menu toggle
  if (navHamburger && navMobileMenu) {
    navHamburger.addEventListener('click', function () {
      const isOpen = navMobileMenu.classList.contains('open');

      if (isOpen) {
        navMobileMenu.classList.remove('open');
        navHamburger.classList.remove('active');
        navHamburger.setAttribute('aria-expanded', 'false');
      } else {
        navMobileMenu.classList.add('open');
        navHamburger.classList.add('active');
        navHamburger.setAttribute('aria-expanded', 'true');
      }
    });

    // Close mobile menu when clicking a link
    navMobileLinks.forEach(link => {
      link.addEventListener('click', function () {
        navMobileMenu.classList.remove('open');
        navHamburger.classList.remove('active');
        navHamburger.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // Smooth scroll for nav links with offset for fixed nav
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;

      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();
        const navHeight = nav.offsetHeight;
        const targetPosition = targetElement.offsetTop - navHeight - 20;

        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    });
  });

  // ==========================================================================
  // Scroll Animations (Intersection Observer)
  // ==========================================================================
  const animatedElements = document.querySelectorAll('.animate-on-scroll');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  animatedElements.forEach(el => observer.observe(el));

  // ==========================================================================
  // Count-up Animation for Metric Values
  // ==========================================================================
  function animateCountUp(element) {
    const target = parseInt(element.dataset.countTo);
    const prefix = element.dataset.prefix || '';
    const suffix = element.dataset.suffix || '';
    const duration = 1500; // 1.5 seconds
    const startTime = performance.now();

    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function (ease-out)
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(easeOut * target);

      element.textContent = prefix + current + suffix;

      if (progress < 1) {
        requestAnimationFrame(update);
      }
    }

    requestAnimationFrame(update);
  }

  // Trigger count-up after metric cards animate in (1.2s delay)
  setTimeout(() => {
    document.querySelectorAll('.countup').forEach(el => {
      animateCountUp(el);
    });
  }, 1200);

  // ==========================================================================
  // Parallax Effect for Hero Phone
  // ==========================================================================
  const heroPhone = document.querySelector('.hero-phone-center');
  const phonesContainer = document.querySelector('.phones-container');

  if (heroPhone && phonesContainer) {
    let ticking = false;

    window.addEventListener('scroll', function () {
      if (!ticking) {
        window.requestAnimationFrame(function () {
          const rect = phonesContainer.getBoundingClientRect();
          const windowHeight = window.innerHeight;

          // Only apply parallax when the section is visible
          if (rect.top < windowHeight && rect.bottom > 0) {
            const scrollProgress = (windowHeight - rect.top) / (windowHeight + rect.height);
            const parallaxOffset = (scrollProgress - 0.5) * 60; // Max 30px movement
            heroPhone.style.transform = `translateY(${parallaxOffset}px)`;
          }

          ticking = false;
        });

        ticking = true;
      }
    });
  }

  // ==========================================================================
  // Enhanced Micro-interactions for Clickable Elements
  // ==========================================================================
  document.querySelectorAll('a, button, .feature-card, .step, .metric-card').forEach(el => {
    el.addEventListener('mouseenter', function () {
      this.style.transition = 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.3s ease';
    });
  });

  // ==========================================================================
  // Staggered Animation for Feature Cards
  // ==========================================================================
  const featureCards = document.querySelectorAll('.feature-card');
  const cardObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
      }
    });
  }, {
    threshold: 0.2,
    rootMargin: '0px 0px -30px 0px'
  });

  featureCards.forEach(card => cardObserver.observe(card));
});
