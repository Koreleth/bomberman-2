/*
Touch
  controls for phones and tablets: a stick to walk and a button to place bombs
  online one set for the own character, local two sets (two players on one device)
  Autor: Korel Öztekin
*/

//TOUCH: phones / tablets (primary pointer is a finger), ?touch=1 forces it for testing
const touchMode = matchMedia("(pointer: coarse)").matches || new URLSearchParams(location.search).get("touch") == "1";

let touchUI = null;
//per control set: player index and the direction the stick points to (-1 = none)
let touchPads = [];

//CREATE: the HTML elements (hidden until a round runs)
function initTouch() {
  if (!touchMode) {
    return;
  }
  document.body.classList.add("touch");
  touchUI = document.createElement("div");
  touchUI.id = "touch-controls";
  touchUI.hidden = true;
  document.body.appendChild(touchUI);

  for (let set = 0; set < 2; set++) {
    const pad = { set: set, direction: -1 };
    pad.stick = createStick(pad);
    pad.bomb = createBombButton(pad);
    touchPads.push(pad);
  }

  //PAUSE: only in local games (like ESC / P)
  const pause = document.createElement("button");
  pause.id = "touch-pause";
  pause.type = "button";
  pause.textContent = "II";
  pause.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    if (canPause()) {
      togglePause();
    }
  });
  touchUI.appendChild(pause);
}

//STICK: 4 directions, the knob follows the finger inside the ring
function createStick(pad) {
  const stick = document.createElement("div");
  stick.className = "touch-stick set-" + pad.set;
  const knob = document.createElement("div");
  knob.className = "touch-knob";
  stick.appendChild(knob);
  touchUI.appendChild(stick);

  let pointer = null;
  const move = (e) => {
    const rect = stick.getBoundingClientRect();
    const radius = rect.width / 2;
    let dx = e.clientX - (rect.left + radius);
    let dy = e.clientY - (rect.top + radius);
    const length = Math.hypot(dx, dy);
    //knob stays inside the ring
    const max = radius * 0.55;
    const k = length > max ? max / length : 1;
    knob.style.transform = "translate(" + dx * k + "px, " + dy * k + "px)";

    //DIRECTION: the longer axis wins, small movements count as standing still
    let direction = -1;
    if (length > radius * 0.25) {
      direction = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 3 : 2) : (dy > 0 ? 1 : 0);
    }
    setPadDirection(pad, direction);
  };
  const end = (e) => {
    if (e.pointerId != pointer) {
      return;
    }
    pointer = null;
    knob.style.transform = "";
    stick.classList.remove("active");
    setPadDirection(pad, -1);
  };
  stick.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    pointer = e.pointerId;
    //the finger may leave the ring and still steers
    try {
      stick.setPointerCapture(pointer);
    } catch (err) {
      //pointer already gone
    }
    stick.classList.add("active");
    move(e);
  });
  stick.addEventListener("pointermove", (e) => {
    if (e.pointerId == pointer) {
      move(e);
    }
  });
  stick.addEventListener("pointerup", end);
  stick.addEventListener("pointercancel", end);
  return stick;
}

//BOMB: one tap = one bomb
function createBombButton(pad) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "touch-bomb set-" + pad.set;
  button.setAttribute("aria-label", "Bomb");
  button.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    button.classList.add("active");
    touchInput(pad, 2, 0);
  });
  const release = () => button.classList.remove("active");
  button.addEventListener("pointerup", release);
  button.addEventListener("pointercancel", release);
  button.addEventListener("pointerleave", release);
  touchUI.appendChild(button);
  return button;
}

//INPUT: release the old direction, press the new one (same events as the keyboard)
function setPadDirection(pad, direction) {
  if (direction == pad.direction) {
    return;
  }
  if (pad.direction >= 0) {
    touchInput(pad, 1, pad.direction);
  }
  pad.direction = direction;
  if (direction >= 0) {
    touchInput(pad, 0, direction);
  }
}

//INPUT: local -> player of this set, online -> own character
function touchInput(pad, type, direction) {
  if (gamemode != 2 || (paused && type != 1)) {
    return;
  }
  if (netMode == "local") {
    applyEvent([pad.set, type, direction]);
  } else if (pad.set == 0) {
    ownInput(type, direction);
  }
}

//UPDATE: every frame, controls only while a round runs (two sets in local games)
function updateTouch() {
  if (!touchUI) {
    return;
  }
  const playing = gamemode == 2;
  document.body.classList.toggle("playing", playing);
  document.body.classList.toggle("two-pads", netMode == "local");
  touchUI.hidden = !playing;
  if (!playing) {
    //finger still on the stick when the round ends -> forget it
    for (const pad of touchPads) {
      pad.direction = -1;
    }
  }
}
