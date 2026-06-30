/**
 * DORA - Script Principale
 * Funzionalità globali: Menu mobile, Cookie banner, Scroll effects, Header sticky
 */

// ========================================
// UTILITIES
// ========================================

/**
 * Seleziona un elemento DOM
 * @param {string} selector - Selettore CSS
 * @returns {HTMLElement|null}
 */
const $ = (selector) => document.querySelector(selector);

/**
 * Seleziona tutti gli elementi DOM
 * @param {string} selector - Selettore CSS
 * @returns {NodeList}
 */
const $$ = (selector) => document.querySelectorAll(selector);

/**
 * Controlla se l'utente preferisce reduced motion
 * @returns {boolean}
 */
const prefersReducedMotion = () => {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

// ========================================
// MENU MOBILE
// ========================================

class MobileMenu {
    constructor() {
        this.toggle = $('#nav-toggle');
        this.menu = $('#nav-menu');
        this.links = $$('.nav-link');
        this.isOpen = false;

        this.init();
    }

    init() {
        if (!this.toggle || !this.menu) return;

        // Toggle menu
        this.toggle.addEventListener('click', () => this.toggleMenu());

        // Chiudi menu al click sui link
        this.links.forEach(link => {
            link.addEventListener('click', () => {
                if (this.isOpen) this.closeMenu();
            });
        });

        // Chiudi menu con ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.closeMenu();
            }
        });

        // Chiudi menu al click fuori
        document.addEventListener('click', (e) => {
            if (this.isOpen && !this.menu.contains(e.target) && !this.toggle.contains(e.target)) {
                this.closeMenu();
            }
        });
    }

    toggleMenu() {
        this.isOpen ? this.closeMenu() : this.openMenu();
    }

    openMenu() {
        this.toggle.classList.add('active');
        this.menu.classList.add('active');
        this.toggle.setAttribute('aria-expanded', 'true');
        this.isOpen = true;

        // Blocca scroll del body
        document.body.style.overflow = 'hidden';

        // Focus management per accessibilità
        this.links[0]?.focus();
    }

    closeMenu() {
        this.toggle.classList.remove('active');
        this.menu.classList.remove('active');
        this.toggle.setAttribute('aria-expanded', 'false');
        this.isOpen = false;

        // Riattiva scroll del body
        document.body.style.overflow = '';

        // Ritorna focus al toggle
        this.toggle.focus();
    }
}

// ========================================
// COOKIE BANNER GDPR
// ========================================

class CookieBanner {
    constructor() {
        this.banner = $('#cookie-banner');
        this.btnAccept = $('#cookie-accept');
        this.btnReject = $('#cookie-reject');
        this.btnCustomize = $('#cookie-customize');

        this.init();
    }

    init() {
        if (!this.banner) return;

        // Controlla se il consenso è già stato dato
        const consent = localStorage.getItem('cookieConsent');

        if (!consent) {
            // Mostra banner dopo breve delay
            setTimeout(() => {
                this.showBanner();
            }, 1000);
        }

        // Event listeners
        if (this.btnAccept) {
            this.btnAccept.addEventListener('click', () => this.acceptAll());
        }

        if (this.btnReject) {
            this.btnReject.addEventListener('click', () => this.rejectAll());
        }

        if (this.btnCustomize) {
            this.btnCustomize.addEventListener('click', () => this.customize());
        }
    }

    showBanner() {
        this.banner.style.display = 'block';
    }

    hideBanner() {
        this.banner.style.display = 'none';
    }

    /**
     * Accetta tutti i cookie
     */
    acceptAll() {
        const consent = {
            necessary: true,
            analytics: true,
            marketing: true,
            timestamp: new Date().toISOString(),
            version: '1.0'
        };

        localStorage.setItem('cookieConsent', JSON.stringify(consent));
        this.hideBanner();
        this.loadScripts();

        console.log('✅ Cookie accettati:', consent);
    }

    /**
     * Rifiuta tutti i cookie non necessari
     */
    rejectAll() {
        const consent = {
            necessary: true,
            analytics: false,
            marketing: false,
            timestamp: new Date().toISOString(),
            version: '1.0'
        };

        localStorage.setItem('cookieConsent', JSON.stringify(consent));
        this.hideBanner();

        // Carica solo script necessari (nessun analytics/marketing)
        console.log('❌ Cookie non necessari rifiutati:', consent);
    }

    /**
     * Personalizza cookie (redirect a pagina preferenze)
     */
    customize() {
        // Per ora redirect a cookie policy
        // In futuro: apri modal con checkbox personalizzati
        window.location.href = 'cookie/cookie-policy.html';
    }

    /**
     * Carica script di terze parti (analytics, marketing) dopo consenso
     */
    loadScripts() {
        const consent = JSON.parse(localStorage.getItem('cookieConsent') || '{}');

        if (consent.analytics) {
            // TODO: Carica Google Analytics o equivalente
            console.log('📊 Analytics caricati');
        }

        if (consent.marketing) {
            // TODO: Carica Facebook Pixel, Google Ads, etc.
            console.log('📢 Marketing caricati');
        }
    }
}

// ========================================
// HEADER STICKY
// ========================================

class StickyHeader {
    constructor() {
        this.header = $('#header');
        this.scrollThreshold = 100;

        this.init();
    }

    init() {
        if (!this.header) return;

        let lastScroll = 0;

        window.addEventListener('scroll', () => {
            const currentScroll = window.pageYOffset;

            // Aggiungi classe scrolled se oltre threshold
            if (currentScroll > this.scrollThreshold) {
                this.header.classList.add('scrolled');
            } else {
                this.header.classList.remove('scrolled');
            }

            lastScroll = currentScroll;
        }, { passive: true });
    }
}

// ========================================
// SCROLL ANIMATIONS (Intersection Observer)
// ========================================

class ScrollAnimations {
    constructor() {
        this.options = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        this.init();
    }

    init() {
        // Se l'utente preferisce reduced motion, non animare
        if (prefersReducedMotion()) {
            console.log('🔇 Reduced motion: animazioni disabilitate');
            return;
        }

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                    observer.unobserve(entry.target);
                }
            });
        }, this.options);

        // Osserva tutti gli elementi con classe animate-on-scroll
        const elements = $$('.animate-on-scroll');
        elements.forEach(el => observer.observe(el));
    }
}

// ========================================
// SMOOTH SCROLL
// ========================================

class SmoothScroll {
    constructor() {
        this.init();
    }

    init() {
        const links = $$('a[href^="#"]');

        links.forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');

                // Ignora link vuoti o solo #
                if (href === '#' || href === '') return;

                const target = document.querySelector(href);

                if (target) {
                    e.preventDefault();

                    const headerOffset = 100;
                    const elementPosition = target.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                    window.scrollTo({
                        top: offsetPosition,
                        behavior: prefersReducedMotion() ? 'auto' : 'smooth'
                    });
                }
            });
        });
    }
}

// ========================================
// SCROLL INDICATOR
// ========================================

class ScrollIndicator {
    constructor() {
        this.indicator = $('.scroll-indicator');
        this.target = $('#ecosistema');

        this.init();
    }

    init() {
        if (!this.indicator || !this.target) return;

        this.indicator.addEventListener('click', () => {
            const offsetPosition = this.target.getBoundingClientRect().top + window.pageYOffset - 100;

            window.scrollTo({
                top: offsetPosition,
                behavior: prefersReducedMotion() ? 'auto' : 'smooth'
            });
        });
    }
}

// ========================================
// ANIMATED COUNTERS (per badge hero)
// ========================================

class AnimatedCounters {
    constructor() {
        this.counters = $$('.counter[data-target]');

        this.init();
    }

    init() {
        if (prefersReducedMotion() || this.counters.length === 0) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateCounter(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        this.counters.forEach(counter => observer.observe(counter));
    }

    animateCounter(counter) {
        const target = +counter.getAttribute('data-target');
        const duration = 2000;
        const step = target / (duration / 16);
        let current = 0;

        const updateCounter = () => {
            current += step;

            if (current < target) {
                counter.textContent = Math.floor(current);
                requestAnimationFrame(updateCounter);
            } else {
                counter.textContent = target;
            }
        };

        updateCounter();
    }
}

// ========================================
// FORM VALIDATION HELPER
// ========================================

class FormValidation {
    /**
     * Valida un campo email
     * @param {string} email
     * @returns {boolean}
     */
    static isValidEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }

    /**
     * Valida un numero di telefono italiano
     * @param {string} phone
     * @returns {boolean}
     */
    static isValidPhone(phone) {
        const regex = /^(\+39)?\s?3\d{2}\s?\d{6,7}$/;
        return regex.test(phone.replace(/\s/g, ''));
    }

    /**
     * Mostra errore su un campo
     * @param {HTMLElement} input
     * @param {string} message
     */
    static showError(input, message) {
        input.classList.add('error');
        const errorEl = input.nextElementSibling;
        if (errorEl && errorEl.classList.contains('form-error')) {
            errorEl.textContent = message;
        }
    }

    /**
     * Rimuove errore da un campo
     * @param {HTMLElement} input
     */
    static clearError(input) {
        input.classList.remove('error');
        const errorEl = input.nextElementSibling;
        if (errorEl && errorEl.classList.contains('form-error')) {
            errorEl.textContent = '';
        }
    }
}

// ========================================
// ACCESSIBILITY HELPERS
// ========================================

class Accessibility {
    constructor() {
        this.init();
    }

    init() {
        // Focus visible per keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                document.body.classList.add('user-is-tabbing');
            }
        });

        document.addEventListener('mousedown', () => {
            document.body.classList.remove('user-is-tabbing');
        });

        // Skip to main content link
        const skipLink = $('.skip-link');
        if (skipLink) {
            skipLink.addEventListener('click', (e) => {
                e.preventDefault();
                const main = $('main');
                if (main) {
                    main.setAttribute('tabindex', '-1');
                    main.focus();
                }
            });
        }
    }
}

// ========================================
// PERFORMANCE: LAZY LOAD IMAGES
// ========================================

class LazyLoadImages {
    constructor() {
        this.init();
    }

    init() {
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;

                        if (img.dataset.src) {
                            img.src = img.dataset.src;
                            img.removeAttribute('data-src');
                        }

                        img.classList.add('loaded');
                        imageObserver.unobserve(img);
                    }
                });
            });

            const images = $$('img[data-src]');
            images.forEach(img => imageObserver.observe(img));
        } else {
            // Fallback per browser vecchi
            this.loadAllImages();
        }
    }

    loadAllImages() {
        const images = $$('img[data-src]');
        images.forEach(img => {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
        });
    }
}

// ========================================
// INITIALIZE ALL MODULES
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 DORA - Sito inizializzato');

    // Inizializza tutti i moduli
    new MobileMenu();
    new CookieBanner();
    new StickyHeader();
    new ScrollAnimations();
    new SmoothScroll();
    new ScrollIndicator();
    new AnimatedCounters();
    new Accessibility();
    new LazyLoadImages();

    // Log per debug
    console.log('✅ Moduli caricati:');
    console.log('  - Menu Mobile');
    console.log('  - Cookie Banner GDPR');
    console.log('  - Header Sticky');
    console.log('  - Scroll Animations');
    console.log('  - Smooth Scroll');
    console.log('  - Accessibility Helpers');
    console.log('  - Lazy Load Images');
});

// ========================================
// GLOBAL ERROR HANDLER
// ========================================

window.addEventListener('error', (e) => {
    console.error('❌ Errore JavaScript:', e.message);
    console.error('File:', e.filename);
    console.error('Linea:', e.lineno);
});

// ========================================
// PERFORMANCE MONITORING
// ========================================

window.addEventListener('load', () => {
    const loadTime = performance.now();
    console.log(`⏱️ Pagina caricata in ${Math.round(loadTime)}ms`);
});