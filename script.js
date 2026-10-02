const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const size = 3;
const tileSize = canvas.width / size;

let puzzle = [];
let moves = 0;
let level = 1;
let score = 0;
let playerName = "";
let seconds = 0;
let timerInterval = null;
let gameRunning = false;


// ===============================
// START GAME
// ===============================

function startGame() {

    playerName = document.getElementById("playerName").value.trim();

    if (playerName === "") {
        playerName = "Player";
    }

    document.getElementById("displayPlayer").textContent = playerName;

    level = 1;
    score = 0;

    document.getElementById("homeScreen").classList.add("hidden");
    document.getElementById("leaderboardScreen").classList.add("hidden");
    document.getElementById("gameScreen").classList.remove("hidden");

    startLevel();
}


// ===============================
// START LEVEL
// ===============================

function startLevel() {

    moves = 0;
    seconds = 0;
    gameRunning = true;

    document.getElementById("level").textContent = level;
    document.getElementById("moves").textContent = moves;
    document.getElementById("timer").textContent = "00:00";
    document.getElementById("message").textContent = "";

    createPuzzle();

    startTimer();
}


// ===============================
// CREATE PUZZLE
// ===============================

function createPuzzle() {

    puzzle = [];

    for (let i = 1; i < 9; i++) {
        puzzle.push(i);
    }

    puzzle.push(0);

    shufflePuzzle();
}


// ===============================
// SHUFFLE
// ===============================

function shufflePuzzle() {

    do {

        for (let i = puzzle.length - 1; i > 0; i--) {

            const randomIndex = Math.floor(Math.random() * (i + 1));

            [puzzle[i], puzzle[randomIndex]] =
            [puzzle[randomIndex], puzzle[i]];
        }

    } while (!isSolvable() || isSolved());

    drawPuzzle();
}


// ===============================
// CHECK SOLVABLE
// ===============================

function isSolvable() {

    let inversions = 0;

    for (let i = 0; i < puzzle.length; i++) {

        if (puzzle[i] === 0) {
            continue;
        }

        for (let j = i + 1; j < puzzle.length; j++) {

            if (puzzle[j] !== 0 && puzzle[i] > puzzle[j]) {
                inversions++;
            }
        }
    }

    return inversions % 2 === 0;
}


// ===============================
// DRAW PUZZLE ON CANVAS
// ===============================

function drawPuzzle() {

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < puzzle.length; i++) {

        const value = puzzle[i];

        const row = Math.floor(i / size);
        const col = i % size;

        const x = col * tileSize;
        const y = row * tileSize;

        if (value === 0) {
            ctx.fillStyle = "#eeeeee";
            ctx.fillRect(x, y, tileSize, tileSize);
            continue;
        }

        ctx.fillStyle = "#3498db";
        ctx.fillRect(
            x + 5,
            y + 5,
            tileSize - 10,
            tileSize - 10
        );

        ctx.fillStyle = "white";
        ctx.font = "bold 40px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        ctx.fillText(
            value,
            x + tileSize / 2,
            y + tileSize / 2
        );
    }
}


// ===============================
// CLICK TILE
// ===============================

canvas.addEventListener("click", function(event) {

    if (!gameRunning) {
        return;
    }

    const rect = canvas.getBoundingClientRect();

    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const mouseX = (event.clientX - rect.left) * scaleX;
    const mouseY = (event.clientY - rect.top) * scaleY;

    const col = Math.floor(mouseX / tileSize);
    const row = Math.floor(mouseY / tileSize);

    const clickedIndex = row * size + col;

    moveTile(clickedIndex);
});


// ===============================
// MOVE TILE
// ===============================

function moveTile(index) {

    const emptyIndex = puzzle.indexOf(0);

    const clickedRow = Math.floor(index / size);
    const clickedCol = index % size;

    const emptyRow = Math.floor(emptyIndex / size);
    const emptyCol = emptyIndex % size;

    const isAdjacent =
        Math.abs(clickedRow - emptyRow) +
        Math.abs(clickedCol - emptyCol) === 1;

    if (!isAdjacent) {
        return;
    }

    [puzzle[index], puzzle[emptyIndex]] =
    [puzzle[emptyIndex], puzzle[index]];

    moves++;

    document.getElementById("moves").textContent = moves;

    drawPuzzle();

    if (isSolved()) {
        levelCompleted();
    }
}


// ===============================
// CHECK WIN
// ===============================

function isSolved() {

    for (let i = 0; i < 8; i++) {

        if (puzzle[i] !== i + 1) {
            return false;
        }
    }

    return puzzle[8] === 0;
}


// ===============================
// LEVEL COMPLETED
// ===============================

function levelCompleted() {

    gameRunning = false;

    clearInterval(timerInterval);

    const levelScore =
        Math.max(1000 - (moves * 10) - (seconds * 5), 100);

    score += levelScore;

    document.getElementById("score").textContent = score;

    document.getElementById("message").textContent =
        `🎉 Level ${level} Completed! +${levelScore} points`;

    setTimeout(() => {

        if (level < 3) {

            level++;

            document.getElementById("message").textContent =
                `🔓 Level ${level} Unlocked!`;

            startLevel();

        } else {

            finishGame();
        }

    }, 1500);
}


// ===============================
// FINISH GAME
// ===============================

function finishGame() {

    saveScore();

    setTimeout(() => {

        alert(
            `🎉 Congratulations ${playerName}!\n\n` +
            `Final Score: ${score}`
        );

        showLeaderboard();

    }, 500);
}


// ===============================
// TIMER
// ===============================

function startTimer() {

    clearInterval(timerInterval);

    timerInterval = setInterval(() => {

        if (!gameRunning) {
            return;
        }

        seconds++;

        const minutes =
            Math.floor(seconds / 60)
                .toString()
                .padStart(2, "0");

        const secs =
            (seconds % 60)
                .toString()
                .padStart(2, "0");

        document.getElementById("timer").textContent =
            `${minutes}:${secs}`;

    }, 1000);
}


// ===============================
// RESTART LEVEL
// ===============================

function restartLevel() {

    clearInterval(timerInterval);

    startLevel();
}


// ===============================
// SAVE SCORE
// ===============================

function saveScore() {

    let leaderboard =
        JSON.parse(localStorage.getItem("puzzleLeaderboard")) || [];

    leaderboard.push({
        name: playerName,
        level: level,
        score: score
    });

    leaderboard.sort((a, b) => b.score - a.score);

    leaderboard = leaderboard.slice(0, 10);

    localStorage.setItem(
        "puzzleLeaderboard",
        JSON.stringify(leaderboard)
    );
}


// ===============================
// SHOW LEADERBOARD
// ===============================

function showLeaderboard() {

    clearInterval(timerInterval);

    document.getElementById("homeScreen").classList.add("hidden");
    document.getElementById("gameScreen").classList.add("hidden");
    document.getElementById("leaderboardScreen").classList.remove("hidden");

    displayLeaderboard();
}


// ===============================
// DISPLAY LEADERBOARD
// ===============================

function displayLeaderboard() {

    const leaderboardBody =
        document.getElementById("leaderboardBody");

    leaderboardBody.innerHTML = "";

    const leaderboard =
        JSON.parse(localStorage.getItem("puzzleLeaderboard")) || [];

    if (leaderboard.length === 0) {

        leaderboardBody.innerHTML =
            `<tr>
                <td colspan="4">No scores yet</td>
            </tr>`;

        return;
    }

    leaderboard.forEach((player, index) => {

        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${player.name}</td>
            <td>${player.level}</td>
            <td>${player.score}</td>
        `;

        leaderboardBody.appendChild(row);
    });
}


// ===============================
// CLEAR LEADERBOARD
// ===============================

function clearLeaderboard() {

    if (confirm("Clear all leaderboard scores?")) {

        localStorage.removeItem("puzzleLeaderboard");

        displayLeaderboard();
    }
}


// ===============================
// GO HOME
// ===============================

function goHome() {

    clearInterval(timerInterval);

    gameRunning = false;

    document.getElementById("gameScreen").classList.add("hidden");
    document.getElementById("leaderboardScreen").classList.add("hidden");
    document.getElementById("homeScreen").classList.remove("hidden");
}