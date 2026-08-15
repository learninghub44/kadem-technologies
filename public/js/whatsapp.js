/* ===========================================================
   KADEM TECHNOLOGIES — whatsapp.js
   Builds the WhatsApp deep link from a single source number.
   =========================================================== */
(function () {
  'use strict';

  var WHATSAPP_NUMBER = '254701059192';
  var DEFAULT_MESSAGE = 'Hello Kadem Technologies, I would like to enquire about your services.';

  function buildLink(message) {
    var text = encodeURIComponent(message || DEFAULT_MESSAGE);
    return 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + text;
  }

  document.querySelectorAll('[data-whatsapp-link]').forEach(function (el) {
    var custom = el.getAttribute('data-whatsapp-message');
    el.setAttribute('href', buildLink(custom));
  });

  window.KADEM_WHATSAPP_LINK = buildLink;
})();
