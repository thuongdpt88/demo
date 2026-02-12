// Sliding Puzzle Game - Main Logic
// Toàn bộ logic game: chia ảnh, render grid, xử lý click, shuffle solvable, timer, move counter

class SlidingPuzzle {
    constructor() {
        // Game state
        this.gridSize = 4;
        this.tiles = [];
        this.emptyPos = { row: 0, col: 0 };
        this.moveCount = 0;
        this.startTime = null;
        this.timerInterval = null;
        this.currentImage = null;
        this.isPlaying = false;

        // DOM elements
        this.puzzleGrid = document.getElementById('puzzleGrid');
        this.dropZone = document.getElementById('dropZone');
        this.gridSizeSelect = document.getElementById('gridSize');
        this.imageUpload = document.getElementById('imageUpload');
        this.useDefaultBtn = document.getElementById('useDefault');
        this.shuffleBtn = document.getElementById('shuffleBtn');
        this.resetBtn = document.getElementById('resetBtn');
        this.moveCountDisplay = document.getElementById('moveCount');
        this.timerDisplay = document.getElementById('timer');
        this.previewImage = document.getElementById('previewImage');
        this.completionModal = document.getElementById('completionModal');
        this.playAgainBtn = document.getElementById('playAgain');

        this.init();
    }

    init() {
        // Event listeners
        this.gridSizeSelect.addEventListener('change', () => {
            this.gridSize = parseInt(this.gridSizeSelect.value);
            if (this.currentImage) {
                this.loadImage(this.currentImage);
            }
        });

        this.imageUpload.addEventListener('change', (e) => {
            this.handleImageUpload(e.target.files[0]);
        });

        this.useDefaultBtn.addEventListener('click', () => {
            this.loadDefaultImage();
        });

        this.shuffleBtn.addEventListener('click', () => {
            this.shuffle();
        });

        this.resetBtn.addEventListener('click', () => {
            this.reset();
        });

        this.playAgainBtn.addEventListener('click', () => {
            this.hideCompletionModal();
            this.shuffle();
        });

        // Drag and drop
        this.setupDragAndDrop();

        // Load default image
        this.loadDefaultImage();
    }

    setupDragAndDrop() {
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            this.dropZone.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
            });
        });

        ['dragenter', 'dragover'].forEach(eventName => {
            this.dropZone.addEventListener(eventName, () => {
                this.dropZone.classList.add('drag-over');
            });
        });

        ['dragleave', 'drop'].forEach(eventName => {
            this.dropZone.addEventListener(eventName, () => {
                this.dropZone.classList.remove('drag-over');
            });
        });

        this.dropZone.addEventListener('drop', (e) => {
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                this.handleImageUpload(files[0]);
            }
        });
    }

    loadDefaultImage() {
        this.loadImage('assets/sample.jpg');
    }

    handleImageUpload(file) {
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                this.loadImage(e.target.result);
            };
            reader.readAsDataURL(file);
        }
    }

    loadImage(imageSrc) {
        this.currentImage = imageSrc;
        
        const img = new Image();
        img.onload = () => {
            this.createPuzzle();
            this.dropZone.classList.add('hidden');
            this.previewImage.style.backgroundImage = `url(${imageSrc})`;
        };
        img.src = imageSrc;
    }

    createPuzzle() {
        // Initialize tiles in solved state
        this.tiles = [];
        for (let i = 0; i < this.gridSize * this.gridSize; i++) {
            this.tiles.push(i);
        }
        
        // Empty tile is at bottom-right
        this.emptyPos = { 
            row: this.gridSize - 1, 
            col: this.gridSize - 1 
        };

        this.moveCount = 0;
        this.updateMoveCount();
        this.stopTimer();
        this.isPlaying = false;
        
        this.renderPuzzle();
    }

    renderPuzzle() {
        this.puzzleGrid.innerHTML = '';
        this.puzzleGrid.style.gridTemplateColumns = `repeat(${this.gridSize}, 1fr)`;
        this.puzzleGrid.style.gridTemplateRows = `repeat(${this.gridSize}, 1fr)`;

        const tileSize = 100 / this.gridSize;

        this.tiles.forEach((tileNum, index) => {
            const tile = document.createElement('div');
            tile.className = 'puzzle-tile';
            tile.dataset.index = index;

            const row = Math.floor(index / this.gridSize);
            const col = index % this.gridSize;

            if (tileNum === this.gridSize * this.gridSize - 1) {
                // Empty tile
                tile.classList.add('empty');
            } else {
                // Calculate background position for this tile
                const origRow = Math.floor(tileNum / this.gridSize);
                const origCol = tileNum % this.gridSize;
                
                tile.style.backgroundImage = `url(${this.currentImage})`;
                tile.style.backgroundSize = `${this.gridSize * 100}% ${this.gridSize * 100}%`;
                tile.style.backgroundPosition = 
                    `${origCol * tileSize}% ${origRow * tileSize}%`;

                // Check if tile is clickable (adjacent to empty)
                if (this.isAdjacent(row, col, this.emptyPos.row, this.emptyPos.col)) {
                    tile.classList.add('clickable');
                }

                tile.addEventListener('click', () => {
                    this.handleTileClick(row, col);
                });
            }

            this.puzzleGrid.appendChild(tile);
        });
    }

    isAdjacent(row1, col1, row2, col2) {
        const rowDiff = Math.abs(row1 - row2);
        const colDiff = Math.abs(col1 - col2);
        return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
    }

    handleTileClick(row, col) {
        if (!this.isPlaying) {
            return;
        }

        if (this.isAdjacent(row, col, this.emptyPos.row, this.emptyPos.col)) {
            this.swapTiles(row, col, this.emptyPos.row, this.emptyPos.col);
            this.moveCount++;
            this.updateMoveCount();
            this.renderPuzzle();

            if (this.isPuzzleSolved()) {
                this.puzzleCompleted();
            }
        }
    }

    swapTiles(row1, col1, row2, col2) {
        const index1 = row1 * this.gridSize + col1;
        const index2 = row2 * this.gridSize + col2;
        
        [this.tiles[index1], this.tiles[index2]] = 
        [this.tiles[index2], this.tiles[index1]];
        
        this.emptyPos = { row: row1, col: col1 };
    }

    shuffle() {
        if (!this.currentImage) return;

        this.isPlaying = true;
        this.moveCount = 0;
        this.updateMoveCount();
        this.startTimer();

        // Shuffle with solvable state guarantee
        let attempts = 0;
        do {
            this.randomShuffle();
            attempts++;
        } while (!this.isSolvable() && attempts < 1000);

        this.renderPuzzle();
    }

    randomShuffle() {
        // Fisher-Yates shuffle
        for (let i = this.tiles.length - 2; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.tiles[i], this.tiles[j]] = [this.tiles[j], this.tiles[i]];
        }

        // Find empty tile position
        const emptyIndex = this.tiles.indexOf(this.gridSize * this.gridSize - 1);
        this.emptyPos = {
            row: Math.floor(emptyIndex / this.gridSize),
            col: emptyIndex % this.gridSize
        };
    }

    isSolvable() {
        // Count inversions (number of pairs where larger number comes before smaller)
        let inversions = 0;
        const tilesWithoutEmpty = this.tiles.filter(t => t !== this.gridSize * this.gridSize - 1);
        
        for (let i = 0; i < tilesWithoutEmpty.length; i++) {
            for (let j = i + 1; j < tilesWithoutEmpty.length; j++) {
                if (tilesWithoutEmpty[i] > tilesWithoutEmpty[j]) {
                    inversions++;
                }
            }
        }

        // For odd grid size, puzzle is solvable if inversions is even
        if (this.gridSize % 2 === 1) {
            return inversions % 2 === 0;
        }

        // For even grid size, add row position of empty tile (from bottom)
        const emptyRowFromBottom = this.gridSize - this.emptyPos.row;
        return (inversions + emptyRowFromBottom) % 2 === 1;
    }

    reset() {
        this.createPuzzle();
    }

    isPuzzleSolved() {
        for (let i = 0; i < this.tiles.length; i++) {
            if (this.tiles[i] !== i) {
                return false;
            }
        }
        return true;
    }

    puzzleCompleted() {
        this.isPlaying = false;
        this.stopTimer();
        
        // Show completion modal
        document.getElementById('finalMoves').textContent = this.moveCount;
        document.getElementById('finalTime').textContent = this.timerDisplay.textContent;
        this.completionModal.classList.add('show');
    }

    hideCompletionModal() {
        this.completionModal.classList.remove('show');
    }

    updateMoveCount() {
        this.moveCountDisplay.textContent = this.moveCount;
    }

    startTimer() {
        this.startTime = Date.now();
        this.timerInterval = setInterval(() => {
            const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
            const minutes = Math.floor(elapsed / 60);
            const seconds = elapsed % 60;
            this.timerDisplay.textContent = 
                `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        }, 1000);
    }

    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
        this.timerDisplay.textContent = '00:00';
    }
}

// Initialize game when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new SlidingPuzzle();
});
