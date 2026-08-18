const canvas = document.getElementById("gameCanvas"); // Update ID if needed
const ctx = canvas.getContext("2d");

// Game State & Stats
let score = 0;
let level = 1;
let lives = 3;
let isPaused = false;
let gameOver = false;

// UI Elements
const scoreElement = document.getElementById("score"); // Optional HTML bind
const levelElement = document.getElementById("level");
const livesElement = document.getElementById("lives");
const restartBtn = document.getElementById("restartBtn"); // Match button ID

// Ball Settings
let ballRadius = 8;
let x = canvas.width / 2;
let y = canvas.height - 30;
let dx = 3;
let dy = -3;

// Paddle Settings
const paddleHeight = 12;
const paddleWidth = 85;
let paddleX = (canvas.width - paddleWidth) / 2;

// Key State
let rightPressed = false;
let leftPressed = false;

// Brick Grid Settings
const brickRowCount = 4;
const brickColumnCount = 6;
const brickWidth = 65;
const brickHeight = 18;
const brickPadding = 10;
const brickOffsetTop = 20;
const brickOffsetLeft = 20;

let bricks = [];
initBricks();

function initBricks() {
    bricks = [];
    for (let c = 0; c < brickColumnCount; c++) {
        bricks[c] = [];
        for (let r = 0; r < brickRowCount; r++) {
            bricks[c][r] = { x: 0, y: 0, status: 1 };
        }
    }
}

// Event Listeners
document.addEventListener("keydown", keyDownHandler);
document.addEventListener("keyup", keyUpHandler);
document.addEventListener("mousemove", mouseMoveHandler);

if (restartBtn) {
    restartBtn.addEventListener("click", restartGame);
}

function keyDownHandler(e) {
    if (e.key === "Right" || e.key === "ArrowRight") {
        rightPressed = true;
    } else if (e.key === "Left" || e.key === "ArrowLeft") {
        leftPressed = true;
    } else if (e.code === "Space") {
        isPaused = !isPaused;
        if (!isPaused) draw(); // Resume loop
    }
}

function keyUpHandler(e) {
    if (e.key === "Right" || e.key === "ArrowRight") {
        rightPressed = false;
    } else if (e.key === "Left" || e.key === "ArrowLeft") {
        leftPressed = false;
    }
}

function mouseMoveHandler(e) {
    const relativeX = e.clientX - canvas.getBoundingClientRect().left;
    if (relativeX > 0 && relativeX < canvas.width) {
        paddleX = relativeX - paddleWidth / 2;
    }
}

function updateUI() {
    if (scoreElement) scoreElement.textContent = score;
    if (levelElement) levelElement.textContent = level;
    if (livesElement) livesElement.textContent = lives;
}

function collisionDetection() {
    let activeBricks = 0;
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            const b = bricks[c][r];
            if (b.status === 1) {
                activeBricks++;
                if (x > b.x && x < b.x + brickWidth && y > b.y && y < b.y + brickHeight) {
                    dy = -dy;
                    b.status = 0;
                    score += 10;
                    updateUI();

                    // Check level completion
                    if (activeBricks - 1 === 0) {
                        level++;
                        dx *= 1.1; // Speed up ball per level
                        dy *= 1.1;
                        initBricks();
                        resetPositions();
                        updateUI();
                    }
                }
            }
        }
    }
}

function drawBall() {
    ctx.beginPath();
    ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
    ctx.fillStyle = "#3b82f6";
    ctx.fill();
    ctx.closePath();
}

function drawPaddle() {
    ctx.beginPath();
    ctx.roundRect(paddleX, canvas.height - paddleHeight - 5, paddleWidth, paddleHeight, 6);
    ctx.fillStyle = "#60a5fa";
    ctx.fill();
    ctx.closePath();
}

function drawBricks() {
    const colors = ["#ef4444", "#f97316", "#eab308", "#10b981"];
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            if (bricks[c][r].status === 1) {
                const brickX = c * (brickWidth + brickPadding) + brickOffsetLeft;
                const brickY = r * (brickHeight + brickPadding) + brickOffsetTop;
                bricks[c][r].x = brickX;
                bricks[c][r].y = brickY;
                ctx.beginPath();
                ctx.roundRect(brickX, brickY, brickWidth, brickHeight, 4);
                ctx.fillStyle = colors[r % colors.length];
                ctx.fill();
                ctx.closePath();
            }
        }
    }
}

function resetPositions() {
    x = canvas.width / 2;
    y = canvas.height - 30;
    paddleX = (canvas.width - paddleWidth) / 2;
}

function restartGame() {
    score = 0;
    level = 1;
    lives = 3;
    dx = 3;
    dy = -3;
    gameOver = false;
    isPaused = false;
    initBricks();
    resetPositions();
    updateUI();
    draw();
}

function draw() {
    if (isPaused || gameOver) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawBricks();
    drawBall();
    drawPaddle();
    collisionDetection();

    // Wall Bouncing
    if (x + dx > canvas.width - ballRadius || x + dx < ballRadius) dx = -dx;
    if (y + dy < ballRadius) dy = -dy;

    // Paddle Hit & Bottom Death
    if (y + dy > canvas.height - paddleHeight - 5 - ballRadius) {
        if (x > paddleX && x < paddleX + paddleWidth) {
            dy = -dy;
        } else if (y + dy > canvas.height - ballRadius) {
            lives--;
            updateUI();
            if (lives <= 0) {
                gameOver = true;
                alert("GAME OVER");
            } else {
                resetPositions();
            }
        }
    }

    // Paddle Controls
    if (rightPressed && paddleX < canvas.width - paddleWidth) paddleX += 6;
    if (leftPressed && paddleX > 0) paddleX -= 6;

    x += dx;
    y += dy;

    requestAnimationFrame(draw);
}

draw();