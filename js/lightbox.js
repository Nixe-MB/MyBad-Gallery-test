/* ============================================================================
   lightbox.js  -  the full-screen viewer: next/previous, swipe, zoom, slideshow, share link
   ============================================================================ */
(function () {
  'use strict';
  var MB = window.MB, $ = MB.$, T = MB.text, S = MB.state;
  var list = [], idx = 0, lastFocus = null, timer = null, seq = 0, startX = null;

  function isOpen() { return !$('#lb').hidden; }
  function setHash(id) { try { if (id) history.replaceState(null, '', '#' + id); else history.replaceState(null, '', location.pathname + location.search); } catch (e) {} }
  function open(f) {
    list = MB.gallery.visible(); idx = list.indexOf(f); if (idx < 0) return;
    lastFocus = document.activeElement; $('#lb').hidden = false; document.documentElement.style.overflow = 'hidden';
    show(0); $('#lbClose').focus(); MB.sfx('open');
  }
  function show(dir) {
    var f = list[idx], img = $('img', f), li = $('#lbImg'), pr = $('.lbprint'), tok = ++seq;
    li.classList.remove('zoom'); li.alt = img.alt; li.classList.add('ld');
    MB.images.full(img).then(function (src) {          /* swap in the full-size original once it is ready */
      if (tok !== seq) return;
      var pre = new Image();
      pre.onload = pre.onerror = function () { if (tok === seq) { li.src = src; li.classList.remove('ld'); } };
      pre.src = src;
    }).catch(function () { if (tok === seq) li.classList.remove('ld'); });
    $('#lbCap').textContent = f.dataset.cap;
    ['--pc', '--tex'].forEach(function (k) { pr.style.setProperty(k, f.style.getPropertyValue(k)); });
    $('#lbMeta').textContent = f.closest('.sheet').dataset.title + ', ' + (idx + 1) + ' of ' + list.length;
    $('#lbPrev').hidden = $('#lbNext').hidden = $('#lbPlay').hidden = list.length < 2;
    var kept = MB.gallery.isFav(f.dataset.id);
    $('#lbFav').textContent = kept ? T.labels.kept : T.labels.keep; $('#lbFav').setAttribute('aria-pressed', String(kept));
    if (dir && !S.calm && pr.animate) pr.animate([{ opacity: 0, transform: 'translateX(' + dir * 60 + 'px) rotate(' + dir * 3 + 'deg)' }, { opacity: 1, transform: 'none' }], { duration: 320, easing: 'cubic-bezier(.2,.8,.2,1)' });
    progress(); setHash(f.dataset.id);
  }
  function progress() { var b = $('#prog'); b.classList.remove('run'); if (timer) { void b.offsetWidth; b.classList.add('run'); } }
  function play(on) {
    clearInterval(timer); timer = on ? setInterval(function () { step(1, true); }, MB.config.slideshowMs) : null;
    $('#lbPlay').textContent = on ? T.labels.pause : T.labels.play; progress();
  }
  function step(d, auto) {
    idx = (idx + d + list.length) % list.length; show(d);
    if (auto) MB.sfx('paper'); else { MB.sfx('tick'); if (timer) play(true); }
  }
  function close() {
    play(false); $('#lb').hidden = true; document.documentElement.style.overflow = ''; MB.sfx('close'); setHash('');
    var f = lastFocus; lastFocus = null;
    if (S.filter === 'fav') MB.gallery.apply();
    if (f && document.contains(f)) f.focus();
  }
  function share() {
    var url = location.href.split('#')[0] + '#' + list[idx].dataset.id;
    function ok() { MB.ui.toast(T.toast.copied); }
    function fail() { MB.ui.toast(T.toast.copyFail); }
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(url).then(ok, fail); else fail();
  }
  function fromHash() {                        /* a link like page.html#p12 opens that photo directly */
    var m = /^#(p\d+)$/.exec(location.hash); if (!m) return;
    var f = MB.$$('.print').filter(function (x) { return x.dataset.id === m[1]; })[0];
    if (f && !f.hidden) open(f);
  }

  function init() {
    $('#lbClose').onclick = close; $('#lbPrev').onclick = function () { step(-1); }; $('#lbNext').onclick = function () { step(1); };
    $('#lbPlay').onclick = function () { MB.sfx('tick'); play(!timer); };
    $('#lbShare').onclick = share;
    $('#lbFav').onclick = function () {
      var f = list[idx], r = this.getBoundingClientRect(); MB.gallery.toggleFav(f, r.left + r.width / 2, r.top + r.height / 2);
      var kept = MB.gallery.isFav(f.dataset.id); this.textContent = kept ? T.labels.kept : T.labels.keep; this.setAttribute('aria-pressed', String(kept));
    };
    $('#lb').addEventListener('click', function (e) { if (e.target.id === 'lb' || e.target.id === 'lbStage') close(); });
    var li = $('#lbImg'), stage = $('#lbStage');
    li.addEventListener('click', function (e) {                 /* click to zoom, move the mouse to look around */
      var r = li.getBoundingClientRect(); li.style.setProperty('--ox', ((e.clientX - r.left) / r.width * 100).toFixed(1) + '%'); li.style.setProperty('--oy', ((e.clientY - r.top) / r.height * 100).toFixed(1) + '%');
      li.classList.toggle('zoom'); MB.sfx('tick');
    });
    li.addEventListener('pointermove', function (e) {
      if (!li.classList.contains('zoom') || e.pointerType !== 'mouse') return;
      var r = li.getBoundingClientRect(); li.style.setProperty('--ox', Math.min(100, Math.max(0, (e.clientX - r.left) / r.width * 100)).toFixed(1) + '%'); li.style.setProperty('--oy', Math.min(100, Math.max(0, (e.clientY - r.top) / r.height * 100)).toFixed(1) + '%');
    });
    stage.addEventListener('pointerdown', function (e) { startX = li.classList.contains('zoom') ? null : e.clientX; });
    stage.addEventListener('pointerup', function (e) {
      if (startX == null) return; var dx = e.clientX - startX; startX = null;
      if (Math.abs(dx) > 60 && list.length > 1) step(dx < 0 ? 1 : -1);
    });
    stage.addEventListener('pointercancel', function () { startX = null; });
    document.addEventListener('keydown', function (e) {
      if (!isOpen()) return;
      if (e.key === 'Escape') { e.preventDefault(); close(); }
      else if (e.key === 'Tab') MB.trap(e, $('#lb'));
      else if (list.length > 1 && e.key === 'ArrowRight') step(1);
      else if (list.length > 1 && e.key === 'ArrowLeft') step(-1);
    });
  }
  MB.lightbox = { init: init, open: open, close: close, isOpen: isOpen, fromHash: fromHash };
})();
