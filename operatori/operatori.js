/**
 * DORA - Pagina Operatori
 * Script specifico per operatori.html
 * Gestisce: Form validation, Animated counters, Scroll animations, GDPR tracking
 */

// ========================================
// UTILITIES
// ========================================

const $operatori = (selector) => document.querySelector(selector);
const $$operatori = (selector) => document.querySelectorAll(selector);

// ========================================
// ANIMATED COUNTERS (per stats hero)
// ========================================

class OperatoriCounters {
    constructor() {
        this.counters = $$('.counter[data-target]');
        this.animated = new Set();
        this.init();
    }

    init() {
        if (!this.counters.length) return;

        // Se l'utente preferisce reduced motion, mostra subito il valore finale
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            this.counters.forEach(counter => {
                counter.textContent = counter.dataset.target;
            });
            return;
        }

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !this.animated.has(entry.target)) {
                    this.animated.add(entry.target);
                    this.animateCounter(entry.target);
                }
            });
        }, { threshold: 0.5 });

        this.counters.forEach(counter => observer.observe(counter));
    }

    animateCounter(counter) {
        const target = parseInt(counter.dataset.target);
        const duration = 2000; // 2 secondi
        const startTime = performance.now();

        const update = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Easing function: ease-out cubic
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const currentValue = Math.floor(easeOut * target);

            counter.textContent = currentValue.toLocaleString('it-IT');

            if (progress < 1) {
                requestAnimationFrame(update);
            } else {
                counter.textContent = target.toLocaleString('it-IT');
            }
        };

        requestAnimationFrame(update);
    }
}

// ========================================
// SCROLL ANIMATIONS (per card e step)
// ========================================

class OperatoriScrollAnimations {
    constructor() {
        this.elements = $$('.animate-on-scroll');
        this.init();
    }

    init() {
        if (!this.elements.length) return;

        // Respect reduced motion preference
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            this.elements.forEach(el => el.classList.add('animate-in'));
            return;
        }

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    // Delay staggered per effetto cascata
                    setTimeout(() => {
                        entry.target.classList.add('animate-in');
                    }, index * 100);
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        this.elements.forEach(el => observer.observe(el));
    }
}

// ========================================
// FORM VALIDATION & SUBMISSION
// ========================================

class OperatoriForm {
    constructor() {
        this.form = $operatori('#operatori-form');
        this.successMessage = $operatori('#form-success');
        this.submitBtn = this.form?.querySelector('button[type="submit"]');
        this.btnText = this.submitBtn?.querySelector('.btn-text');
        this.btnLoader = this.submitBtn?.querySelector('.btn-loader');

        this.validators = {
            nome: (value) => {
                if (!value.trim()) return 'Il nome è obbligatorio';
                if (value.trim().length < 2) return 'Il nome deve avere almeno 2 caratteri';
                if (!/^[a-zA-ZÀ-ÿ\s']+$/.test(value.trim())) return 'Il nome contiene caratteri non validi';
                return '';
            },
            email: (value) => {
                if (!value.trim()) return 'L\'email è obbligatoria';
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(value.trim())) return 'Inserisci un\'email valida';
                return '';
            },
            telefono: (value) => {
                if (!value.trim()) return 'Il telefono è obbligatorio';
                // Accetta formati: +39 320 1234567, 3201234567, 320 1234567
                const cleaned = value.replace(/[\s\-\(\)]/g, '');
                const phoneRegex = /^(\+39)?3\d{8,9}$/;
                if (!phoneRegex.test(cleaned)) return 'Inserisci un numero italiano valido (es: 320 1234567)';
                return '';
            },
            professione: (value) => {
                if (!value) return 'Seleziona la tua professione';
                return '';
            },
            provincia: (value) => {
                if (!value.trim()) return 'La provincia è obbligatoria';
                if (value.trim().length < 2) return 'Inserisci una provincia valida';
                return '';
            },
            citta: (value) => {
                if (!value.trim()) return 'La città è obbligatoria';
                if (value.trim().length < 2) return 'Inserisci una città valida';
                return '';
            },
            privacy: (checked) => {
                if (!checked) return 'Devi accettare la Privacy Policy per procedere';
                return '';
            },
            termini: (checked) => {
                if (!checked) return 'Devi accettare i Termini e Condizioni per procedere';
                return '';
            }
        };

        this.init();
    }

    init() {
        if (!this.form) return;

        // Event listeners per validazione in tempo reale
        this.form.querySelectorAll('.form-input').forEach(input => {
            input.addEventListener('blur', (e) => this.validateField(e.target));
            input.addEventListener('input', (e) => {
                if (e.target.classList.contains('error')) {
                    this.validateField(e.target);
                }
            });
        });

        // Checkbox listeners
        this.form.querySelectorAll('.form-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => this.validateCheckbox(e.target));
        });

        // Form submission
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));

        // Prevent default number input behavior
        this.form.querySelectorAll('input[type="number"]').forEach(input => {
            input.addEventListener('wheel', (e) => e.preventDefault());
        });
    }

    validateField(input) {
        const fieldName = input.name;
        const validator = this.validators[fieldName];

        if (!validator) return true;

        const error = validator(input.value);
        const errorElement = $operatori(`#${fieldName}-error`);

        if (error) {
            this.showFieldError(input, errorElement, error);
            return false;
        } else {
            this.clearFieldError(input, errorElement);
            return true;
        }
    }

    validateCheckbox(checkbox) {
        const fieldName = checkbox.name;
        const validator = this.validators[fieldName];

        if (!validator) return true;

        const error = validator(checkbox.checked);
        const errorElement = $operatori(`#${fieldName}-error`);

        if (error) {
            this.showCheckboxError(checkbox, errorElement, error);
            return false;
        } else {
            this.clearCheckboxError(checkbox, errorElement);
            return true;
        }
    }

    showFieldError(input, errorElement, message) {
        input.classList.add('error');
        input.setAttribute('aria-invalid', 'true');
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.setAttribute('role', 'alert');
        }
    }

    clearFieldError(input, errorElement) {
        input.classList.remove('error');
        input.removeAttribute('aria-invalid');
        if (errorElement) {
            errorElement.textContent = '';
            errorElement.removeAttribute('role');
        }
    }

    showCheckboxError(checkbox, errorElement, message) {
        checkbox.setAttribute('aria-invalid', 'true');
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.setAttribute('role', 'alert');
        }
    }

    clearCheckboxError(checkbox, errorElement) {
        checkbox.removeAttribute('aria-invalid');
        if (errorElement) {
            errorElement.textContent = '';
            errorElement.removeAttribute('role');
        }
    }

    validateForm() {
        let isValid = true;
        const requiredFields = this.form.querySelectorAll('[required]');

        requiredFields.forEach(field => {
            if (field.type === 'checkbox') {
                if (!this.validateCheckbox(field)) isValid = false;
            } else {
                if (!this.validateField(field)) isValid = false;
            }
        });

        return isValid;
    }

    async handleSubmit(e) {
        e.preventDefault();

        if (!this.validateForm()) {
            // Scroll to first error
            const firstError = this.form.querySelector('.error, [aria-invalid="true"]');
            if (firstError) {
                firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
                firstError.focus();
            }
            return;
        }

        // Show loading state
        this.setLoadingState(true);

        try {
            // Collect form data
            const formData = new FormData(this.form);
            const data = Object.fromEntries(formData.entries());

            // Add timestamp and metadata
            data.timestamp = new Date().toISOString();
            data.source = 'operatori_pre_registrazione';
            data.consent_version = '1.0';

            // Simulate API call (replace with actual endpoint)
            await this.submitToServer(data);

            // Save to localStorage for tracking
            this.saveToLocalStorage(data);

            // Track conversion (if analytics consent given)
            this.trackConversion(data);

            // Show success
            this.showSuccess();

            console.log('✅ Pre-registrazione operatore completata:', data);

        } catch (error) {
            console.error('❌ Errore invio form:', error);
            this.showError('Si è verificato un errore. Riprova tra qualche minuto.');
        } finally {
            this.setLoadingState(false);
        }
    }

    async submitToServer(data) {
        // TODO: Replace with actual API endpoint
        // Example:
        // const response = await fetch('https://api.chiamadora.it/operatori/register', {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify(data)
        // });
        // if (!response.ok) throw new Error('Server error');

        // Simulate API delay
        return new Promise((resolve) => {
            setTimeout(resolve, 1500);
        });
    }

    saveToLocalStorage(data) {
        try {
            const preRegistrations = JSON.parse(localStorage.getItem('dora_pre_registrations') || '[]');
            preRegistrations.push({
                ...data,
                registration_date: new Date().toISOString()
            });
            localStorage.setItem('dora_pre_registrations', JSON.stringify(preRegistrations));

            // Save consent log for GDPR
            localStorage.setItem('dora_consent_log', JSON.stringify({
                user: data.email,
                timestamp: data.timestamp,
                privacy_accepted: true,
                terms_accepted: true,
                marketing_accepted: data.marketing === 'on',
                ip: 'logged_server_side' // IP logged on server
            }));
        } catch (error) {
            console.warn('⚠️ Impossibile salvare in localStorage:', error);
        }
    }

    trackConversion(data) {
        const consent = JSON.parse(localStorage.getItem('cookieConsent') || '{}');

        if (consent.analytics) {
            // Google Analytics 4 event (se configurato)
            if (typeof gtag !== 'undefined') {
                gtag('event', 'operator_registration', {
                    event_category: 'conversion',
                    event_label: data.professione,
                    value: 1
                });
            }
        }

        if (consent.marketing) {
            // Facebook Pixel event (se configurato)
            if (typeof fbq !== 'undefined') {
                fbq('track', 'Lead', {
                    content_name: 'Operatore DORA',
                    content_category: data.professione
                });
            }
        }
    }

    setLoadingState(loading) {
        if (!this.submitBtn) return;

        if (loading) {
            this.submitBtn.disabled = true;
            if (this.btnText) this.btnText.style.display = 'none';
            if (this.btnLoader) this.btnLoader.style.display = 'flex';
        } else {
            this.submitBtn.disabled = false;
            if (this.btnText) this.btnText.style.display = 'inline-flex';
            if (this.btnLoader) this.btnLoader.style.display = 'none';
        }
    }

    showSuccess() {
        this.form.style.display = 'none';
        if (this.successMessage) {
            this.successMessage.style.display = 'block';
            // Scroll to success message
            this.successMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    showError(message) {
        alert(message); // TODO: Replace with custom modal
    }
}

// ========================================
// SMOOTH SCROLL per anchor links interni
// ========================================

class OperatoriSmoothScroll {
    constructor() {
        this.init();
    }

    init() {
        const links = $$operatori('a[href^="#"]');

        links.forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                if (href === '#' || href === '') return;

                const target = document.querySelector(href);
                if (target) {
                    e.preventDefault();

                    const headerOffset = 100;
                    const elementPosition = target.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                    window.scrollTo({
                        top: offsetPosition,
                        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'
                    });
                }
            });
        });
    }
}

// ========================================
// FORM AUTO-SAVE (draft recovery)
// ========================================

class FormAutoSave {
    constructor() {
        this.form = $operatori('#operatori-form');
        this.storageKey = 'dora_operatori_draft';
        this.init();
    }

    init() {
        if (!this.form) return;

        // Load draft on page load
        this.loadDraft();

        // Save draft on input change (debounced)
        let timeout;
        this.form.querySelectorAll('.form-input').forEach(input => {
            input.addEventListener('input', () => {
                clearTimeout(timeout);
                timeout = setTimeout(() => this.saveDraft(), 1000);
            });
        });

        // Clear draft on successful submission
        this.form.addEventListener('submit', () => {
            setTimeout(() => this.clearDraft(), 2000);
        });
    }

    saveDraft() {
        try {
            const formData = new FormData(this.form);
            const data = Object.fromEntries(formData.entries());
            localStorage.setItem(this.storageKey, JSON.stringify(data));
        } catch (error) {
            console.warn('⚠️ Impossibile salvare draft:', error);
        }
    }

    loadDraft() {
        try {
            const draft = localStorage.getItem(this.storageKey);
            if (!draft) return;

            const data = JSON.parse(draft);
            Object.keys(data).forEach(key => {
                const field = this.form.querySelector(`[name="${key}"]`);
                if (field) {
                    if (field.type === 'checkbox') {
                        field.checked = data[key] === 'on';
                    } else {
                        field.value = data[key];
                    }
                }
            });

            console.log('📝 Draft ripristinato dal localStorage');
        } catch (error) {
            console.warn('⚠️ Impossibile caricare draft:', error);
        }
    }

    clearDraft() {
        localStorage.removeItem(this.storageKey);
    }
}

// ========================================
// TELEPHONE INPUT FORMATTING
// ========================================

class PhoneFormatter {
    constructor() {
        this.phoneInput = $operatori('#telefono');
        this.init();
    }

    init() {
        if (!this.phoneInput) return;

        this.phoneInput.addEventListener('input', (e) => {
            let value = e.target.value.replace(/[^\d+]/g, '');

            // Format: +39 320 1234567
            if (value.startsWith('+39')) {
                value = '+39 ' + value.slice(3).replace(/(\d{3})(\d+)/, '$1 $2');
            } else if (value.startsWith('3')) {
                value = value.replace(/(\d{3})(\d+)/, '$1 $2');
            }

            e.target.value = value.slice(0, 20); // Max length
        });
    }
}

// ========================================
// PROVINCE AUTOCOMPLETE (opzionale)
// ========================================

class ProvinceAutocomplete {
    constructor() {
        this.provinciaInput = $operatori('#provincia');
        this.province = [
            'Agrigento', 'Alessandria', 'Ancona', 'Aosta', 'Arezzo', 'Ascoli Piceno', 'Asti', 'Avellino',
            'Bari', 'Barletta-Andria-Trani', 'Belluno', 'Benevento', 'Bergamo', 'Biella', 'Bologna', 'Bolzano',
            'Brescia', 'Brindisi', 'Cagliari', 'Caltanissetta', 'Campobasso', 'Caserta', 'Catania', 'Catanzaro',
            'Chieti', 'Como', 'Cosenza', 'Cremona', 'Crotone', 'Cuneo', 'Enna', 'Fermo', 'Ferrara', 'Firenze',
            'Foggia', 'Forlì-Cesena', 'Frosinone', 'Genova', 'Gorizia', 'Grosseto', 'Imperia', 'Isernia',
            'L\'Aquila', 'La Spezia', 'Latina', 'Lecce', 'Lecco', 'Livorno', 'Lodi', 'Lucca', 'Macerata',
            'Mantova', 'Massa-Carrara', 'Matera', 'Messina', 'Milano', 'Modena', 'Monza e della Brianza',
            'Napoli', 'Novara', 'Nuoro', 'Oristano', 'Padova', 'Palermo', 'Parma', 'Pavia', 'Perugia',
            'Pesaro e Urbino', 'Pescara', 'Piacenza', 'Pisa', 'Pistoia', 'Pordenone', 'Potenza', 'Prato',
            'Ragusa', 'Ravenna', 'Reggio Calabria', 'Reggio Emilia', 'Rieti', 'Rimini', 'Roma', 'Rovigo',
            'Salerno', 'Sassari', 'Savona', 'Siena', 'Siracusa', 'Sondrio', 'Sud Sardegna', 'Taranto',
            'Teramo', 'Terni', 'Torino', 'Trapani', 'Trento', 'Treviso', 'Trieste', 'Udine', 'Varese',
            'Venezia', 'Verbano-Cusio-Ossola', 'Vercelli', 'Verona', 'Vibo Valentia', 'Vicenza', 'Viterbo'
        ];
        this.init();
    }

    init() {
        if (!this.provinciaInput) return;

        // Create datalist for autocomplete
        const datalist = document.createElement('datalist');
        datalist.id = 'province-list';

        this.province.forEach(prov => {
            const option = document.createElement('option');
            option.value = prov;
            datalist.appendChild(option);
        });

        document.body.appendChild(datalist);
        this.provinciaInput.setAttribute('list', 'province-list');
    }
}

// ========================================
// INITIALIZE ALL MODULES
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('🎯 DORA Operatori - Pagina inizializzata');

    // Inizializza tutti i moduli
    new OperatoriCounters();
    new OperatoriScrollAnimations();
    new OperatoriForm();
    new OperatoriSmoothScroll();
    new FormAutoSave();
    new PhoneFormatter();
    new ProvinceAutocomplete();

    console.log('✅ Moduli operatori caricati:');
    console.log('  - Animated Counters');
    console.log('  - Scroll Animations');
    console.log('  - Form Validation & Submission');
    console.log('  - Smooth Scroll');
    console.log('  - Auto-save Draft');
    console.log('  - Phone Formatter');
    console.log('  - Province Autocomplete');
});

// ========================================
// DEBUG: Export registration data (solo per sviluppo)
// ========================================

if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    window.exportRegistrations = () => {
        const data = JSON.parse(localStorage.getItem('dora_pre_registrations') || '[]');
        console.table(data);
        return data;
    };

    console.log('🛠️ Debug: usa window.exportRegistrations() per vedere le pre-registrazioni');
}