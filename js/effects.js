/* ============================================================================
   effects.js  -  title letters, drifting bits, fireflies, paper plane, confetti, scroll rail
   ============================================================================ */
(function () {
  'use strict';
  var MB = window.MB, $ = MB.$, h = MB.h, rnd = MB.rnd, pick = MB.pick, S = MB.state;

  function burst(x, y) {                       /* a little paper confetti */
    if (S.calm) return;
    var colors = ['#d9a441', '#c0443a', '#3d6a56', '#5b84b1', '#e8a0ae'];
    for (var i = 0; i < 12; i++) {
      var b = h('i', 'bit'), a = rnd(0, 6.28), d = rnd(40, 110);
      b.style.left = x + 'px'; b.style.top = y + 'px'; b.style.background = pick(colors); document.body.appendChild(b);
      b.animate([{ transform: 'translate(0,0) rotate(0)', opacity: 1 }, { transform: 'translate(' + Math.cos(a) * d + 'px,' + (Math.sin(a) * d + 60) + 'px) rotate(' + rnd(-360, 360) + 'deg)', opacity: 0 }],
        { duration: rnd(600, 1000), easing: 'cubic-bezier(.2,.7,.3,1)' }).onfinish = (function (el) { return function () { el.remove(); }; })(b);
    }
  }
  function title() {
    var t = $('#ttl'), k = 0;
    Array.from(MB.config.siteName).forEach(function (c) {
      var e = h('span', 'ch', c); e.style.setProperty('--k', k++);
      if (c === '🍀') e.classList.add('clv'); t.appendChild(e);
    });
    t.addEventListener('click', function (e) {
      var c = e.target.closest('.clv');
      if (c) {
        c.classList.remove('spin'); void c.offsetWidth; c.classList.add('spin'); MB.sfx('spark');
        var r = c.getBoundingClientRect(); burst(r.left + r.width / 2, r.top + r.height / 2);
        setTimeout(function () { c.classList.remove('spin'); }, 950);
      } else if (e.target.closest('.ch')) MB.sfx('tick');
    });
  }
  function drift() {
    var d = $('.drift'), f = $('.fireflies'), i, e;
    if (d && !d.children.length) for (i = 0; i < 9; i++) {
      e = h('i', null, pick(['🍀', '🍀', '🍃', '✿', '✦', '🌼']));
      e.style.setProperty('--x', (5 + i * 11 + Math.random() * 6) + '%'); e.style.setProperty('--s', (1.2 + Math.random() * 1.8) + 'rem');
      e.style.setProperty('--d', (20 + Math.random() * 18) + 's'); e.style.setProperty('--w', (-Math.random() * 30) + 's'); d.appendChild(e);
    }
    if (f && !f.children.length) for (i = 0; i < 10; i++) {
      e = h('i'); e.style.setProperty('--x', rnd(3, 97).toFixed(0) + '%'); e.style.setProperty('--d', rnd(14, 26).toFixed(0) + 's');
      e.style.setProperty('--w', (-rnd(0, 20)).toFixed(0) + 's'); e.style.setProperty('--dx', rnd(-40, 40).toFixed(0) + 'px'); f.appendChild(e);
    }
  }
  function plane() {                           /* follows a curved path, points along its heading, banks and flutters */
    if (S.calm || document.hidden) return;
    var p = h('div', 'plane'), W = innerWidth, H = innerHeight, y0 = rnd(.12, .55) * H, ang = null,
      P = [[-80, y0], [W * rnd(.2, .4), y0 - rnd(.15, .4) * H], [W * rnd(.55, .8), y0 + rnd(0, .35) * H], [W + 80, y0 - rnd(-.1, .25) * H]],
      T = rnd(10000, 14000), t0 = performance.now(), phase = rnd(0, 6.28);
    p.innerHTML = '<svg viewBox="0 0 48 40" aria-hidden="true"><path d="M2 6 L48 20 L2 34 L13 20Z" fill="#fbf8ef" stroke="#6d675a" stroke-width="1.4" stroke-linejoin="round"/><path d="M13 20 L2 34 L48 20Z" fill="rgba(0,0,0,.1)"/><path d="M13 20 L48 20" stroke="#6d675a" stroke-width="1.2"/></svg>';
    document.body.appendChild(p);
    function bz(t) { var u = 1 - t; return [u * u * u * P[0][0] + 3 * u * u * t * P[1][0] + 3 * u * t * t * P[2][0] + t * t * t * P[3][0], u * u * u * P[0][1] + 3 * u * u * t * P[1][1] + 3 * u * t * t * P[2][1] + t * t * t * P[3][1]]; }
    function frame(now) {
      var k = Math.min(1, (now - t0) / T), a = bz(k), b = bz(Math.min(1, k + .012)), target = Math.atan2(b[1] - a[1], b[0] - a[0]) * 180 / Math.PI;
      ang = ang == null ? target : ang + (target - ang) * .1;
      p.style.transform = 'perspective(320px) translate(' + a[0].toFixed(1) + 'px,' + a[1].toFixed(1) + 'px) rotate(' + ang.toFixed(1) + 'deg) rotateX(' + (Math.sin(k * 13 + phase) * 32).toFixed(1) + 'deg)';
      p.style.opacity = k < .05 ? k / .05 : k > .95 ? (1 - k) / .05 : 1;
      if (k < 1 && !document.hidden && !S.calm) requestAnimationFrame(frame); else p.remove();
    }
    requestAnimationFrame(frame);
  }
  function rail() {                            /* the little clover that shows how far down you are */
    var r = $('.rail'), busy = false; if (!r) return;
    function update() { if (busy) return; busy = true; requestAnimationFrame(function () { busy = false; var m = document.documentElement.scrollHeight - innerHeight; r.style.setProperty('--p', m > 0 ? Math.min(1, Math.max(0, scrollY / m)).toFixed(4) : '0'); }); }
    addEventListener('scroll', update, { passive: true }); addEventListener('resize', update); update();
  }
  function planes() { setTimeout(plane, 6000); setInterval(plane, 30000); }
  MB.effects = { burst: burst, title: title, drift: drift, plane: plane, planes: planes, rail: rail };
})();
