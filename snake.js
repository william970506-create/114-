const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const speedEl = document.getElementById('speed');
const cellSizeSel = document.getElementById('cellSize');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');

let cellSize = parseInt(cellSizeSel.value);
let cols = Math.floor(canvas.width / cellSize);
let rows = Math.floor(canvas.height / cellSize);

let snake = [];
let dir = { x: 1, y: 0 };
let food = null;
let score = 0;
let running = false;
let timer = null;
let tickMs = Math.round(1000 / parseInt(speedEl.value));
let paused = false;

function reset() {
  cellSize = parseInt(cellSizeSel.value);
  cols = Math.floor(canvas.width / cellSize);
  rows = Math.floor(canvas.height / cellSize);
  snake = [];
  const startX = Math.floor(cols / 2);
  const startY = Math.floor(rows / 2);
  snake.push({ x: startX, y: startY });
  snake.push({ x: startX - 1, y: startY });
  snake.push({ x: startX - 2, y: startY });
  dir = { x: 1, y: 0 };
  placeFood();
  score = 0;
  scoreEl.textContent = score;
  paused = false;
}

function placeFood() {
  while (true) {
    const f = {
      x: Math.floor(Math.random() * cols),
      y: Math.floor(Math.random() * rows),
    };
    if (!snake.some((s) => s.x === f.x && s.y === f.y)) {
      food = f;
      break;
    }
  }
}

function step() {
  if (paused) return;
  const head = snake[0];
  const newHead = { x: head.x + dir.x, y: head.y + dir.y };

  if (newHead.x < 0 || newHead.x >= cols || newHead.y < 0 || newHead.y >= rows) {
    gameOver();
    return;
  }

  if (snake.some((s) => s.x === newHead.x && s.y === newHead.y)) {
    gameOver();
    return;
  }

  snake.unshift(newHead);

  if (food && newHead.x === food.x && newHead.y === food.y) {
    score += 10;
    scoreEl.textContent = score;
    placeFood();
  } else {
    snake.pop();
  }

  draw();
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.save();
  ctx.globalAlpha = 0.07;
  for (let i = 0; i <= cols; i++) ctx.fillRect(i * cellSize - 1, 0, 1, canvas.height);
  for (let j = 0; j <= rows; j++) ctx.fillRect(0, j * cellSize, canvas.width, 1);
  ctx.restore();

  if (food) {
    const fx = food.x * cellSize,
      fy = food.y * cellSize;
    ctx.fillStyle = "#ef4444";
    ctx.fillRect(fx + 2, fy + 2, cellSize - 4, cellSize - 4);
  }

  for (let i = 0; i < snake.length; i++) {
    const s = snake[i];
    const x = s.x * cellSize,
      y = s.y * cellSize;
    ctx.fillStyle =
      i === 0 ? "#06b6d4" : `rgba(34,197,94,${1 - (i / snake.length) * 0.6})`;
    ctx.fillRect(x + 1, y + 1, cellSize - 2, cellSize - 2);
  }
}

function gameOver() {
  clearInterval(timer);
  running = false;
  paused = true;
  ctx.save();
  ctx.fillStyle = "rgba(0,0,0,0.5)";
  ctx.fillRect(0, canvas.height / 2 - 40, canvas.width, 80);
  ctx.fillStyle = "#fff";
  ctx.font = "22px system-ui";
  ctx.textAlign = "center";
  ctx.fillText("遊戲結束！按重新開始再試一次", canvas.width / 2, canvas.height / 2 + 8);
  ctx.restore();
}

function trySetDir(x, y) {
  if (snake.length > 1) {
    const next = { x: snake[0].x + x, y: snake[0].y + y };
    if (next.x === snake[1].x && next.y === snake[1].y) return;
  }
  dir = { x, y };
}

function startLoop() {
  if (running) clearInterval(timer);
  tickMs = Math.round(1000 / parseInt(speedEl.value));
  timer = setInterval(step, tickMs);
  running = true;
  paused = false;
}

window.addEventListener("keydown", (e) => {
  const k = e.key;
  if (k === "ArrowUp" || k === "w" || k === "W") trySetDir(0, -1);
  if (k === "ArrowDown" || k === "s" || k === "S") trySetDir(0, 1);
  if (k === "ArrowLeft" || k === "a" || k === "A") trySetDir(-1, 0);
  if (k === "ArrowRight" || k === "d" || k === "D") trySetDir(1, 0);
  if (k === " " || k === "p" || k === "P") paused = !paused;
  if (!running && !paused) startLoop();
});

startBtn.addEventListener("click", () => {
  reset();
  draw();
  startLoop();
});

pauseBtn.addEventListener("click", () => {
  paused = !paused;
  pauseBtn.textContent = paused ? "繼續" : "暫停";
});

speedEl.addEventListener("input", () => {
  if (running) startLoop();
});

cellSizeSel.addEventListener("change", () => {
  reset();
  draw();
});

reset();
draw();
