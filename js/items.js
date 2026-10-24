/*
Items
  all balancing values and item definitions in one place
  Autor: Korel Öztekin
*/

//BALANCING: change the numbers here to tune the game
const BALANCE = {
  startSpeed: 2,       //pixels per frame without skates
  speedStep: 0.35,     //+ per skate (Bomberman 1: +1, way too strong)
  maxSpeedLevel: 5,    //5 skates -> 3.75 pixels per frame
  maxBombs: 8,
  maxRadius: 8,
  fuse: 150,           //frames until a bomb explodes (2.5 s)
  shortFuse: 70,       //skull curse "SHORT FUSE"
  kickSpeed: 5,        //pixels per frame of a kicked bomb (has to divide the block size 50)
  shieldTime: 480,     //8 s
  curseTime: 600,      //10 s
  itemBoxShare: 0.3,   //share of the destroyable boxes that hide an item ("?" boxes)
  burnItems: true,     //explosions destroy items lying on the floor
  roundTime: 7200,     //2 min until HURRY UP (sudden death)
  hurryUpTime: 120,    //2 s HURRY UP banner before the first block falls
  blockInterval: 30,   //every 0.5 s 4 new blocks (one per side)
  blockFallTime: 30    //0.5 s from the shadow to the landing, time to run away
};

//ITEMS: id = value in itemMap / boxItems, index = tile in items2.png, weight = chance inside a "?" box
const ITEM_BOMB = 1;
const ITEM_FIRE = 2;
const ITEM_SKATE = 3;
const ITEM_KICK = 4;
const ITEM_SHIELD = 5;
const ITEM_HEART = 6;
const ITEM_SKULL = 7;
const ITEM_PIERCE = 8;
const ITEM_FULLFIRE = 9;

//name + info are shown on the ITEMS page in the menu
const ITEMS = {
  [ITEM_BOMB]:     { weight: 23, name: "BOMB UP", info: ["+1 bomb at the same time"] },
  [ITEM_FIRE]:     { weight: 22, name: "FIRE UP", info: ["+1 explosion range"] },
  [ITEM_SKATE]:    { weight: 12, name: "SKATE", info: ["a little faster (max 5)"] },
  [ITEM_KICK]:     { weight: 16, name: "KICK", info: ["walk into a bomb", "to kick it away"] },
  [ITEM_SHIELD]:   { weight: 7, name: "SHIELD", info: ["8 seconds invincible"] },
  [ITEM_HEART]:    { weight: 6, name: "HEART", info: ["+1 life (max 3)", "full lives: shield"] },
  [ITEM_SKULL]:    { weight: 10, name: "SKULL", info: ["random curse for 10 s", "touch a player to pass it on"] },
  [ITEM_PIERCE]:   { weight: 5, name: "PIERCE BOMB", info: ["explosions go", "through boxes"] },
  [ITEM_FULLFIRE]: { weight: 6, name: "FULL FIRE", info: ["max explosion range"] }
};

//SKULL: one of these curses for BALANCE.curseTime frames, touching another player passes it on
const CURSES = ["SLOW", "TURBO", "REVERSE", "DIARRHEA", "NO BOMBS", "SHORT FUSE", "TINY FIRE"];

//RANDOM: item id for a "?" box (uses rng, so online every browser gets the same)
function randomItem() {
  const total = Object.values(ITEMS).reduce((sum, item) => sum + item.weight, 0);
  let roll = rng() * total;
  for (const id in ITEMS) {
    roll -= ITEMS[id].weight;
    if (roll < 0) {
      return Number(id);
    }
  }
  return ITEM_BOMB;
}

//DRAW: one item of items2.png
function drawItem(id, x, y, size) {
  sprite(items2, (id - 1) * 17, 0, 16, 16, x, y, size, size);
}
