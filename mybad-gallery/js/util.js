/* ============================================================================
   util.js  -  small helpers and shared state used by every other file
   ============================================================================ */
(function () {
  'use strict';
  var MB = window.MB;
  MB.$ = function (s, r) { return (r || document).querySelector(s); };
  MB.$$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  MB.h = function (tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };
  MB.plural = function (n, w) { return n + ' ' + w + (n === 1 ? '' : 's'); };
  MB.rnd = function (a, b) { return a + Math.random() * (b - a); };
  MB.pick = function (a) { return a[Math.floor(Math.random() * a.length)]; };
  MB.shuffleArray = function (a) {
    a = a.slice();
    for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  };
  MB.store = {
    get: function (k, d) { try { var v = localStorage.getItem(k); return v == null ? d : v; } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  };
  /* keeps Tab inside an open pop-up */
  MB.trap = function (e, root) {
    var f = MB.$$('button,input,select,a[href]', root).filter(function (x) { return !x.disabled && x.offsetParent !== null; });
    if (!f.length) return;
    var i = f.indexOf(document.activeElement);
    if (e.shiftKey && i <= 0) { e.preventDefault(); f[f.length - 1].focus(); }
    else if (!e.shiftKey && (i === -1 || i === f.length - 1)) { e.preventDefault(); f[0].focus(); }
  };
  MB.state = {
    calm: MB.store.get('pg-motion', MB.config.motion) === 'calm',
    sound: MB.store.get('pg-snd', MB.config.sound ? 'on' : 'off') !== 'off',
    gesture: false, filter: 'all', q: ''
  };
})();
