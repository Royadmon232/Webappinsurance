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
        if (navToggle && navMenu) {
            var closeMenu = function () {
                navMenu.classList.remove('open');
                navToggle.setAttribute('aria-expanded', 'false');
            };
            navToggle.addEventListener('click', function () {
                var isOpen = navMenu.classList.toggle('open');
                navToggle.setAttribute('aria-expanded', String(isOpen));
            });
            navMenu.addEventListener('click', function (e) {
                if (e.target.closest('a')) closeMenu();
            });
            document.addEventListener('keydown', function (e) {
                if (e.key === 'Escape') closeMenu();
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
            window.open(url, '_blank', 'noopener');
            statusBox.className = 'form-status success';
            statusBox.textContent = 'WhatsApp נפתח — נחזור אליכם בהקדם!';
            form.reset();
        });
    });
})();
