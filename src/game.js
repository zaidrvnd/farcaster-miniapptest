import { applyItem, grantCard } from './items.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const levelEl = document.getElementById('level');
const hpEl = document.getElementById('hp');
const scoreEl = document.getElementById('score');
const messageEl = document.getElementById('message');
const highScoresEl = document.getElementById('highscores');

const player = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  radius: 15,
  speed: 3,
  hp: 10,
  maxHp: 10,
  damage: 2,
  defense: 0,
  score: 0
};

let keys = {};
let bullets = [];
let zombies = [];
let items = [];
let level = 1;
let gameOver = false;

const highScores = JSON.parse(localStorage.getItem('zs_highscores') || '[]');

function renderLeaderboard() {
  highScoresEl.innerHTML = highScores
    .slice(0, 5)
    .map(s => `<li>${s}</li>`)
    .join('');
}

function resetGame() {
  player.x = canvas.width / 2;
  player.y = canvas.height / 2;
  player.hp = player.maxHp = 10;
  player.speed = 3;
  player.damage = 2;
  player.defense = 0;
  player.score = 0;
  bullets = [];
  zombies = [];
  items = [];
  level = 1;
  gameOver = false;
  messageEl.style.display = 'none';
  if (window.miniapp) {
    miniapp.sdk.actions.setPrimaryButton({ text: '', hidden: true });
  }
  renderLeaderboard();
  spawnWave();
}

function spawnWave() {
  const count = 5 + level * 2;
  for (let i = 0; i < count; i++) {
    const r = Math.random();
    if (r < 0.3) spawnZombie('fast');
    else if (r < 0.6) spawnZombie('strong');
    else spawnZombie('normal');
  }
  spawnZombie('mini');
  if (level % 5 === 0) spawnZombie('boss');
}

function spawnZombie(type) {
  let hp = 5 + level * 2;
  let dmg = 1 + level;
  let speed = 1 + level * 0.05;
  let radius = 15;
  let score = 10;

  if (type === 'fast') {
    speed *= 1.5;
    hp *= 0.7;
  }
  if (type === 'strong') {
    hp *= 1.5;
    speed *= 0.8;
    score = 15;
  }
  if (type === 'mini') {
    hp *= 3;
    dmg *= 2;
    radius = 20;
    score = 50;
  }
  if (type === 'boss') {
    hp *= 6;
    dmg *= 4;
    radius = 30;
    speed *= 0.7;
    score = 100;
  }

  let x, y;
  if (Math.random() < 0.5) {
    x = Math.random() < 0.5 ? -radius : canvas.width + radius;
    y = Math.random() * canvas.height;
  } else {
    x = Math.random() * canvas.width;
    y = Math.random() < 0.5 ? -radius : canvas.height + radius;
  }

  zombies.push({ x, y, hp, dmg, speed, radius, score, type });
}

function shoot(e) {
  if (gameOver) return;
  const rect = canvas.getBoundingClientRect();
  const mx = e.clientX - rect.left;
  const my = e.clientY - rect.top;
  const angle = Math.atan2(my - player.y, mx - player.x);
  const speed = 6;
  bullets.push({ x: player.x, y: player.y, dx: Math.cos(angle) * speed, dy: Math.sin(angle) * speed });
}

function update() {
  if (gameOver) return;

  if (zombies.length === 0) {
    level++;
    if (level % 5 === 0) handleGrantCard();
    spawnWave();
  }

  if (keys['ArrowUp'] || keys['w']) player.y -= player.speed;
  if (keys['ArrowDown'] || keys['s']) player.y += player.speed;
  if (keys['ArrowLeft'] || keys['a']) player.x -= player.speed;
  if (keys['ArrowRight'] || keys['d']) player.x += player.speed;

  // keep player in bounds
  player.x = Math.max(player.radius, Math.min(canvas.width - player.radius, player.x));
  player.y = Math.max(player.radius, Math.min(canvas.height - player.radius, player.y));

  // bullets
  bullets.forEach((b, bi) => {
    b.x += b.dx;
    b.y += b.dy;
    if (b.x < 0 || b.x > canvas.width || b.y < 0 || b.y > canvas.height) {
      bullets.splice(bi, 1);
    }
  });

  // zombies
  zombies.forEach((z, zi) => {
    const angle = Math.atan2(player.y - z.y, player.x - z.x);
    z.x += Math.cos(angle) * z.speed;
    z.y += Math.sin(angle) * z.speed;

    // collision with player
    const distP = Math.hypot(player.x - z.x, player.y - z.y);
    if (distP < player.radius + z.radius) {
      player.hp -= Math.max(1, z.dmg - player.defense);
      zombies.splice(zi, 1);
      if (player.hp <= 0) endGame();
      return;
    }

    // collision with bullets
    bullets.forEach((b, bi) => {
      const dist = Math.hypot(b.x - z.x, b.y - z.y);
      if (dist < z.radius) {
        z.hp -= player.damage;
        bullets.splice(bi, 1);
        if (z.hp <= 0) {
          player.score += z.score;
          dropItem(z.x, z.y, z.type);
          zombies.splice(zi, 1);
        }
      }
    });
  });

  // items
  items.forEach((it, ii) => {
    const dist = Math.hypot(player.x - it.x, player.y - it.y);
    if (dist < player.radius + 10) {
      handleApplyItem(it.type);
      items.splice(ii, 1);
    }
  });

  levelEl.textContent = level;
  hpEl.textContent = player.hp;
  scoreEl.textContent = player.score;
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // player
  ctx.fillStyle = 'white';
  ctx.beginPath();
  ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
  ctx.fill();

  // bullets
  ctx.fillStyle = 'yellow';
  bullets.forEach(b => {
    ctx.beginPath();
    ctx.arc(b.x, b.y, 4, 0, Math.PI * 2);
    ctx.fill();
  });

  // zombies
  zombies.forEach(z => {
    if (z.type === 'boss') ctx.fillStyle = 'purple';
    else if (z.type === 'mini') ctx.fillStyle = 'red';
    else ctx.fillStyle = 'green';
    ctx.beginPath();
    ctx.arc(z.x, z.y, z.radius, 0, Math.PI * 2);
    ctx.fill();
  });

  // items
  items.forEach(it => {
    let color = 'blue';
    if (it.type === 'weapon') color = 'orange';
    if (it.type === 'armor') color = 'silver';
    if (it.type === 'helmet') color = 'gray';
    if (it.type === 'accessory') color = 'pink';
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(it.x, it.y, 10, 0, Math.PI * 2);
    ctx.fill();
  });
}

function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

function dropItem(x, y, zType) {
  const chance = zType === 'boss' ? 1 : zType === 'mini' ? 0.5 : 0.3;
  if (Math.random() < chance) {
    const types = ['weapon', 'armor', 'helmet', 'accessory'];
    const type = types[Math.floor(Math.random() * types.length)];
    items.push({ x, y, type });
  }
}

function handleApplyItem(type) {
  const msg = applyItem(player, type);
  if (msg) showMessage(msg);
}

function handleGrantCard() {
  const name = grantCard(player);
  showMessage(`Mendapat ${name}!`);
}

function showMessage(text) {
  messageEl.innerHTML = text;
  messageEl.style.display = 'block';
  setTimeout(() => {
    if (!gameOver) messageEl.style.display = 'none';
  }, 2000);
}

function endGame() {
  gameOver = true;
  showMessage(`Game Over! Poin: ${player.score}<br>Tekan Enter untuk restart`);
  highScores.push(player.score);
  highScores.sort((a, b) => b - a);
  localStorage.setItem('zs_highscores', JSON.stringify(highScores.slice(0, 5)));
  renderLeaderboard();
  if (window.miniapp) {
    const finalScore = player.score;
    miniapp.sdk.actions.setPrimaryButton({ text: 'Bagikan Skor' });
    miniapp.sdk.once('primaryButtonClicked', async () => {
      try {
        await miniapp.sdk.actions.composeCast({ text: `Aku mencetak ${finalScore} poin di Zombie Survival!` });
      } finally {
        await miniapp.sdk.actions.setPrimaryButton({ text: '', hidden: true });
      }
    });
  }
}

window.addEventListener('keydown', (e) => {
  keys[e.key] = true;
  if (gameOver && e.key === 'Enter') {
    resetGame();
  }
});

window.addEventListener('keyup', (e) => delete keys[e.key]);
canvas.addEventListener('click', shoot);

resetGame();
requestAnimationFrame(gameLoop);
