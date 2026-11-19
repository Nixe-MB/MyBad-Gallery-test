/* ============================================================================
   audio.js  -  every sound is made in the browser (no audio files), with a soft echo
   MB.sfx('tick'|'hover'|'paper'|'open'|'close'|'shuffle'|'roll'|'spark'|'toggle', note?)
   ============================================================================ */
(function () {
  'use strict';
  var MB = window.MB, S = MB.state, AC = null, NB = null, MASTER = null, SEND = null, lastHover = 0;
  var SCALE = [523.25, 587.33, 659.25, 783.99, 880, 1046.5, 1174.66];   /* a gentle pentatonic scale */
  ['pointerdown', 'keydown'].forEach(function (t) { document.addEventListener(t, function () { S.gesture = true; }, { capture: true, once: true }); });

  function ctx() {
    if (!S.sound || !S.gesture) return null;
    try {
      if (!AC) {
        AC = new (window.AudioContext || window.webkitAudioContext)();
        var comp = AC.createDynamicsCompressor(); comp.connect(AC.destination);
        MASTER = AC.createGain(); MASTER.gain.value = .9; MASTER.connect(comp);
        var n = Math.floor(AC.sampleRate * 1.4), ib = AC.createBuffer(2, n, AC.sampleRate);
        for (var c = 0; c < 2; c++) { var d = ib.getChannelData(c); for (var i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 3); }
        var rv = AC.createConvolver(); rv.buffer = ib;
        var wet = AC.createGain(); wet.gain.value = .3; rv.connect(wet); wet.connect(comp);
        SEND = AC.createGain(); SEND.connect(rv);
      }
      if (AC.state === 'suspended') { var r = AC.resume(); if (r && r.catch) r.catch(function () {}); }
    } catch (e) { return null; }
    return AC;
  }
  function out(node, reverb) {
    node.connect(MASTER);
    if (reverb) { var s = AC.createGain(); s.gain.value = reverb; node.connect(s); s.connect(SEND); }
  }
  function tone(c, f0, f1, dur, type, gain, delay, reverb) {
    var t = c.currentTime + (delay || 0), o = c.createOscillator(), v = c.createGain();
    o.type = type || 'sine';
    o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(Math.max(1, f1), t + dur);
    v.gain.setValueAtTime(.0001, t); v.gain.exponentialRampToValueAtTime(gain, t + .015); v.gain.exponentialRampToValueAtTime(.0001, t + dur);
    o.connect(v); out(v, reverb == null ? .5 : reverb); o.start(t); o.stop(t + dur + .05);
  }
  function puff(c, f0, f1, dur, gain, delay) {          /* filtered noise = paper rustle */
    if (!NB) { NB = c.createBuffer(1, c.sampleRate, c.sampleRate); var a = NB.getChannelData(0); for (var i = 0; i < a.length; i++) a[i] = Math.random() * 2 - 1; }
    var t = c.currentTime + (delay || 0), s = c.createBufferSource(), f = c.createBiquadFilter(), v = c.createGain();
    s.buffer = NB; f.type = 'bandpass'; f.Q.value = .9;
    f.frequency.setValueAtTime(f0, t); f.frequency.exponentialRampToValueAtTime(f1, t + dur);
    v.gain.setValueAtTime(.0001, t); v.gain.exponentialRampToValueAtTime(gain, t + dur * .3); v.gain.exponentialRampToValueAtTime(.0001, t + dur);
    s.connect(f); f.connect(v); out(v, .25); s.start(t, Math.random() * .4, dur + .05);
  }
  function note(i) { return SCALE[i % 7] * (i >= 7 ? 2 : 1); }

  MB.sfx = function (kind, n) {
    var c = ctx(); if (!c) return;
    var now = performance.now();
    n = n == null ? Math.floor(Math.random() * 7) : Math.abs(n) % 9;
    if (kind === 'hover') { if (now - lastHover < 110) return; lastHover = now; tone(c, note(n), note(n), .24, 'sine', .022, 0, .8); }
    else if (kind === 'tick') tone(c, note(n), note(n) * .98, .18, 'triangle', .07, 0, .6);
    else if (kind === 'paper') puff(c, 3200, 1400, .22, .2);
    else if (kind === 'open') { puff(c, 1500, 3600, .28, .2); tone(c, note(n) / 2, note(n) / 2, .4, 'sine', .05, .02, .9); }
    else if (kind === 'close') { puff(c, 3600, 1200, .24, .18); tone(c, note(n) / 2, note(n) / 3, .32, 'sine', .04, 0, .9); }
    else if (kind === 'shuffle') { puff(c, 700, 5200, .55, .24); for (var i = 0; i < 7; i++) tone(c, note(6 - i), note(6 - i), .32, 'triangle', .05, .06 * i + .05, .8); }
    else if (kind === 'roll') { for (var j = 0; j < 5; j++) puff(c, 2200 + j * 500, 1200, .1, .16, j * .07); }
    else if (kind === 'spark') { [2, 4, 6, 8].forEach(function (x, k) { tone(c, note(x), note(x) * 1.01, .3, 'sine', .055, k * .07, .9); }); }
    else if (kind === 'toggle') tone(c, 420, 840, .16, 'sine', .06, 0, .6);
  };
})();
