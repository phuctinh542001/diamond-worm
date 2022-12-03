import levels from './levels.js'
const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

// Board game
let board;
const musicEL = $('.music');
const toggleGame = $('.toggle__game');

// Audio in game
const moveAudio = new Audio('./assets/music/move.mp3');
const eatAudio = new Audio('./assets/music/eat.mp3');
const gameOverAudio = new Audio('./assets/music/gameover.mp3');
const musicAudio = new Audio('./assets/music/music.mp3');

const mapSize = 12;
let gameStatus = 0;

let level;
let snakeHead;
let snakeTail;
let snakeDirt;
let wall;
let diamond;
let gate;

let currentLevel = Number(JSON.parse(localStorage.getItem('currentLevel')));

// ====================
// Function
// ====================

// Hàm load level game
function loadGame(levelNum) {
    currentLevel = levelNum;
    localStorage.setItem('currentLevel', JSON.stringify(levelNum));

    level = structuredClone(levels[levelNum - 1]);
    snakeHead = level.snakeHead;
    snakeTail = level.snakeTail;
    snakeDirt = [1, 0];
    wall = level.wall;
    diamond = level.diamond;
    gate = level.gate;  

    if ($('.levels')) {
        $('.levels').remove();
    }

    const boardTemp = document.createElement('div');
    boardTemp.id = 'board';
    
    $('#game').appendChild(boardTemp);
    board = $('#board');
    
    renderGame();
    
    document.addEventListener('keydown', e => {
        switch (e.code) {
            case 'ArrowUp': 
                moveAudio.play();
                checkInput([0, -1]);
                break;
            case 'ArrowDown':
                moveAudio.play();
                checkInput([0, 1]);
                break;
            case 'ArrowLeft':
                moveAudio.play();
                checkInput([-1, 0]);
                break;
            case 'ArrowRight':
                moveAudio.play();
                checkInput([1, 0]);
                break;
            default:
                break;
        }
    });

    console.log(typeof currentLevel);
    console.log(currentLevel);
}

// Hàm kiểm tra di chuyển của con rắn
function checkInput(direction) {
    if (checkHitTail(direction)) {
        return
    };

    if (checkHitWall(direction)) {
        return
    };

    if (compareBlock(snakeDirt, [0, -1])) {
        if (compareBlock(direction, [0, 1])) {
            return;
        }
    }

    if (compareBlock(snakeDirt, [0, 1])) {
        if (compareBlock(direction, [0, -1])) {
            return;
        }
    }

    if (compareBlock(snakeDirt, [1, 0])) {
        if (compareBlock(direction, [-1, 0])) {
            return;
        }
    }

    if (compareBlock(snakeDirt, [-1, 0])) {
        if (compareBlock(direction, [1, 0])) {
            return;
        }
    }

    gameHandle(direction);
}

// Game play handle
function gameHandle(direction) {
    // Win the game
    if (
        (snakeHead[0] + direction[0]) === gate[0] &&
        (snakeHead[1] + direction[1]) === gate[1]
    ) {
        gameWin();
    } else {
        // Check Diamond
        if (
            (snakeHead[0] + direction[0]) === diamond[0] &&
            (snakeHead[1] + direction[1]) === diamond[1]
        ) {
            eatDiamond();
        } else {
            updateSnake(direction);
        }
    
        // Check game Over
        let downDistance = checkGravity();
    
        if (downDistance !== null) {
            if (downDistance !== 0) {
                downSnake(downDistance);
            } 
            if (!checkNextMove()) {
                console.log('over1');
                gameStatus = 2;
            };
        } else {
            console.log('over3');
            gameStatus = 1;
        }
    
        if (gameStatus !== 0) {
            gameOver();
        } else {
            snakeDirt = [...direction];
    
            renderGame();
        }

    }
    
}

// Hàm ăn kim cương
function eatDiamond() {
    snakeTail.unshift([...snakeHead]);
    snakeHead = [...diamond];
    diamond = [];
}

// Hàm cập nhật lại vị trí con rắn
function updateSnake(direction) {
    // Update Snake
    for (let i = snakeTail.length - 1; i > 0; i--) {
        snakeTail[i] = [...snakeTail[i - 1]];
    }

    snakeTail[0] = [...snakeHead];

    snakeHead[0] += direction[0];
    snakeHead[1] += direction[1];
}

// Hàm kiểm tra con rắn rơi xuống
function checkGravity() {
    for (let i = 0; true; i++) {
        let over = false;
        for (let j = 0; j < snakeTail.length; j++) {
            for (let k = 0; k < wall.length; k++) {
                if (wall[k][0] !== snakeTail[j][0]) {
                    continue;
                } else {
                    if (wall[k][1] === snakeTail[j][1] + i + 1) {
                        return i;
                    }
                }
            }

            if (diamond[0] === snakeTail[j][0] && 
                (diamond[1] === snakeTail[j][1] + i + 1)
            ) {
                return i;
            }

            if (snakeTail[j][1] + i + 1 === mapSize) {
                over = true;
            }
        }

        for (let k = 0; k < wall.length; k++) {
            if (wall[k][0] !== snakeHead[0]) {
                continue;
            } else {
                if (wall[k][1] === snakeHead[1] + i + 1) {
                    return i;
                }
            }
        }

        if (
            diamond[0] === snakeHead[0] && 
            diamond[1] === snakeHead[1] + i + 1
        ) {
                return i;
        }
       
        if (over) {
            return null;
        }
    }
}

// Hàm render khung game
function renderGame() {
    $('#level').innerHTML = `YOUR LEVEL: ${currentLevel}`
    board.innerHTML = '';

    // Render wall
    for (let i = 0; i < wall.length; i++) {
        createBlock(wall[i], 'wall');
    }
    // Render gate
    createBlock(level.gate, 'gate');

    // Render head
    createBlock(snakeHead, 'head')
    // Render snake 
    for (let i = 0; i < snakeTail.length; i++) {
        createBlock(snakeTail[i], 'tail');
    }
    

    createBlock(diamond, 'diamond');
}

// Hàm cho con rắn rơi xuống
function downSnake(downDistance) {
    for (let i = 0; i < snakeTail.length; i++) {
        snakeTail[i][1] = snakeTail[i][1] + downDistance;
    }
    snakeHead[1] = snakeHead[1] + downDistance; 
}

// Hàm kiểm tra di chuyển tiếp theo
function checkNextMove() {
    let up = true;
    let down = true;
    let left = true;
    let right = true;
    if (checkHitTail([0, 1]) || checkHitWall([0, 1])) {
        down = false;
    }
    if (checkHitTail([0, -1]) || checkHitWall([0, -1])) {
        up = false;
    }
    if (checkHitTail([1, 0]) || checkHitWall([1, 0])) {
        right = false;
    }
    if (checkHitTail([-1, 0]) || checkHitWall([-1, 0])) {
        left = false;
    }

    if (!up && !down && !left && !right) {
        return false;
    }

    return true;
}

// Hàm kiểm tra cắn phải tường
function checkHitWall(direction) {
    let headTemp = [];
    headTemp[0] = snakeHead[0] + direction[0];
    headTemp[1] = snakeHead[1] + direction[1];

    for (let i = 0; i < snakeTail.length; i++) {
        if(compareBlock(headTemp, snakeTail[i])) {
            return true;
        }
    }

    return false;
}

// Hàm kiểm tra cắn phải đuôi
function checkHitTail(direction) {
    let headTemp = [];
    headTemp[0] = snakeHead[0] + direction[0];
    headTemp[1] = snakeHead[1] + direction[1];

    for (let i = 0; i < wall.length; i++) {
        if(compareBlock(headTemp, wall[i])) {
            return true;
        }
    }

    return false;
}

// Hàm qua vượt ải thành công
function gameWin() {
    board.innerHTML = '';

    const winMessage = document.createElement('div');
    winMessage.classList.add('message');
    winMessage.innerHTML = 'Chúc mừng! <br> Bạn đã vượt qua ải !';

    board.appendChild(winMessage);
}

// Game over handle
function gameOver() {
    gameOverAudio.play();
    board.innerHTML = '';

    const winMessage = document.createElement('div');
    winMessage.classList.add('message');
    if (gameStatus === 1) {
        winMessage.innerHTML = 'NON! Bạn bị ngã chết';
    } else {
        winMessage.innerHTML = 'NON! Bạn không thể <br> di chuyển nữa';
    }

    gameStatus = 0;
    board.appendChild(winMessage); 
}

// Create block board game
function createBlock(direction, property) {
    if (direction) {
        const block = document.createElement('div');
        block.classList.add(property);
        block.style.gridColumnStart = direction[0];
        block.style.gridRowStart = direction[1];
    
        board.appendChild(block);
    }
}

// Compare position     
function compareBlock(pos1, pos2) {
    if (pos1[0] === pos2[0] && pos1[1] === pos2[1])
        return true;
    return false;
}

// ====================
// Events
// ====================

// Sự kiện load trang mở đầu 
window.addEventListener('load', function() {
    $('#level').innerHTML = `YOUR LEVEL: ${currentLevel}`
    const gameArea = $('#game');
    const levelsGame = $('.levels')

    for (let i = 0; i < 9; i++) {
        const levelGame = document.createElement('button');
        levelGame.classList.add('level');
        levelGame.dataset.index = i + 1;

        levelGame.innerHTML = `Level ${i + 1}`;

        levelsGame.appendChild(levelGame);
    }
})

// Sự kiện tải màn chơi
$('#game').addEventListener('click', function(e) {
    if (e.target.closest('.level')) {
        const levelNum = Number(e.target.closest('.level').dataset.index);
    
        loadGame(levelNum);
    }
})

// Sự kiện nút bật/tắt nhạc
$('.music').addEventListener('click', function() {
    if (musicAudio.paused) {
        musicEL.innerHTML = '<i class="fa-solid fa-volume-high"></i>';
        musicAudio.play();
    } else {
        musicEL.innerHTML = '<i class="fa-solid fa-volume-xmark"></i>';
        musicAudio.pause();
    }
    musicEL.blur();
})

// Sự kiện nút tải lại trò chơi
$('.reload').addEventListener('click', function() {
    level = structuredClone(levels[currentLevel - 1]);
    snakeHead = level.snakeHead;
    snakeTail = level.snakeTail;
    snakeDirt = [1, 0];
    wall = level.wall;
    diamond = level.diamond;
    gate = level.gate;

    if ($('.levels')) {
        $('.levels').remove();
    }
    
    if (board) {
        board.remove();
    }

    const boardTemp = document.createElement('div');
    boardTemp.id = 'board';
    
    $('#game').appendChild(boardTemp);
    board = $('#board');

    renderGame();

})

$('.next').addEventListener('click', function() {
    level = structuredClone(levels[currentLevel]);
    snakeHead = level.snakeHead;
    snakeTail = level.snakeTail;
    snakeDirt = [1, 0];
    wall = level.wall;
    diamond = level.diamond;
    gate = level.gate;

    if ($('.levels')) {
        $('.levels').remove();
    }
    
    if (board) {
        board.remove();
    }

    const boardTemp = document.createElement('div');
    boardTemp.id = 'board';
    
    $('#game').appendChild(boardTemp);
    board = $('#board');

    currentLevel++;

    renderGame();
})

// Sự kiện nút menu
$('.menu').addEventListener('click', function() {
    location.reload();
})



