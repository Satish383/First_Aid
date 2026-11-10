/* =========================================================
   FIRST AID PLUMBING SPECIALIST — script.js
   Vanilla JavaScript — no dependencies beyond Bootstrap 5
   ========================================================= */

(function () {
    'use strict';

    /* ---------------------------------------------------------
       1. NAVBAR — sticky background transition + active link
       --------------------------------------------------------- */
    const mainNav = document.getElementById('mainNav');
    const navLinks = document.querySelectorAll('.main-nav .nav-link');
    const navbarCollapse = document.getElementById('navMenu');

    function handleNavbarScroll() {
        if (!mainNav) return;
        if (window.scrollY > 30) {
            mainNav.classList.add('scrolled');
        } else {
            mainNav.classList.remove('scrolled');
        }
    }

    window.addEventListener('scroll', handleNavbarScroll, { passive: true });
    handleNavbarScroll();

    // Close mobile menu after clicking a nav link
    navLinks.forEach((link) => {
        link.addEventListener('click', () => {
            if (navbarCollapse && navbarCollapse.classList.contains('show')) {
                const bsCollapse =
                    bootstrap.Collapse.getInstance(navbarCollapse) ||
                    new bootstrap.Collapse(navbarCollapse, { toggle: false });
                bsCollapse.hide();
            }
        });
    });

    // Active nav highlighting via IntersectionObserver
    const sections = document.querySelectorAll('section[id]');
    const navMap = {};

    navLinks.forEach((link) => {
        const href = link.getAttribute('href');
        if (href && href.startsWith('#')) {
            navMap[href.substring(1)] = link;
        }
    });

    function setActiveLink(id) {
        navLinks.forEach((l) => l.classList.remove('active'));
        if (navMap[id]) navMap[id].classList.add('active');
    }

    if ('IntersectionObserver' in window && sections.length) {
        const sectionObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveLink(entry.target.id);
                    }
                });
            },
            { rootMargin: '-45% 0px -50% 0px', threshold: 0 }
        );

        sections.forEach((section) => sectionObserver.observe(section));
    }

    /* ---------------------------------------------------------
       2. SCROLL REVEAL ANIMATIONS
       --------------------------------------------------------- */
    const revealElements = document.querySelectorAll(
        '.reveal-up, .reveal-left, .reveal-right, .reveal-scale'
    );

    if ('IntersectionObserver' in window && revealElements.length) {
        const revealObserver = new IntersectionObserver(
            (entries, observer) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                        observer.unobserve(entry.target);
                    }
                });
            },
            { rootMargin: '0px 0px -8% 0px', threshold: 0.12 }
        );

        revealElements.forEach((el) => revealObserver.observe(el));
    } else {
        // Fallback: show everything
        revealElements.forEach((el) => el.classList.add('visible'));
    }

    /* ---------------------------------------------------------
       3. ANIMATED STATISTICS COUNTERS
       --------------------------------------------------------- */
    const counters = document.querySelectorAll('.counter');

    function animateCounter(el) {
        const target = parseFloat(el.getAttribute('data-target'));
        const decimals = parseInt(el.getAttribute('data-decimals') || '0', 10);
        const duration = 1800;
        const startTime = performance.now();

        function updateCounter(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // easeOutCubic
            const eased = 1 - Math.pow(1 - progress, 3);
            const value = target * eased;

            el.textContent = value.toFixed(decimals);

            if (progress < 1) {
                requestAnimationFrame(updateCounter);
            } else {
                el.textContent = target.toFixed(decimals);
            }
        }

        requestAnimationFrame(updateCounter);
    }

    if ('IntersectionObserver' in window && counters.length) {
        const counterObserver = new IntersectionObserver(
            (entries, observer) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        animateCounter(entry.target);
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.5 }
        );

        counters.forEach((counter) => counterObserver.observe(counter));
    } else {
        counters.forEach((counter) => {
            const target = parseFloat(counter.getAttribute('data-target'));
            const decimals = parseInt(counter.getAttribute('data-decimals') || '0', 10);
            counter.textContent = target.toFixed(decimals);
        });
    }

    /* ---------------------------------------------------------
       4. REVIEW CAROUSEL
       --------------------------------------------------------- */
    const reviewTrack = document.getElementById('reviewTrack');
    const prevBtn = document.getElementById('prevReview');
    const nextBtn = document.getElementById('nextReview');

    if (reviewTrack) {
        const cards = reviewTrack.querySelectorAll('.review-card');
        const totalSlides = cards.length;
        let currentIndex = 0;
        let autoSlideTimer = null;
        const AUTO_DELAY = 5500;

        function goToSlide(index) {
            if (totalSlides === 0) return;
            currentIndex = (index + totalSlides) % totalSlides;
            reviewTrack.style.transform = `translateX(-${currentIndex * 100}%)`;
        }

        function nextSlide() {
            goToSlide(currentIndex + 1);
        }

        function prevSlide() {
            goToSlide(currentIndex - 1);
        }

        function startAutoSlide() {
            stopAutoSlide();
            if (totalSlides > 1) {
                autoSlideTimer = setInterval(nextSlide, AUTO_DELAY);
            }
        }

        function stopAutoSlide() {
            if (autoSlideTimer) {
                clearInterval(autoSlideTimer);
                autoSlideTimer = null;
            }
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                nextSlide();
                startAutoSlide(); // reset timer
            });
        }

        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                prevSlide();
                startAutoSlide();
            });
        }

        // Pause on hover
        reviewTrack.addEventListener('mouseenter', stopAutoSlide);
        reviewTrack.addEventListener('mouseleave', startAutoSlide);

        // Touch swipe support
        let touchStartX = 0;
        let touchEndX = 0;

        reviewTrack.addEventListener(
            'touchstart',
            (e) => {
                touchStartX = e.changedTouches[0].screenX;
                stopAutoSlide();
            },
            { passive: true }
        );

        reviewTrack.addEventListener(
            'touchend',
            (e) => {
                touchEndX = e.changedTouches[0].screenX;
                const diff = touchStartX - touchEndX;

                if (Math.abs(diff) > 45) {
                    if (diff > 0) {
                        nextSlide();
                    } else {
                        prevSlide();
                    }
                }
                startAutoSlide();
            },
            { passive: true }
        );

        // Keyboard accessibility
        if (nextBtn) {
            nextBtn.addEventListener('keydown', (e) => {
                if (e.key === 'ArrowRight') {
                    e.preventDefault();
                    nextSlide();
                }
            });
        }
        if (prevBtn) {
            prevBtn.addEventListener('keydown', (e) => {
                if (e.key === 'ArrowLeft') {
                    e.preventDefault();
                    prevSlide();
                }
            });
        }

        // Init
        goToSlide(0);
        startAutoSlide();

        // Pause when tab hidden
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                stopAutoSlide();
            } else {
                startAutoSlide();
            }
        });
    }

    /* ---------------------------------------------------------
       5. CONTACT FORM VALIDATION + EMAIL HANDOFF
       --------------------------------------------------------- */
    const contactForm = document.getElementById('contactForm');

    if (contactForm) {
        const fullName = document.getElementById('fullName');
        const phone = document.getElementById('phone');
        const email = document.getElementById('email');
        const service = document.getElementById('service');
        const message = document.getElementById('message');

        // Validation patterns
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
        const phonePattern = /^[\d\s()+.\-]{7,20}$/;

        function setInvalid(el, isInvalid) {
            if (!el) return;
            if (isInvalid) {
                el.classList.add('is-invalid');
            } else {
                el.classList.remove('is-invalid');
            }
        }

        function validateField(el, validator) {
            if (!el) return true;
            const value = (el.value || '').trim();
            const valid = validator(value);
            setInvalid(el, !valid);
            return valid;
        }

        // Live validation on blur/input
        [fullName, phone, email, service, message].forEach((field) => {
            if (!field) return;

            field.addEventListener('blur', () => {
                switch (field) {
                    case fullName:
                        setInvalid(field, field.value.trim().length < 2);
                        break;
                    case phone:
                        setInvalid(field, !phonePattern.test(field.value.trim()));
                        break;
                    case email:
                        setInvalid(field, !emailPattern.test(field.value.trim()));
                        break;
                    case service:
                        setInvalid(field, !field.value);
                        break;
                    case message:
                        setInvalid(field, field.value.trim().length < 5);
                        break;
                }
            });

            field.addEventListener('input', () => {
                if (field.classList.contains('is-invalid')) {
                    field.classList.remove('is-invalid');
                }
            });
        });

        contactForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const validName = validateField(fullName, (v) => v.length >= 2);
            const validPhone = validateField(phone, (v) => phonePattern.test(v));
            const validEmail = validateField(email, (v) => emailPattern.test(v));
            const validService = validateField(service, (v) => v.length > 0);
            const validMessage = validateField(message, (v) => v.length >= 5);

            const isValid =
                validName && validPhone && validEmail && validService && validMessage;

            if (!isValid) {
                // Focus first invalid field
                const firstInvalid = contactForm.querySelector('.is-invalid');
                if (firstInvalid) {
                    firstInvalid.focus();
                    firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
                return;
            }

            // ---- EMAIL HANDOFF ----
            // NOTE: This is a frontend-only handoff. It opens the user's email
            // client with a pre-filled message. For true server-side delivery,
            // integrate a backend endpoint or a form service (e.g. Formspree,
            // EmailJS) at this point.
            const businessEmail = 'hello@firstaidplumbing.example'; // TODO: replace with real email when available
            const subject = encodeURIComponent(
                `Plumbing Request — ${service.value} — ${fullName.value.trim()}`
            );
            const bodyLines = [
                'New plumbing service request:',
                '',
                `Full Name: ${fullName.value.trim()}`,
                `Phone: ${phone.value.trim()}`,
                `Email: ${email.value.trim()}`,
                `Service: ${service.value}`,
                '',
                'Message:',
                message.value.trim(),
                '',
                '— Sent from firstaidplumbing website contact form'
            ];
            const body = encodeURIComponent(bodyLines.join('\n'));

            const mailtoLink = `mailto:${businessEmail}?subject=${subject}&body=${body}`;

            // Provide immediate feedback
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalHTML = submitBtn.innerHTML;

            submitBtn.disabled = true;
            submitBtn.innerHTML =
                '<i class="bi bi-check-circle-fill me-2"></i>Opening Email…';

            window.location.href = mailtoLink;

            // Reset UI after a short delay
            setTimeout(() => {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalHTML;
                contactForm.reset();
            }, 2200);

            // Clear any lingering invalid states
            [fullName, phone, email, service, message].forEach((f) => {
                if (f) f.classList.remove('is-invalid');
            });
        });
    }

    /* ---------------------------------------------------------
       6. BACK TO TOP BUTTON
       --------------------------------------------------------- */
    const backToTop = document.getElementById('backToTop');

    function handleBackToTopVisibility() {
        if (!backToTop) return;
        if (window.scrollY > 500) {
            backToTop.classList.add('show');
        } else {
            backToTop.classList.remove('show');
        }
    }

    window.addEventListener('scroll', handleBackToTopVisibility, {
        passive: true
    });
    handleBackToTopVisibility();

    if (backToTop) {
        backToTop.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    /* ---------------------------------------------------------
       7. DYNAMIC COPYRIGHT YEAR
       --------------------------------------------------------- */
    const yearEl = document.getElementById('copyrightYear');
    if (yearEl) {
        yearEl.textContent = new Date().getFullYear();
    }

    /* ---------------------------------------------------------
       8. SMOOTH SCROLL FALLBACK FOR OLDER BROWSERS
       (CSS scroll-behavior handles modern; this ensures anchor
       offsets account for the sticky navbar)
       --------------------------------------------------------- */
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (!targetId || targetId === '#') return;

            const target = document.querySelector(targetId);
            if (!target) return;

            e.preventDefault();

            const navHeight = mainNav ? mainNav.offsetHeight : 0;
            const extraOffset = 16;
            const targetPosition =
                target.getBoundingClientRect().top +
                window.pageYOffset -
                navHeight -
                extraOffset;

            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });

            // Update focus for accessibility
            target.setAttribute('tabindex', '-1');
            target.focus({ preventScroll: true });
        });
    });

    /* ---------------------------------------------------------
       9. IMAGE LAZY-LOAD GRACEFUL FALLBACK
       (Ensures broken images get a styled placeholder)
       --------------------------------------------------------- */
    document.querySelectorAll('img').forEach((img) => {
        img.addEventListener('error', function () {
            if (this.dataset.fallbackApplied) return;
            this.dataset.fallbackApplied = 'true';
            this.style.background =
                'linear-gradient(135deg, #0D2B4A 0%, #0878D1 100%)';
            this.style.objectFit = 'cover';
            this.alt = this.alt || 'Plumbing service image';
        });
    });

    /* ---------------------------------------------------------
       10. HERO ENTRANCE — trigger immediately on load
       --------------------------------------------------------- */
    window.addEventListener('load', () => {
        // Ensure hero elements are revealed even if observer missed them
        document
            .querySelectorAll('.hero-section .reveal-up, .hero-section .reveal-scale')
            .forEach((el, i) => {
                setTimeout(() => el.classList.add('visible'), i * 120);
            });
    });

    /* ---------------------------------------------------------
       11. EMERGENCY CTA PULSE — subtle periodic emphasis
       --------------------------------------------------------- */
    const emergencyPhone = document.querySelector('.emergency-phone');
    if (emergencyPhone) {
        setInterval(() => {
            emergencyPhone.style.transform = 'scale(1.04)';
            setTimeout(() => {
                emergencyPhone.style.transform = 'scale(1)';
            }, 420);
        }, 6000);
    }
})();