// Get UI Elements
const canvas = document.getElementById("canvas"); // Make sure canvas id matches
const ctx = canvas.getContext("2d");

const scoreDisplay = document.getElementById("score"); // Element holding score value
const levelDisplay = document.getElementById("level"); // Element holding level value
const livesDisplay = document.getElementById("lives"); // Element holding lives value
const restartBtn = document.getElementById("restart-btn"); // Restart button element

// Game Variables
let score = 0;
let level = 1;
let lives = 3;
let isPaused = false;
let gameOver = false;

// Ball Settings
let ballRadius = 8;
let x = canvas.width / 2;
let y = canvas.height - 30;
let dx = 3;
let dy = -3;

// Paddle Settings
const paddleHeight = 12;
const paddleWidth = 90;
let paddleX = (canvas.width - paddleWidth) / 2;

// Controls
let rightPressed = false;
let leftPressed = false;

// Brick Settings
const brickRowCount = 5;
const brickColumnCount = 7;
const brickWidth = 70;
const brickHeight = 20;
const brickPadding = 10;
const brickOffsetTop = 30;
const brickOffsetLeft = 25;

let bricks = [];
createBricks();

// Initialize or rebuild brick array
function createBricks() {
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

if (restartBtn) {
    restartBtn.addEventListener("click", resetGame);
}

// Keyboard Control Handlers
function keyDownHandler(e) {
    if (e.key === "ArrowRight" || e.key === "Right") {
        rightPressed = true;
    } else if (e.key === "ArrowLeft" || e.key === "Left") {
        leftPressed = true;
    } else if (e.code === "Space") {
        e.preventDefault(); // Prevent page scrolling
        isPaused = !isPaused;
        if (!isPaused && !gameOver) {
            draw(); // Resume game loop
        }
    }
}

function keyUpHandler(e) {
    if (e.key === "ArrowRight" || e.key === "Right") {
        rightPressed = false;
    } else if (e.key === "ArrowLeft" || e.key === "Left") {
        leftPressed = false;
    }
}

// Helper to update text contents in UI header
function updateUI() {
    if (scoreDisplay) scoreDisplay.textContent = score;
    if (levelDisplay) levelDisplay.textContent = level;
    if (livesDisplay) livesDisplay.textContent = lives;
}

// Collision Detection between Ball and Bricks
function collisionDetection() {
    let remainingBricks = 0;

    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            const b = bricks[c][r];
            if (b.status === 1) {
                remainingBricks++;
                if (x > b.x && x < b.x + brickWidth && y > b.y && y < b.y + brickHeight) {
                    dy = -dy;
                    b.status = 0;
                    score += 10;
                    updateUI();

                    // Advance Level if all bricks broken
                    if (remainingBricks - 1 === 0) {
                        level++;
                        dx *= 1.1; // Slightly increase speed per level
                        dy *= 1.1;
                        createBricks();
                        resetBallAndPaddle();
                        updateUI();
                    }
                }
            }
        }
    }
}

// Drawing Functions
function drawBall() {
    ctx.beginPath();
    ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
    ctx.fillStyle = "#ffffff";
    ctx.fill();
    ctx.closePath();
}

function drawPaddle() {
    ctx.beginPath();
    // Modern rounded corner paddle
    if (ctx.roundRect) {
        ctx.roundRect(paddleX, canvas.height - paddleHeight - 10, paddleWidth, paddleHeight, 6);
    } else {
        ctx.rect(paddleX, canvas.height - paddleHeight - 10, paddleWidth, paddleHeight);
    }
    ctx.fillStyle = "#3b82f6";
    ctx.fill();
    ctx.closePath();
}

function drawBricks() {
    // Dynamic row colors matching modern themes
    const colors = ["#ef4444", "#f97316", "#eab308", "#10b981", "#06b6d4"];

    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            if (bricks[c][r].status === 1) {
                const brickX = c * (brickWidth + brickPadding) + brickOffsetLeft;
                const brickY = r * (brickHeight + brickPadding) + brickOffsetTop;
                bricks[c][r].x = brickX;
                bricks[c][r].y = brickY;

                ctx.beginPath();
                if (ctx.roundRect) {
                    ctx.roundRect(brickX, brickY, brickWidth, brickHeight, 4);
                } else {
                    ctx.rect(brickX, brickY, brickWidth, brickHeight);
                }
                ctx.fillStyle = colors[r % colors.length];
                ctx.fill();
                ctx.closePath();
            }
        }
    }
}

function resetBallAndPaddle() {
    x = canvas.width / 2;
    y = canvas.height - 30;
    paddleX = (canvas.width - paddleWidth) / 2;
}

function resetGame() {
    score = 0;
    level = 1;
    lives = 3;
    dx = 3;
    dy = -3;
    isPaused = false;
    gameOver = false;
    createBricks();
    resetBallAndPaddle();
    updateUI();
    draw();
}

// Game Loop
function draw() {
    if (isPaused || gameOver) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawBricks();
    drawBall();
    drawPaddle();
    collisionDetection();

    // Wall Collision (Left / Right)
    if (x + dx > canvas.width - ballRadius || x + dx < ballRadius) {
        dx = -dx;
    }

    // Ceiling Collision
    if (y + dy < ballRadius) {
        dy = -dy;
    } else if (y + dy > canvas.height - paddleHeight - 10 - ballRadius) {
        // Paddle Collision
        if (x > paddleX && x < paddleX + paddleWidth) {
            dy = -dy;
        } else if (y + dy > canvas.height - ballRadius) {
            // Bottom hit - lose a life
            lives--;
            updateUI();

            if (lives <= 0) {
                gameOver = true;
                alert("GAME OVER");
            } else {
                resetBallAndPaddle();
            }
        }
    }

    // Move Paddle
    if (rightPressed && paddleX < canvas.width - paddleWidth) {
        paddleX += 7;
    } else if (leftPressed && paddleX > 0) {
        paddleX -= 7;
    }

    // Move Ball
    x += dx;
    y += dy;

    requestAnimationFrame(draw);
}

// Start Game
draw();