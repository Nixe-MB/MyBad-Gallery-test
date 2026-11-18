/* ============================================================================
   protect.js  -  image loading + optional encryption
   Normal build:    images are plain files (light deterrents only: no right-click save, no dragging).
   Protected build: every image file is AES-256-GCM encrypted (.enc) and is decrypted in the visitor's
                    browser. Opened straight from the folder the files are unreadable; with a password
                    (see set-password.html) they stay unreadable to anyone without it.
   Honest note: anything a screen can show can be screenshotted. This keeps casual copying out, not a determined person.
   ============================================================================ */
(function () {
  'use strict';
  var MB = window.MB, $ = MB.$, h = MB.h, T = MB.text;
  var enabled = !!(MB.config.protect && MB.config.protect.enabled), keyPromise = null, cache = new Map();

  function b64(s) { var b = atob(s), a = new Uint8Array(b.length); for (var i = 0; i < b.length; i++) a[i] = b.charCodeAt(i); return a; }
  function importKey(raw) { return crypto.subtle.importKey('raw', raw, { name: 'AES-GCM' }, false, ['decrypt']); }

  function askPassword(message) {
    return new Promise(function (resolve) {
      var box = h('div', 'panelbox'), o = h('div', 'overlay panel gate'), inp = h('input'), go = h('button', 'btn primary', T.gate.button);
      o.setAttribute('role', 'dialog'); o.setAttribute('aria-modal', 'true');
      inp.type = 'password'; inp.autocomplete = 'current-password'; inp.setAttribute('aria-label', 'Password');
      box.appendChild(h('h2', null, T.gate.title));
      box.appendChild(h('p', null, message || T.gate.body)); box.appendChild(inp); box.appendChild(go); o.appendChild(box);
      function submit() { if (!inp.value) return; o.remove(); resolve(inp.value); }
      go.onclick = submit; inp.onkeydown = function (e) { if (e.key === 'Enter') submit(); };
      document.body.appendChild(o); inp.focus();
    });
  }
  function passwordKey() {
    var K = MB.keys;
    try { var saved = sessionStorage.getItem('mb-k'); if (saved) return importKey(b64(saved)); } catch (e) {}
    function attempt(message) {
      return askPassword(message).then(function (pw) {
        return crypto.subtle.importKey('raw', new TextEncoder().encode(pw), 'PBKDF2', false, ['deriveKey'])
          .then(function (base) { return crypto.subtle.deriveKey({ name: 'PBKDF2', salt: b64(K.salt), iterations: K.iter, hash: 'SHA-256' }, base, { name: 'AES-GCM', length: 256 }, false, ['decrypt']); })
          .then(function (dk) { return crypto.subtle.decrypt({ name: 'AES-GCM', iv: b64(K.iv) }, dk, b64(K.wrapped)); })
          .then(function (raw) {
            try { sessionStorage.setItem('mb-k', btoa(String.fromCharCode.apply(null, new Uint8Array(raw)))); } catch (e) {}
            return importKey(raw);
          }, function () { return attempt(T.toast.gateBad); });
      });
    }
    return attempt('');
  }
  function getKey() {
    if (!keyPromise) keyPromise = (MB.keys && MB.keys.mode === 'password') ? passwordKey() : importKey(b64(MB.keys.k));
    return keyPromise;
  }
  function load(url) {                       /* url -> Promise of a blob: address, decrypted once and cached */
    if (!cache.has(url)) cache.set(url, fetch(url)
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.arrayBuffer(); })
      .then(function (buf) { return getKey().then(function (k) { return crypto.subtle.decrypt({ name: 'AES-GCM', iv: new Uint8Array(buf, 0, 12) }, k, buf.slice(12)); }); })
      .then(function (data) { return URL.createObjectURL(new Blob([data], { type: 'image/jpeg' })); }));
    return cache.get(url);
  }
  function hydrate(img) { load(img.dataset.enc).then(function (u) { img.src = u; }).catch(function () {}); }

  MB.images = {
    watch: function (imgs) {                 /* decrypt thumbnails only when they are about to scroll into view */
      if (!enabled) return;
      var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (en) {
        en.forEach(function (x) { if (x.isIntersecting) { io.unobserve(x.target); hydrate(x.target); } });
      }, { rootMargin: '900px 0px' }) : null;
      imgs.forEach(function (i) { if (io) io.observe(i); else hydrate(i); });
    },
    thumb: function (img) { return enabled ? load(img.dataset.enc) : Promise.resolve(img.currentSrc || img.src); },
    full: function (img) { return enabled ? load(img.dataset.fullEnc) : Promise.resolve(img.dataset.full || img.currentSrc || img.src); }
  };
  MB.protect = {
    enabled: enabled,
    unlock: function () { return enabled ? getKey() : Promise.resolve(); },
    guard: function () {                      /* light deterrents, always on */
      document.addEventListener('contextmenu', function (e) { if (e.target.closest && e.target.closest('.frame,.lbprint,.th')) e.preventDefault(); });
      document.addEventListener('dragstart', function (e) { if (e.target.tagName === 'IMG') e.preventDefault(); });
    }
  };
})();
