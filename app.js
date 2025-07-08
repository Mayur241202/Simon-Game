/**
 * Enhanced Simon Game - Professional JavaScript Implementation
 * Features: Classes, Modules, Local Storage, Audio, Animations, Error Handling
 */

class SimonGame {
    constructor() {
        this.gameSequence = [];
        this.userSequence = [];
        this.isStarted = false;
        this.currentLevel = 0;
        this.isUserTurn = false;
        this.isAnimating = false;
        this.gameSpeed = 1000;
        this.minSpeed = 300;
        this.speedDecrement = 50;
        
        // Game statistics
        this.stats = {
            gamesPlayed: 0,
            totalScore: 0,
            highScore: 0,
            averageScore: 0,
            currentStreak: 0,
            bestStreak: 0
        };
        
        // Color configuration
        this.colors = ['red', 'blue', 'green', 'yellow'];
        this.colorFrequencies = {
            red: 220,
            blue: 330,
            green: 440,
            yellow: 550
        };
        
        // DOM elements
        this.elements = {
            h2: document.querySelector('h2'),
            body: document.querySelector('body'),
            buttons: document.querySelectorAll('.btn'),
            startBtn: null,
            statsPanel: null,
            difficultySelect: null
        };
        
        // Audio context for sound effects
        this.audioContext = null;
        this.soundEnabled = true;
        
        this.init();
    }
    
    /**
     * Initialize the game
     */
    init() {
        this.loadGameStats();
        this.createUI();
        this.setupEventListeners();
        this.updateDisplay();
        this.preloadSounds();
        console.log('Simon Game initialized successfully!');
    }
    
    /**
     * Create additional UI elements
     */
    createUI() {
        // Create stats panel
        this.createStatsPanel();
        
        // Create start button
        this.createStartButton();
        
        // Create difficulty selector
        this.createDifficultySelector();
        
        // Create sound toggle
        this.createSoundToggle();
    }
    
    /**
     * Create statistics panel
     */
    createStatsPanel() {
        const statsPanel = document.createElement('div');
        statsPanel.className = 'stats-panel';
        statsPanel.innerHTML = `
            <h3>Game Statistics</h3>
            <div class="stat-item">
                <span>High Score:</span>
                <span id="high-score">${this.stats.highScore}</span>
            </div>
            <div class="stat-item">
                <span>Games Played:</span>
                <span id="games-played">${this.stats.gamesPlayed}</span>
            </div>
            <div class="stat-item">
                <span>Average Score:</span>
                <span id="avg-score">${this.stats.averageScore.toFixed(1)}</span>
            </div>
            <div class="stat-item">
                <span>Current Streak:</span>
                <span id="current-streak">${this.stats.currentStreak}</span>
            </div>
        `;
        
        document.body.appendChild(statsPanel);
        this.elements.statsPanel = statsPanel;
    }
    
    /**
     * Create start button
     */
    createStartButton() {
        const startBtn = document.createElement('button');
        startBtn.className = 'start-btn';
        startBtn.textContent = 'Start Game';
        startBtn.addEventListener('click', () => this.startGame());
        
        const container = document.querySelector('.container');
        container.parentNode.insertBefore(startBtn, container.nextSibling);
        this.elements.startBtn = startBtn;
    }
    
    /**
     * Create difficulty selector
     */
    createDifficultySelector() {
        const difficultyDiv = document.createElement('div');
        difficultyDiv.className = 'difficulty-selector';
        difficultyDiv.innerHTML = `
            <label for="difficulty">Difficulty:</label>
            <select id="difficulty">
                <option value="easy">Easy</option>
                <option value="medium" selected>Medium</option>
                <option value="hard">Hard</option>
                <option value="expert">Expert</option>
            </select>
        `;
        
        const container = document.querySelector('.container');
        container.parentNode.insertBefore(difficultyDiv, container);
        
        this.elements.difficultySelect = document.getElementById('difficulty');
        this.elements.difficultySelect.addEventListener('change', (e) => {
            this.setDifficulty(e.target.value);
        });
    }
    
    /**
     * Create sound toggle
     */
    createSoundToggle() {
        const soundToggle = document.createElement('button');
        soundToggle.className = 'sound-toggle';
        soundToggle.innerHTML = '🔊';
        soundToggle.addEventListener('click', () => this.toggleSound());
        
        document.body.appendChild(soundToggle);
        this.elements.soundToggle = soundToggle;
    }
    
    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Keyboard events
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' && !this.isStarted) {
                e.preventDefault();
                this.startGame();
            } else if (e.code === 'Escape') {
                this.resetGame();
            }
        });
        
        // Button events with enhanced handling
        this.elements.buttons.forEach(btn => {
            btn.addEventListener('click', (e) => this.handleButtonClick(e));
            btn.addEventListener('mouseenter', () => this.handleButtonHover(btn));
        });
        
        // Window events
        window.addEventListener('beforeunload', () => {
            this.saveGameStats();
        });
        
        // Visibility API for pause/resume
        document.addEventListener('visibilitychange', () => {
            if (document.hidden && this.isStarted) {
                this.pauseGame();
            }
        });
    }
    
    /**
     * Preload audio context
     */
    preloadSounds() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (error) {
            console.warn('Audio context not supported:', error);
            this.soundEnabled = false;
        }
    }
    
    /**
     * Set game difficulty
     */
    setDifficulty(difficulty) {
        const difficultySettings = {
            easy: { speed: 1200, minSpeed: 600, decrement: 30 },
            medium: { speed: 1000, minSpeed: 400, decrement: 50 },
            hard: { speed: 800, minSpeed: 300, decrement: 70 },
            expert: { speed: 600, minSpeed: 200, decrement: 100 }
        };
        
        const settings = difficultySettings[difficulty];
        this.gameSpeed = settings.speed;
        this.minSpeed = settings.minSpeed;
        this.speedDecrement = settings.decrement;
        
        console.log(`Difficulty set to: ${difficulty}`);
    }
    
    /**
     * Start the game
     */
    startGame() {
        if (this.isStarted) return;
        
        this.isStarted = true;
        this.isUserTurn = false;
        this.gameSequence = [];
        this.userSequence = [];
        this.currentLevel = 0;
        
        this.elements.startBtn.disabled = true;
        this.elements.startBtn.textContent = 'Game Running...';
        
        this.updateDisplay('Get Ready...', 'info');
        
        setTimeout(() => {
            this.levelUp();
        }, 1000);
        
        console.log('Game started!');
    }
    
    /**
     * Level up - add new color to sequence
     */
    async levelUp() {
        this.userSequence = [];
        this.currentLevel++;
        this.isUserTurn = false;
        
        // Add random color to sequence
        const randomColor = this.colors[Math.floor(Math.random() * this.colors.length)];
        this.gameSequence.push(randomColor);
        
        // Update display
        this.updateDisplay(`Level ${this.currentLevel}`, 'level');
        
        // Increase game speed
        this.gameSpeed = Math.max(this.minSpeed, this.gameSpeed - this.speedDecrement);
        
        // Play sequence after delay
        setTimeout(() => {
            this.playSequence();
        }, 1500);
    }
    
    /**
     * Play the current sequence
     */
    async playSequence() {
        this.isAnimating = true;
        
        for (let i = 0; i < this.gameSequence.length; i++) {
            await this.sleep(this.gameSpeed);
            await this.flashButton(this.gameSequence[i]);
        }
        
        this.isAnimating = false;
        this.isUserTurn = true;
        this.updateDisplay('Your Turn!', 'user-turn');
    }
    
    /**
     * Flash button with animation and sound
     */
    async flashButton(color) {
        const btn = document.querySelector(`.${color}`);
        
        // Visual feedback
        btn.classList.add('flash');
        this.playSound(color);
        
        await this.sleep(300);
        
        btn.classList.remove('flash');
        await this.sleep(100);
    }
    
    /**
     * Handle button click
     */
    handleButtonClick(event) {
        if (!this.isUserTurn || this.isAnimating) return;
        
        const btn = event.target;
        const color = btn.id;
        
        // Add user input
        this.userSequence.push(color);
        
        // Visual and audio feedback
        this.flashButton(color);
        
        // Check answer
        this.checkAnswer(this.userSequence.length - 1);
    }
    
    /**
     * Handle button hover
     */
    handleButtonHover(btn) {
        if (!this.isUserTurn || this.isAnimating) return;
        
        btn.style.transform = 'translateY(-3px) scale(1.02)';
        setTimeout(() => {
            btn.style.transform = '';
        }, 150);
    }
    
    /**
     * Check user answer
     */
    checkAnswer(index) {
        const userColor = this.userSequence[index];
        const correctColor = this.gameSequence[index];
        
        if (userColor === correctColor) {
            // Correct answer
            if (this.userSequence.length === this.gameSequence.length) {
                // Sequence complete - level up
                this.isUserTurn = false;
                this.updateDisplay('Correct! Next Level...', 'success');
                
                setTimeout(() => {
                    this.levelUp();
                }, 1000);
            }
        } else {
            // Wrong answer - game over
            this.gameOver();
        }
    }
    
    /**
     * Game over handling
     */
    gameOver() {
        this.isStarted = false;
        this.isUserTurn = false;
        
        // Update statistics
        this.updateStats();
        
        // Visual feedback
        this.elements.body.style.backgroundColor = '#ff4444';
        this.elements.body.classList.add('game-over');
        
        // Play game over sound
        this.playGameOverSound();
        
        // Update display
        this.updateDisplay(
            `Game Over! Final Score: ${this.currentLevel}<br>
            High Score: ${this.stats.highScore}<br>
            <small>Press Space or click Start to play again</small>`, 
            'game-over'
        );
        
        // Reset visual effects
        setTimeout(() => {
            this.elements.body.style.backgroundColor = '';
            this.elements.body.classList.remove('game-over');
        }, 500);
        
        // Enable start button
        this.elements.startBtn.disabled = false;
        this.elements.startBtn.textContent = 'Start New Game';
        
        console.log(`Game Over! Final Score: ${this.currentLevel}`);
    }
    
    /**
     * Update game statistics
     */
    updateStats() {
        this.stats.gamesPlayed++;
        this.stats.totalScore += this.currentLevel;
        this.stats.averageScore = this.stats.totalScore / this.stats.gamesPlayed;
        
        if (this.currentLevel > this.stats.highScore) {
            this.stats.highScore = this.currentLevel;
            this.stats.bestStreak = Math.max(this.stats.bestStreak, this.stats.currentStreak + 1);
            this.stats.currentStreak++;
        } else {
            this.stats.currentStreak = 0;
        }
        
        this.saveGameStats();
        this.updateStatsDisplay();
    }
    
    /**
     * Update statistics display
     */
    updateStatsDisplay() {
        document.getElementById('high-score').textContent = this.stats.highScore;
        document.getElementById('games-played').textContent = this.stats.gamesPlayed;
        document.getElementById('avg-score').textContent = this.stats.averageScore.toFixed(1);
        document.getElementById('current-streak').textContent = this.stats.currentStreak;
    }
    
    /**
     * Save game statistics to localStorage
     */
    saveGameStats() {
        try {
            localStorage.setItem('simonGameStats', JSON.stringify(this.stats));
        } catch (error) {
            console.warn('Could not save game stats:', error);
        }
    }
    
    /**
     * Load game statistics from localStorage
     */
    loadGameStats() {
        try {
            const savedStats = localStorage.getItem('simonGameStats');
            if (savedStats) {
                this.stats = { ...this.stats, ...JSON.parse(savedStats) };
            }
        } catch (error) {
            console.warn('Could not load game stats:', error);
        }
    }
    
    /**
     * Play sound for button
     */
    playSound(color) {
        if (!this.soundEnabled || !this.audioContext) return;
        
        try {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.frequency.value = this.colorFrequencies[color];
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + 0.3);
        } catch (error) {
            console.warn('Could not play sound:', error);
        }
    }
    
    /**
     * Play game over sound
     */
    playGameOverSound() {
        if (!this.soundEnabled || !this.audioContext) return;
        
        try {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.frequency.value = 150;
            oscillator.type = 'sawtooth';
            
            gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.8);
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + 0.8);
        } catch (error) {
            console.warn('Could not play game over sound:', error);
        }
    }
    
    /**
     * Toggle sound on/off
     */
    toggleSound() {
        this.soundEnabled = !this.soundEnabled;
        this.elements.soundToggle.innerHTML = this.soundEnabled ? '🔊' : '🔇';
        console.log(`Sound ${this.soundEnabled ? 'enabled' : 'disabled'}`);
    }
    
    /**
     * Pause game
     */
    pauseGame() {
        if (this.isStarted) {
            this.isUserTurn = false;
            this.updateDisplay('Game Paused', 'paused');
            console.log('Game paused');
        }
    }
    
    /**
     * Reset game
     */
    resetGame() {
        this.isStarted = false;
        this.isUserTurn = false;
        this.isAnimating = false;
        this.gameSequence = [];
        this.userSequence = [];
        this.currentLevel = 0;
        
        this.elements.startBtn.disabled = false;
        this.elements.startBtn.textContent = 'Start Game';
        
        this.updateDisplay('Press Space or Start to begin', 'reset');
        console.log('Game reset');
    }
    
    /**
     * Update display message
     */
    updateDisplay(message, type = 'default') {
        this.elements.h2.innerHTML = message;
        this.elements.h2.className = `message-${type}`;
    }
    
    /**
     * Utility function for delays
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    /**
     * Get game state (for debugging/testing)
     */
    getGameState() {
        return {
            isStarted: this.isStarted,
            currentLevel: this.currentLevel,
            gameSequence: this.gameSequence,
            userSequence: this.userSequence,
            stats: this.stats
        };
    }
}

// Game initialization and utility functions
document.addEventListener('DOMContentLoaded', () => {
    // Initialize game
    const game = new SimonGame();
    
    // Make game globally accessible for debugging
    window.simonGame = game;
    
    // Add performance monitoring
    window.addEventListener('load', () => {
        if (window.performance && window.performance.timing) {
            const loadTime = window.performance.timing.loadEventEnd - window.performance.timing.navigationStart;
            console.log(`Page loaded in ${loadTime}ms`);
        }
    });
    
    // Service Worker registration for PWA capabilities
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js').catch(error => {
            console.log('Service Worker registration failed:', error);
        });
    }
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SimonGame;
}