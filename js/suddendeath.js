/*
SuddenDeath class
  after BALANCE.roundTime "HURRY UP" appears and blocks fall from the outside to the middle,
  always 4 at once (one per side, turned by 90 degrees) so every corner is equally fast in danger,
  a block crushes players (out of the round), bombs (explode) and items
  Autor: Korel Öztekin
*/


class SuddenDeath {

  constructor() {
    //groups of fields that get their blocks at the same time
    this.order = ringOrder();
    //the 3x3 fields in the middle stay free
    this.fillCount = this.order.findIndex((group) => group.some(([row, col]) => row >= 6 && row <= 8 && col >= 6 && col <= 8));
    this.next = 0;
    this.falling = [];
    this.roundStart = -1;
    this.activeFrame = -1;
  }

  get active() {
    return this.activeFrame >= 0;
  }

  //TIMER: frames left until HURRY UP
  timeLeft() {
    if (this.roundStart < 0) {
      return BALANCE.roundTime;
    }
    return Math.max(0, BALANCE.roundTime - (frame - this.roundStart));
  }

  update() {
    if (this.roundStart < 0) {
      this.roundStart = frame;
    }
    if (!this.active && this.timeLeft() == 0) {
      this.activeFrame = frame;
      hurryUp.play(1, 0.2 * volume);
    }
    if (!this.active) {
      return;
    }

    //DROP: a new block every few frames, after the HURRY UP banner
    const since = frame - this.activeFrame - BALANCE.hurryUpTime;
    if (since >= 0 && since % BALANCE.blockInterval == 0 && this.next < this.fillCount) {
      for (const [row, col] of this.order[this.next]) {
        this.falling.push({ row: row, col: col, start: frame });
      }
      this.next++;
    }

    //LAND: blocks that reached the ground
    for (let i = this.falling.length - 1; i >= 0; i--) {
      const drop = this.falling[i];
      if (frame - drop.start >= BALANCE.blockFallTime) {
        this.falling.splice(i, 1);
        this.land(drop.row, drop.col);
      }
    }
  }

  land(row, col) {
    karte.map[row][col] = 0;
    karte.itemMap[row][col] = 0;
    karte.boxItems[row][col] = 0;
    blockLand.play(1, 0.06 * volume);

    //BOMB: crushed bombs explode
    for (const list of bombs) {
      for (const bomb of list) {
        if (bomb.bombActive && bomb.col == col && bomb.row == row) {
          bomb.detonate();
        }
      }
    }
    //PLAYER: crushed players are out, the shield does not help
    players.forEach((player, p) => {
      if (player.live > 0 && !player.cooldown && toInt(player.pos.x / block) == col && toInt(player.pos.y / block) == row) {
        player.crush(hitSounds[p]);
      }
    });
  }

  //RESPAWN: free field that gets a block as late as possible (spawn corners are walled first)
  safeSpot() {
    for (let i = this.order.length - 1; i >= this.next; i--) {
      for (const [row, col] of this.order[i]) {
        const bomb = bombs.some((list) => list.some((b) => b.bombActive && b.col == col && b.row == row));
        if (karte.map[row][col] == 1 && !bomb) {
          return { x: col * block + (block / 2), y: row * block + (block / 2) };
        }
      }
    }
    //only boxes left -> clear the middle
    const [row, col] = this.order[this.order.length - 1][0];
    karte.map[row][col] = 1;
    return { x: col * block + (block / 2), y: row * block + (block / 2) };
  }

  //DRAW: falling blocks with a shadow that grows on the target field
  render() {
    imageMode(CORNER);
    for (const drop of this.falling) {
      const t = (frame - drop.start) / BALANCE.blockFallTime;
      const x = drop.col * block;
      const y = drop.row * block;
      const shadow = block * (0.3 + 0.6 * t);
      push();
      noStroke();
      fill(0, 60 + 100 * t);
      rectMode(CENTER);
      rect(x + block / 2, y + block / 2, shadow, shadow, 6);
      pop();
      //falling block: looks like the pillars (with outline, so it is visible above walls too)
      pic(tilePillar, x, y - (1 - t) * 250, block, block);
    }
  }

  //DRAW: round timer in the top row (P1 is on the left, P3 runs down the right wall)
  drawTimer() {
    const x = 650;
    const y = 25;
    const seconds = Math.ceil(this.timeLeft() / 60);
    const label = this.active ? "!!!" : idiv(seconds, 60) + ":" + String(seconds % 60).padStart(2, "0");
    push();
    rectMode(CENTER);
    noStroke();
    fill(20, 20, 30, 220);
    rect(x, y, 70, 24, 6);
    textFont(pixel);
    textAlign(CENTER);
    textSize(18);
    //last 10 seconds and sudden death: red and blinking
    if ((seconds <= 10 || this.active) && idiv(frame, 15) % 2 == 0) {
      fill(255, 70, 70);
    } else {
      fill(255);
    }
    text(label, x, y + 6);
    pop();
  }

  //DRAW: HURRY UP banner at the start of the sudden death
  drawBanner() {
    if (!this.active || frame - this.activeFrame >= BALANCE.hurryUpTime) {
      return;
    }
    const age = frame - this.activeFrame;
    //slides in from the right, stays, slides out to the left
    const x = age < 20 ? width + 300 - age * (width / 2 + 300) / 20
      : age > BALANCE.hurryUpTime - 20 ? width / 2 - (age - (BALANCE.hurryUpTime - 20)) * (width / 2 + 300) / 20
        : width / 2;
    push();
    rectMode(CENTER);
    noStroke();
    fill(180, 20, 20, 220);
    rect(width / 2, height / 2, width, 110);
    textFont(geospeed);
    textAlign(CENTER);
    textSize(80);
    fill(0, 120);
    text("HURRY UP!", x + 4, height / 2 + 32);
    fill(idiv(frame, 8) % 2 == 0 ? color(255, 220, 0) : color(255));
    text("HURRY UP!", x, height / 2 + 28);
    pop();
  }
}


//ORDER: ring by ring from the outside to the middle, every step one field per side
//       (top left -> right, right top -> down, bottom right -> left, left bottom -> up), hard walls are left out
function ringOrder() {
  const order = [];
  for (let k = 1; k <= 7; k++) {
    const lo = k;
    const hi = 14 - k;
    if (lo == hi) {
      order.push([[lo, lo]]);
      continue;
    }
    for (let j = 0; j < hi - lo; j++) {
      const group = [[lo, lo + j], [lo + j, hi], [hi, hi - j], [hi - j, lo]]
        .filter(([row, col]) => karte.startMap[row][col] != 0);
      if (group.length > 0) {
        order.push(group);
      }
    }
  }
  return order;
}
