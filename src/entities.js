export class Character {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.radius = 15;
    this.speed = 3;
    this.hp = 10;
    this.maxHp = 10;
    this.damage = 2;
    this.defense = 0;
    this.score = 0;
  }
}

export class Zombie {
  constructor(level, type, width, height) {
    this.type = type;
    let hp = 5 + level * 2;
    let dmg = 1 + level;
    let speed = 1 + level * 0.05;
    let radius = 15;
    let score = 10;

    if (type === 'fast') {
      speed *= 1.5;
      hp *= 0.7;
    } else if (type === 'strong') {
      hp *= 1.5;
      speed *= 0.8;
      score = 15;
    } else if (type === 'mini') {
      hp *= 3;
      dmg *= 2;
      radius = 20;
      score = 50;
    } else if (type === 'boss') {
      hp *= 6;
      dmg *= 4;
      radius = 30;
      speed *= 0.7;
      score = 100;
    }

    let x, y;
    if (Math.random() < 0.5) {
      x = Math.random() < 0.5 ? -radius : width + radius;
      y = Math.random() * height;
    } else {
      x = Math.random() * width;
      y = Math.random() < 0.5 ? -radius : height + radius;
    }

    this.x = x;
    this.y = y;
    this.hp = hp;
    this.dmg = dmg;
    this.speed = speed;
    this.radius = radius;
    this.score = score;
  }
}

export class Boss extends Zombie {
  constructor(level, width, height) {
    super(level, 'boss', width, height);
  }
}
