/* ============================================================================
   gallery.js  -  the prints: hearts, tabs, search, mix-up, fresh paper, film strip, mouse tilt
   ============================================================================ */
(function () {
  'use strict';
  var MB = window.MB, $ = MB.$, $$ = MB.$$, h = MB.h, plural = MB.plural, rnd = MB.rnd, T = MB.text, S = MB.state;
  var prints = [], sheets = [], favs = [], observer = null, tilts = new Map(), tiltFrame = 0;

  /* ---------- kept-close hearts ---------- */
  try { favs = JSON.parse(MB.store.get('pg-fav', '[]')); if (!Array.isArray(favs)) favs = []; } catch (e) { favs = []; }
  function isFav(id) { return favs.indexOf(id) > -1; }
  function toggleFav(f, x, y) {
    var id = f.dataset.id, i = favs.indexOf(id);
    if (i > -1) favs.splice(i, 1); else favs.push(id);
    MB.store.set('pg-fav', JSON.stringify(favs));
    var on = isFav(id), b = $('.heart', f);
    b.textContent = on ? '♥' : '♡'; b.setAttribute('aria-pressed', String(on));
    b.classList.remove('pop'); void b.offsetWidth; b.classList.add('pop');
    if (on && x != null) MB.effects.burst(x, y);
    MB.sfx(on ? 'spark' : 'tick'); updateSub();
    if (S.filter === 'fav' && !MB.lightbox.isOpen()) apply();
  }
  function addHeart(f) {
    var on = isFav(f.dataset.id), b = h('button', 'heart', on ? '♥' : '♡');
    b.type = 'button'; b.setAttribute('aria-label', 'Keep this photo close'); b.setAttribute('aria-pressed', String(on)); f.appendChild(b);
  }

  /* ---------- tabs, search, counts ---------- */
  function buildTabs() {
    var t = $('#tabs'); t.replaceChildren();
    [['all', 'Everything'], ['fav', 'Kept close ♥']].concat(sheets.map(function (s) { return [s.dataset.sec, s.dataset.title]; })).forEach(function (x) {
      var b = h('button', 'tab', x[1]); b.type = 'button'; b.dataset.f = x[0]; t.appendChild(b);
    });
  }
  function updateSub() {
    var fv = prints.filter(function (f) { return isFav(f.dataset.id); }).length;
    $('#sub').textContent = T.sub(prints.length, sheets.length, fv);
  }
  function reveal() {                         /* fade prints and section headings in as they scroll into view */
    var els = $$('.print:not(.in),.sheet:not(.seen)');
    function mark(e) { e.classList.add(e.classList.contains('print') ? 'in' : 'seen'); }
    if (S.calm || !('IntersectionObserver' in window)) { els.forEach(mark); return; }
    if (!observer) observer = new IntersectionObserver(function (en) { en.forEach(function (x) { if (x.isIntersecting) { mark(x.target); observer.unobserve(x.target); } }); }, { threshold: .12 });
    els.forEach(function (e) { observer.observe(e); });
  }
  function apply() {
    var q = S.q.trim().toLowerCase(), shown = 0;
    prints.forEach(function (f) {
      var hay = (f.dataset.cap + ' ' + $('img', f).alt + ' ' + f.closest('.sheet').dataset.title).toLowerCase();
      f.hidden = !((S.filter !== 'fav' || isFav(f.dataset.id)) && (!q || hay.indexOf(q) > -1));
    });
    sheets.forEach(function (s) {
      var n = $$('.print:not([hidden])', s).length, ok = S.filter === 'all' || S.filter === 'fav' || s.dataset.sec === S.filter;
      $('.count', s).textContent = plural(n, 'photo'); s.hidden = !ok || !n; if (!s.hidden) shown++;
    });
    var none = $('#none'); none.hidden = shown > 0;
    none.textContent = S.filter === 'fav' && !S.q ? T.none.fav : T.none.search;
    $$('.tab').forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.f === S.filter)); });
    updateSub(); reveal();
  }
  function visible() { return prints.filter(function (f) { return !f.hidden && !f.closest('.sheet').hidden; }); }

  /* ---------- mixing things up ---------- */
  function scramble() {                       /* new order inside every section */
    sheets.forEach(function (s) {
      var g = $('.grid', s);
      MB.shuffleArray($$('.print', g)).forEach(function (f, k) { f.style.setProperty('--i', k % 6); g.appendChild(f); });
    });
  }
  function shuffle() {
    var before = new Map();
    prints.forEach(function (f) { if (!f.hidden) before.set(f, f.getBoundingClientRect()); });   /* read first... */
    scramble(); MB.skins.orderSections(); MB.skins.restyle(); sheets = $$('.sheet');
    prints.forEach(MB.skins.roll); buildStrip(); buildTabs(); apply();
    MB.sfx('shuffle'); MB.ui.buzz(); MB.ui.toast(T.toast.shuffle);
    if (S.calm) return;
    var i = 0;                                                                                  /* ...then write (no layout thrash) */
    before.forEach(function (o, f) {
      var n = f.getBoundingClientRect(); f.classList.add('in');
      if (!f.animate || n.bottom < -120 || n.top > innerHeight + 120) return;                   /* only animate what is on screen */
      f.animate([{ transform: 'translate(' + (o.left - n.left) + 'px,' + (o.top - n.top) + 'px) rotate(' + rnd(-70, 70) + 'deg) scale(.6)', opacity: .3 }, { transform: 'none', opacity: 1 }],
        { duration: rnd(800, 1200), delay: (i++) * 25, easing: 'cubic-bezier(.2,.9,.25,1)', fill: 'backwards' });
    });
  }
  function reroll() {
    prints.forEach(MB.skins.roll); MB.sfx('roll'); MB.ui.buzz(); MB.ui.toast(T.toast.reroll);
    if (!S.calm) prints.forEach(function (f, i) {
      if (!f.hidden && f.animate) f.animate([{ transform: 'perspective(600px) rotateY(90deg)', opacity: .2 }, { transform: 'none', opacity: 1 }], { duration: 520, delay: i * 30, easing: 'ease-out', fill: 'backwards' });
    });
  }
  function surprise() { var l = visible(); if (l.length) MB.lightbox.open(MB.pick(l)); }

  /* ---------- film strip (a random handful, small copies only) ---------- */
  function buildStrip() {
    var t = $('#track'); t.replaceChildren();
    var L = MB.shuffleArray($$('.print')).slice(0, MB.config.stripSize);
    [0, 1].forEach(function (copy) {
      L.forEach(function (f) {
        var b = h('button', 'th'), i = new Image();
        i.alt = ''; i.decoding = 'async'; i.draggable = false;
        MB.images.thumb($('img', f)).then(function (u) { i.src = u; }).catch(function () {});
        b.type = 'button'; b.setAttribute('aria-label', 'Open ' + f.dataset.cap);
        if (copy) { b.setAttribute('aria-hidden', 'true'); b.tabIndex = -1; }
        b.appendChild(i);
        b.onclick = function () {
          if (f.hidden || f.closest('.sheet').hidden) { S.filter = 'all'; S.q = ''; $('#q').value = ''; apply(); }
          MB.lightbox.open(f);
        };
        t.appendChild(b);
      });
    });
  }

  /* ---------- smooth 3D tilt under the mouse (eased every frame, never snaps) ---------- */
  function tickTilt() {
    tiltFrame = 0; var more = false;
    tilts.forEach(function (t, f) {
      t.x += (t.tx - t.x) * .12; t.y += (t.ty - t.y) * .12;
      var moving = Math.abs(t.tx - t.x) > .02 || Math.abs(t.ty - t.y) > .02;
      if (!moving && t.tx === 0 && t.ty === 0) { f.classList.remove('tilt'); f.style.setProperty('--rx', '0deg'); f.style.setProperty('--ry', '0deg'); tilts.delete(f); return; }
      f.style.setProperty('--rx', t.x.toFixed(2) + 'deg'); f.style.setProperty('--ry', t.y.toFixed(2) + 'deg'); more = true;
    });
    if (more) tiltFrame = requestAnimationFrame(tickTilt);
  }
  function tiltTo(f, x, y) {
    var t = tilts.get(f) || { x: 0, y: 0, tx: 0, ty: 0 };
    t.tx = x; t.ty = y; tilts.set(f, t); f.classList.add('tilt'); if (!tiltFrame) tiltFrame = requestAnimationFrame(tickTilt);
  }

  function bind() {
    $('#tabs').addEventListener('click', function (e) { var b = e.target.closest('.tab'); if (!b) return; S.filter = b.dataset.f; MB.sfx('tick'); apply(); });
    $('#q').addEventListener('input', function () { S.q = this.value; apply(); });
    $('#shufBtn').onclick = shuffle; $('#rollBtn').onclick = reroll; $('#surBtn').onclick = surprise;
    var main = $('#sheets');
    main.addEventListener('click', function (e) {
      var hb = e.target.closest('.heart');
      if (hb) { var r = hb.getBoundingClientRect(); toggleFav(hb.closest('.print'), r.left + r.width / 2, r.top + r.height / 2); return; }
      var fr = e.target.closest('.frame'); if (fr) MB.lightbox.open(fr.closest('.print'));
    });
    main.addEventListener('pointermove', function (e) {
      if (e.pointerType !== 'mouse' || S.calm) return;
      var f = e.target.closest('.frame'); if (!f) return;
      var r = f.getBoundingClientRect(); tiltTo(f, -((e.clientY - r.top) / r.height - .5) * 9, ((e.clientX - r.left) / r.width - .5) * 11);
    }, { passive: true });
    main.addEventListener('pointerout', function (e) { var f = e.target.closest('.frame'); if (f && !f.contains(e.relatedTarget)) tiltTo(f, 0, 0); });
    main.addEventListener('pointerover', function (e) {
      if (e.pointerType !== 'mouse') return;
      var f = e.target.closest('.frame'); if (f && !f.contains(e.relatedTarget)) MB.sfx('hover', prints.indexOf(f.closest('.print')));
    });
  }

  function init() {
    prints = $$('.print'); sheets = $$('.sheet');
    sheets.forEach(function (s) { s.dataset.title = $('h2', s).textContent; $$('.print', s).forEach(function (f, j) { f.style.setProperty('--i', j % 6); }); });
    prints.forEach(function (f) { f.dataset.cap = $('.cap', f).textContent; MB.skins.roll(f); addHeart(f); });
    MB.images.watch($$('.frame img'));
    buildTabs(); scramble(); buildStrip(); bind(); apply();
  }
  MB.gallery = { init: init, apply: apply, shuffle: shuffle, reroll: reroll, surprise: surprise, visible: visible, reveal: reveal, toggleFav: toggleFav, isFav: isFav, prints: function () { return prints; } };
})();
