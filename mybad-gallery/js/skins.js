/* ============================================================================
   skins.js  -  all the randomness: print looks, section order, paper, tints
   roll(print)   gives one print a new tint, wear, tape, frame style, tilt, caption font
   restyle()     new desk tint, colour washes, strip speed, paper + layout for every section, stickers
   orderSections() puts the sections in a new random order
   ============================================================================ */
(function () {
  'use strict';
  var MB = window.MB, $ = MB.$, $$ = MB.$$, h = MB.h, rnd = MB.rnd, pick = MB.pick;
  var CARD = ['#f2c6d0', '#cfe3d3', '#c9dbe8', '#ddd0ec', '#f6dfa9', '#f1cdb5'];
  var TINTS = ['#8fb996', '#e0a3a3', '#9db7d5', '#d9c28a', '#b9a5d4', '#9ccfc4', '#d5a98a'];
  var STICKERS = ['★', '✿', '☺', '♥', '✦', '🍀', '☁', '✂'];
  var FONTS = [['Caveat,"Bradley Hand",cursive', '1.4rem'], ['Kalam,"Segoe Print",cursive', '1.1rem'], ['"Reenie Beanie","Bradley Hand",cursive', '1.7rem']];

  function roll(f) {
    var L = [], kinds = ['ring', 'fox', 'edge', 'crease', 'wash', 'burn', 'ink', 'scratch', 'grid', 'dogear'];
    var count = 2 + Math.floor(Math.random() * 3), on = {}, k, p, s = f.style;
    function xy() { return rnd(4, 96).toFixed(0) + '% ' + rnd(4, 96).toFixed(0) + '%'; }
    while (Object.keys(on).length < count) on[pick(kinds)] = 1;
    if (on.ring) L.push('radial-gradient(circle at ' + rnd(12, 88).toFixed(0) + '% ' + rnd(75, 97).toFixed(0) + '%,transparent 14px,rgba(120,80,30,.42) 17px,transparent 30px)');
    if (on.fox) for (k = 0; k < 8; k++) L.push('radial-gradient(circle at ' + xy() + ',rgba(140,90,40,.6) 1.6px,transparent 3px)');
    if (on.edge) L.push('linear-gradient(' + pick(['90deg', '180deg']) + ',rgba(120,90,40,.32),transparent 16%,transparent 84%,rgba(120,90,40,.32))');
    if (on.crease) { p = rnd(25, 70); L.push('linear-gradient(' + pick([0, 90, 20, -20, 70]) + 'deg,transparent ' + p.toFixed(1) + '%,rgba(0,0,0,.24) ' + (p + .4).toFixed(1) + '%,rgba(255,255,255,.7) ' + (p + 1).toFixed(1) + '%,transparent ' + (p + 1.7).toFixed(1) + '%)'); }
    if (on.wash) L.push('radial-gradient(ellipse at ' + xy() + ',transparent 30%,rgba(185,140,70,.38))');
    if (on.burn) L.push('radial-gradient(circle at ' + pick(['0% 0%', '100% 0%', '0% 100%', '100% 100%']) + ',rgba(90,55,20,.5),transparent 42%)');
    if (on.ink) for (k = 0; k < 3; k++) L.push('radial-gradient(circle at ' + xy() + ',rgba(30,45,90,.55) ' + rnd(1.5, 3.5).toFixed(1) + 'px,transparent ' + rnd(4, 7).toFixed(1) + 'px)');
    if (on.scratch) { p = Math.round(rnd(9, 17)); L.push('repeating-linear-gradient(' + rnd(0, 180).toFixed(0) + 'deg,transparent 0 ' + p + 'px,rgba(0,0,0,.1) ' + p + 'px ' + (p + 1) + 'px)'); }
    if (on.grid) { L.push('linear-gradient(rgba(60,90,130,.18) 1px,transparent 1px) 0 0/14px 14px'); L.push('linear-gradient(90deg,rgba(60,90,130,.18) 1px,transparent 1px) 0 0/14px 14px'); }
    if (on.dogear) L.push('linear-gradient(' + pick([45, 135, 225, 315]) + 'deg,transparent 93%,rgba(0,0,0,.3) 93%)');
    L.push('var(--grain)');
    var font = pick(FONTS);
    s.setProperty('--tex', L.join(','));
    s.setProperty('--pc', 'var(--p' + Math.floor(rnd(0, 12)) + ')');
    s.setProperty('--cc', pick(CARD));
    s.setProperty('--r', rnd(-3.4, 3.4).toFixed(2) + 'deg');
    s.setProperty('--sc', rnd(.95, 1.04).toFixed(3));
    s.setProperty('--tw', Math.round(rnd(58, 100)) + 'px');
    s.setProperty('--tr', rnd(-9, 9).toFixed(1) + 'deg');
    s.setProperty('--pd', rnd(.45, .95).toFixed(2) + 'rem');
    s.setProperty('--cr', rnd(-1.6, 1.6).toFixed(2) + 'deg');
    s.setProperty('--cf', font[0]); s.setProperty('--cz', font[1]);
    $('.frame', f).className = 'frame t' + Math.floor(rnd(0, 8)) + ' v' + pick([0, 0, 1, 2, 3, 4, 5, 6, 7, 8]);
  }

  function orderSections() {
    var main = $('#sheets'), none = $('#none');
    MB.shuffleArray($$('.sheet')).forEach(function (x) { main.insertBefore(x, none); });
    $$('.sheet').forEach(function (x, n) { x.dataset.n = ('0' + (n + 1)).slice(-2); x.style.setProperty('--n', n); });
  }

  function stickers(sheet) {
    $$('.sticker', sheet).forEach(function (e) { e.remove(); });
    for (var i = 0, n = 1 + Math.floor(Math.random() * 2); i < n; i++) {
      var s = h('span', 'sticker', pick(STICKERS));
      s.setAttribute('aria-hidden', 'true');
      s.style.left = rnd(3, 86).toFixed(0) + '%'; s.style.fontSize = rnd(1.15, 1.5).toFixed(2) + 'rem'; s.style.setProperty('--sr', rnd(-18, 18).toFixed(0) + 'deg');
      sheet.appendChild(s);
    }
  }

  function restyle() {
    var root = document.documentElement.style;
    root.setProperty('--tint', pick(TINTS));
    ['--w1', '--w2', '--w3'].forEach(function (k) { root.setProperty(k, pick(TINTS)); });
    $$('.wash i').forEach(function (i) { i.style.left = rnd(5, 95).toFixed(0) + 'vw'; i.style.top = rnd(5, 100).toFixed(0) + 'vh'; });
    var track = $('#track');
    if (track) { track.style.setProperty('--sd', Math.round(rnd(55, 110)) + 's'); track.style.setProperty('--sdir', Math.random() < .5 ? 'normal' : 'reverse'); }
    $$('.sheet').forEach(function (x) {
      x.dataset.paper = Math.floor(rnd(0, 5)); x.dataset.head = pick(['l', 'l', 'r', 'c']);
      x.style.setProperty('--cw', rnd(13, 19).toFixed(1) + 'rem'); x.style.setProperty('--cg', rnd(1.4, 2.8).toFixed(1) + 'rem');
      stickers(x);
    });
  }
  MB.skins = { roll: roll, orderSections: orderSections, restyle: restyle };
})();
