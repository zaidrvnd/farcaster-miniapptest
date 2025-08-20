import { describe, it, expect } from 'vitest';
import { Character, Zombie } from '../src/entities.js';

describe('entities', () => {
  it('initializes character defaults', () => {
    const c = new Character(0, 0);
    expect(c.hp).toBe(10);
    expect(c.damage).toBe(2);
  });

  it('scales zombie stats with level', () => {
    const z1 = new Zombie(1, 'normal', 800, 600);
    const z5 = new Zombie(5, 'normal', 800, 600);
    expect(z5.hp).toBeGreaterThan(z1.hp);
    expect(z5.dmg).toBeGreaterThan(z1.dmg);
  });

  it('boss stronger than normal', () => {
    const normal = new Zombie(1, 'normal', 800, 600);
    const boss = new Zombie(1, 'boss', 800, 600);
    expect(boss.hp).toBeGreaterThan(normal.hp);
    expect(boss.dmg).toBeGreaterThan(normal.dmg);
  });
});
