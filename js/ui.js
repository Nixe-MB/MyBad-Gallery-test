/* ============================================================================
   ui.js  -  buttons that change how the site behaves: theme, sound, motion, layout,
   shortcuts, pop-up panels, toast, back-to-top
   ============================================================================ */
(function () {
  'use strict';
  var MB = window.MB, $ = MB.$, $$ = MB.$$, T = MB.text, L = MB.text.labels, S = MB.state, root = document.documentElement, toastTimer;

  function toast(m) { var t = $('#toast'); if (!t) return; t.textContent = m; t.classList.add('on'); clearTimeout(toastTimer); toastTimer = setTimeout(function () { t.classList.remove('on'); }, 2600); }
  function buzz() { try { if (navigator.vibrate) navigator.vibrate(18); } catch (e) {} }
  function hint() { var e = $('.hint'); if (e) e.textContent = MB.pick(T.hints); }

  /* ---------- theme ---------- */
  function isDark() { var t = root.dataset.theme; return t ? t === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches; }
  function themeLabel() { var b = $('#themeBtn'); if (b) b.textContent = isDark() ? L.themeLight : L.themeDark; }
  function toggleTheme() { var t = isDark() ? 'light' : 'dark'; root.dataset.theme = t; MB.store.set('pg-theme', t); themeLabel(); MB.sfx('toggle'); }

  /* ---------- sound, motion, layout ---------- */
  function soundLabel() { var b = $('#sndBtn'); b.textContent = S.sound ? L.soundOn : L.soundOff; b.setAttribute('aria-pressed', String(S.sound)); }
  function toggleSound() { S.sound = !S.sound; MB.store.set('pg-snd', S.sound ? 'on' : 'off'); soundLabel(); MB.sfx('tick'); }
  function motionLabel() { var b = $('#motBtn'); b.textContent = S.calm ? L.motionOff : L.motionOn; b.setAttribute('aria-pressed', String(!S.calm)); root.classList.toggle('calm', S.calm); }
  function toggleMotion() {
    S.calm = !S.calm; MB.store.set('pg-motion', S.calm ? 'calm' : 'full'); motionLabel();
    if (!S.calm) MB.effects.drift();
    MB.gallery.reveal(); MB.sfx('toggle');
  }
  var DENSITY = [null, '1.3', '.8'], density = parseInt(MB.store.get('pg-den', '0'), 10) || 0;
  function layoutLabel() {
    var b = $('#denBtn'); b.textContent = L.layout + L.layouts[density];
    if (DENSITY[density]) root.style.setProperty('--cm', DENSITY[density]); else root.style.removeProperty('--cm');
  }
  function toggleLayout() { density = (density + 1) % 3; MB.store.set('pg-den', String(density)); layoutLabel(); MB.sfx('tick'); }

  /* ---------- pop-up panels (shortcuts; About in the one-file preview) ---------- */
  var panelFocus = null;
  function openPanel(id) { var p = document.getElementById(id); if (!p) return; panelFocus = document.activeElement; p.hidden = false; root.style.overflow = 'hidden'; var b = $('button', p); if (b) b.focus(); MB.sfx('paper'); }
  function closePanels() { var any = false; $$('.panel[data-closable]').forEach(function (p) { if (!p.hidden) { p.hidden = true; any = true; } }); if (any) { root.style.overflow = MB.lightbox.isOpen() ? 'hidden' : ''; if (panelFocus) panelFocus.focus(); } return any; }
  function openPanelEl() { return $$('.panel[data-closable]').filter(function (p) { return !p.hidden; })[0]; }

  /* ---------- keyboard shortcuts ---------- */
  function keys(e) {
    var panel = openPanelEl();
    if (panel) { if (e.key === 'Escape') { e.preventDefault(); closePanels(); } else if (e.key === 'Tab') MB.trap(e, panel); return; }
    if (MB.lightbox.isOpen() || e.ctrlKey || e.metaKey || e.altKey) return;
    var el = e.target; if (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable)) { if (e.key === 'Escape') el.blur(); return; }
    var k = e.key.toLowerCase();
    if (k === 's') MB.gallery.shuffle();
    else if (k === 'r') MB.gallery.reroll();
    else if (k === 'm') toggleSound();
    else if (k === 't') toggleTheme();
    else if (k === 'f') { S.filter = S.filter === 'fav' ? 'all' : 'fav'; MB.gallery.apply(); MB.sfx('tick'); }
    else if (k === '/') { e.preventDefault(); $('#q').focus(); }
    else if (k === '?') openPanel('help');
  }

  function init() {
    $('#themeBtn').onclick = toggleTheme; $('#sndBtn').onclick = toggleSound; $('#motBtn').onclick = toggleMotion; $('#denBtn').onclick = toggleLayout;
    $('#helpBtn').onclick = function () { openPanel('help'); };
    $$('.panel[data-closable] [data-close]').forEach(function (b) { b.onclick = closePanels; });
    $$('.panel[data-closable]').forEach(function (p) { p.addEventListener('click', function (e) { if (e.target === p) closePanels(); }); });
    $$('[data-panel]').forEach(function (a) { if (document.getElementById(a.dataset.panel)) a.addEventListener('click', function (e) { e.preventDefault(); openPanel(a.dataset.panel); }); });
    $('#topBtn').onclick = function () { MB.sfx('tick'); scrollTo({ top: 0, behavior: S.calm ? 'auto' : 'smooth' }); };
    $('#footText').textContent = T.footer; $('#topBtn').textContent = L.top;
    $('#shufBtn').textContent = L.shuffle; $('#rollBtn').textContent = L.reroll; $('#surBtn').textContent = L.surprise; $('#helpBtn').textContent = L.help;
    try { matchMedia('(prefers-color-scheme: dark)').addEventListener('change', themeLabel); } catch (e) {}
    document.addEventListener('keydown', keys);
    document.addEventListener('visibilitychange', function () { root.classList.toggle('paused', document.hidden); });   /* pause animations in background tabs */
    themeLabel(); soundLabel(); motionLabel(); layoutLabel();
  }
  MB.ui = { init: init, toast: toast, buzz: buzz, hint: hint, openPanel: openPanel };
})();
