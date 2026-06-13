/* Admon Insurance Agency — site behavior (RTL, Hebrew) */
(function () {
    'use strict';

    var WHATSAPP_NUMBER = '972509313531';

    /* Clean up any legacy service worker */
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then(function (regs) {
            regs.forEach(function (reg) { reg.unregister(); });
        }).catch(function () {});
        if (window.caches && caches.keys) {
            caches.keys().then(function (keys) {
                keys.forEach(function (key) { caches.delete(key); });
            }).catch(function () {});
        }
    }

    document.addEventListener('DOMContentLoaded', function () {
        /* Current year in footer */
        document.querySelectorAll('[data-year]').forEach(function (el) {
            el.textContent = new Date().getFullYear();
        });

        /* Animated number counters (run when scrolled into view) */
        var prefersReduced = window.matchMedia &&
            window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        function animateCount(el) {
            var target = parseFloat(el.getAttribute('data-count-to')) || 0;
            var format = el.getAttribute('data-count-format');
            var prefix = el.getAttribute('data-count-prefix') || '';
            var suffix = el.getAttribute('data-count-suffix') || '';
            var duration = target >= 1000000 ? 2200 : 1500;

            function render(value) {
                var n = Math.round(value);
                var text = format === 'comma' ? n.toLocaleString('en-US') : String(n);
                el.textContent = prefix + text + suffix;
            }
            if (prefersReduced || !window.requestAnimationFrame) {
                render(target);
                return;
            }
            var startTime = null;
            function easeOutExpo(t) { return t >= 1 ? 1 : 1 - Math.pow(2, -10 * t); }
            function frame(now) {
                if (startTime === null) startTime = now;
                var progress = Math.min((now - startTime) / duration, 1);
                render(target * easeOutExpo(progress));
                if (progress < 1) {
                    window.requestAnimationFrame(frame);
                } else {
                    render(target);
                }
            }
            window.requestAnimationFrame(frame);
        }

        var counters = document.querySelectorAll('[data-count-to]');
        if (counters.length) {
            if ('IntersectionObserver' in window) {
                var counterObserver = new IntersectionObserver(function (entries) {
                    entries.forEach(function (entry) {
                        if (entry.isIntersecting) {
                            animateCount(entry.target);
                            counterObserver.unobserve(entry.target);
                        }
                    });
                }, { threshold: 0.4 });
                counters.forEach(function (c) { counterObserver.observe(c); });
            } else {
                counters.forEach(animateCount);
            }
        }

        /* Header shadow on scroll */
        var header = document.querySelector('.site-header');
        if (header) {
            var onScroll = function () {
                header.classList.toggle('scrolled', window.scrollY > 8);
            };
            window.addEventListener('scroll', onScroll, { passive: true });
            onScroll();
        }

        /* Mobile navigation */
        var navToggle = document.querySelector('.nav-toggle');
        var navMenu = document.getElementById('nav-menu');
        var submenuToggle = document.querySelector('.submenu-toggle');
        var submenuLi = submenuToggle ? submenuToggle.closest('.has-submenu') : null;

        var closeSubmenu = function () {
            if (submenuLi) {
                submenuLi.classList.remove('submenu-open');
                submenuToggle.setAttribute('aria-expanded', 'false');
            }
        };

        if (navToggle && navMenu) {
            var closeMenu = function () {
                navMenu.classList.remove('open');
                navToggle.setAttribute('aria-expanded', 'false');
                closeSubmenu();
            };
            navToggle.addEventListener('click', function () {
                var isOpen = navMenu.classList.toggle('open');
                navToggle.setAttribute('aria-expanded', String(isOpen));
                if (!isOpen) closeSubmenu();
            });
            navMenu.addEventListener('click', function (e) {
                if (e.target.closest('a')) closeMenu();
            });
            document.addEventListener('keydown', function (e) {
                if (e.key === 'Escape') closeMenu();
            });
        }

        /* Dropdown submenu (תחומי שירות) */
        if (submenuToggle && submenuLi) {
            submenuToggle.addEventListener('click', function (e) {
                e.preventDefault();
                var open = submenuLi.classList.toggle('submenu-open');
                submenuToggle.setAttribute('aria-expanded', String(open));
            });
            document.addEventListener('click', function (e) {
                if (!e.target.closest('.has-submenu')) closeSubmenu();
            });
        }

        /* Service cards: preselect interest and jump to lead form */
        var interestSelect = document.getElementById('lead-interest');
        document.querySelectorAll('[data-interest]').forEach(function (el) {
            el.addEventListener('click', function (e) {
                var value = el.getAttribute('data-interest');
                if (interestSelect && value) {
                    e.preventDefault();
                    var option = Array.prototype.find.call(interestSelect.options, function (opt) {
                        return opt.value === value;
                    });
                    interestSelect.value = option ? value : 'אחר';
                    var lead = document.getElementById('lead');
                    if (lead) lead.scrollIntoView({ behavior: 'smooth' });
                    var nameInput = document.getElementById('lead-name');
                    if (nameInput) {
                        window.setTimeout(function () {
                            nameInput.focus({ preventScroll: true });
                        }, 450);
                    }
                }
            });
        });

        /* Build prefilled WhatsApp URL */
        function buildWhatsAppUrl(interest, name, phone, note) {
            var lines = ['שלום, אשמח שנציג מאדמון סוכנות לביטוח יחזור אליי בנושא: ' +
                (interest || 'ביטוח ופיננסים') + '.'];
            if (name) lines.push('שם: ' + name);
            if (phone) lines.push('טלפון: ' + phone);
            if (note) lines.push('הערה: ' + note);
            return 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(lines.join('\n'));
        }

        /* Open WhatsApp reliably on desktop and mobile.
           Try a new tab; if the browser blocks it, fall back to same-tab navigation. */
        function openWhatsApp(url) {
            var win = window.open(url, '_blank');
            if (win) {
                win.opener = null;
            } else {
                window.location.href = url;
            }
        }

        /* Static WhatsApp links with optional fixed topic */
        document.querySelectorAll('a[data-whatsapp]').forEach(function (link) {
            link.addEventListener('click', function () {
                link.href = buildWhatsAppUrl(link.getAttribute('data-whatsapp') || '');
            });
            link.href = buildWhatsAppUrl(link.getAttribute('data-whatsapp') || '');
        });

        /* Lead form — opens WhatsApp directly, no backend */
        var form = document.getElementById('lead-form');
        if (!form) return;

        var nameField = document.getElementById('lead-name');
        var phoneField = document.getElementById('lead-phone');
        var noteField = document.getElementById('lead-note');
        var statusBox = document.getElementById('lead-status');

        function isValidIsraeliPhone(value) {
            var digits = (value || '').replace(/[^\d]/g, '');
            return /^0(5\d{8}|[23489]\d{7}|7\d{8})$/.test(digits);
        }

        function setFieldError(field, hasError) {
            var group = field.closest('.form-group');
            if (group) group.classList.toggle('invalid', hasError);
        }

        function validate() {
            var ok = true;
            if (!nameField.value.trim() || nameField.value.trim().length < 2) {
                setFieldError(nameField, true); ok = false;
            } else {
                setFieldError(nameField, false);
            }
            if (!isValidIsraeliPhone(phoneField.value)) {
                setFieldError(phoneField, true); ok = false;
            } else {
                setFieldError(phoneField, false);
            }
            if (interestSelect && !interestSelect.value) {
                setFieldError(interestSelect, true); ok = false;
            } else if (interestSelect) {
                setFieldError(interestSelect, false);
            }
            return ok;
        }

        [nameField, phoneField, interestSelect].forEach(function (field) {
            if (!field) return;
            field.addEventListener('input', function () { setFieldError(field, false); });
            field.addEventListener('change', function () { setFieldError(field, false); });
        });

        form.addEventListener('submit', function (e) {
            e.preventDefault();
            if (!validate()) {
                statusBox.className = 'form-status error';
                statusBox.textContent = 'אנא בדקו את השדות המסומנים ונסו שוב.';
                return;
            }
            var interest = interestSelect ? interestSelect.value : '';
            var name = nameField.value.trim();
            var phone = phoneField.value.trim();
            var note = noteField ? noteField.value.trim() : '';
            var url = buildWhatsAppUrl(interest, name, phone, note);
            openWhatsApp(url);
            statusBox.className = 'form-status success';
            statusBox.innerHTML = 'מעבירים אתכם ל‑WhatsApp… אם החלון לא נפתח, ' +
                '<a href="' + url + '" target="_blank" rel="noopener">לחצו כאן</a>.';
            form.reset();
        });
    });
})();
