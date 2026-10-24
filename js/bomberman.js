/*
Bomberman 2:
  Autor: Korel Öztekin
  date: 15.03.2024
  version: 2.0.0 (balancing, "?" item boxes, new items: kick, shield, heart, skull, pierce bomb, full fire)
*/

let menuSong;
let hit1;
let hit2;
let click;
let bombPut;
let ambient;
let quake;
let winP1;
let winP2;
let winP3;
let winP4;
let deathP3;
let deathP4;
let explosionS;
let explosionM;
let explosionL;
let itemGet;
let extraLife;
let shieldSound;
let curseSound;
let kickSound;
let bombStop;
let hurryUp;
let blockLand;
let pauseSound;
let spawn;
let slice;


//setup
let block = 50;
let gamemode = 0;
let pixel;
let heart;
let heart0;
let tileBorder;
let tilePillar;
let tileFloor;
let tileBox;
let bombPic;
let items2;
let itemBox;
let explosionPic;
let playerPic1;
let playerPic2;
let playerPic3;
let playerPic4;
let effects;
let skater0;
let skater;
let fire;
let banner;
let logo;
let setting;
let close;
let kill;
let blood;
let bird;

//player variables
let keyCodeOne = [87, 83, 65, 68]; //playerOne -> w,s,a,d and SPACE
let keyCodeTwo = [38, 40, 37, 39]; //playerTwo -> Arrowkeys and ALTGR
let keyBombOne = 32;
let keyBombTwo = 18;
let players = [];
let playerPics = [];
let winPics = [];
let hitSounds = [];
let winSounds = [];
const PLAYER_NAMES = ["PLAYER ONE", "PLAYER TWO", "PLAYER THREE", "PLAYER FOUR"];

//map
let karte;
let rng = Math.random;

//HUD
let hud;

//animation
let ani;

//game
let startTimer = false;
let hitFrameMain = 0;
let animationCounter = 0;
let winner = -1;
//END: the winner cheers on the field before the banner comes
let victoryShown = false;
//END: tap / click instead of a key (phones)
let endTapped = false;

//text that flies up when an item is collected
let popups = [];

//HURRY UP: blocks fall from the outside to the middle
let suddenDeath;

//PAUSE: only in local games (online every browser has to run the same frames)
let paused = false;
let pauseSnapshot = null;

//bomb (one list and one explosion counter per player)
let bombs = [];
let explosionCount = [];

//online: "local" = everyone on this keyboard, "host" / "client" = online lobby (see net.js)
let netMode = "local";
let myIndex = 0;


//MENU
let bomberman;
let bomberman2;
let menubox;
let movement = { x: 0, y: 0 };
let animation = 0;
let addsize = 1;
let geospeed;
let colorR = 255;
let colorG = 255;
let colorB = 255;
let volume = 1;

let keyChangeOne = false;
let keyChangeTwo = false;
let soundChange = false;
let endSound = false;

//TIMING: the game logic counts frames, so it runs at a fixed 60 steps per second
//        no matter how fast the monitor refreshes (60Hz, 144Hz, ...)
const STEP = 1000 / 60;
let frame = 0;
let accumulator = 0;
let lastTime = 0;


function preload() {
  heart = loadImage("sprites/heart.png");
  heart0 = loadImage("sprites/heart0.png");
  tileBorder = loadImage("sprites/tile-border.png");
  tilePillar = loadImage("sprites/tile-pillar.png");
  tileFloor = loadImage("sprites/tile-floor.png");
  tileBox = loadImage("sprites/tile-box.png");
  bombPic = loadImage("sprites/bombs.png");
  items2 = loadImage("sprites/items2.png");
  itemBox = loadImage("sprites/itembox.png");
  explosionPic = loadImage("sprites/explosion.png");
  //players: sheets with all animations (sprites by Phongpon, recolored per player)
  playerPic1 = loadImage("sprites/bomber1.png");
  playerPic2 = loadImage("sprites/bomber2.png");
  playerPic3 = loadImage("sprites/bomber3.png");
  playerPic4 = loadImage("sprites/bomber4.png");
  effects = loadImage("sprites/effects.png");
  skater0 = loadImage("sprites/skater0.png");
  skater = loadImage("sprites/skater.png");
  banner = loadImage("sprites/banner.png");
  fire = loadImage("sprites/fire.png");
  bomberman = loadImage("sprites/bomberman.png");
  logo = loadImage("sprites/logo.png");
  menubox = loadImage("sprites/Menu.png");
  bomberman2 = loadImage("sprites/bomberman2.png");
  winPics = [bomberman, bomberman2, loadImage("sprites/bomberman3.png"), loadImage("sprites/bomberman4.png")];
  setting = loadImage("sprites/setting.png");
  close = loadImage("sprites/close.png");
  kill = loadImage("sprites/kill.png");
  blood = loadImage("sprites/Blood.png");
  bird = loadImage("sprites/bird.png");

  geospeed = loadFont("font/geospeed.ttf");
  pixel = loadFont("font/pixel.ttf");
}


function setup() {
  const canvas = createCanvas(750, 750);
  canvas.parent("game");
  //PHONES: at most 2x pixel density, 3x would be a 2250x2250 canvas
  if (touchMode) {
    pixelDensity(Math.min(2, displayDensity()));
  }
  frameRate(60);

  block = width / 15;

  rectMode(CENTER);
  textAlign(CENTER);
  imageMode(CENTER);
  textSize(20);

  playerPics = [playerPic1, playerPic2, playerPic3, playerPic4];
  hud = new HUD();
  ani = new Animations();
  loadSettings();

  menuSong = new SoundFile("sounds/thats-it-for-today-loop.wav"); //ViRiX Dreamcore, see credits
  hit1 = new SoundFile("sounds/hit1.wav");
  hit2 = new SoundFile("sounds/hit2.wav");
  bombPut = new SoundFile("sounds/bomb-set.wav");
  click = new SoundFile("sounds/confirm.wav");
  quake = new SoundFile("sounds/321.mp3");
  ambient = new SoundFile("sounds/ambient1.wav");
  winP1 = new SoundFile("sounds/p1win.wav");
  winP2 = new SoundFile("sounds/p2win.wav");
  winP3 = new SoundFile("sounds/p3win.wav");
  winP4 = new SoundFile("sounds/p4win.wav");
  deathP3 = new SoundFile("sounds/p3death.wav");
  deathP4 = new SoundFile("sounds/p4death.wav");
  explosionS = new SoundFile("sounds/explosion-s.wav");
  explosionM = new SoundFile("sounds/explosion-m.wav");
  explosionL = new SoundFile("sounds/explosion-l.wav");
  slice = new SoundFile("sounds/slice.mp3");
  itemGet = new SoundFile("sounds/item-get.wav");
  extraLife = new SoundFile("sounds/extra-life.wav");
  shieldSound = new SoundFile("sounds/shield.wav");
  curseSound = new SoundFile("sounds/curse.wav");
  kickSound = new SoundFile("sounds/kick.wav");
  bombStop = new SoundFile("sounds/bomb-stop.wav");
  hurryUp = new SoundFile("sounds/hurry-up.wav");
  blockLand = new SoundFile("sounds/block-land.wav");
  pauseSound = new SoundFile("sounds/pause.wav");
  spawn = new SoundFile("sounds/spawn.wav");
  hitSounds = [hit1, hit2, deathP3, deathP4];
  winSounds = [winP1, winP2, winP3, winP4];

  initPanels();
  initTouch();

  //DRAW: first frame behind the start overlay, then wait for the click
  frame++;
  menuRender();
  noLoop();

  const overlay = document.getElementById("start-overlay");
  const startButton = document.getElementById("start-button");
  if (inviteCode()) {
    startButton.textContent = "CLICK TO JOIN LOBBY " + inviteCode();
  }
  startButton.addEventListener("click", () => {
    audioCtx.resume();
    overlay.hidden = true;
    lastTime = performance.now();
    loop();
    joinFromInvite();
    //BACKGROUND: browsers pause draw() in hidden tabs, keep the game (and the online host) running
    setInterval(() => {
      if (document.hidden) {
        step();
      }
    }, STEP);
  });

  //RESET: keys when the tab loses focus, otherwise players keep walking (local games also pause)
  window.addEventListener("blur", () => {
    releaseAllKeys();
    if (canPause() && !paused) {
      togglePause();
    }
  });
}


function draw() {
  step();
}


function step() {
  updateTouch();
  const now = performance.now();
  //the online host may catch up to one second, everybody else at most 4 frames
  const maxBehind = (netMode == "host" && gamemode == 2) ? 60 : 4;
  accumulator = Math.min(accumulator + now - lastTime, STEP * maxBehind);
  lastTime = now;

  //PAUSE: no game frames, frame stays the same so all timers (bombs, respawn, HURRY UP) stop too
  if (paused) {
    accumulator = 0;
    resetMatrix();
    pauseScreen();
    return;
  }

  //ONLINE CLIENT: the host decides when the next game frame happens
  if (netMode == "client" && gamemode == 2) {
    clientFrames();
    return;
  }

  //UPDATE: one game frame per 1/60 s (1 ms tolerance against timer jitter)
  const outgoing = [];
  while (accumulator >= STEP - 1) {
    accumulator -= STEP;
    if (netMode == "host" && gamemode == 2) {
      //ONLINE HOST: every frame gets the inputs that arrived since the last one
      const events = pendingEvents;
      pendingEvents = [];
      outgoing.push([frame + 1, events]);
      runFrame(events);
    } else {
      runFrame([]);
    }
  }
  if (outgoing.length > 0) {
    sendFrames(outgoing);
  }
}


function runFrame(events) {
  for (const event of events) {
    applyEvent(event);
  }
  frame++;
  resetMatrix();
  gameFrame();
}


function gameFrame() {
  switch (gamemode) {
    case 0:
      menuRender();
      break;

    case 1:
      settings();
      break;

    case 2:
      gamestart();
      break;

    case 3:
      endScreen();
      break;

    case 4:
      quitScreen();
      break;

    case 5:
    case 6:
      panelBackground();
      break;

    case 7:
      itemGuide();
      break;
  }
}


//SWITCH: game state + show the matching HTML panel (5 = local / online, 6 = lobby)
function showScreen(mode) {
  gamemode = mode;
  document.getElementById("panel-mode").hidden = mode != 5;
  document.getElementById("panel-lobby").hidden = mode != 6;
}


//START: a new round for count players, online every browser uses the same seed
function startMatch(count, seed) {
  const spawns = [
    [block + (block / 2), block + (block / 2)], //top left
    [700 - 25, 700 - 25],                       //bottom right
    [700 - 25, block + (block / 2)],            //top right
    [block + (block / 2), 700 - 25]             //bottom left
  ];
  players = [];
  bombs = [];
  explosionCount = [];
  for (let i = 0; i < count; i++) {
    players.push(new Player(spawns[i][0], spawns[i][1])); //new Player (x,y);
    bombs.push([]);
    explosionCount.push(0);
  }
  karte = new Karte();
  rng = seed === undefined ? Math.random : seededRandom(seed);
  karte.placeItems();
  popups = [];
  suddenDeath = new SuddenDeath();

  frame = 0;
  hitFrameMain = 0;
  startTimer = false;
  animationCounter = 0;
  endSound = false;
  winner = -1;
  victoryShown = false;
  endTapped = false;
  paused = false;
  showScreen(2);
}



//case 0:
function menuRender() {
  imageMode(CENTER);
  if (!menuSong.isPlaying()) {
    menuSong.loop(1, 0.02 * volume);
  }
  //DRAW Menu
  hud.drawMenu();

  //animationcounter
  ani.variable();

  // BUTTON: Play
  ani.playButton();

  // BUTTON: Settings
  hud.settingButton();

  // BUTTON: Quit
  hud.quitButton();

  // BUTTON: Items
  hud.itemsButton();

  //DRAW: Buttons
  hud.drawButtons();
}
//__________________________________________________________________________________________
// __________________________________________________________________________________________


//case 1:
function settings() {
  //USE: Buttons
  hud.settingsButtons();

  //DRAW: volume, controls, back
  hud.drawSettings();
}

//___________________________________________________________________
//___________________________________________________________________



//case 2:
function gamestart() {
  //gamemode
  cursor(ARROW);
  textFont(pixel);
  textSize(18);
  karte.render();

  if (menuSong.isPlaying()) {
    menuSong.pause();
  }

  //TIMER: 3,2,1,.. Counter + ANIMATION: Numbers
  if (!startTimer) {
    hud.drawTutorial();
    ani.beforeGame();
  }


  else {
    //TIMER: cooldown
    ani.coolDownTimer();

    //TIMER: sudden death, falling blocks
    suddenDeath.update();

    //DRAW: BombList
    bombPlant();

    for (const player of players) {
      if (player.live > 0) {
        player.update();
        player.itemCollected(karte.itemMap);
      }
    }

    //SKULL: curse effects that need the whole game
    skullCurses();

    players.forEach((player, i) => player.render(playerPics[i]));

    players.forEach((player, i) => {
      if (!player.cooldown && player.live > 0) {
        player.move(karte.map, playerPics[i]);
      }
    });

    suddenDeath.render();

    //DRAW: marker above the own character in online games
    if (netMode != "local" && players[myIndex] && players[myIndex].live > 0 && !players[myIndex].cooldown) {
      const me = players[myIndex];
      push();
      fill(255);
      stroke(0);
      strokeWeight(2);
      triangle(me.pos.x - 7, me.pos.y - 48, me.pos.x + 7, me.pos.y - 48, me.pos.x, me.pos.y - 39);
      pop();
    }

    //CHANGE: state if only one player is left (after the death animation)
    const alive = players.filter((player) => player.live > 0);
    const dying = players.some((player) => player.live == 0 && player.cooldown);
    if (alive.length <= 1 && !dying) {
      winner = alive.length == 1 ? players.indexOf(alive[0]) : -1;
      hitFrameMain = frame;
      animationCounter = 0;
      gamemode = 3;
    }

    //DRAW: live, speed, bombcount, explosionradius, killtext
    if (players.length == 2) {
      hud.render(players[0], players[1]);
    } else {
      players.forEach((player, i) => hud.renderCompact(player, i));
      hud.drawBirds();
    }

    //DRAW: shield, skull and item texts on top of the HUD
    for (const player of players) {
      if (!player.cooldown && player.live > 0) {
        player.drawStatus();
      }
    }
    drawPopups();

    //DRAW: round timer and HURRY UP
    suddenDeath.drawTimer();
    suddenDeath.drawBanner();
  }
}

function bombPlant() {

  //CHAIN REACTION: a bomb in the fire of another explosion explodes right away
  for (const list of bombs) {
    for (const bomb of list) {
      if (bomb.bombActive && bombs.some((other) => other.some((o) => o.explosionActive && o.explosionMap[bomb.row][bomb.col] == 3))) {
        bomb.detonate();
      }
    }
  }

  //REPEAT: for the bombs of every player
  for (let owner = 0; owner < players.length; owner++) {
    const list = bombs[owner];
    for (let i = 0; i < list.length; i++) {
      const bomb = list[i];
      bomb.bombPlanted(karte.map);

      //COLISION: Explosion with player & Bomb with player
      players.forEach((player, p) => {
        if (player.live > 0) {
          player.checkHit(bomb.explosionMap, hitSounds[p]);
        }
      });
      for (const player of players) {
        if (player.live > 0) {
          const blocked = player.checkBomb(bomb.bombPos, bomb.bombActive);
          if (blocked >= 0 && player.kick) {
            kickBomb(player, bomb, blocked);
          }
        }
      }

      //COLISION: Explosion with items and map
      if (bomb.explosionActive) {
        karte.burnItems(bomb.explosionMap);
      }
      karte.change(bomb.explosionMap, !bomb.explosionActive, !bomb.bombActive);

      //COUNTER: How many explosions
      if (bomb.explode) {
        explosionCount[owner]++;
        bomb.explode = false;
      }
      //REMOVE: delete bomb after explosion (i-- so the next bomb is not skipped)
      if (!bomb.bombActive && !bomb.explosionActive) {
        list.splice(i, 1);
        explosionCount[owner]--;
        i--;
      }
    }
  }
}

//KICK: only when the player walks straight against the bomb (direction: 0 = up, 1 = down, 2 = left, 3 = right)
function kickBomb(player, bomb, direction) {
  const dirX = [0, 0, -1, 1][direction];
  const dirY = [-1, 1, 0, 0][direction];
  const offset = dirX != 0 ? Math.abs(player.pos.y - bomb.bombPos.y) : Math.abs(player.pos.x - bomb.bombPos.x);
  if (offset < 20) {
    bomb.kick(dirX, dirY);
  }
}

function placeBomb(p) {
  const player = players[p];
  const col = toInt(player.pos.x / block);
  const row = toInt(player.pos.y / block);
  //only one bomb per field (Bomberman 1 allowed stacking)
  const taken = bombs.some((list) => list.some((bomb) => bomb.bombActive && bomb.col == col && bomb.row == row));
  if (player.curse == "NO BOMBS" || taken) {
    return;
  }
  if (player.invBomb > bombs[p].length - explosionCount[p]) {
    //create new Bomb
    bombs[p].push(new Bomb(player.pos, player.bombRadius(), player.pierce, player.bombFuse()));
    bombPut.play(1, 0.1 * volume);
  }
}

//SKULL: DIARRHEA places bombs all the time, touching another player passes the curse on
function skullCurses() {
  players.forEach((player, p) => {
    if (player.curse == "DIARRHEA" && player.live > 0 && !player.cooldown) {
      placeBomb(p);
    }
  });
  const canTouch = (player) => player.live > 0 && !player.cooldown;
  for (const from of players) {
    for (const to of players) {
      if (from != to && from.curse && !to.curse && canTouch(from) && canTouch(to) &&
        frame - from.curseFrom > 60 && dist(from.pos.x, from.pos.y, to.pos.x, to.pos.y) < 30) {
        const until = from.curseUntil;
        to.setCurse(from.curse);
        to.curseUntil = until;
        from.clearCurse();
        curseSound.play(1, 0.1 * volume);
        addPopup("SKULL: " + to.curse, to.pos.x, to.pos.y - 40, [200, 130, 255]);
      }
    }
  }
}

//POPUP: short text above a player, flies up and fades out
function addPopup(message, x, y, color) {
  //top row: below the player, otherwise the text would fly into the HUD
  popups.push({ message: message, x: constrain(x, 90, width - 90), y: y < 60 ? y + 95 : y, color: color, start: frame });
}

function drawPopups() {
  popups = popups.filter((popup) => frame - popup.start < 70);
  push();
  textFont(pixel);
  textSize(16);
  textAlign(CENTER);
  for (const popup of popups) {
    const age = frame - popup.start;
    const alpha = age < 40 ? 255 : 255 - (age - 40) * 8;
    const y = popup.y - age * 0.5;
    fill(0, alpha);
    text(popup.message, popup.x + 2, y + 2);
    fill(popup.color[0], popup.color[1], popup.color[2], alpha);
    text(popup.message, popup.x, y);
  }
  pop();
}
//___________________________________________________________________________________________________
//___________________________________________________________________________________________________

//case 3:
function endScreen() {
  ambient.stop();
  karte.render();

  //VICTORY: about 2 seconds of cheering, then the banner (its timer starts now)
  if (winner >= 0 && !victoryShown) {
    if (frame - hitFrameMain < 115) {
      players[winner].drawVictory(playerPics[winner], frame - hitFrameMain);
      return;
    }
    victoryShown = true;
    hitFrameMain = frame;
  }

  //ANIMATION: Counter
  if (animationCounter >= 300 && animationCounter < 350) {
    animationCounter++;
  } else if (animationCounter < 300) {
    animationCounter = animationCounter + 25;

  //BUTTON: Back to menu (online: back to the lobby)
  } else if (keyIsPressed || endTapped) {
    animationCounter = 0;
    if (netMode == "local") {
      showScreen(0);
    } else {
      backToLobby();
    }
    return;
  }

  //DRAW Background banner
  ani.endAnimation();
}

//___________________________________________________________________________________________________
//___________________________________________________________________________________________________

//case 4: a browser tab can not be closed by the game, so QUIT shows this screen with the credits
function quitScreen() {
  cursor(ARROW);
  fill(0);
  rect(width / 2, height / 2, width, height);
  fill(255);
  textFont(geospeed);
  textSize(48);
  text("THANKS FOR", width / 2, 250);
  text("PLAYING", width / 2, 310);

  //CREDITS
  textFont(pixel);
  textSize(22);
  text("CREDITS", width / 2, 430);
  textSize(16);
  text("Game by Korel Öztekin", width / 2, 470);
  text("Some of the songs and/or sound effects in this project", width / 2, 520);
  text("were created by ViRiX Dreamcore (David Mckee).", width / 2, 545);
  text("www.virixcore.net for more information", width / 2, 570);
  text("Bomberman character sprites ripped by Phongpon.", width / 2, 610);

  textSize(20);
  text("CLICK TO GO BACK", width / 2, 700);
}

//case 7: ITEMS page from the menu
function itemGuide() {
  if (!menuSong.isPlaying()) {
    menuSong.loop(1, 0.02 * volume);
  }
  hud.drawItemGuide();
  hud.itemGuideButtons();
}

//PAUSE: ESC or P in local games
function canPause() {
  return gamemode == 2 && netMode == "local";
}

function togglePause() {
  paused = !paused;
  pauseSound.play(1, 0.1 * volume);
  if (paused) {
    //last game picture, the pause screen is drawn on top of it every frame
    pauseSnapshot = get();
    ambient.pause();
  } else {
    lastTime = performance.now();
    if (startTimer) {
      ambient.loop(1, 0.1 * volume);
    }
  }
}

//PAUSE: Q -> back to the menu
function quitFromPause() {
  paused = false;
  ambient.stop();
  bombs = [];
  showScreen(0);
}

function pauseScreen() {
  imageMode(CORNER);
  image(pauseSnapshot, 0, 0, width, height);
  push();
  rectMode(CENTER);
  noStroke();
  fill(0, 150);
  rect(width / 2, height / 2, width, height);

  //PANEL: same colors as the menu buttons
  fill(0, 70);
  rect(width / 2 + 5, height / 2 + 5, 420, 280, 16);
  fill(78, 92, 128);
  stroke(245);
  strokeWeight(4);
  rect(width / 2, height / 2, 420, 280, 16);
  noStroke();

  textAlign(CENTER);
  textFont(geospeed);
  textSize(72);
  fill(255, 215, 0);
  text("PAUSE", width / 2, height / 2 - 40);

  pop();

  //BUTTONS: tap / click, keyboard: ESC / P and Q
  hud.drawPanelButton("CONTINUE", width / 2, height / 2 + 20, 300, 46, overPauseButton(0));
  hud.drawPanelButton("QUIT TO MENU", width / 2, height / 2 + 78, 300, 46, overPauseButton(1));
  push();
  textAlign(CENTER);
  textFont(pixel);
  textSize(13);
  fill(255, 200);
  text(touchMode ? "TAP A BUTTON" : "ESC / P = CONTINUE     Q = QUIT", width / 2, height / 2 + 125);
  pop();
}

//PAUSE: is the mouse / finger on button 0 (continue) or 1 (quit)
function overPauseButton(index) {
  return Math.abs(mouseX - width / 2) < 150 && Math.abs(mouseY - (height / 2 + 20 + 58 * index)) < 23;
}

//case 5 + 6: background behind the HTML panels (local / online, lobby)
function panelBackground() {
  imageMode(CENTER);
  cursor(ARROW);
  if (!menuSong.isPlaying()) {
    menuSong.loop(1, 0.02 * volume);
  }
  fill(82, 115, 181);
  rect(width / 2, height / 2, width, height);
  ani.variable();
  pic(bomberman, width - 100 + movement.x, height / 2 + movement.y);
}

//___________________________________________________________________________________________________
//___________________________________________________________________________________________________


//INPUT: events are [player, type, direction], type 0 = press, 1 = release, 2 = bomb, 3 = left the game
function applyEvent([p, type, direction]) {
  const player = players[p];
  if (!player) {
    return;
  }
  if (type == 0) {
    if (!player.cooldown && player.live > 0 && gamemode == 2) {
      player.pressDirection(direction);
    }
  } else if (type == 1) {
    player.releaseDirection(direction);
  } else if (type == 2) {
    if (!player.cooldown && player.live > 0 && gamemode == 2) {
      placeBomb(p);
    }
  } else if (type == 3) {
    player.live = 0;
    player.cooldown = false;
    player.keys.fill(false);
  }
}

//INPUT: online both key sets control the own character
function ownInput(type, direction) {
  if (netMode == "host") {
    pendingEvents.push([myIndex, type, direction]);
  } else {
    sendInput(type, direction);
  }
}

function keyPressed() {
  //ESC: back from the ITEMS page
  if (gamemode == 7 && keyCode == 27) {
    gamemode = 0;
  }

  //SETTINGS: new bomb key, ESC back to the menu
  if (gamemode == 1) {
    if (keyChangeOne || keyChangeTwo) {
      hud.changeBombKey(keyCode);
    } else if (keyCode == 27) {
      gamemode = 0;
    }
    return false;
  }

  //PAUSE: ESC / P (not if one of them is a bomb key), while paused only Q does something
  if (canPause() && (keyCode == 27 || keyCode == 80) && keyCode != keyBombOne && keyCode != keyBombTwo) {
    togglePause();
    return false;
  }
  if (paused) {
    if (keyCode == 81) {
      quitFromPause();
    }
    return false;
  }
  if (gamemode == 2) {
    if (netMode == "local") {
      //walk P1 + P2
      [keyCodeOne, keyCodeTwo].forEach((keySet, p) => {
        const direction = keySet.indexOf(keyCode);
        if (direction >= 0) {
          applyEvent([p, 0, direction]);
        }
      });
      //bombkey P1 + P2
      if (keyCode == keyBombOne) {
        applyEvent([0, 2, 0]);
      }
      if (keyCode == keyBombTwo) {
        applyEvent([1, 2, 0]);
      }
    } else {
      const direction = Math.max(keyCodeOne.indexOf(keyCode), keyCodeTwo.indexOf(keyCode));
      if (direction >= 0) {
        ownInput(0, direction);
      }
      if (keyCode == keyBombOne || keyCode == keyBombTwo) {
        ownInput(2, 0);
      }
    }
  }

  //BROWSER: stop arrow keys / space from scrolling and ALT from opening the menu bar
  if (document.activeElement.tagName != "INPUT" && [18, 32, 37, 38, 39, 40, keyBombOne, keyBombTwo].includes(keyCode)) {
    return false;
  }
}

function keyReleased() {
  if (netMode == "local") {
    [keyCodeOne, keyCodeTwo].forEach((keySet, p) => {
      const direction = keySet.indexOf(keyCode);
      if (direction >= 0) {
        applyEvent([p, 1, direction]);
      }
    });
  } else if (gamemode == 2) {
    const direction = Math.max(keyCodeOne.indexOf(keyCode), keyCodeTwo.indexOf(keyCode));
    if (direction >= 0) {
      ownInput(1, direction);
    }
  }
  if (keyCode == 18) {
    return false;
  }
}

function releaseAllKeys() {
  if (netMode == "local") {
    for (const player of players) {
      player.keys.fill(false);
    }
  } else if (gamemode == 2) {
    for (let direction = 0; direction < 4; direction++) {
      ownInput(1, direction);
    }
  }
}

function mousePressed() {
  if (paused) {
    if (overPauseButton(0)) {
      togglePause();
    } else if (overPauseButton(1)) {
      quitFromPause();
    }
  }
  //END: tap / click to continue, once "PRESS ANY KEY" is shown
  if (gamemode == 3 && animationCounter >= 350) {
    endTapped = true;
  }
}

function mouseReleased() {
  soundChange = true;
  if (gamemode == 4) {
    gamemode = 0;
  }
}
