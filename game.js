class DiamondQuest {
    constructor() {
        // Constants
        this.TILE_SIZE = 32;
        this.GRID_WIDTH = 20;
        this.GRID_HEIGHT = 15;
        this.TILE_TYPES = {
            EMPTY: 0,
            WALL: 1,
            DIRT: 2,
            BOULDER: 3,
            DIAMOND: 4,
            PLAYER: 5,
            EXIT: 6,
        };
        this.tileColors = {
            [this.TILE_TYPES.EMPTY]: "bg-gray-900",
            [this.TILE_TYPES.WALL]: "bg-gray-700",
            [this.TILE_TYPES.DIRT]: "bg-yellow-800",
            [this.TILE_TYPES.BOULDER]: "bg-gray-500",
            [this.TILE_TYPES.DIAMOND]: "bg-blue-400",
            [this.TILE_TYPES.PLAYER]: "bg-green-500",
            [this.TILE_TYPES.EXIT]: "bg-purple-600",
        };

        // Game state
        this.grid = [];
        this.playerPos = { x: 0, y: 0 };
        this.exitPos = { x: 0, y: 0 };
        this.diamondsCollected = 0;
        this.diamondsRequired = 10;
        this.timeRemaining = 60;
        this.gameRunning = false;
        this.exitRevealed = false;
        this.timerInterval = null;
        this.crushTimer = null;
        this.playerDead = false;

        // DOM elements
        this.gameContainer = document.getElementById("game-container");
        this.diamondsCollectedEl = document.getElementById("diamonds-collected");
        this.diamondsRequiredEl = document.getElementById("diamonds-required");
        this.timeRemainingEl = document.getElementById("time-remaining");
        this.gameMessageEl = document.getElementById("game-message");
        this.restartButton = document.getElementById("restart-button");

        // Initialize controls and event listeners
        this.initControls();
    }

    initControls() {
        // Keyboard controls
        window.addEventListener("keydown", (event) => {
            if (!this.gameRunning) return;
            switch (event.key) {
                case "ArrowUp":
                    this.movePlayer(0, -1);
                    break;
                case "ArrowDown":
                    this.movePlayer(0, 1);
                    break;
                case "ArrowLeft":
                    this.movePlayer(-1, 0);
                    break;
                case "ArrowRight":
                    this.movePlayer(1, 0);
                    break;
            }
        });

        // Desktop buttons
        document.getElementById("btn-up").addEventListener("click", () => this.movePlayer(0, -1));
        document.getElementById("btn-down").addEventListener("click", () => this.movePlayer(0, 1));
        document.getElementById("btn-left").addEventListener("click", () => this.movePlayer(-1, 0));
        document.getElementById("btn-right").addEventListener("click", () => this.movePlayer(1, 0));

        // Mobile buttons
        document.getElementById("btn-up-mobile").addEventListener("click", () => this.movePlayer(0, -1));
        document.getElementById("btn-down-mobile").addEventListener("click", () => this.movePlayer(0, 1));
        document.getElementById("btn-left-mobile").addEventListener("click", () => this.movePlayer(-1, 0));
        document.getElementById("btn-right-mobile").addEventListener("click", () => this.movePlayer(1, 0));

        // Touch swipe controls
        let touchStartX = 0, touchStartY = 0;
        this.gameContainer.addEventListener("touchstart", (e) => {
            touchStartX = e.changedTouches[0].screenX;
            touchStartY = e.changedTouches[0].screenY;
        });
        this.gameContainer.addEventListener("touchend", (e) => {
            const touchEndX = e.changedTouches[0].screenX;
            const touchEndY = e.changedTouches[0].screenY;
            const diffX = touchEndX - touchStartX;
            const diffY = touchEndY - touchStartY;
            const threshold = 30;
            if (Math.abs(diffX) > Math.abs(diffY)) {
                if (diffX > threshold) this.movePlayer(1, 0);
                else if (diffX < -threshold) this.movePlayer(-1, 0);
            } else {
                if (diffY > threshold) this.movePlayer(0, 1);
                else if (diffY < -threshold) this.movePlayer(0, -1);
            }
        });

        // Restart game button
        this.restartButton.addEventListener("click", () => this.initGame());
    }

    startCrushTimer() {
        if (!this.crushTimer) {
            this.crushTimer = setTimeout(() => {
                this.endGame(false);
            }, 500);
        }
    }

    cancelCrushTimer() {
        if (this.crushTimer) {
            clearTimeout(this.crushTimer);
            this.crushTimer = null;
        }
    }

    initGame() {
        // Reset state and update UI
        this.grid = [];
        this.diamondsCollected = 0;
        this.timeRemaining = 60;
        this.exitRevealed = false;
        this.playerDead = false;
        this.cancelCrushTimer();
        this.updateUI();

        // Generate level and render
        this.generateLevel();
        this.renderGame();

        // Start timer
        this.gameRunning = true;
        if (this.timerInterval) clearInterval(this.timerInterval);
        this.timerInterval = setInterval(() => {
            if (this.gameRunning) {
                this.timeRemaining--;
                this.timeRemainingEl.textContent = this.timeRemaining;
                if (this.timeRemaining <= 0) this.endGame(false);
            }
        }, 1000);

        // Start physics updates
        this.updatePhysics();
    }

    updateUI() {
        this.diamondsCollectedEl.textContent = this.diamondsCollected;
        this.diamondsRequiredEl.textContent = this.diamondsRequired;
        this.timeRemainingEl.textContent = this.timeRemaining;
        this.gameMessageEl.classList.add("hidden");
        this.restartButton.classList.add("hidden");
    }

    generateLevel() {
        // Build the grid with borders and random elements
        for (let y = 0; y < this.GRID_HEIGHT; y++) {
            const row = [];
            for (let x = 0; x < this.GRID_WIDTH; x++) {
                if (x === 0 || y === 0 || x === this.GRID_WIDTH - 1 || y === this.GRID_HEIGHT - 1) {
                    row.push(this.TILE_TYPES.WALL);
                } else {
                    const rand = Math.random();
                    if (rand < 0.45) row.push(this.TILE_TYPES.DIRT);
                    else if (rand < 0.6) row.push(this.TILE_TYPES.BOULDER);
                    else if (rand < 0.7) row.push(this.TILE_TYPES.DIAMOND);
                    else row.push(this.TILE_TYPES.EMPTY);
                }
            }
            this.grid.push(row);
        }

        // Place the player safely and clear nearby boulders
        let placed = false;
        while (!placed) {
            const x = Math.floor(Math.random() * (this.GRID_WIDTH - 4)) + 2;
            const y = Math.floor(Math.random() * (this.GRID_HEIGHT - 4)) + 2;
            if (this.grid[y][x] !== this.TILE_TYPES.BOULDER) {
                this.grid[y][x] = this.TILE_TYPES.PLAYER;
                this.playerPos = { x, y };
                for (let dy = -1; dy <= 1; dy++) {
                    for (let dx = -1; dx <= 1; dx++) {
                        if (dx === 0 && dy === 0) continue;
                        const nx = x + dx;
                        const ny = y + dy;
                        if (this.grid[ny][nx] === this.TILE_TYPES.BOULDER) {
                            this.grid[ny][nx] = this.TILE_TYPES.DIRT;
                        }
                    }
                }
                placed = true;
            }
        }

        // Place the exit (hidden until enough diamonds are collected)
        placed = false;
        while (!placed) {
            const x = Math.floor(Math.random() * (this.GRID_WIDTH - 4)) + 2;
            const y = Math.floor(Math.random() * (this.GRID_HEIGHT - 4)) + 2;
            const distToPlayer = Math.abs(x - this.playerPos.x) + Math.abs(y - this.playerPos.y);
            if (distToPlayer > 10 && this.grid[y][x] !== this.TILE_TYPES.BOULDER) {
                this.exitPos = { x, y };
                placed = true;
            }
        }

        // Calculate diamonds required (at least 10 or 80% of available)
        let diamondCount = 0;
        for (let y = 0; y < this.GRID_HEIGHT; y++) {
            for (let x = 0; x < this.GRID_WIDTH; x++) {
                if (this.grid[y][x] === this.TILE_TYPES.DIAMOND) diamondCount++;
            }
        }
        this.diamondsRequired = Math.max(10, Math.floor(diamondCount * 0.8));
        this.diamondsRequiredEl.textContent = this.diamondsRequired;
    }

    renderGame() {
        // Clear and set dimensions of the game container
        this.gameContainer.innerHTML = "";
        this.gameContainer.style.width = `${this.GRID_WIDTH * this.TILE_SIZE}px`;
        this.gameContainer.style.height = `${this.GRID_HEIGHT * this.TILE_SIZE}px`;

        // Render each tile based on its type
        for (let y = 0; y < this.GRID_HEIGHT; y++) {
            for (let x = 0; x < this.GRID_WIDTH; x++) {
                const tileType = this.grid[y][x];
                const tile = document.createElement("div");
                if (tileType === this.TILE_TYPES.PLAYER) {
                    if (this.playerDead) {
                        tile.className = `absolute bg-red-500 border border-gray-900`;
                        tile.innerHTML = `<div class="flex items-center justify-center h-full text-xl">😵‍💫</div>`;
                    } else {
                        tile.className = `absolute ${this.tileColors[tileType]} border border-gray-900`;
                        tile.innerHTML = `<div class="flex items-center justify-center h-full text-xl">😎</div>`;
                    }
                } else if (tileType === this.TILE_TYPES.DIAMOND) {
                    tile.className = `absolute ${this.tileColors[tileType]} border border-gray-900`;
                    tile.innerHTML = `<div class="flex items-center justify-center h-full text-xl">💎</div>`;
                } else if (tileType === this.TILE_TYPES.BOULDER) {
                    tile.className = `absolute ${this.tileColors[tileType]} border border-gray-900`;
                    tile.innerHTML = `<div class="flex items-center justify-center h-full text-xl">🪨</div>`;
                } else if (tileType === this.TILE_TYPES.EXIT) {
                    tile.className = `absolute ${this.tileColors[tileType]} border border-gray-900`;
                    tile.innerHTML = `<div class="flex items-center justify-center h-full text-xl">🚪</div>`;
                } else {
                    tile.className = `absolute ${this.tileColors[tileType]} border border-gray-900`;
                }
                tile.style.width = `${this.TILE_SIZE}px`;
                tile.style.height = `${this.TILE_SIZE}px`;
                tile.style.left = `${x * this.TILE_SIZE}px`;
                tile.style.top = `${y * this.TILE_SIZE}px`;
                this.gameContainer.appendChild(tile);
            }
        }
    }

    movePlayer(dx, dy) {
        if (!this.gameRunning) return;

        // If moving down while under threat, attempt a "dash" move (two tiles) if possible.
        if (dy === 1 && this.crushTimer) {
            const secondStepY = this.playerPos.y + 2;
            if (secondStepY < this.GRID_HEIGHT) {
                const intermediateTile = this.grid[this.playerPos.y + 1][this.playerPos.x];
                const destinationTile = this.grid[secondStepY][this.playerPos.x];
                const canIntermediate = intermediateTile !== this.TILE_TYPES.WALL &&
                    intermediateTile !== this.TILE_TYPES.BOULDER;
                const canDestination = destinationTile !== this.TILE_TYPES.WALL &&
                    destinationTile !== this.TILE_TYPES.BOULDER;
                if (canIntermediate && canDestination) {
                    if (intermediateTile === this.TILE_TYPES.DIAMOND) {
                        this.collectDiamond();
                    }
                    if (destinationTile === this.TILE_TYPES.DIAMOND) {
                        this.collectDiamond();
                    }
                    this.grid[this.playerPos.y][this.playerPos.x] = this.TILE_TYPES.EMPTY;
                    this.playerPos.y += 2;
                    this.grid[this.playerPos.y][this.playerPos.x] = this.TILE_TYPES.PLAYER;
                    this.cancelCrushTimer();
                    this.renderGame();
                    this.updatePhysics();
                    return;
                }
            }
        }

        // Standard move
        const newX = this.playerPos.x + dx;
        const newY = this.playerPos.y + dy;
        if (newX < 0 || newX >= this.GRID_WIDTH || newY < 0 || newY >= this.GRID_HEIGHT) return;

        const targetTile = this.grid[newY][newX];

        if (targetTile === this.TILE_TYPES.WALL) return;
        else if (targetTile === this.TILE_TYPES.BOULDER) {
            const behindX = newX + dx;
            const behindY = newY + dy;
            if (behindX >= 0 && behindX < this.GRID_WIDTH &&
                behindY >= 0 && behindY < this.GRID_HEIGHT &&
                this.grid[behindY][behindX] === this.TILE_TYPES.EMPTY) {
                this.grid[behindY][behindX] = this.TILE_TYPES.BOULDER;
                this.grid[newY][newX] = this.TILE_TYPES.EMPTY;
            } else return;
        } else if (targetTile === this.TILE_TYPES.DIAMOND) {
            this.collectDiamond();
        } else if (targetTile === this.TILE_TYPES.EXIT &&
            this.diamondsCollected >= this.diamondsRequired) {
            this.endGame(true);
            return;
        }

        this.grid[this.playerPos.y][this.playerPos.x] = this.TILE_TYPES.EMPTY;
        this.grid[newY][newX] = this.TILE_TYPES.PLAYER;
        this.playerPos = { x: newX, y: newY };

        if (this.crushTimer &&
            (newY === 0 || this.grid[newY - 1][newX] !== this.TILE_TYPES.BOULDER)) {
            this.cancelCrushTimer();
        }

        this.renderGame();
        this.updatePhysics();
    }

    collectDiamond() {
        this.diamondsCollected++;
        this.diamondsCollectedEl.textContent = this.diamondsCollected;
        if (this.diamondsCollected >= this.diamondsRequired && !this.exitRevealed) {
            this.revealExit();
        }
    }

    updatePhysics() {
        let changes = false;

        // Process falling objects from bottom to top
        for (let y = this.GRID_HEIGHT - 2; y >= 0; y--) {
            for (let x = 0; x < this.GRID_WIDTH; x++) {
                if (this.grid[y][x] === this.TILE_TYPES.BOULDER ||
                    this.grid[y][x] === this.TILE_TYPES.DIAMOND) {
                    if (this.grid[y + 1][x] === this.TILE_TYPES.EMPTY) {
                        this.grid[y + 1][x] = this.grid[y][x];
                        this.grid[y][x] = this.TILE_TYPES.EMPTY;
                        changes = true;
                        if (y + 2 < this.GRID_HEIGHT &&
                            this.grid[y + 2][x] === this.TILE_TYPES.PLAYER) {
                            this.startCrushTimer();
                        }
                    } else if (this.grid[y + 1][x] === this.TILE_TYPES.PLAYER &&
                        this.grid[y][x] === this.TILE_TYPES.BOULDER) {
                        if (!this.crushTimer) {
                            this.startCrushTimer();
                        }
                        changes = true;
                    } else if (this.grid[y][x] === this.TILE_TYPES.BOULDER &&
                        (this.grid[y + 1][x] === this.TILE_TYPES.BOULDER ||
                            this.grid[y + 1][x] === this.TILE_TYPES.WALL)) {
                        if (x + 1 < this.GRID_WIDTH &&
                            this.grid[y][x + 1] === this.TILE_TYPES.EMPTY &&
                            this.grid[y + 1][x + 1] === this.TILE_TYPES.EMPTY) {
                            if (this.grid[y][x + 2] === this.TILE_TYPES.PLAYER ||
                                this.grid[y + 1][x + 1] === this.TILE_TYPES.PLAYER) {
                                this.startCrushTimer();
                            } else {
                                this.grid[y][x + 1] = this.TILE_TYPES.BOULDER;
                                this.grid[y][x] = this.TILE_TYPES.EMPTY;
                                changes = true;
                            }
                        } else if (x - 1 >= 0 &&
                            this.grid[y][x - 1] === this.TILE_TYPES.EMPTY &&
                            this.grid[y + 1][x - 1] === this.TILE_TYPES.EMPTY) {
                            if ((x - 2 >= 0 && this.grid[y][x - 2] === this.TILE_TYPES.PLAYER) ||
                                this.grid[y + 1][x - 1] === this.TILE_TYPES.PLAYER) {
                                this.startCrushTimer();
                            } else {
                                this.grid[y][x - 1] = this.TILE_TYPES.BOULDER;
                                this.grid[y][x] = this.TILE_TYPES.EMPTY;
                                changes = true;
                            }
                        }
                    }
                }
            }
        }

        if (changes) {
            this.renderGame();
            setTimeout(() => this.updatePhysics(), 100);
        }
    }

    revealExit() {
        this.grid[this.exitPos.y][this.exitPos.x] = this.TILE_TYPES.EXIT;
        this.exitRevealed = true;
        this.gameMessageEl.textContent = "Exit has been revealed!";
        this.gameMessageEl.classList.remove("hidden");
        setTimeout(() => this.gameMessageEl.classList.add("hidden"), 3000);
        this.renderGame();
        const exitTile = document.querySelector(
            `div[style*="left: ${this.exitPos.x * this.TILE_SIZE}px"][style*="top: ${this.exitPos.y * this.TILE_SIZE}px"]`
        );
        if (exitTile) {
            exitTile.style.animation = "exitFlash 1s infinite";
            setTimeout(() => (exitTile.style.animation = ""), 3000);
        }
    }

    triggerFestivity() {
        const container = document.createElement("div");
        container.id = "confetti-container";
        document.body.appendChild(container);
        const colors = [
            "#ff0000", "#00ff00", "#0000ff", "#ffff00",
            "#ff00ff", "#00ffff", "#ffa500", "#800080"
        ];
        const confettiCount = 100;
        for (let i = 0; i < confettiCount; i++) {
            const confetti = document.createElement("div");
            confetti.className = "confetti-piece";
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.left = Math.random() * 100 + "vw";
            confetti.style.top = "-10px";
            confetti.style.animationDelay = Math.random() * 3 + "s";
            container.appendChild(confetti);
        }
        setTimeout(() => {
            container.remove();
        }, 5000);
    }

    endGame(victory) {
        this.gameRunning = false;
        clearInterval(this.timerInterval);
        if (!victory) {
            this.playerDead = true;
        }
        this.gameMessageEl.textContent = victory ? "You Win!" : "Game Over!";
        this.gameMessageEl.classList.remove("hidden");
        this.restartButton.classList.remove("hidden");
        this.renderGame();
        if (victory) {
            this.triggerFestivity();
        }
    }
}

// Initialize game once the DOM is fully loaded
document.addEventListener("DOMContentLoaded", function () {
    if (document.getElementById("game-container") &&
        document.getElementById("diamonds-collected") &&
        document.getElementById("diamonds-required") &&
        document.getElementById("time-remaining") &&
        document.getElementById("game-message") &&
        document.getElementById("restart-button")) {
        const game = new DiamondQuest();
        game.initGame();
    } else {
        console.error("Some game elements were not found in the DOM");
    }
}); 