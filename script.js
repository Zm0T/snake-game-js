document.getElementById('startGame').addEventListener('click', startGame);
document.getElementById('settingsButton').addEventListener('click', showSettings);
document.getElementById('saveSettings').addEventListener('click', saveSettings);
document.getElementById('restartGame').addEventListener('click', startGame);
document.getElementById('goToMenu').addEventListener('click', goToMenu);
document.getElementById('snakeColor').addEventListener('change', updateColorPreview);

let snakeColor = '#0000FF'; // Blue by default
let boardSize = 16;
let initialApples = 1;
const cellSize = 16; // Размер одной клетки на поле
let snake;
let apples = [];
let dx;
let dy;
let changingDirection;
let score;
let gameCanvas;
let ctx;

function showSettings() {
    document.getElementById('menu').style.display = 'none';
    document.getElementById('settings').style.display = 'block';
    updateColorPreview();
}

function saveSettings() {
    snakeColor = document.getElementById('snakeColor').value;
    boardSize = parseInt(document.getElementById('boardSize').value);
    initialApples = parseInt(document.getElementById('initialApples').value);
    document.getElementById('settings').style.display = 'none';
    document.getElementById('menu').style.display = 'block';
}

function startGame() {
    document.getElementById('menu').style.display = 'none';
    document.getElementById('gameOver').style.display = 'none';
    document.getElementById('scoreBoard').style.display = 'block';
    gameCanvas = document.getElementById('gameCanvas');
    gameCanvas.width = boardSize * cellSize;
    gameCanvas.height = boardSize * cellSize;
    gameCanvas.style.display = 'block';
    ctx = gameCanvas.getContext('2d');
    resetGame();
    document.addEventListener('keydown', changeDirection);
    main();
}

function resetGame() {
    snake = [
        { x: cellSize * 5, y: cellSize * 5 },
        { x: cellSize * 4, y: cellSize * 5 },
        { x: cellSize * 3, y: cellSize * 5 },
        { x: cellSize * 2, y: cellSize * 5 }
    ];
    dx = cellSize;
    dy = 0;
    changingDirection = false;
    score = 0;
    apples = [];
    updateScore();
    createApples(initialApples);
}

function main() {
    if (hasGameEnded()) return;
    changingDirection = false;
    setTimeout(function onTick() {
        clearCanvas();
        drawApples();
        advanceSnake();
        drawSnake();
        main();
    }, 100);
}

function clearCanvas() {
    ctx.fillStyle = '#98FB98'; // Светло-зеленый фон
    ctx.strokeStyle = 'black';
    ctx.fillRect(0, 0, gameCanvas.width, gameCanvas.height);
    ctx.strokeRect(0, 0, gameCanvas.width, gameCanvas.height);
}

function drawSnake() {
    snake.forEach((part, index) => drawSnakePart(part, index === 0));
}

function drawSnakePart(snakePart, isHead) {
    ctx.fillStyle = isHead ? adjustColorBrightness(snakeColor, -50) : snakeColor; // Голову змеи выделяем светлым или темным оттенком
    ctx.strokeStyle = 'black';
    ctx.fillRect(snakePart.x, snakePart.y, cellSize, cellSize);
    ctx.strokeRect(snakePart.x, snakePart.y, cellSize, cellSize);
}

function advanceSnake() {
    const head = { x: snake[0].x + dx, y: snake[0].y + dy };
    snake.unshift(head);
    const hasEatenApple = apples.some((apple, index) => {
        if (snake[0].x === apple.x && snake[0].y === apple.y) {
            apples.splice(index, 1);
            score += 1;
            updateScore();
            createApples(1); // Добавляем новое яблоко на поле
            return true;
        }
        return false;
    });
    if (!hasEatenApple) {
        snake.pop();
    }
}

function hasGameEnded() {
    for (let i = 4; i < snake.length; i++) {
        if (snake[i].x === snake[0].x && snake[i].y === snake[0].y) return showGameOver(false);
    }
    const hitLeftWall = snake[0].x < 0;
    const hitRightWall = snake[0].x >= gameCanvas.width;
    const hitTopWall = snake[0].y < 0;
    const hitBottomWall = snake[0].y >= gameCanvas.height;
    if (hitLeftWall || hitRightWall || hitTopWall || hitBottomWall) {
        showGameOver(false);
        return true;
    }
    if (score >= boardSize * boardSize) {
        showGameOver(true);
        return true;
    }
    return false;
}

function showGameOver(gameCompleted) {
    document.getElementById('gameCanvas').style.display = 'none';
    document.getElementById('gameOver').style.display = 'block';
    document.getElementById('scoreBoard').style.display = 'none';
    document.getElementById('gameOverMessage').innerText = gameCompleted ? 'Congratulations! You Completed the Game!' : 'Game Over';
    document.getElementById('finalScore').innerText = `Final Score: ${score}`;
}

function goToMenu() {
    document.getElementById('gameOver').style.display = 'none';
    document.getElementById('menu').style.display = 'block';
    document.getElementById('scoreBoard').style.display = 'none';
    document.getElementById('gameCanvas').style.display = 'none';
}

function createApples(num) {
    for (let i = 0; i < num; i++) {
        let apple;
        do {
            apple = {
                x: Math.floor(Math.random() * (gameCanvas.width / cellSize)) * cellSize,
                y: Math.floor(Math.random() * (gameCanvas.height / cellSize)) * cellSize
            };
        } while (isAppleOnSnake(apple));
        apples.push(apple);
    }
}

function isAppleOnSnake(apple) {
    return snake.some(part => part.x === apple.x && part.y === apple.y);
}

function drawApples() {
    apples.forEach(apple => {
        ctx.fillStyle = 'red';
        ctx.strokeStyle = 'black';
        ctx.fillRect(apple.x, apple.y, cellSize, cellSize);
        ctx.strokeRect(apple.x, apple.y, cellSize, cellSize);
    });
}

function changeDirection(event) {
    const LEFT_KEY = 37;
    const RIGHT_KEY = 39;
    const UP_KEY = 38;
    const DOWN_KEY = 40;
    const keyPressed = event.keyCode;
    const goingUp = dy === -cellSize;
    const goingDown = dy === cellSize;
    const goingRight = dx === cellSize;
    const goingLeft = dx === -cellSize;

    if (changingDirection) return;
    changingDirection = true;

    if (keyPressed === LEFT_KEY && !goingRight) {
        dx = -cellSize;
        dy = 0;
    }
    if (keyPressed === RIGHT_KEY && !goingLeft) {
        dx = cellSize;
        dy = 0;
    }
    if (keyPressed === UP_KEY && !goingDown) {
        dx = 0;
        dy = -cellSize;
    }
    if (keyPressed === DOWN_KEY && !goingUp) {
        dx = 0;
        dy = cellSize;
    }
}

function updateScore() {
    document.getElementById('scoreDisplay').innerText = `Score: ${score}`;
}

function updateColorPreview() {
    const color = document.getElementById('snakeColor').value;
    document.getElementById('colorPreview').style.backgroundColor = color;
}

function adjustColorBrightness(color, amount) {
    let usePound = false;

    if (color[0] === "#") {
        color = color.slice(1);
        usePound = true;
    }

    let num = parseInt(color, 16);

    let r = (num >> 16) + amount;
    if (r > 255) r = 255;
    else if (r < 0) r = 0;

    let b = ((num >> 8) & 0x00FF) + amount;
    if (b > 255) b = 255;
    else if (b < 0) b = 0;

    let g = (num & 0x0000FF) + amount;
    if (g > 255) g = 255;
    else if (g < 0) g = 0;

    return (usePound ? "#" : "") + (g | (b << 8) | (r << 16)).toString(16);
}
