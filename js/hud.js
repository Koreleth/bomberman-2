/*
HUD class
  this class prints points, live and other variables you can see
  Autor: Korel Öztekin
  date: 15.03.2024
*/

class HUD {

  constructor() {
    //settings page: which button the mouse is over, message under a bomb key
    this.hover = {};
    this.message = null;
  }

  render(playerOne, playerTwo) {
    imageMode(CENTER);


    //DRAW: Live P1
    for (let h = 0; h < 3; h++) {
      pic(h < playerOne.live ? heart : heart0, 70 + 30 * h, 25, 25, 25);
    }

    //DRAW: Speed P1 (number of skates)
    fill(100, 100, 255);
    rect(205, 25, 50, 20);
    pic(skater, 180, 25, 100, 100);
    fill(255);
    text(" x " + playerOne.speedLevel, 210, 32);

    //DRAW: Bombinv P1
    fill(100, 100, 100);
    rect(295, 25, 50, 20);
    sprite(bombPic, 32, 0, 16, 16, 270, 27, 25, 25);
    fill(255);
    text(" x " + playerOne.invBomb, 298, 32);

    //DRAW: Explosionradius P1
    fill(200, 100, 0);
    rect(390, 25, 50, 20);
    pic(fire, 365, 25, 100, 100);
    fill(255);
    text(" x " + playerOne.explosionRadius, 395, 32);

    //DRAW: Kick / Pierce P1
    this.drawAbilities(playerOne, 440, 25, 26);

    //DRAW: Image in corner
    drawPortrait(0, 25, 25, 46);


    //DRAW: Live P2
    for (let h = 0; h < 3; h++) {
      pic(h < playerTwo.live ? heart : heart0, 680 - 30 * h, 725, 25, 25);
    }

    //DRAW: Speed P2 (number of skates)
    fill(100, 100, 255);
    rect(555, 725, 50, 20);
    pic(skater, 580, 725, 100, 100);
    fill(255);
    text(playerTwo.speedLevel + " x ", 550, 732);

    //DRAW: BombInv P2
    fill(100, 100, 100);
    rect(460, 725, 50, 20);
    sprite(bombPic, 32, 0, 16, 16, 490, 727, 25, 25);
    fill(255);
    text(playerTwo.invBomb + " x ", 453, 732);

    //DRAW: Explosioradius P2
    fill(200, 100, 0);
    rect(370, 725, 50, 20);
    pic(fire, 395, 725, 100, 100);
    fill(255);
    text(playerTwo.explosionRadius + " x ", 365, 732);

    //DRAW: Kick / Pierce P2
    this.drawAbilities(playerTwo, 310, 725, -26);

    //DRAW: Image corner
    drawPortrait(1, 725, 725, 46);

    this.drawBirds();
  }


  //DRAW: icons of the items a player keeps (kick, pierce), step < 0 -> from right to left (or bottom to top)
  drawAbilities(player, x, y, step, vertical = false) {
    imageMode(CENTER);
    const icons = [];
    if (player.kick) {
      icons.push(ITEM_KICK);
    }
    if (player.pierce) {
      icons.push(ITEM_PIERCE);
    }
    icons.forEach((id, i) => drawItem(id, vertical ? x : x + step * i, vertical ? y + step * i : y, Math.abs(step) - 4));
  }


  //DRAW: smaller HUD for 3-4 players, one in each corner (P1 top left, P2 bottom right, P3 top right, P4 bottom left)
  renderCompact(player, index) {
    //P3 + P4 run along the side walls
    if (index >= 2) {
      this.renderVertical(player, index);
      return;
    }
    const mirror = index == 1;
    const y = index == 0 ? 25 : 725;
    const x = (pos) => mirror ? width - pos : pos;
    imageMode(CENTER);

    //DRAW: Image in corner
    drawPortrait(index, x(25), y, 46);

    //DRAW: Live
    for (let h = 0; h < 3; h++) {
      pic(h < player.live ? heart : heart0, x(64 + 22 * h), y, 20, 20);
    }

    //DRAW: Speed, Bombinv, Explosionradius
    textSize(14);
    fill(100, 100, 255);
    rect(x(160), y, 52, 18);
    pic(skater, x(160) + (mirror ? 24 : -24), y, 76, 76);
    fill(100, 100, 100);
    rect(x(222), y, 52, 18);
    sprite(bombPic, 32, 0, 16, 16, x(222) + (mirror ? 22 : -22), y + 2, 20, 20);
    fill(200, 100, 0);
    rect(x(284), y, 52, 18);
    pic(fire, x(284) + (mirror ? 24 : -24), y, 76, 76);

    fill(255);
    const textX = (pos) => x(pos) + (mirror ? -6 : 6);
    text("x " + player.speedLevel, textX(160), y + 5);
    text("x " + player.invBomb, textX(222), y + 5);
    text("x " + player.explosionRadius, textX(284), y + 5);

    //DRAW: Kick / Pierce
    this.drawAbilities(player, x(326), y, mirror ? -22 : 22);
    imageMode(CORNER);
  }


  //DRAW: HUD along a side wall, P3 from the top right corner down, P4 from the bottom left corner up
  renderVertical(player, index) {
    const down = index == 2;
    const cx = down ? width - 25 : 25;
    const y = (pos) => down ? pos : height - pos;
    imageMode(CENTER);

    //DRAW: Image in corner
    drawPortrait(index, cx, y(25), 46);

    //DRAW: Live (hearts one below the other)
    for (let h = 0; h < 3; h++) {
      pic(h < player.live ? heart : heart0, cx, y(58 + 18 * h), 16, 16);
    }

    //DRAW: Speed, Bombinv, Explosionradius (icon on top, number below)
    const stats = [
      [color(100, 100, 255), (sy) => pic(skater, cx, sy, 72, 72), player.speedLevel],
      [color(100, 100, 100), (sy) => sprite(bombPic, 32, 0, 16, 16, cx, sy + 1, 22, 22), player.invBomb],
      [color(200, 100, 0), (sy) => pic(fire, cx, sy, 72, 72), player.explosionRadius]
    ];
    textSize(14);
    stats.forEach(([boxColor, icon, value], i) => {
      const sy = y(140 + 52 * i);
      fill(boxColor);
      rect(cx, sy, 40, 46, 5);
      icon(sy - 9);
      fill(255);
      text("x" + value, cx, sy + 19);
    });

    //DRAW: Kick / Pierce
    this.drawAbilities(player, cx, y(286), down ? 24 : -24, true);
    imageMode(CORNER);
  }


  drawBirds() {
    imageMode(CENTER);
    //DRAW: Enviroment
    //birds
    const birdFrame = 20 * (idiv(frame, 10) % 4);
    sprite(bird, birdFrame, 0, 20, 16, 800 - (frame % 800), 590, 40, 32);
    sprite(bird, birdFrame, 0, 20, 16, 800 - ((frame - 170) % 800), 7400, 40, 32);
    sprite(bird, birdFrame, 0, 20, 16, 800 - ((idiv(frame, 3) - 200) % 800), 45);
    scale(-1, 1);
    sprite(bird, birdFrame, 0, 20, 16, -((frame - 70) % 800), 320, 40, 32);
    sprite(bird, birdFrame, 0, 20, 16, -(idiv(frame - 70, 2) % 800), 75, 30, 24);
    sprite(bird, birdFrame, 0, 20, 16, -(100 + idiv(frame, 3) % 800), 630);
    scale(-1, 1);

    imageMode(CORNER);
  }


  settingButton() {

    //ANIMATION: Hover over button
    if (mouseX < 70 && mouseX > 10 && mouseY < 70 && mouseY > 10) {
      cursor(HAND);
      if (mouseIsPressed) {
        if (!click.isPlaying()) {
          click.play(1, 0.05 * volume);
        }
        //game start
        gamemode = 1;
      }
    }
  }

  quitButton() {
    //ANIMATION: Hover over button
    if (mouseX < 740 && mouseX > 680 && mouseY < 60 && mouseY > 10) {
      cursor(HAND);
      if (mouseIsPressed) {
        menuSong.pause();
        gamemode = 4;
      }
    }
  }

  drawButtons() {
    //DRAW: Buttons
    pic(close, width - 30, 30, 40, 40);
    pic(menubox, 200, 500, 340 * addsize, 175 * addsize);
    fill(colorR, colorG, colorB);
    textFont(geospeed);
    textSize(50 * addsize);
    text("PLAY", 230, 540);
    textFont(pixel);
    textSize(20);
    fill(255);
    text("2.0.0", 70, 730);
    text("Bomberman 2", 70, 710);

    //DRAW: ITEMS button with a "?" box
    this.drawPanelButton("ITEMS", 210, 630, 240, 56, this.itemsHover);
    imageMode(CENTER);
    sprite(itemBox, 0, 0, 50, 50, 112, 630, 38, 38);
  }

  //DRAW: dark button with white border like the PLAY button
  drawPanelButton(label, x, y, w, h, hover) {
    const grow = hover ? 1.02 : 1;
    push();
    rectMode(CENTER);
    noStroke();
    fill(0, 70);
    rect(x + 4, y + 4, w * grow, h * grow, 12);
    fill(78, 92, 128);
    stroke(245);
    strokeWeight(4);
    rect(x, y, w * grow, h * grow, 12);
    noStroke();
    if (hover) {
      fill(235, 140, 70);
    } else {
      fill(255);
    }
    textFont(geospeed);
    textAlign(CENTER);
    textSize(h * 0.6 * grow);
    text(label, x + (label == "ITEMS" ? 18 : 0), y + h * 0.22);
    pop();
  }

  //BUTTON: ITEMS -> page with all items
  itemsButton() {
    this.itemsHover = mouseX < 330 && mouseX > 90 && mouseY < 658 && mouseY > 602;
    if (this.itemsHover) {
      cursor(HAND);
      if (mouseIsPressed) {
        if (!click.isPlaying()) {
          click.play(1, 0.05 * volume);
        }
        gamemode = 7;
      }
    }
  }

  //DRAW: ITEMS page, every item with picture, name and what it does
  drawItemGuide() {
    push();
    rectMode(CORNER);
    imageMode(CENTER);
    noStroke();
    fill(82, 115, 181);
    rect(0, 0, width, height);

    fill(255);
    textAlign(CENTER);
    textFont(geospeed);
    textSize(56);
    text("ITEMS", width / 2, 78);

    //"?" box first, then all items (two columns)
    const entries = [{ name: "? BOX", info: ["hides a random item", "normal boxes are empty"] }];
    for (const id in ITEMS) {
      entries.push({ id: Number(id), name: ITEMS[id].name, info: ITEMS[id].info });
    }
    entries.forEach((entry, i) => {
      const x = i % 2 == 0 ? 35 : 390;
      const y = 160 + idiv(i, 2) * 90;

      fill(0, 45);
      rect(x, y - 38, 325, 76, 10);
      if (entry.id) {
        drawItem(entry.id, x + 34, y, 44);
      } else {
        sprite(itemBox, 50 * (idiv(frame, 20) % 2), 0, 50, 50, x + 34, y, 46, 46);
      }

      textAlign(LEFT);
      textFont(pixel);
      textSize(18);
      fill(255, 215, 0);
      text(entry.name, x + 68, y - 10);
      textSize(13);
      fill(255);
      entry.info.forEach((line, l) => text(line, x + 68, y + 10 + 16 * l));
    });

    //SKULL: list of the curses
    textAlign(CENTER);
    textFont(pixel);
    textSize(16);
    fill(255, 215, 0);
    text("SKULL CURSES", width / 2, 627);
    textSize(14);
    fill(255);
    text(CURSES.slice(0, 4).join("   "), width / 2, 652);
    text(CURSES.slice(4).join("   "), width / 2, 674);
    pop();

    this.drawPanelButton("BACK", 95, 715, 130, 44, this.backHover);
  }

  //BUTTON: BACK on the ITEMS page
  itemGuideButtons() {
    this.backHover = mouseX < 160 && mouseX > 30 && mouseY < 737 && mouseY > 693;
    if (this.backHover) {
      cursor(HAND);
      if (mouseIsPressed) {
        if (!click.isPlaying()) {
          click.play(1, 0.05 * volume);
        }
        gamemode = 0;
      }
    } else {
      cursor(ARROW);
    }
  }

  drawMenu() {
    //DRAW: Menubackground
    fill(82, 115, 181);
    rect(width / 2, height / 2, width, height);
    pic(logo, 240, 120, 500, 500);
    //DRAW: "2" next to the logo, behind the animated character
    push();
    textFont("Impact");
    textStyle(ITALIC);
    textSize(130);
    strokeJoin(ROUND);
    stroke(20, 30, 140);
    strokeWeight(10);
    fill(255, 150, 0);
    text("2", 330, 300);
    noStroke();
    fill(255, 215, 0);
    text("2", 326, 294);
    pop();
    pic(bomberman, width - 100 + movement.x, height / 2 + movement.y);
    pic(setting, 40, 40, 80, 80);
    hitFrameMain = frame;
  }

  //DRAW: intro before the round (controls + tips), the countdown runs in the middle
  drawTutorial() {
    push();
    rectMode(CORNER);
    noStroke();
    fill(10, 15, 35, 150);
    rect(0, 0, width, height);

    if (netMode == "local") {
      this.tutorialPlayer(0, 200, 55, keyCodeOne, keyBombOne);
      this.tutorialPlayer(1, 550, 55, keyCodeTwo, keyBombTwo);
    } else {
      this.tutorialOnline(200, 55);
      this.tutorialPlayers(550, 55);
    }
    this.tutorialTips(445);
    pop();
  }

  //DRAW: card like the menu buttons
  tutorialCard(x, y, w, h) {
    push();
    rectMode(CORNER);
    noStroke();
    fill(0, 90);
    rect(x + 5, y + 5, w, h, 14);
    fill(78, 92, 128, 240);
    stroke(245);
    strokeWeight(3);
    rect(x, y, w, h, 14);
    pop();
  }

  //CARD: one local player (picture, name, move keys, bomb key)
  tutorialPlayer(index, cx, y, moveKeys, bombKey) {
    this.tutorialCard(cx - 165, y, 330, 250);
    drawPortrait(index, cx - 115, y + 40, 50);
    textAlign(LEFT);
    textFont(geospeed);
    textSize(30);
    fill(255);
    text(PLAYER_NAMES[index], cx - 80, y + 52);

    textAlign(CENTER);
    textFont(pixel);
    textSize(14);
    fill(255, 215, 0);
    text("MOVE", cx - 70, y + 100);
    text("BOMB", cx + 85, y + 100);
    textSize(12);
    fill(255, 210);
    if (touchMode) {
      //PHONE: P1 uses the controls on the left, P2 the ones on the right
      this.touchHint(cx - 70, cx + 85, y + 154);
      text((index == 0 ? "LEFT" : "RIGHT") + " CONTROLS   -   II = PAUSE", cx, y + 230);
      return;
    }
    //W A S D or arrows (moveKeys: up, down, left, right)
    const labels = moveKeys[0] == 87 ? ["W", "A", "S", "D"] : [0, 2, 1, 3];
    this.keyCap(cx - 70, y + 133, 38, 38, labels[0]);
    this.keyCap(cx - 114, y + 175, 38, 38, labels[1]);
    this.keyCap(cx - 70, y + 175, 38, 38, labels[2]);
    this.keyCap(cx - 26, y + 175, 38, 38, labels[3]);
    this.keyCap(cx + 85, y + 154, 120, 46, keyName(bombKey), true);
    text("ESC / P = PAUSE", cx, y + 230);
  }

  //DRAW: stick and bomb button like the touch controls (intro on phones)
  touchHint(stickX, bombX, y) {
    push();
    noFill();
    stroke(245);
    strokeWeight(3);
    fill(20, 28, 55, 140);
    ellipse(stickX, y, 76, 76);
    noStroke();
    fill(255);
    ellipse(stickX + 10, y - 6, 32, 32);
    //arrows around the knob
    fill(255, 215, 0);
    triangle(stickX, y - 34, stickX - 6, y - 26, stickX + 6, y - 26);
    triangle(stickX, y + 34, stickX - 6, y + 26, stickX + 6, y + 26);
    triangle(stickX - 34, y, stickX - 26, y - 6, stickX - 26, y + 6);
    triangle(stickX + 34, y, stickX + 26, y - 6, stickX + 26, y + 6);

    stroke(245);
    strokeWeight(3);
    fill(78, 92, 128);
    ellipse(bombX, y, 66, 66);
    imageMode(CENTER);
    sprite(bombPic, 32, 0, 16, 16, bombX, y, 40, 40);
    pop();
  }

  //CARD: online, the own character with both key sets
  tutorialOnline(cx, y) {
    this.tutorialCard(cx - 165, y, 330, 250);
    drawPortrait(myIndex, cx - 115, y + 40, 50);
    textAlign(LEFT);
    textFont(geospeed);
    textSize(30);
    fill(255);
    text("YOU", cx - 80, y + 52);
    textFont(pixel);
    textSize(14);
    fill(255, 215, 0);
    text(PLAYER_NAMES[myIndex], cx + 5, y + 50);

    textAlign(CENTER);
    text("MOVE", cx - 75, y + 100);
    text("BOMB", cx + 80, y + 100);
    if (touchMode) {
      this.touchHint(cx - 75, cx + 80, y + 154);
      textSize(12);
      fill(255, 210);
      text("STICK", cx - 75, y + 225);
      text("TAP", cx + 80, y + 225);
      return;
    }
    this.keyCap(cx - 75, y + 133, 38, 38, "W");
    this.keyCap(cx - 119, y + 175, 38, 38, "A");
    this.keyCap(cx - 75, y + 175, 38, 38, "S");
    this.keyCap(cx - 31, y + 175, 38, 38, "D");
    this.keyCap(cx + 80, y + 133, 120, 38, keyName(keyBombOne), true);
    this.keyCap(cx + 80, y + 175, 120, 38, keyName(keyBombTwo), true);

    textSize(12);
    fill(255, 210);
    text("OR THE ARROW KEYS", cx - 75, y + 225);
    text("ONE OF BOTH", cx + 80, y + 225);
  }

  //CARD: online, everybody in this round
  tutorialPlayers(cx, y) {
    this.tutorialCard(cx - 165, y, 330, 250);
    textAlign(CENTER);
    textFont(geospeed);
    textSize(30);
    fill(255);
    text("PLAYERS", cx, y + 45);
    textAlign(LEFT);
    textFont(pixel);
    textSize(16);
    players.forEach((player, i) => {
      const rowY = y + 82 + i * 42;
      drawPortrait(i, cx - 120, rowY, 34);
      fill(i == myIndex ? color(255, 215, 0) : color(255));
      text(PLAYER_NAMES[i] + (i == myIndex ? "  (YOU)" : ""), cx - 92, rowY + 6);
    });
  }

  //CARD: tips under the countdown
  tutorialTips(y) {
    this.tutorialCard(35, y, 680, 245);
    textAlign(CENTER);
    textFont(geospeed);
    textSize(28);
    fill(255, 215, 0);
    text("TIPS", width / 2, y + 40);

    const seconds = idiv(BALANCE.roundTime, 60);
    const time = idiv(seconds, 60) + ":" + String(seconds % 60).padStart(2, "0");
    const tips = [
      [() => sprite(itemBox, 0, 0, 50, 50, 80, 0, 34, 34), "Items hide in ? boxes - the menu page ITEMS explains them"],
      [() => sprite(bombPic, 32, 0, 16, 16, 80, 0, 34, 34), "Bombs in the fire of another bomb explode right away"],
      [() => drawItem(ITEM_SKULL, 80, 0, 30), "Touch another player to pass a skull curse on"],
      [() => sprite(tilePillar, 0, 0, 50, 50, 80, 0, 30, 30), "HURRY UP after " + time + ": blocks fall, only the middle stays"]
    ];
    imageMode(CENTER);
    textAlign(LEFT);
    textFont(pixel);
    textSize(15);
    tips.forEach(([icon, line], i) => {
      const rowY = y + 80 + i * 42;
      push();
      translate(0, rowY);
      icon();
      pop();
      fill(255);
      text(line, 115, rowY + 6);
    });
  }

  //______________________________ SETTINGS ______________________________

  //DRAW: settings page (volume, controls of both players)
  drawSettings() {
    push();
    rectMode(CORNER);
    imageMode(CENTER);
    noStroke();
    fill(82, 115, 181);
    rect(0, 0, width, height);

    fill(255);
    textAlign(CENTER);
    textFont(geospeed);
    textSize(56);
    text("SETTINGS", width / 2, 78);

    //CARD: volume (0 - 4)
    fill(0, 45);
    rect(35, 115, 680, 110, 10);
    textAlign(LEFT);
    textFont(pixel);
    textSize(20);
    fill(255, 215, 0);
    text("VOLUME", 65, 177);
    this.roundButton("-", 300, 170, this.hover.minus);
    for (let i = 0; i < 4; i++) {
      fill(i < volume ? color(255, 215, 0) : color(255, 255, 255, 60));
      rect(340 + i * 50, 156, 44, 28, 5);
    }
    this.roundButton("+", 580, 170, this.hover.plus);
    textAlign(CENTER);
    textSize(18);
    fill(255);
    text(volume == 0 ? "MUTE" : volume + " / 4", 662, 177);

    //CARDS: player one + two
    this.playerCard(0, 200, keyBombOne, keyChangeOne, this.hover.keyOne);
    this.playerCard(1, 550, keyBombTwo, keyChangeTwo, this.hover.keyTwo);

    //CARD: other keys
    fill(0, 45);
    rect(35, 600, 680, 70, 10);
    textAlign(CENTER);
    textFont(pixel);
    textSize(14);
    fill(255);
    text("PAUSE (LOCAL):  ESC / P", width / 2, 628);
    text("ONLINE:  WASD OR ARROWS  +  ONE OF THE BOMB KEYS", width / 2, 652);
    pop();

    this.drawPanelButton("BACK", 95, 715, 130, 44, this.hover.back);
  }

  //DRAW: card with picture, move keys and the bomb key (click to change)
  playerCard(index, cx, bombKey, changing, hover) {
    fill(0, 45);
    rect(cx - 165, 245, 330, 335, 10);

    drawPortrait(index, cx, 292, 56);
    textAlign(CENTER);
    textFont(geospeed);
    textSize(30);
    fill(255);
    text(PLAYER_NAMES[index], cx, 355);

    textFont(pixel);
    textSize(14);
    fill(255, 215, 0);
    text("MOVE", cx, 388);
    //W A S D or arrows: up on top, left / down / right below
    const labels = index == 0 ? ["W", "A", "S", "D"] : [0, 2, 1, 3];
    this.keyCap(cx, 418, 38, 38, labels[0]);
    this.keyCap(cx - 44, 460, 38, 38, labels[1]);
    this.keyCap(cx, 460, 38, 38, labels[2]);
    this.keyCap(cx + 44, 460, 38, 38, labels[3]);

    textFont(pixel);
    textSize(14);
    fill(255, 215, 0);
    text("BOMB", cx, 500);
    //bomb key: blinks while waiting for a key
    const waiting = changing && idiv(frame, 20) % 2 == 0;
    this.keyCap(cx, 530, 200, 46, changing ? (waiting ? "PRESS KEY" : "") : keyName(bombKey), hover || changing);
    //HINT or MESSAGE (e.g. key already in use) under the bomb key
    textSize(11);
    if (this.message && this.message.player == index && frame - this.message.start < 120) {
      fill(255, 130, 130);
      text(this.message.text, cx, 570);
    } else {
      fill(255, 200);
      text(changing ? "ESC = CANCEL" : "CLICK TO CHANGE", cx, 570);
    }
  }

  //DRAW: one keyboard key, label is a text or a direction (0 = up, 1 = down, 2 = left, 3 = right)
  keyCap(x, y, w, h, label, highlight = false) {
    push();
    rectMode(CENTER);
    noStroke();
    fill(0, 80);
    rect(x + 2, y + 3, w, h, 7);
    fill(highlight ? color(235, 140, 70) : color(78, 92, 128));
    stroke(245);
    strokeWeight(3);
    rect(x, y, w, h, 7);
    noStroke();
    fill(255);
    if (typeof label == "number") {
      //arrow
      const a = [-HALF_PI, HALF_PI, PI, 0][label];
      translate(x, y);
      rotate(a);
      triangle(9, 0, -5, -8, -5, 8);
      rect(-8, 0, 8, 5);
    } else {
      textFont(pixel);
      textAlign(CENTER);
      textSize(label.length > 2 ? 18 : 20);
      text(label, x, y + 7);
    }
    pop();
  }

  //DRAW: round - / + button
  roundButton(label, x, y, hover) {
    push();
    noStroke();
    fill(0, 80);
    ellipse(x + 2, y + 3, 44, 44);
    fill(hover ? color(235, 140, 70) : color(78, 92, 128));
    stroke(245);
    strokeWeight(3);
    ellipse(x, y, 44, 44);
    noStroke();
    fill(255);
    rectMode(CENTER);
    rect(x, y, 18, 5);
    if (label == "+") {
      rect(x, y, 5, 18);
    }
    pop();
  }

  //USE: buttons of the settings page (- / + one step per click, bomb keys, back)
  settingsButtons() {
    const over = (x, y, w, h) => Math.abs(mouseX - x) < w / 2 && Math.abs(mouseY - y) < h / 2;
    const changing = keyChangeOne || keyChangeTwo;
    this.hover = {
      minus: over(300, 170, 44, 44),
      plus: over(580, 170, 44, 44),
      keyOne: !changing && over(200, 530, 200, 46),
      keyTwo: !changing && over(550, 530, 200, 46),
      back: over(95, 715, 130, 44)
    };
    cursor(Object.values(this.hover).some((h) => h) ? HAND : ARROW);

    if (!mouseIsPressed) {
      return;
    }
    const clickSound = () => {
      if (!click.isPlaying()) {
        click.play(1, 0.05 * volume);
      }
    };
    if ((this.hover.minus || this.hover.plus) && soundChange) {
      volume = constrain(volume + (this.hover.plus ? 1 : -1), 0, 4);
      saveSettings();
      clickSound();
      soundChange = false;
    } else if (this.hover.keyOne) {
      keyChangeOne = true;
      clickSound();
    } else if (this.hover.keyTwo) {
      keyChangeTwo = true;
      clickSound();
    } else if (this.hover.back) {
      keyChangeOne = false;
      keyChangeTwo = false;
      clickSound();
      gamemode = 0;
    }
  }

  //KEY: new bomb key (called from keyPressed), movement keys and the other bomb key are not allowed
  changeBombKey(code) {
    const player = keyChangeOne ? 0 : 1;
    const other = keyChangeOne ? keyBombTwo : keyBombOne;
    if (code == 27) {
      keyChangeOne = false;
      keyChangeTwo = false;
      return;
    }
    if (keyCodeOne.includes(code) || keyCodeTwo.includes(code)) {
      this.message = { player: player, text: "THIS KEY IS USED FOR WALKING", start: frame };
      return;
    }
    if (code == other) {
      this.message = { player: player, text: "THE OTHER PLAYER USES THIS KEY", start: frame };
      return;
    }
    if (keyChangeOne) {
      keyBombOne = code;
    } else {
      keyBombTwo = code;
    }
    keyChangeOne = false;
    keyChangeTwo = false;
    this.message = null;
    saveSettings();
    click.play(1, 0.05 * volume);
  }

}
