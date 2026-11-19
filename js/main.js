/* ============================================================================
   main.js  -  starts everything, in order. (Everything else is just definitions.)
   ============================================================================ */
(function () {
  'use strict';
  var MB = window.MB;
  MB.protect.guard();
  MB.skins.orderSections();      /* new section order for this visit */
  MB.skins.restyle();            /* new tint, paper, layout and stickers */
  MB.ui.hint();
  MB.effects.title(); MB.effects.drift(); MB.effects.rail();
  MB.gallery.init();
  MB.lightbox.init();
  MB.ui.init();
  MB.effects.planes();
  MB.lightbox.fromHash();
  MB.protect.unlock();           /* asks for the password right away if the site is password-protected */
})();
