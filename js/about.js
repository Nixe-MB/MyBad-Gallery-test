/* about.js  -  the small amount of script the About page needs: saved theme, sound switch, drifting bits */
(function () {
  'use strict';
  var MB = window.MB, $ = MB.$, root = document.documentElement;
  if (MB.state.calm) root.classList.add('calm');
  MB.effects.drift();
  var b = $('#themeBtn');
  function isDark() { var t = root.dataset.theme; return t ? t === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches; }
  function label() { b.textContent = isDark() ? MB.text.labels.themeLight : MB.text.labels.themeDark; }
  b.onclick = function () { var t = isDark() ? 'light' : 'dark'; root.dataset.theme = t; MB.store.set('pg-theme', t); label(); MB.sfx('toggle'); };
  label();
})();
