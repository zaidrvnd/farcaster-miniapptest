export function applyItem(player, type) {
  switch (type) {
    case 'weapon':
      player.damage += 1;
      return 'Senjata +1 DMG';
    case 'armor':
      player.maxHp += 2;
      player.hp += 2;
      return 'Armor +2 HP';
    case 'helmet':
      player.defense += 1;
      return 'Helmet +1 DEF';
    case 'accessory':
      player.speed += 0.2;
      return 'Aksesoris +Kecepatan';
    default:
      return '';
  }
}

export function grantCard(player) {
  const cards = [
    { name: 'Kartu Kekuatan', apply: () => { player.damage += 2; } },
    { name: 'Kartu Ketahanan', apply: () => { player.maxHp += 5; player.hp += 5; } },
    { name: 'Kartu Kecepatan', apply: () => { player.speed += 0.5; } },
    { name: 'Kartu Perisai', apply: () => { player.defense += 2; } }
  ];
  const card = cards[Math.floor(Math.random() * cards.length)];
  card.apply();
  return card.name;
}
