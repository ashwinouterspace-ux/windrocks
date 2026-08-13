    // ==========================================
    // CANVAS SETUP
    // ==========================================

    const canvas = document.getElementById("gameCanvas");
    const ctx = canvas.getContext("2d");

    const scoreDisplay = document.getElementById("score");
    const levelDisplay = document.getElementById("level");
    const livesDisplay = document.getElementById("lives");
    const restartButton = document.getElementById("restartButton");


    // ==========================================
    // GAME VARIABLES
    // ==========================================

    let score = 0;
    let lives = 3;
    let level = 1;

    let gameRunning = true;
    let gamePaused = false;

    let rightPressed = false;
    let leftPressed = false;


    // ==========================================
    // BALL
    // ==========================================

    const ball = {
        x: canvas.width / 2,
        y: canvas.height - 70,
        radius: 9,
        speedX: 4,
        speedY: -4
    };


    // ==========================================
    // PADDLE
    // ==========================================

    const paddle = {
        width: 120,
        height: 14,
        x: canvas.width / 2 - 60,
        y: canvas.height - 35,
        speed: 8
    };


    // ==========================================
    // BRICKS
    // ==========================================

    const brickSettings = {
        rows: 5,
        columns: 10,
        width: 68,
        height: 22,
        padding: 8,
        top: 60,
        left: 20
    };

    let bricks = [];


    function createBricks() {

        bricks = [];

        for (let row = 0; row < brickSettings.rows; row++) {

            for (let column = 0; column < brickSettings.columns; column++) {

                bricks.push({
                    x: brickSettings.left +
                       column * (brickSettings.width + brickSettings.padding),

                    y: brickSettings.top +
                       row * (brickSettings.height + brickSettings.padding),

                    width: brickSettings.width,
                    height: brickSettings.height,

                    visible: true,

                    // Different colors for different rows
                    color: `hsl(${row * 50 + 10}, 80%, 55%)`
                });
            }
        }
    }


    // ==========================================
    // POWER-UP
    // ==========================================

    let powerUps = [];


    function createPowerUp(x, y) {

        // 20% chance of a power-up
        if (Math.random() > 0.2) {
            return;
        }

        powerUps.push({
            x: x,
            y: y,
            width: 22,
            height: 22,
            speed: 3,
            type: "wide"
        });
    }


    // ==========================================
    // KEYBOARD CONTROLS
    // ==========================================

    document.addEventListener("keydown", function(event) {

        if (event.key === "ArrowRight") {
            rightPressed = true;
        }

        if (event.key === "ArrowLeft") {
            leftPressed = true;
        }

        if (event.code === "Space") {

            event.preventDefault();

            if (gameRunning) {
                gamePaused = !gamePaused;
            }
        }
    });


    document.addEventListener("keyup", function(event) {

        if (event.key === "ArrowRight") {
            rightPressed = false;
        }

        if (event.key === "ArrowLeft") {
            leftPressed = false;
        }
    });


    // ==========================================
    // TOUCH / MOUSE CONTROLS
    // ==========================================

    canvas.addEventListener("mousemove", function(event) {

        const rect = canvas.getBoundingClientRect();

        const mouseX =
            (event.clientX - rect.left) *
            (canvas.width / rect.width);

        paddle.x = mouseX - paddle.width / 2;

        if (paddle.x < 0) {
            paddle.x = 0;
        }

        if (paddle.x + paddle.width > canvas.width) {
            paddle.x = canvas.width - paddle.width;
        }
    });


    // ==========================================
    // DRAW BALL
    // ==========================================

    function drawBall() {

        ctx.beginPath();

        ctx.arc(
            ball.x,
            ball.y,
            ball.radius,
            0,
            Math.PI * 2
        );

        ctx.fillStyle = "#ffffff";
        ctx.fill();

        ctx.closePath();
    }


    // ==========================================
    // DRAW PADDLE
    // ==========================================

    function drawPaddle() {

        ctx.fillStyle = "#38bdf8";

        ctx.fillRect(
            paddle.x,
            paddle.y,
            paddle.width,
            paddle.height
        );
    }


    // ==========================================
    // DRAW BRICKS
    // ==========================================

    function drawBricks() {

        bricks.forEach(function(brick) {

            if (!brick.visible) {
                return;
            }

            ctx.fillStyle = brick.color;

            ctx.fillRect(
                brick.x,
                brick.y,
                brick.width,
                brick.height
            );
        });
    }


    // ==========================================
    // DRAW POWER-UPS
    // ==========================================

    function drawPowerUps() {

        powerUps.forEach(function(powerUp) {

            ctx.fillStyle = "#facc15";

            ctx.fillRect(
                powerUp.x,
                powerUp.y,
                powerUp.width,
                powerUp.height
            );

            ctx.fillStyle = "#111827";

            ctx.font = "14px Arial";

            ctx.fillText(
                "W",
                powerUp.x + 5,
                powerUp.y + 16
            );
        });
    }


    // ==========================================
    // MOVE PADDLE
    // ==========================================

    function movePaddle() {

        if (rightPressed) {

            paddle.x += paddle.speed;

            if (paddle.x + paddle.width > canvas.width) {
                paddle.x = canvas.width - paddle.width;
            }
        }

        if (leftPressed) {

            paddle.x -= paddle.speed;

            if (paddle.x < 0) {
                paddle.x = 0;
            }
        }
    }


    // ==========================================
    // COLLISION WITH BRICKS
    // ==========================================

    function checkBrickCollisions() {

        bricks.forEach(function(brick) {

            if (!brick.visible) {
                return;
            }

            if (
                ball.x + ball.radius > brick.x &&
                ball.x - ball.radius < brick.x + brick.width &&
                ball.y + ball.radius > brick.y &&
                ball.y - ball.radius < brick.y + brick.height
            ) {

                brick.visible = false;

                ball.speedY *= -1;

                score += 10;

                scoreDisplay.textContent = score;

                createPowerUp(
                    brick.x + brick.width / 2,
                    brick.y
                );
            }
        });
    }


    // ==========================================
    // MOVE POWER-UPS
    // ==========================================

    function updatePowerUps() {

        powerUps.forEach(function(powerUp) {

            powerUp.y += powerUp.speed;

            // Check if paddle catches power-up

            if (
                powerUp.x + powerUp.width > paddle.x &&
                powerUp.x < paddle.x + paddle.width &&
                powerUp.y + powerUp.height > paddle.y &&
                powerUp.y < paddle.y + paddle.height
            ) {

                // Make paddle wider

                paddle.width = 180;

                setTimeout(function() {
                    paddle.width = 120;
                }, 7000);

                powerUp.y = canvas.height + 100;
            }
        });

        // Remove power-ups that leave screen

        powerUps = powerUps.filter(function(powerUp) {
            return powerUp.y < canvas.height + 50;
        });
    }


    // ==========================================
    // CHECK LEVEL
    // ==========================================

    function checkLevelComplete() {

        const remainingBricks =
            bricks.filter(brick => brick.visible).length;

        if (remainingBricks === 0) {

            level++;

            levelDisplay.textContent = level;

            createBricks();

            // Increase ball speed
            ball.speedX *= 1.1;
            ball.speedY *= 1.1;

            resetBall();
        }
    }


    // ==========================================
    // RESET BALL
    // ==========================================

    function resetBall() {

        ball.x = canvas.width / 2;
        ball.y = canvas.height - 70;

        ball.speedX =
            (Math.random() > 0.5 ? 1 : -1) *
            (4 + level * 0.5);

        ball.speedY =
            -(4 + level * 0.5);

        paddle.x =
            canvas.width / 2 -
            paddle.width / 2;
    }


    // ==========================================
    // GAME OVER
    // ==========================================

    function gameOver() {

        gameRunning = false;

        ctx.fillStyle = "rgba(0, 0, 0, 0.75)";
        ctx.fillRect(
            0,
            0,
            canvas.width,
            canvas.height
        );

        ctx.fillStyle = "white";

        ctx.textAlign = "center";

        ctx.font = "50px Arial";

        ctx.fillText(
            "GAME OVER",
            canvas.width / 2,
            canvas.height / 2 - 30
        );

        ctx.font = "24px Arial";

        ctx.fillText(
            "Final Score: " + score,
            canvas.width / 2,
            canvas.height / 2 + 20
        );

        ctx.font = "18px Arial";

        ctx.fillText(
            "Click Restart Game to play again",
            canvas.width / 2,
            canvas.height / 2 + 60
        );

        ctx.textAlign = "left";
    }


    // ==========================================
    // WIN SCREEN
    // ==========================================

    function drawWinScreen() {

        ctx.fillStyle = "rgba(0, 0, 0, 0.75)";

        ctx.fillRect(
            0,
            0,
            canvas.width,
            canvas.height
        );

        ctx.fillStyle = "white";

        ctx.textAlign = "center";

        ctx.font = "50px Arial";

        ctx.fillText(
            "YOU WIN! 🎉",
            canvas.width / 2,
            canvas.height / 2 - 30
        );

        ctx.font = "24px Arial";

        ctx.fillText(
            "Score: " + score,
            canvas.width / 2,
            canvas.height / 2 + 20
        );

        ctx.textAlign = "left";
    }


    // ==========================================
    // UPDATE GAME
    // ==========================================

    function update() {

        if (!gameRunning || gamePaused) {
            return;
        }

        movePaddle();

        updatePowerUps();

        ball.x += ball.speedX;
        ball.y += ball.speedY;


        // Left and right walls

        if (
            ball.x + ball.radius >
            canvas.width ||

            ball.x - ball.radius < 0
        ) {

            ball.speedX *= -1;
        }


        // Top wall

        if (ball.y - ball.radius < 0) {

            ball.y = ball.radius;

            ball.speedY *= -1;
        }


        // Paddle collision

        if (
            ball.y + ball.radius >= paddle.y &&
            ball.y - ball.radius <= paddle.y + paddle.height &&
            ball.x >= paddle.x &&
            ball.x <= paddle.x + paddle.width &&
            ball.speedY > 0
        ) {

            // Change angle depending on where ball hits paddle

            const hitPosition =
                (ball.x - paddle.x) /
                paddle.width;

            const angle =
                (hitPosition - 0.5) *
                Math.PI *
                0.8;

            const speed =
                Math.sqrt(
                    ball.speedX ** 2 +
                    ball.speedY ** 2
                );

            ball.speedX =
                speed * Math.sin(angle);

            ball.speedY =
                -Math.abs(
                    speed * Math.cos(angle)
                );

            ball.y =
                paddle.y - ball.radius;
        }


        // Ball falls below paddle

        if (ball.y - ball.radius > canvas.height) {

            lives--;

            livesDisplay.textContent = lives;

            if (lives <= 0) {

                gameOver();

                return;
            }

            resetBall();
        }


        checkBrickCollisions();

        checkLevelComplete();
    }


    // ==========================================
    // DRAW EVERYTHING
    // ==========================================

    function draw() {

        ctx.clearRect(
            0,
            0,
            canvas.width,
            canvas.height
        );

        drawBricks();

        drawBall();

        drawPaddle();

        drawPowerUps();


        // Pause screen

        if (gamePaused && gameRunning) {

            ctx.fillStyle =
                "rgba(0, 0, 0, 0.6)";

            ctx.fillRect(
                0,
                0,
                canvas.width,
                canvas.height
            );

            ctx.fillStyle = "white";

            ctx.textAlign = "center";

            ctx.font = "45px Arial";

            ctx.fillText(
                "PAUSED",
                canvas.width / 2,
                canvas.height / 2
            );

            ctx.textAlign = "left";
        }
    }


    // ==========================================
    // GAME LOOP
    // ==========================================

    function gameLoop() {

        update();

        draw();

        requestAnimationFrame(gameLoop);
    }


    // ==========================================
    // RESTART GAME
    // ==========================================

    restartButton.addEventListener("click", function() {

        score = 0;
        lives = 3;
        level = 1;

        scoreDisplay.textContent = score;
        livesDisplay.textContent = lives;
        levelDisplay.textContent = level;

        gameRunning = true;
        gamePaused = false;

        paddle.width = 120;

        powerUps = [];

        createBricks();

        resetBall();
    });


    // ==========================================
    // START GAME
    // ==========================================

    createBricks();

    resetBall();

    gameLoop();