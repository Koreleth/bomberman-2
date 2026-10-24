/*
Helpers
  small replacements for Java/Processing behaviour that JavaScript does not have
  Autor: Korel Öztekin
*/

// Java integer division (truncates towards zero)
function idiv(a, b) {
  return Math.trunc(a / b);
}

// Java int() cast
function toInt(n) {
  return Math.trunc(n);
}

// RANDOM: seeded generator (mulberry32), online every browser gets the same items with the same seed
function seededRandom(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// SETTINGS: saved only in this browser (volume and bomb keys)
function loadSettings() {
  try {
    const saved = JSON.parse(localStorage.getItem("bomberman2-settings"));
    if (saved) {
      volume = saved.volume ?? volume;
      keyBombOne = saved.keyBombOne ?? keyBombOne;
      keyBombTwo = saved.keyBombTwo ?? keyBombTwo;
    }
  } catch (e) {
    // private mode / blocked storage -> defaults
  }
}

function saveSettings() {
  try {
    localStorage.setItem("bomberman2-settings", JSON.stringify({ volume, keyBombOne, keyBombTwo }));
  } catch (e) {
    // private mode / blocked storage -> settings only for this session
  }
}

// new int [15][15]
function grid() {
  return Array.from({ length: 15 }, () => new Array(15).fill(0));
}

// DRAW: whole image -> small pixel art stays sharp, big pictures get smoothed
function pic(img, x, y, w, h) {
  drawingContext.imageSmoothingEnabled = img.width >= 300;
  if (w === undefined) {
    image(img, x, y);
  } else {
    image(img, x, y, w, h);
  }
}

// DRAW: replacement for image(img.get(sx,sy,sw,sh), x, y, w, h) without copying pixels every frame
function sprite(img, sx, sy, sw, sh, x, y, w = sw, h = sh) {
  drawingContext.imageSmoothingEnabled = img.width >= 300;
  image(img, x, y, w, h, sx, sy, sw, sh);
}

// TEXT: name of a keycode for the settings / tutorial screen
function keyName(code) {
  const names = {
    8: "BACK", 9: "TAB", 13: "ENTER", 16: "SHIFT", 17: "CTRL", 18: "ALT GR",
    32: "SPACE", 37: "LEFT", 38: "UP", 39: "RIGHT", 40: "DOWN", 46: "DEL",
    188: ",", 189: "-", 190: ".", 191: "#", 226: "<"
  };
  if (names[code]) {
    return names[code];
  }
  if ((code >= 48 && code <= 57) || (code >= 65 && code <= 90)) {
    return String.fromCharCode(code);
  }
  if (code >= 96 && code <= 105) {
    return "NUM " + (code - 96);
  }
  return "KEY " + code;
}
