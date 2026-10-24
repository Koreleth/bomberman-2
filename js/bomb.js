/*
Bomb class
  if keypressed, this class will be created. After explosion it will be dealeted
  Autor: Korel Öztekin
  date: 15.03.2024
  Bomberman 2: chain reactions, kicking, pierce bombs
*/


class Bomb {

  constructor(playerPos, explosionRadius, pierce = false, fuse = BALANCE.fuse) {
    //BOMB: Planting Center of player position
    this.bombPos = {
      x: toInt(playerPos.x / block) * block + (block / 2),
      y: toInt(playerPos.y / block) * block + (block / 2)
    };
    //ITEM Variable
    this.bombMultipliyer = explosionRadius;
    this.pierce = pierce;
    this.fuse = fuse;

    this.bombActive = true;
    this.explosionActive = false;
    this.explode = false;
    this.explosionMap = grid();
    //KICK: direction {x, y} while the bomb slides, null when it lies still
    this.slideDir = null;

    this.hitframe = frame;
  }

  get col() {
    return toInt(this.bombPos.x / block);
  }

  get row() {
    return toInt(this.bombPos.y / block);
  }

  bombPlanted(map) {
    imageMode(CENTER);
    const animFrame = 16 * (idiv(frame, 15) % 4);

    //DRAW: Bomb
    if (this.bombActive) {
      this.slide(map);

      //pierce bombs are red
      if (this.pierce) {
        tint(255, 110, 110);
      }
      sprite(bombPic, animFrame, 0, 16, 16, this.bombPos.x, this.bombPos.y, 40, 40);
      noTint();

      //TIMER: Bomb -> Explode
      if (frame - this.hitframe >= this.fuse) {
        this.detonate();
      }
      imageMode(CORNER);


    //______________explosion_______________________


    } if (this.explosionActive) {
      imageMode(CENTER);

      //DRAW: explosioncenter
      sprite(explosionPic, 96, animFrame, 16, 16, this.bombPos.x, this.bombPos.y, block, block);
      this.explosionMap[this.row][this.col] = 3;

      //DRAW: explosion in x+, x-, y+ and y- direction (spritesheet x of the end piece, spritesheet x of the middle piece)
      this.explosionRay(map, 1, 0, 48, 80, animFrame);
      this.explosionRay(map, -1, 0, 32, 80, animFrame);
      this.explosionRay(map, 0, 1, 16, 64, animFrame);
      this.explosionRay(map, 0, -1, 0, 64, animFrame);

      //TIMER: Explosion -> Ending
      if (frame - this.hitframe >= 59) {
        this.explosionActive = false;
      }
    }
  }
  //_____________end Explosion_____________________

  //EXPLODE: after the fuse or right away when another explosion hits the bomb (chain reaction)
  detonate() {
    if (!this.bombActive) {
      return;
    }
    //a sliding bomb explodes in the middle of the field it is on
    this.slideDir = null;
    this.bombPos.x = this.col * block + (block / 2);
    this.bombPos.y = this.row * block + (block / 2);

    this.explosionActive = true;
    this.bombActive = false;
    this.hitframe = frame;
    this.explode = true;
    const sound = this.bombMultipliyer >= 6 ? explosionL : this.bombMultipliyer >= 3 ? explosionM : explosionS;
    sound.play(1, 0.12 * volume);
  }

  explosionRay(map, dirX, dirY, endPiece, middlePiece, animFrame) {
    for (let i = 1; i <= this.bombMultipliyer; i++) {
      const x = this.bombPos.x + (block * i * dirX);
      const y = this.bombPos.y + (block * i * dirY);
      const row = toInt(y / block);
      const col = toInt(x / block);

      //COLISION: if there is a hard wall
      if (map[row][col] == 0) {
        break;
      }
      //PIERCE: the explosion goes through destroyable walls
      const stops = map[row][col] == 2 && !this.pierce;
      if (i == this.bombMultipliyer || stops) {
        sprite(explosionPic, endPiece, animFrame, 16, 16, x, y, block, block);
      } else {
        sprite(explosionPic, middlePiece, animFrame, 16, 16, x, y, block, block);
      }
      //CREATE: int [][] variables
      this.explosionMap[row][col] = 3;
      //COLISION: if there is a destroyable wall
      if (stops) {
        break;
      }
    }
  }

  //KICK: start sliding in a direction
  kick(dirX, dirY) {
    if (this.slideDir || !this.bombActive) {
      return;
    }
    if (cellFree(this.col + dirX, this.row + dirY, this)) {
      this.slideDir = { x: dirX, y: dirY };
      kickSound.play(1, 0.1 * volume);
    }
  }

  //KICK: move until a wall, a bomb or a player is in the way
  slide(map) {
    if (!this.slideDir) {
      return;
    }
    const centerX = this.col * block + (block / 2);
    const centerY = this.row * block + (block / 2);
    if (this.bombPos.x == centerX && this.bombPos.y == centerY &&
      !cellFree(this.col + this.slideDir.x, this.row + this.slideDir.y, this)) {
      this.slideDir = null;
      bombStop.play(1, 0.1 * volume);
      return;
    }
    this.bombPos.x += this.slideDir.x * BALANCE.kickSpeed;
    this.bombPos.y += this.slideDir.y * BALANCE.kickSpeed;
  }
}


//KICK: can a bomb slide onto this field? (no wall, no bomb, no player)
function cellFree(col, row, self) {
  if (karte.map[row][col] != 1) {
    return false;
  }
  for (const list of bombs) {
    for (const bomb of list) {
      if (bomb != self && bomb.bombActive && bomb.col == col && bomb.row == row) {
        return false;
      }
    }
  }
  for (const player of players) {
    if (player.live > 0 && !player.cooldown &&
      toInt(player.pos.x / block) == col && toInt(player.pos.y / block) == row) {
      return false;
    }
  }
  return true;
}
