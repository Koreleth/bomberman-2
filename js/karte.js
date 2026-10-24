/*
Karte class
  this class creates the map and checks if map changing.
  Autor: Korel Öztekin
  date: 15.03.2024
  Bomberman 2: "?" boxes with hidden items
*/


class Karte {

  //0 = hard wall
  //1 = no wall
  //2 = destroyable wall
  //3 = no wall -> item spawn random

  constructor() {
    //SAVE: Map
    this.startMap = [
      [0,0,0,0,0,  0,0,0,0,0,  0,0,0,0,0],
      [0,1,1,1,2,  2,1,2,1,2,  2,1,1,1,0],
      [0,1,0,1,0,  2,0,2,0,2,  0,1,0,1,0],
      [0,1,1,1,2,  2,1,2,1,2,  2,1,1,1,0],
      [0,2,0,2,0,  2,0,2,0,2,  0,2,0,2,0],

      [0,2,2,2,2,  2,1,2,1,2,  2,2,2,2,0],
      [0,1,0,1,0,  1,0,2,0,1,  0,1,0,1,0],
      [0,2,2,2,2,  2,2,2,2,2,  2,2,2,2,0],
      [0,1,0,1,0,  1,0,2,0,1,  0,1,0,1,0],
      [0,2,2,2,2,  2,1,2,1,2,  2,2,2,2,0],

      [0,2,0,2,0,  2,0,2,0,2,  0,2,0,2,0],
      [0,1,1,1,2,  2,1,2,1,2,  2,1,1,1,0],
      [0,1,0,1,0,  2,0,2,0,2,  0,1,0,1,0],
      [0,1,1,1,2,  2,1,2,1,2,  2,1,1,1,0],
      [0,0,0,0,0,  0,0,0,0,0,  0,0,0,0,0]
    ];
    this.map = this.startMap.map((row) => row.slice());

    //0 = No Item, otherwise an item id (see items.js)
    this.itemMap = grid();
    //items hidden in the "?" boxes, they appear when the box is destroyed
    this.boxItems = grid();
  }

  //CREATE: "?" boxes, the top left quarter is rolled and mirrored to the other corners -> fair for every player
  placeItems() {
    for (let i = 1; i <= 7; i++) {
      for (let j = 1; j <= 7; j++) {
        if (this.startMap[i][j] == 2 && rng() < BALANCE.itemBoxShare) {
          const item = randomItem();
          this.boxItems[i][j] = item;
          this.boxItems[i][14 - j] = item;
          this.boxItems[14 - i][j] = item;
          this.boxItems[14 - i][14 - j] = item;
        }
      }
    }
  }

  render() {
    fill(255, 0, 0);

    // Draw map
    imageMode(CORNER);

    for (let i = 0; i < this.map.length; i++) {
      for (let j = 0; j < this.map[i].length; j++) {
        const x = j * block;
        const y = i * block;
        if (this.map[i][j] == 0) {
          //border around the field, pillars (and sudden death blocks) inside
          const edge = i == 0 || j == 0 || i == 14 || j == 14;
          pic(edge ? tileBorder : tilePillar, x, y, block, block);
        } else if (this.map[i][j] == 1 || this.map[i][j] == 3) {
          //grass in a checker pattern
          sprite(tileFloor, ((i + j) % 2) * 50, 0, 50, 50, x, y, block, block);
        } else if (this.map[i][j] == 2 && this.boxItems[i][j] != 0) {
          //"?" box, the question mark lights up every 20 frames
          sprite(itemBox, 50 * (idiv(frame, 20) % 2), 0, 50, 50, x, y, block, block);
        } else if (this.map[i][j] == 2) {
          pic(tileBox, x, y, block, block);
        }
      }
    }

    //DRAW: blocks above and left of a floor field cast a shadow on it (light from the top left)
    push();
    noStroke();
    rectMode(CORNER);
    const solid = (i, j) => this.map[i][j] == 0 || this.map[i][j] == 2;
    for (let i = 1; i < this.map.length - 1; i++) {
      for (let j = 1; j < this.map[i].length - 1; j++) {
        if (solid(i, j)) {
          continue;
        }
        if (solid(i - 1, j)) {
          fill(0, 60);
          rect(j * block, i * block, block, 10);
        }
        if (solid(i, j - 1)) {
          fill(0, 40);
          rect(j * block, i * block, 7, block);
        }
      }
    }
    pop();

    //DRAW: Items
    imageMode(CENTER);
    for (let i = 0; i < this.itemMap.length; i++) {
      for (let j = 0; j < this.itemMap[i].length; j++) {
        if (this.itemMap[i][j] != 0) {
          //items bounce a little so they are easy to spot
          const bounce = idiv(frame + 7 * (i + j), 15) % 2 == 0 ? 0 : -2;
          drawItem(this.itemMap[i][j], j * block + (block / 2), i * block + (block / 2) + bounce, 32);
        }
      }
    }
    imageMode(CORNER);
    fill(155, 155, 155);
  }


  //COLISION: Explsoion with Map
  change(explosionMap, explosionActive, bombActive) {
    for (let i = 0; i < explosionMap.length; i++) {
      for (let j = 0; j < explosionMap[i].length; j++) {
        if (explosionMap[i][j] == 3 && this.map[i][j] == 2) {

          if (explosionActive && bombActive) {
            this.map[i][j] = 1;
            //"?" box -> the hidden item appears, normal boxes are empty
            this.itemMap[i][j] = this.boxItems[i][j];
            this.boxItems[i][j] = 0;
          }
        }
      }
    }
  }

  //COLISION: a burning explosion destroys the items lying on the floor
  burnItems(explosionMap) {
    if (!BALANCE.burnItems) {
      return;
    }
    for (let i = 0; i < explosionMap.length; i++) {
      for (let j = 0; j < explosionMap[i].length; j++) {
        if (explosionMap[i][j] == 3 && this.map[i][j] == 1 && this.itemMap[i][j] != 0) {
          this.itemMap[i][j] = 0;
        }
      }
    }
  }


  resetMap() {
    for (let i = 0; i < this.map.length; i++) {
      for (let j = 0; j < this.map[i].length; j++) {
        this.map[i][j] = this.startMap[i][j];
        this.itemMap[i][j] = 0;
        this.boxItems[i][j] = 0;
      }
    }
  }
}
