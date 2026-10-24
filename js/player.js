/*
Player class
  creates player one and player two, creating variables, and checking collisions with #Karte
  Autor: Korel Öztekin
  date: 15.03.2024
  Bomberman 2: balanced speed, new items (kick, shield, heart, skull, pierce, full fire)
*/


class Player {

  //CONSTRUCTOR
  constructor(x, y) {
    //ITEM variables
    this.speedLevel = 0;
    this.invBomb = 1;
    this.explosionRadius = 1;
    this.kick = false;
    this.pierce = false;
    this.shieldUntil = 0;
    //SKULL: name of the curse (see CURSES) and until which frame it lasts
    this.curse = null;
    this.curseUntil = 0;
    this.curseFrom = 0;

    //player variables
    this.live = 3;
    this.hit = true;
    this.cooldown = false;
    this.respawntimer = true;

    //playerposition
    this.pos = { x: x, y: y };
    this.spawnPos = { x: x, y: y };
    //playersize
    this.pWidth = 18;
    this.pHeight = 24;
    //ANIMATION: since when the player stands still (idle / stun animation)
    this.idleSince = 0;
    this.playerMapX = 0;
    this.playerMapY = 0;

    this.hitframe = 0;
    this.keys = [false, false, false, false];
    this.playerInBomb = false;
    this.lastDirection = 0;
  }

  //SPEED: every skate adds a little, the skull curses override it
  get speed() {
    if (this.curse == "SLOW") {
      return 1.2;
    }
    if (this.curse == "TURBO") {
      return 5;
    }
    return BALANCE.startSpeed + BALANCE.speedStep * this.speedLevel;
  }

  get shielded() {
    return frame < this.shieldUntil;
  }

  //BOMB: values for the next bomb (the skull can change them)
  bombRadius() {
    return this.curse == "TINY FIRE" ? 1 : this.explosionRadius;
  }

  bombFuse() {
    return this.curse == "SHORT FUSE" ? BALANCE.shortFuse : BALANCE.fuse;
  }

  //TIMER: curse runs out
  update() {
    if (this.curse && frame >= this.curseUntil) {
      this.clearCurse();
    }
  }

  setCurse(curse) {
    this.clearCurse();
    this.curse = curse;
    this.curseFrom = frame;
    this.curseUntil = frame + BALANCE.curseTime;
    if (curse == "REVERSE") {
      this.keys.fill(false);
    }
  }

  clearCurse() {
    //the directions swap with REVERSE, release all keys so none gets stuck
    if (this.curse == "REVERSE") {
      this.keys.fill(false);
    }
    this.curse = null;
  }

  render(playerPic) {
    rectMode(CENTER);

    //ANIMATION: Hit by explosion
    if (this.cooldown) {
      imageMode(CENTER);
      const t = frame - this.hitframe;

      //BLOOD: over the whole screen, fades out slowly until the respawn
      drawingContext.globalAlpha = 0.85 * Math.pow(Math.max(0, 1 - t / 120), 1.5);
      pic(blood, width / 2, height / 2);

      //KILL: small above the player, pops in, shakes a moment and fades out after about half a second
      if (t < 60) {
        const size = 0.42 * (t < 8 ? 1.4 - 0.4 * t / 8 : 1);
        const shake = t < 12 ? (t % 4) - 1.5 : 0;
        drawingContext.globalAlpha = t < 35 ? 1 : 1 - (t - 35) / 25;
        sprite(kill, 242, 292, 266, 165, constrain(this.pos.x, 90, width - 90) + shake,
          Math.max(this.pos.y - 70, 60), 266 * size, 165 * size);
      }
      drawingContext.globalAlpha = 1;

      //DEFEAT: spins, falls and stays down until the respawn
      this.drawBody(playerPic, "defeat", Math.min(13, idiv(frame - this.hitframe, 8)));
      imageMode(CORNER);
    }
  }

  //DRAW: one animation frame at the player position, with a shadow under the feet
  drawBody(playerPic, anim, index) {
    push();
    noStroke();
    fill(0, 70);
    ellipse(this.pos.x, this.pos.y + 13, 28, 10);
    pop();
    //SKULL: cursed players flicker purple
    if (this.curse && idiv(frame, 6) % 2 == 0) {
      tint(190, 110, 255);
    }
    drawBomber(playerPic, anim, index, this.pos.x, this.pos.y + 14);
    noTint();
  }

  //DRAW: walking, or standing (stun with a curse, shield pose, idle after a while, else breathing)
  drawMoving(playerPic, walking) {
    const dir = DIR_NAMES[this.lastDirection];
    const still = frame - this.idleSince;
    if (walking) {
      this.idleSince = frame;
      this.drawBody(playerPic, "walk" + dir, idiv(frame, 6));
    } else if (this.curse) {
      //plays once, then loops from frame 2
      const t = idiv(still, 7);
      this.drawBody(playerPic, "stun", t < 8 ? t : 2 + (t - 8) % 6);
    } else if (this.shielded) {
      this.drawBody(playerPic, "shield" + dir, idiv(frame, 15));
    } else if (still > 240 && idiv(still - 240, 8) < IDLE_SEQUENCE.length) {
      this.drawBody(playerPic, "idle", IDLE_SEQUENCE[idiv(still - 240, 8)]);
    } else {
      if (still > 240) {
        //idle animation finished -> wait again
        this.idleSince = frame;
      }
      this.drawBody(playerPic, "stand" + dir, [0, 1, 2, 1][idiv(frame, 15) % 4]);
    }
  }

  //DRAW: winner on the field at the end of the round (cheering, then jumping)
  drawVictory(playerPic, since) {
    if (since < 72) {
      this.drawBody(playerPic, "victory", idiv(since, 6));
    } else {
      this.drawBody(playerPic, "jump", idiv(since - 72, 5));
    }
  }

  //DRAW: shield bubble with a spinning shield and dizzy stars above the head
  drawStatus() {
    imageMode(CENTER);
    if (this.shielded) {
      const left = this.shieldUntil - frame;
      //blinks during the last 2 seconds
      if (left > 120 || idiv(frame, 6) % 2 == 0) {
        push();
        noFill();
        strokeWeight(3);
        stroke(120, 220, 255, 140 + 80 * sin(frame * 0.2));
        ellipse(this.pos.x, this.pos.y - 10, 46, 56);
        pop();
        //spinning shield, the last frame (dark) blinks when it runs out
        const shieldFrame = left > 120 ? idiv(frame, 6) % 6 : 6;
        sprite(effects, shieldFrame * 26, 0, 16, 20, this.pos.x + 20, this.pos.y - 2, 16, 20);
      }
    }
    if (this.curse) {
      //two stars circle around the head
      for (const phase of [0, 3]) {
        sprite(effects, ((idiv(frame, 5) + phase) % 7) * 26, 20, 26, 12, this.pos.x, this.pos.y - 38, 39, 18);
      }
    }
    imageMode(CORNER);
  }


  move(map, playerPic) {
    const pos = this.pos;
    const speed = this.speed;
    const halfW = this.pWidth / 2;
    const halfH = this.pHeight / 2;
    const walking = this.keys[0] || this.keys[1] || this.keys[2] || this.keys[3];

    this.playerMapY = toInt(pos.y / block);
    this.playerMapX = toInt(pos.x / block);
    if (this.respawntimer && !this.cooldown) {
      if (idiv(frame, 10) % 2 == 0)
        drawingContext.globalAlpha = 0.5;
    } else {
      drawingContext.globalAlpha = 1;
    }

    //COLISION: with Bomb, destroyable wall, hard wall
    if (walking) {

      //WALK: Up
      if (this.keys[0]) {
        if (map[toInt(((pos.y - speed) - halfH) / block)][toInt((pos.x + halfW) / block)] == 1 &&
          map[toInt(((pos.y - speed) - halfH) / block)][toInt((pos.x - halfW) / block)] == 1) {
          pos.y -= speed;
        } else {
          this.cornerAssist(map, 0, -1);
        }
        this.lastDirection = 2;
      }

      //WALK: Down
      if (this.keys[1]) {
        if (map[toInt(((pos.y + speed) + halfH) / block)][toInt((pos.x + halfW) / block)] == 1 &&
          map[toInt(((pos.y + speed) + halfH) / block)][toInt((pos.x - halfW) / block)] == 1) {
          pos.y += speed;
        } else {
          this.cornerAssist(map, 0, 1);
        }
        this.lastDirection = 1;
      }

      //WALK: Left
      if (this.keys[2]) {
        if (map[toInt((pos.y - halfH) / block)][toInt(((pos.x - speed) - halfW) / block)] == 1 &&
          map[toInt((pos.y + halfH) / block)][toInt(((pos.x - speed) - halfW) / block)] == 1) {
          pos.x -= speed;
        } else {
          this.cornerAssist(map, -1, 0);
        }
        this.lastDirection = 3;
      }

      //WALK: Right
      if (this.keys[3]) {
        if (map[toInt((pos.y - halfH) / block)][toInt(((pos.x + speed) + halfW) / block)] == 1 &&
          map[toInt((pos.y + halfH) / block)][toInt(((pos.x + speed) + halfW) / block)] == 1) {
          pos.x += speed;
        } else {
          this.cornerAssist(map, 1, 0);
        }
        this.lastDirection = 0;
      }

    }

    //ANIMATION: walking / standing
    if (!this.cooldown) {
      this.drawMoving(playerPic, walking);
    }
    drawingContext.globalAlpha = 1;
  }


  //WALK: blocked at a corner -> slide into the free lane next to it
  //      (Bomberman 2, makes turning into a corridor easy, important for the touch stick)
  cornerAssist(map, dirX, dirY) {
    const vertical = dirY != 0;
    const along = vertical ? this.pos.x : this.pos.y;
    const center = toInt(along / block) * block + (block / 2);
    const offset = along - center;
    if (offset == 0 || Math.abs(offset) > 18) {
      return;
    }
    //the next field in walking direction has to be free
    const col = toInt(this.pos.x / block) + dirX;
    const row = toInt(this.pos.y / block) + dirY;
    if (map[row][col] != 1) {
      return;
    }
    const step = Math.min(this.speed, Math.abs(offset)) * -Math.sign(offset);
    if (vertical) {
      this.pos.x += step;
    } else {
      this.pos.y += step;
    }
  }


  checkHit(explosionMap, hitSound) {

    //COLISION: Player hit with bomb
    if (explosionMap[toInt((this.pos.y + this.pHeight - 15) / block)][this.playerMapX] == 3 || explosionMap[toInt((this.pos.y - this.pHeight + 30) / block)][this.playerMapX] == 3
      || explosionMap[this.playerMapY][toInt((this.pos.x + this.pWidth - 20) / block)] == 3 || explosionMap[this.playerMapY][toInt((this.pos.x - this.pWidth + 20) / block)] == 3) {
      this.hit = true;

      //START: Cooldown
      if (this.hit && !this.respawntimer && !this.shielded) {
        this.live = this.live - 1;
        this.clearCurse();
        this.shieldUntil = 0;
        hitSound.play(1, 0.1 * volume);
        this.respawntimer = true;
        slice.play(1, 0.1 * volume);
        this.cooldown = true;
        // to mainclass
        this.hitframe = frame;
      }
    }
  }


  //returns the direction the bomb blocked (0 = up, 1 = down, 2 = left, 3 = right) or -1
  checkBomb(bombPos, bombActive) {
    const pos = this.pos;
    const speed = this.speed;
    const before = this.keys.slice();

    //COLISION: Player with bomb
    if (((pos.x) > (bombPos.x - 40) && (pos.x) < (bombPos.x + 40)) && ((pos.y) > (bombPos.y - 40) && (pos.y) < (bombPos.y + 40))) {
      this.playerInBomb = true;
    } else {
      this.playerInBomb = false;
    }
    if ((((pos.x + speed) >= bombPos.x - 40 && !(pos.x >= bombPos.x + 40)) && (pos.y <= bombPos.y + 40 && pos.y >= bombPos.y - 40)) && !this.playerInBomb && bombActive) {
      this.keys[3] = false;
    }
    if ((((pos.x - speed) <= bombPos.x + 40 && !(pos.x <= bombPos.x - 40)) && (pos.y <= bombPos.y + 40 && pos.y >= bombPos.y - 40)) && !this.playerInBomb && bombActive) {
      this.keys[2] = false;
    }
    if ((((pos.y + speed) >= bombPos.y - 40 && !(pos.y >= bombPos.y + 40)) && (pos.x <= bombPos.x + 40 && pos.x >= bombPos.x - 40)) && !this.playerInBomb && bombActive) {
      this.keys[1] = false;
    }
    if ((((pos.y - speed) <= bombPos.y + 40 && !(pos.y <= bombPos.y - 40)) && (pos.x <= bombPos.x + 40 && pos.x >= bombPos.x - 40)) && !this.playerInBomb && bombActive) {
      this.keys[0] = false;
    }
    return before.findIndex((pressed, direction) => pressed && !this.keys[direction]);
  }

  itemCollected(itemMap) {
    //COLISION: Player with Item
    const item = itemMap[this.playerMapY][this.playerMapX];
    if (item == 0) {
      return;
    }
    itemMap[this.playerMapY][this.playerMapX] = 0;
    let sound = itemGet;
    let message;
    let color = [255, 255, 255];

    if (item == ITEM_BOMB) {
      message = this.invBomb < BALANCE.maxBombs ? "BOMB +1" : "BOMB MAX";
      this.invBomb = Math.min(this.invBomb + 1, BALANCE.maxBombs);
    } else if (item == ITEM_FIRE) {
      message = this.explosionRadius < BALANCE.maxRadius ? "FIRE +1" : "FIRE MAX";
      this.explosionRadius = Math.min(this.explosionRadius + 1, BALANCE.maxRadius);
    } else if (item == ITEM_SKATE) {
      message = this.speedLevel < BALANCE.maxSpeedLevel ? "SPEED +1" : "SPEED MAX";
      this.speedLevel = Math.min(this.speedLevel + 1, BALANCE.maxSpeedLevel);
    } else if (item == ITEM_KICK) {
      message = "KICK";
      this.kick = true;
    } else if (item == ITEM_PIERCE) {
      message = "PIERCE BOMB";
      this.pierce = true;
    } else if (item == ITEM_FULLFIRE) {
      message = "FULL FIRE";
      this.explosionRadius = BALANCE.maxRadius;
      color = [255, 170, 0];
    } else if (item == ITEM_HEART && this.live < 3) {
      message = "+1 LIFE";
      this.live++;
      sound = extraLife;
      color = [255, 90, 110];
    } else if (item == ITEM_SHIELD || item == ITEM_HEART) {
      //a heart with full lives gives a shield
      message = "SHIELD";
      this.shieldUntil = frame + BALANCE.shieldTime;
      sound = shieldSound;
      color = [120, 220, 255];
    } else if (item == ITEM_SKULL) {
      this.setCurse(CURSES[toInt(rng() * CURSES.length)]);
      message = "SKULL: " + this.curse;
      sound = curseSound;
      color = [200, 130, 255];
    }
    sound.play(1, 0.1 * volume);
    addPopup(message, this.pos.x, this.pos.y - 40, color);
  }

  respawn() {
    this.pos.x = this.spawnPos.x;
    this.pos.y = this.spawnPos.y;
    //SUDDEN DEATH: the corner is walled -> respawn further inside
    if (karte.map[toInt(this.pos.y / block)][toInt(this.pos.x / block)] != 1) {
      const spot = suddenDeath.safeSpot();
      this.pos.x = spot.x;
      this.pos.y = spot.y;
    }
  }

  //SUDDEN DEATH: a falling block crushes the player -> out of the round
  crush(hitSound) {
    this.live = 0;
    this.clearCurse();
    this.shieldUntil = 0;
    this.keys.fill(false);
    hitSound.play(1, 0.1 * volume);
    slice.play(1, 0.1 * volume);
    this.respawntimer = true;
    this.cooldown = true;
    this.hitframe = frame;
  }


  //for movement (direction: 0 = up, 1 = down, 2 = left, 3 = right)

  pressDirection(direction) {
    //SKULL: up <-> down, left <-> right
    if (this.curse == "REVERSE") {
      direction ^= 1;
    }
    this.keys[direction] = true;
    //up / down stops left / right and the other way around
    if (direction < 2) {
      this.keys[2] = false;
      this.keys[3] = false;
    } else {
      this.keys[0] = false;
      this.keys[1] = false;
    }
  }

  releaseDirection(direction) {
    if (this.curse == "REVERSE") {
      direction ^= 1;
    }
    this.keys[direction] = false;
  }
}
