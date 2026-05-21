// # const statusRow = document.querySelector(".status-row");
// # const statusText = document.querySelector("#status-text");
// # 
// # async function updateStatus() {
// #   try {
// #     const response = await fetch("/health", { cache: "no-store" });
// #     if (!response.ok) {
// #       throw new Error(`Health check failed with ${response.status}`);
// #     }
// # 
// #     const data = await response.json();
// #     statusRow.classList.add("is-ok");
// #     statusText.textContent = `${data.service} ${data.version} is ${data.status}`;
// #   } catch (error) {
// #     statusRow.classList.remove("is-ok");
// #     statusText.textContent = "Service status unavailable";
// #   }
// # }
// # 
// # updateStatus();

// Snake Game Logic
const canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext("2d");
const scoreEl = document.getElementById("score");
const highScoreEl = document.getElementById("high-score");
const overlay = document.getElementById("game-overlay");
const overlayTitle = document.getElementById("overlay-title");
const overlayMsg = document.getElementById("overlay-msg");
const startBtn = document.getElementById("start-btn");

// Touch / Mobile control buttons
const ctrlUp = document.getElementById("ctrl-up");
const ctrlDown = document.getElementById("ctrl-down");
const ctrlLeft = document.getElementById("ctrl-left");
const ctrlRight = document.getElementById("ctrl-right");

// Grid configurations
const GRID_SIZE = 20;
const TILE_COUNT = canvas.width / GRID_SIZE;

let snake = [];
let food = { x: 0, y: 0 };
let dx = 1;
let dy = 0;
let nextDx = 1;
let nextDy = 0;
let score = 0;
let highScore = parseInt(localStorage.getItem("appe-snake-high-score") || "0", 10);
let gameInterval = null;
let isPlaying = false;
let gameSpeed = 120; // Time step in ms
let lastTime = 0;
const WIN_SCORE = 500;

// Swipe Gesture Coordinates
let touchStartX = 0;
let touchStartY = 0;
const SWIPE_THRESHOLD = 30;

// Initialize high score display
highScoreEl.textContent = highScore;

function resetGame() {
  snake = [
    { x: 10, y: 10 },
    { x: 9, y: 10 },
    { x: 8, y: 10 }
  ];
  dx = 1;
  dy = 0;
  nextDx = 1;
  nextDy = 0;
  score = 0;
  scoreEl.textContent = score;
  spawnFood();
}

function spawnFood() {
  let attempts = 0;
  while (attempts < 100) {
    const rx = Math.floor(Math.random() * TILE_COUNT);
    const ry = Math.floor(Math.random() * TILE_COUNT);
    
    // Check if food spawns on snake
    const onSnake = snake.some(segment => segment.x === rx && segment.y === ry);
    if (!onSnake) {
      food = { x: rx, y: ry };
      return;
    }
    attempts++;
  }
}

function handleInput(xDir, yDir) {
  // Prevent turning 180 degrees instantly
  if (xDir !== 0 && dx !== -xDir) {
    nextDx = xDir;
    nextDy = 0;
  }
  if (yDir !== 0 && dy !== -yDir) {
    nextDx = 0;
    nextDy = yDir;
  }
}

// Event Listeners
window.addEventListener("keydown", (e) => {
  if (!isPlaying) {
    if (e.key === " " || e.key === "Enter") {
      startGame();
    }
    return;
  }
  
  switch (e.key) {
    case "ArrowUp":
    case "w":
    case "W":
      handleInput(0, -1);
      e.preventDefault();
      break;
    case "ArrowDown":
    case "s":
    case "S":
      handleInput(0, 1);
      e.preventDefault();
      break;
    case "ArrowLeft":
    case "a":
    case "A":
      handleInput(-1, 0);
      e.preventDefault();
      break;
    case "ArrowRight":
    case "d":
    case "D":
      handleInput(1, 0);
      e.preventDefault();
      break;
  }
});

// Mobile Controls (D-pad)
ctrlUp.addEventListener("click", () => isPlaying && handleInput(0, -1));
ctrlDown.addEventListener("click", () => isPlaying && handleInput(0, 1));
ctrlLeft.addEventListener("click", () => isPlaying && handleInput(-1, 0));
ctrlRight.addEventListener("click", () => isPlaying && handleInput(1, 0));

// Touch Screen Swipe Gestures
canvas.addEventListener("touchstart", (e) => {
  if (!isPlaying) return;
  touchStartX = e.touches[0].clientX;
  touchStartY = e.touches[0].clientY;
}, { passive: true });

canvas.addEventListener("touchmove", (e) => {
  // Prevent page scrolling when swiping inside the game board
  if (isPlaying) {
    e.preventDefault();
  }
}, { passive: false });

canvas.addEventListener("touchend", (e) => {
  if (!isPlaying) return;

  const touchEndX = e.changedTouches[0].clientX;
  const touchEndY = e.changedTouches[0].clientY;

  const diffX = touchEndX - touchStartX;
  const diffY = touchEndY - touchStartY;

  // Verify swipe distance is long enough
  if (Math.max(Math.abs(diffX), Math.abs(diffY)) < SWIPE_THRESHOLD) {
    return;
  }

  if (Math.abs(diffX) > Math.abs(diffY)) {
    // Horizontal Swipe
    if (diffX > 0) {
      handleInput(1, 0); // Right
    } else {
      handleInput(-1, 0); // Left
    }
  } else {
    // Vertical Swipe
    if (diffY > 0) {
      handleInput(0, 1); // Down
    } else {
      handleInput(0, -1); // Up
    }
  }
}, { passive: true });

startBtn.addEventListener("click", startGame);

function startGame() {
  if (isPlaying) return;
  overlay.classList.add("hidden");
  resetGame();
  isPlaying = true;
  lastTime = performance.now();
  requestAnimationFrame(gameLoop);
}

function gameOver() {
  isPlaying = false;
  if (score > highScore) {
    highScore = score;
    localStorage.setItem("appe-snake-high-score", highScore.toString());
    highScoreEl.textContent = highScore;
  }
  
  overlayTitle.textContent = "Game Over";
  overlayMsg.textContent = `You scored ${score} points!`;
  startBtn.textContent = "Play Again";
  overlay.classList.remove("hidden");
}

function gameWin() {
  isPlaying = false;
  if (score > highScore) {
    highScore = score;
    localStorage.setItem("appe-snake-high-score", highScore.toString());
    highScoreEl.textContent = highScore;
  }
  
  overlayTitle.textContent = "Victory!";
  overlayMsg.textContent = `You reached the target score of ${WIN_SCORE} points!`;
  startBtn.textContent = "Play Again";
  overlay.classList.remove("hidden");
}

function update() {
  // Update direction
  dx = nextDx;
  dy = nextDy;

  // Move snake head
  const head = { x: snake[0].x + dx, y: snake[0].y + dy };

  // Wrap snake coordinates on boundaries
  if (head.x < 0) {
    head.x = TILE_COUNT - 1;
  } else if (head.x >= TILE_COUNT) {
    head.x = 0;
  }

  if (head.y < 0) {
    head.y = TILE_COUNT - 1;
  } else if (head.y >= TILE_COUNT) {
    head.y = 0;
  }

  // Self collision
  for (let i = 0; i < snake.length; i++) {
    if (snake[i].x === head.x && snake[i].y === head.y) {
      gameOver();
      return;
    }
  }

  // Grow / Move snake
  snake.unshift(head);

  if (head.x === food.x && head.y === food.y) {
    score += 10;
    scoreEl.textContent = score;
    if (score >= WIN_SCORE) {
      gameWin();
      return;
    }
    spawnFood();
  } else {
    snake.pop();
  }
}

function drawGrid() {
  // Use colors that match stylesheet variables
  ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--line').trim() || "#dfe3e6";
  ctx.lineWidth = 0.5;

  for (let i = 1; i < TILE_COUNT; i++) {
    // Vertical line
    ctx.beginPath();
    ctx.moveTo(i * GRID_SIZE, 0);
    ctx.lineTo(i * GRID_SIZE, canvas.height);
    ctx.stroke();

    // Horizontal line
    ctx.beginPath();
    ctx.moveTo(0, i * GRID_SIZE);
    ctx.lineTo(canvas.width, i * GRID_SIZE);
    ctx.stroke();
  }
}

function draw() {
  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Draw subtle grid
  drawGrid();

  // Draw Food
  ctx.fillStyle = "#db5461"; // Vibrant secondary pink/red
  ctx.shadowColor = "#db5461";
  ctx.shadowBlur = 8;
  ctx.beginPath();
  const radius = GRID_SIZE / 2 - 2;
  const foodX = food.x * GRID_SIZE + GRID_SIZE / 2;
  const foodY = food.y * GRID_SIZE + GRID_SIZE / 2;
  ctx.arc(foodX, foodY, radius, 0, Math.PI * 2);
  ctx.fill();
  
  // Reset shadow for snake
  ctx.shadowBlur = 0;

  // Draw Snake
  const accentColor = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || "#177e89";
  const accentStrongColor = getComputedStyle(document.documentElement).getPropertyValue('--accent-strong').trim() || "#11616a";

  snake.forEach((segment, index) => {
    // Gradient effect along the snake's body
    if (index === 0) {
      ctx.fillStyle = accentStrongColor; // Head is darker
    } else {
      ctx.fillStyle = accentColor;
    }
    
    // Draw rounded rects for snake body
    const x = segment.x * GRID_SIZE + 1;
    const y = segment.y * GRID_SIZE + 1;
    const w = GRID_SIZE - 2;
    const h = GRID_SIZE - 2;
    const r = 4; // Corner radius
    
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(x, y, w, h, r) : ctx.rect(x, y, w, h);
    ctx.fill();

    // Draw eyes on the snake head
    if (index === 0) {
      ctx.fillStyle = "#ffffff";
      const eyeSize = 3;
      
      // Determine eye placements based on direction
      let leftEye = { x: 0, y: 0 };
      let rightEye = { x: 0, y: 0 };
      
      if (dx === 1) { // Moving Right
        leftEye = { x: x + w - 6, y: y + 4 };
        rightEye = { x: x + w - 6, y: y + h - 6 };
      } else if (dx === -1) { // Moving Left
        leftEye = { x: x + 4, y: y + 4 };
        rightEye = { x: x + 4, y: y + h - 6 };
      } else if (dy === 1) { // Moving Down
        leftEye = { x: x + 4, y: y + h - 6 };
        rightEye = { x: x + w - 6, y: y + h - 6 };
      } else if (dy === -1) { // Moving Up
        leftEye = { x: x + 4, y: y + 4 };
        rightEye = { x: x + w - 6, y: y + 4 };
      }
      
      ctx.beginPath();
      ctx.arc(leftEye.x, leftEye.y, eyeSize, 0, Math.PI * 2);
      ctx.arc(rightEye.x, rightEye.y, eyeSize, 0, Math.PI * 2);
      ctx.fill();

      // Pupils
      ctx.fillStyle = "#000000";
      ctx.beginPath();
      ctx.arc(leftEye.x, leftEye.y, 1, 0, Math.PI * 2);
      ctx.arc(rightEye.x, rightEye.y, 1, 0, Math.PI * 2);
      ctx.fill();
    }
  });
}

function gameLoop(timestamp) {
  if (!isPlaying) return;

  const elapsed = timestamp - lastTime;

  if (elapsed > gameSpeed) {
    update();
    if (isPlaying) {
      draw();
    }
    lastTime = timestamp;
  }

  if (isPlaying) {
    requestAnimationFrame(gameLoop);
  }
}
