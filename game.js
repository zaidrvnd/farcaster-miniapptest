import { sdk } from 'https://esm.sh/@farcaster/frame-sdk';

const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

let player = { x: 140, y: 360, w: 20, h: 20 };
let obstacles = [];
let score = 0;
let gameInterval;
let spawnInterval;

function resetGame() {
  player.x = canvas.width / 2 - player.w / 2;
  obstacles = [];
  score = 0;
  document.getElementById('score').textContent = '0';
}

function startGame() {
  resetGame();
  document.getElementById('menu').classList.add('hidden');
  canvas.classList.remove('hidden');
  gameInterval = setInterval(updateGame, 20);
  spawnInterval = setInterval(spawnObstacle, 1000);
}

function endGame() {
  clearInterval(gameInterval);
  clearInterval(spawnInterval);
  canvas.classList.add('hidden');
  document.getElementById('menu').classList.remove('hidden');
  submitScore(Math.floor(score));
}

function spawnObstacle() {
  const size = 20;
  obstacles.push({
    x: Math.random() * (canvas.width - size),
    y: -size,
    w: size,
    h: size,
    speed: 2 + Math.random() * 3
  });
}

function updateGame() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // draw player
  ctx.fillStyle = '#00ff00';
  ctx.fillRect(player.x, player.y, player.w, player.h);

  // update obstacles
  ctx.fillStyle = '#ff0000';
  for (let o of obstacles) {
    o.y += o.speed;
    ctx.fillRect(o.x, o.y, o.w, o.h);

    if (o.y > canvas.height) {
      obstacles.shift();
      score++;
    } else if (collides(player, o)) {
      endGame();
      return;
    }
  }

  score += 0.01;
  document.getElementById('score').textContent = Math.floor(score);
}

function collides(a, b) {
  return a.x < b.x + b.w &&
         a.x + a.w > b.x &&
         a.y < b.y + b.h &&
         a.y + a.h > b.y;
}

document.addEventListener('keydown', (e) => {
  if (canvas.classList.contains('hidden')) return;
  if (e.key === 'ArrowLeft') player.x = Math.max(0, player.x - 15);
  if (e.key === 'ArrowRight') player.x = Math.min(canvas.width - player.w, player.x + 15);
});

async function submitScore(finalScore) {
  console.log('Submitting score', finalScore);
  const scores = JSON.parse(localStorage.getItem('scores') || '[]');
  scores.push({ score: finalScore, date: Date.now() });
  scores.sort((a, b) => b.score - a.score);
  localStorage.setItem('scores', JSON.stringify(scores.slice(0, 10)));
  loadLeaderboard();
  // TODO: integrate on-chain score submission via smart contract
}

const GACHA_TREASURY_ADDRESS = '0x000000000000000000000000000000000000dEaD';

const gachaItems = [
  'Retro Skin',
  'Damage Buff',
  'Shield Boost',
  'Golden Controller (+10% score)',
  'Event Item'
];

async function spinGacha() {
  if (!sdk.isInMiniApp()) {
    alert('Not running in Farcaster mini app');
    return;
  }
  try {
    const result = await sdk.actions.sendToken({
      to: GACHA_TREASURY_ADDRESS,
      amount: '0.001',
      chain: 'ethereum'
    });
    if (!result || !result.success) {
      alert('Payment failed');
      return;
    }
  } catch (e) {
    alert('Payment error: ' + e.message);
    return;
  }

  const item = gachaItems[Math.floor(Math.random() * gachaItems.length)];
  alert('You received: ' + item);
  const inventory = JSON.parse(localStorage.getItem('inventory') || '[]');
  inventory.push(item);
  localStorage.setItem('inventory', JSON.stringify(inventory));
  loadInventory();
}

function loadLeaderboard() {
  const list = document.getElementById('leaderboard-list');
  const scores = JSON.parse(localStorage.getItem('scores') || '[]');
  if (list) {
    list.innerHTML = scores.length
      ? scores.map((s, i) => `<li>${i + 1}. ${s.score}</li>`).join('')
      : '<li>No scores yet</li>';
  }
}

function showLeaderboard() {
  loadLeaderboard();
  document.getElementById('leaderboard').classList.remove('hidden');
}

function closeLeaderboard() {
  document.getElementById('leaderboard').classList.add('hidden');
}

function loadInventory() {
  const list = document.getElementById('inventory-list');
  const items = JSON.parse(localStorage.getItem('inventory') || '[]');
  if (list) {
    list.innerHTML = items.length
      ? items.map((i) => `<li>${i}</li>`).join('')
      : '<li>No items</li>';
  }
}

function showInventory() {
  loadInventory();
  document.getElementById('inventory').classList.remove('hidden');
}

function closeInventory() {
  document.getElementById('inventory').classList.add('hidden');
}

window.startGame = startGame;
window.spinGacha = spinGacha;
window.showLeaderboard = showLeaderboard;
window.closeLeaderboard = closeLeaderboard;
window.showInventory = showInventory;
window.closeInventory = closeInventory;
