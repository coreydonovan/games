const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game states
const GAME_STATE = {
  TITLE: 'title',
  PLAYING: 'playing',
  GAME_OVER: 'game_over'
};

let state = GAME_STATE.TITLE;

// Image assets
const vadimImg = new Image();
vadimImg.src = 'vadim.png';
const tjayImg = new Image();
tjayImg.src = 'tjay.png';

// Paddle (head) settings
const PADDLE_WIDTH = 80;
const PADDLE_HEIGHT = 80;
const PADDLE_MARGIN = 30;
const PADDLE_SPEED = 6;

// Ball settings
const BALL_SIZE = 24;
const BALL_SPEED = 6;

// Player objects
const vadim = {
  x: PADDLE_MARGIN,
  y: canvas.height / 2 - PADDLE_HEIGHT / 2,
  width: PADDLE_WIDTH,
  height: PADDLE_HEIGHT,
  dy: 0
};

const tjay = {
  x: canvas.width - PADDLE_MARGIN - PADDLE_WIDTH,
  y: canvas.height / 2 - PADDLE_HEIGHT / 2,
  width: PADDLE_WIDTH,
  height: PADDLE_HEIGHT,
  dy: 0
};

// Ball object
const ball = {
  x: canvas.width / 2 - BALL_SIZE / 2,
  y: canvas.height / 2 - BALL_SIZE / 2,
  dx: BALL_SPEED * (Math.random() > 0.5 ? 1 : -1),
  dy: BALL_SPEED * (Math.random() * 2 - 1)
};

let keys = {};
let winner = null;

// Event listeners
document.addEventListener('keydown', (e) => {
  keys[e.key] = true;
  if (state === GAME_STATE.TITLE && (e.key === ' ' || e.key === 'Enter')) {
    startGame();
  }
});
document.addEventListener('keyup', (e) => {
  keys[e.key] = false;
});

function startGame() {
  // Reset positions
  vadim.y = canvas.height / 2 - PADDLE_HEIGHT / 2;
  tjay.y = canvas.height / 2 - PADDLE_HEIGHT / 2;
  ball.x = canvas.width / 2 - BALL_SIZE / 2;
  ball.y = canvas.height / 2 - BALL_SIZE / 2;
  ball.dx = BALL_SPEED * (Math.random() > 0.5 ? 1 : -1);
  ball.dy = BALL_SPEED * (Math.random() * 2 - 1);
  winner = null;
  state = GAME_STATE.PLAYING;
}

function drawTitleScreen() {
  ctx.fillStyle = '#222';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#fff';
  ctx.font = 'bold 40px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('SuperMicro vs Dell', canvas.width / 2, canvas.height / 2 - 40);

  ctx.font = '24px Arial';
  ctx.fillText('Press SPACE or ENTER to Start', canvas.width / 2, canvas.height / 2 + 20);

  // Draw Vadim and TJay heads
  ctx.drawImage(vadimImg, canvas.width / 2 - 160, canvas.height / 2 + 60, 64, 64);
  ctx.drawImage(tjayImg, canvas.width / 2 + 96, canvas.height / 2 + 60, 64, 64);

  ctx.font = '18px Arial';
  ctx.fillText('Vadim', canvas.width / 2 - 128, canvas.height / 2 + 140);
  ctx.fillText('TJay', canvas.width / 2 + 128, canvas.height / 2 + 140);
}

function drawGame() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw middle line
  ctx.strokeStyle = '#aaa';
  ctx.setLineDash([10, 10]);
  ctx.beginPath();
  ctx.moveTo(canvas.width / 2, 0);
  ctx.lineTo(canvas.width / 2, canvas.height);
  ctx.stroke();
  ctx.setLineDash([]);

  // Draw Vadim head
  ctx.drawImage(vadimImg, vadim.x, vadim.y, vadim.width, vadim.height);

  // Draw TJay head
  ctx.drawImage(tjayImg, tjay.x, tjay.y, tjay.width, tjay.height);

  // Draw ball
  ctx.beginPath();
  ctx.arc(ball.x + BALL_SIZE / 2, ball.y + BALL_SIZE / 2, BALL_SIZE / 2, 0, Math.PI * 2);
  ctx.fillStyle = '#f5c542';
  ctx.fill();
  ctx.strokeStyle = '#333';
  ctx.stroke();
}

function drawGameOver() {
  drawGame();
  ctx.fillStyle = 'rgba(0,0,0,0.7)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#fff';
  ctx.font = 'bold 36px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(`${winner} Wins!`, canvas.width / 2, canvas.height / 2);
  ctx.font = '24px Arial';
  ctx.fillText('Press SPACE or ENTER to Restart', canvas.width / 2, canvas.height / 2 + 40);
}

function updateVadimAI() {
  // Simple AI: move Vadim's head towards the ball
  const vadimCenter = vadim.y + vadim.height / 2;
  const ballCenter = ball.y + BALL_SIZE / 2;
  if (vadimCenter < ballCenter - 10) {
    vadim.y += PADDLE_SPEED;
  } else if (vadimCenter > ballCenter + 10) {
    vadim.y -= PADDLE_SPEED;
  }
  // Clamp to canvas
  vadim.y = Math.max(0, Math.min(canvas.height - vadim.height, vadim.y));
}

function updateTJayControl() {
  if (keys['ArrowUp']) {
    tjay.y -= PADDLE_SPEED;
  }
  if (keys['ArrowDown']) {
    tjay.y += PADDLE_SPEED;
  }
  // Clamp to canvas
  tjay.y = Math.max(0, Math.min(canvas.height - tjay.height, tjay.y));
}

function updateBall() {
  ball.x += ball.dx;
  ball.y += ball.dy;

  // Top/bottom wall collision
  if (ball.y <= 0 || ball.y + BALL_SIZE >= canvas.height) {
    ball.dy *= -1;
    ball.y = Math.max(0, Math.min(canvas.height - BALL_SIZE, ball.y));
  }

  // Left paddle (Vadim) collision
  if (
    ball.x <= vadim.x + vadim.width &&
    ball.x >= vadim.x &&
    ball.y + BALL_SIZE >= vadim.y &&
    ball.y <= vadim.y + vadim.height
  ) {
    ball.dx = Math.abs(ball.dx);
    // Add some "english" based on where it hits the head
    let impact = (ball.y + BALL_SIZE / 2 - (vadim.y + vadim.height / 2)) / (vadim.height / 2);
    ball.dy = BALL_SPEED * impact;
    ball.x = vadim.x + vadim.width;
  }

  // Right paddle (TJay) collision
  if (
    ball.x + BALL_SIZE >= tjay.x &&
    ball.x + BALL_SIZE <= tjay.x + tjay.width &&
    ball.y + BALL_SIZE >= tjay.y &&
    ball.y <= tjay.y + tjay.height
  ) {
    ball.dx = -Math.abs(ball.dx);
    let impact = (ball.y + BALL_SIZE / 2 - (tjay.y + tjay.height / 2)) / (tjay.height / 2);
    ball.dy = BALL_SPEED * impact;
    ball.x = tjay.x - BALL_SIZE;
  }

  // Left/right wall (score)
  if (ball.x < 0) {
    winner = 'TJay';
    state = GAME_STATE.GAME_OVER;
  } else if (ball.x + BALL_SIZE > canvas.width) {
    winner = 'Vadim';
    state = GAME_STATE.GAME_OVER;
  }
}

function gameLoop() {
  if (state === GAME_STATE.TITLE) {
    drawTitleScreen();
  } else if (state === GAME_STATE.PLAYING) {
    updateVadimAI();
    updateTJayControl();
    updateBall();
    drawGame();
  } else if (state === GAME_STATE.GAME_OVER) {
    drawGameOver();
  }
  requestAnimationFrame(gameLoop);
}

// Wait for images to load before starting loop
let imagesLoaded = 0;
vadimImg.onload = tjayImg.onload = function () {
  imagesLoaded++;
  if (imagesLoaded === 2) {
    gameLoop();
  }
};