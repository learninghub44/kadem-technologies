/* ===========================================================
   KADEM TECHNOLOGIES — contact.js
   Client-side validation + submission to /api/contact.
   Server-side validation and spam protection live in the
   Cloudflare Worker (see /worker/index.js) — never trust
   client-side validation alone.
   =========================================================== */
(function () {
  'use strict';

  var form = document.querySelector('[data-contact-form]');
  if (!form) return;

  var statusBox = form.querySelector('[data-form-status]');
  var submitBtn = form.querySelector('[data-form-submit]');
  var isSubmitting = false;

  var validators = {
    name: function (v) { return v.trim().length >= 2 || 'Enter your full name.'; },
    email: function (v) {
      var re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return re.test(v.trim()) || 'Enter a valid email address.';
    },
    phone: function (v) {
      var re = /^[0-9+()\s-]{7,20}$/;
      return re.test(v.trim()) || 'Enter a valid phone or WhatsApp number.';
    },
    service: function (v) { return v.trim().length > 0 || 'Select the service you need.'; },
    message: function (v) { return v.trim().length >= 10 || 'Add a few details about your project (10+ characters).'; }
  };

  function fieldWrapper(input) { return input.closest('.k-field'); }

  function validateField(input) {
    var name = input.getAttribute('name');
    var validator = validators[name];
    if (!validator) return true;
    var result = validator(input.value);
    var wrapper = fieldWrapper(input);
    if (result === true) {
      wrapper.classList.remove('is-invalid');
      return true;
    }
    wrapper.classList.add('is-invalid');
    var errorEl = wrapper.querySelector('.k-field__error');
    if (errorEl) errorEl.textContent = result;
    return false;
  }

  form.querySelectorAll('input, textarea, select').forEach(function (input) {
    input.addEventListener('blur', function () { validateField(input); });
  });

  function setStatus(type, message) {
    if (!statusBox) return;
    statusBox.textContent = message;
    statusBox.className = 'k-form-status is-visible k-form-status--' + type;
  }

  function clearStatus() {
    if (!statusBox) return;
    statusBox.className = 'k-form-status';
    statusBox.textContent = '';
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (isSubmitting) return;

    var inputs = Array.prototype.slice.call(form.querySelectorAll('input, textarea, select'));
    var valid = inputs.reduce(function (ok, input) { return validateField(input) && ok; }, true);

    if (!valid) {
      setStatus('error', 'Please fix the highlighted fields and try again.');
      return;
    }

    var payload = {};
    inputs.forEach(function (input) { payload[input.name] = input.value.trim(); });
    /* Honeypot field — bots tend to fill every input, humans never see this one. */
    var honeypot = form.querySelector('[name="company_website"]');
    if (honeypot && honeypot.value) return; // silently drop likely spam

    isSubmitting = true;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending…';
    clearStatus();

    fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(function (res) {
        if (!res.ok) throw new Error('request_failed');
        return res.json();
      })
      .then(function () {
        setStatus('success', 'Thank you. Your message has been sent — Kadem Technologies will respond to ' + payload.email + ' shortly.');
        form.reset();
      })
      .catch(function () {
        setStatus('error', 'Something went wrong sending your message. Please try again, or reach us directly on WhatsApp at +254 701 059 192 or email support@christech.co.ke.');
      })
      .finally(function () {
        isSubmitting = false;
        submitBtn.disabled = false;
        submitBtn.textContent = 'Send Message';
      });
  });
})();
