/*
Animations class
  menu hover, countdown before the game, respawn timers and the end screen
  Autor: Korel Öztekin
  date: 15.03.2024
*/


//BOMBER: rows of bomber1-4.png, every frame is 32x40 with the feet at y = 38
//        (built from the sprite sheet "ripped by Phongpon", see credits)
const BOMBER_W = 32;
const BOMBER_H = 40;
const BOMBER_SCALE = 1.75;
const BOMBER_ANIMS = {
  standDown: { row: 0, frames: 3 },
  standLeft: { row: 1, frames: 3 },
  standRight: { row: 2, frames: 3 },
  standUp: { row: 3, frames: 3 },
  walkDown: { row: 4, frames: 6 },
  walkLeft: { row: 5, frames: 6 },
  walkRight: { row: 6, frames: 6 },
  walkUp: { row: 7, frames: 6 },
  stun: { row: 8, frames: 8 },
  victory: { row: 9, frames: 12 },
  defeat: { row: 10, frames: 14 },
  idle: { row: 11, frames: 10 },
  jump: { row: 12, frames: 9 },
  cry: { row: 13, frames: 4 },
  dance: { row: 14, frames: 8 },
  shieldDown: { row: 15, frames: 2 },
  shieldLeft: { row: 16, frames: 2 },
  shieldRight: { row: 17, frames: 2 },
  shieldUp: { row: 18, frames: 2 }
};
//direction names in the order of player.lastDirection (0 = right, 1 = down, 2 = up, 3 = left)
const DIR_NAMES = ["Right", "Down", "Up", "Left"];

//IDLE: frames of the idle row after standing still (look around, blink, stretch)
const IDLE_SEQUENCE = [0, 1, 2, 1, 2, 1, 2, 1, 2, 3, 4, 5, 6, 3, 4, 5, 6, 3, 4, 5, 6, 3, 4, 5, 6,
  7, 8, 9, 7, 8, 9, 7, 8, 9, 7, 8, 9, 7, 8, 9, 7, 8, 9];

//DRAW: one frame of an animation, x / feetY = where the feet stand
function drawBomber(pic, anim, index, x, feetY) {
  const a = BOMBER_ANIMS[anim];
  const f = ((index % a.frames) + a.frames) % a.frames;
  imageMode(CENTER);
  sprite(pic, f * BOMBER_W, a.row * BOMBER_H, BOMBER_W, BOMBER_H,
    x, feetY - (BOMBER_H / 2 - 2) * BOMBER_SCALE, BOMBER_W * BOMBER_SCALE, BOMBER_H * BOMBER_SCALE);
}

//DRAW: head of a player for the HUD and the settings
function drawPortrait(index, x, y, size) {
  imageMode(CENTER);
  sprite(playerPics[index], 6, 9, 20, 20, x, y, size, size);
}


class Animations {

  playButton() {
    if (mouseX < 370 && mouseX > 30 && mouseY < 560 && mouseY > 480) {
      this.hover();
      cursor(HAND);
      if (mouseIsPressed) {
        //gamestart sound
        if (!click.isPlaying()) {
          click.play(1, 0.05 * volume);
        }
        //OPEN: local / online selection
        showScreen(5);
      }
    } else if (!(mouseX < 70 && mouseX > 10 && mouseY < 70 && mouseY > 10) &&
      !(mouseX < 740 && mouseX > 680 && mouseY < 60 && mouseY > 10)) {
      this.resetHover();
    }
  }


  hover() {
    addsize = 1.02;
    colorR = 235;
    colorG = 140;
    colorB = 70;
    cursor(HAND);
  }

  //RESET: Cursor and color
  resetHover() {
    addsize = 1;
    colorR = 255;
    colorG = 255;
    colorB = 255;
    cursor(ARROW);
  }

  variable() {
    //ANIMATION: Counter for menu character
    if (frame % 2 == 0) {
      switch (animation) {
        case 0:
          movement.x++;
          if (movement.x > 60) {
            animation = 1;
          }
          break;
        case 1:
          movement.x--;
          if (movement.x < 0) {
            animation = 0;
          }
          break;
      }
    }
  }

  beforeGame() {

    //COUNTER: int ++ and int--
    if (animationCounter >= 350 && animationCounter < 395) {
      animationCounter++;
    } else {
      animationCounter = animationCounter + 50;
    }
    if (animationCounter > 750) {
      animationCounter = 0;
    }

    textSize(100);

    const seconds = idiv(frame - hitFrameMain, 60);

    //TIMER: 0 -> DRAW: "Fight"
    if (seconds % 4 == 3) {
      this.countdownBand();
      fill(255);
      text("FIGHT", width / 2, 410);

    //TIMER: 3-1 -> DRAW: "number"
    } else if (3 - seconds >= 0) {
      if (!quake.isPlaying()) {
        quake.play(1, 0.05 * volume);
      }
      this.countdownBand();
      fill(255);
      text(3 - seconds, animationCounter, 410);
    }

    //RESET: hitframe for cooldown
    if (seconds % 5 == 4) {
      for (const player of players) {
        player.hitframe = frame;
      }
      startTimer = true;
      if (!ambient.isPlaying()) {
        ambient.loop(1, 0.1 * volume);
      }
    }
  }

  //DRAW: band in the middle for 3, 2, 1, FIGHT
  countdownBand() {
    push();
    rectMode(CENTER);
    noStroke();
    fill(82, 115, 181);
    rect(width / 2, height / 2, 750, 100);
    imageMode(CORNER);
    sprite(bomberman, 0, 200, 750, 100, 300, 325);
    fill(245);
    rect(width / 2, height / 2 - 52, 750, 4);
    rect(width / 2, height / 2 + 52, 750, 4);
    pop();
  }

  coolDownTimer() {
    //cooldown Timer
    for (const player of players) {
      if (player.cooldown && (frame - player.hitframe) % 120 == 0) {
        player.respawn();
        if (player.live > 0) {
          spawn.play(1, 0.05 * volume);
        }
        player.cooldown = false;
      }
    }
    //respawn protection (blinking), the same for every player
    for (const player of players) {
      if (player.respawntimer && (frame - player.hitframe) % 300 == 0) {
        player.respawntimer = false;
      }
    }
    //cooldown Timer end
  }


  endAnimation() {

    const bannerWidth = Math.min(50 * (frame - hitFrameMain), banner.width);
    if (bannerWidth > 0) {
      sprite(banner, 0, 0, bannerWidth, 750, 0, 0);
    }

    //Show WinnerTIE
    if (winner == -1) {
      textFont(geospeed);
      textSize(128);
      fill(255);
      text("TIE", animationCounter, height / 2 + 40);

    } else {
      //SHOW Winner P2 / P4 (picture on the left)
      if (winner % 2 == 1) {

        textFont(geospeed);
        textSize(48);
        fill(255);
        text(PLAYER_NAMES[winner], animationCounter - 130, (height / 2) + 20);
        text("WINS", animationCounter - 130, (height / 2) + 60);
        pic(winPics[winner], animationCounter - 80, 0);

      //SHOW WIinner P1 / P3 (picture on the right)
      } else {
        textFont(geospeed);
        textSize(48);
        fill(255);
        text(PLAYER_NAMES[winner], animationCounter + 150, (height / 2));
        text("WINS", animationCounter + 150, (height / 2) + 40);
        scale(-1, 1);
        pic(winPics[winner], -1 * animationCounter - 200, 0);
        scale(-1, 1);
      }
      if (!endSound) {
        winSounds[winner].play(1, 0.1 * volume);
        endSound = true;
      }
    }
    //ANIMATION draw
    if (animationCounter >= 350) {
      textSize(40);
      fill(255, 150 + ((5 * frame) % 205));
      text(touchMode ? "TAP TO CONTINUE" : "PRESS ANY KEY", width / 2, 700);
    }
  }
}
