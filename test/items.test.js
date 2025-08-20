import { describe, it, expect } from 'vitest';
import { applyItem, grantCard } from '../src/items.js';

describe('applyItem', () => {
  it('menambah damage ketika mendapat senjata', () => {
    const player = { damage: 2, maxHp: 10, hp: 10, defense: 0, speed: 3 };
    const msg = applyItem(player, 'weapon');
    expect(player.damage).toBe(3);
    expect(msg).toContain('DMG');
  });

  it('menambah hp ketika mendapat armor', () => {
    const player = { damage: 2, maxHp: 10, hp: 10, defense: 0, speed: 3 };
    const msg = applyItem(player, 'armor');
    expect(player.maxHp).toBe(12);
    expect(player.hp).toBe(12);
    expect(msg).toContain('HP');
  });
});

describe('grantCard', () => {
  it('mengembalikan nama kartu dan memperkuat pemain', () => {
    const player = { damage: 2, maxHp: 10, hp: 10, defense: 0, speed: 3 };
    const name = grantCard(player);
    const cards = ['Kartu Kekuatan', 'Kartu Ketahanan', 'Kartu Kecepatan'];
    expect(cards).toContain(name);
    expect(
      player.damage !== 2 || player.maxHp !== 10 || player.speed !== 3
    ).toBe(true);
  });
});
