/* ============================================================================
   text.js  -  every sentence the site says, in one place. Edit freely.
   (Section notes and photo captions live in index.html.)
   ============================================================================ */
MB.text = {
  labels: {
    shuffle: 'Mix them up', reroll: 'Fresh paper', surprise: 'Surprise me',
    soundOn: 'Sound: on', soundOff: 'Sound: off', motionOn: 'Motion: lively', motionOff: 'Motion: calm',
    themeDark: 'Dark paper', themeLight: 'Light paper', layouts: ['Cozy', 'Roomy', 'Compact'], layout: 'Layout: ',
    help: 'Shortcuts', top: 'Back to the top ↑',
    keep: '♡ Keep this one', kept: '♥ Kept close', play: 'Play slideshow', pause: 'Pause slideshow', share: 'Share this photo'
  },
  sub: function (n, s, f) {
    return n + ' photographs tucked into ' + s + ' little corners' + (f ? ', ' + f + ' of them kept close' : '') + '. Tap any print to take a closer look.';
  },
  hints: [
    'Every time you visit, the prints land in a different order, like finding them for the first time.',
    'New desk, new paper, new order. No two visits look the same.',
    'Take your time. Nothing here is in a hurry.',
    'A fresh pile of prints, just for you.',
    'Everything moves around a little each visit. Try mixing them up yourself.'
  ],
  none: {
    fav: 'Nothing kept yet. Tap the little heart on any print and it will wait for you here.',
    search: 'Hmm, nothing by that name. Try another word?'
  },
  toast: {
    shuffle: 'Mixed up. New order, new paper.',
    reroll: 'Fresh paper, just for you.',
    copied: 'Link copied. Send it to someone you like.',
    copyFail: 'Could not copy here, but you can grab the link from the address bar.',
    gateBad: 'That password did not work. Want to try again?'
  },
  gate: { title: 'A little privacy', body: 'These photos are kept private. Enter the password to look around.', button: 'Open the gallery' },
  footer: 'Made with luck 🍀 Thanks for stopping by.'
};
