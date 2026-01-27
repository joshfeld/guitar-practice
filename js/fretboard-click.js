// Fretboard Click Game module

const FretboardClick = {
    totalRounds: 10,
    currentRound: 0,
    score: 0,
    times: [],
    targetNote: null,
    selectedPositions: new Set(),
    fretCircles: null,
    roundStartTime: null,

    init() {
        this.setupEl = document.getElementById('fret-click-setup');
        this.gameEl = document.getElementById('fret-click-game');
        this.resultsEl = document.getElementById('fret-click-results');
        this.fretboardEl = document.getElementById('fret-click-fretboard');

        this.questionsSelect = document.getElementById('fret-click-questions');
        this.startBtn = document.getElementById('fret-click-start');
        this.submitBtn = document.getElementById('fret-click-submit');
        this.feedbackEl = document.getElementById('fret-click-feedback');
        this.restartBtn = document.getElementById('fret-click-restart');
        this.targetEl = document.getElementById('fret-click-target');

        this.currentEl = document.getElementById('fret-click-current');
        this.totalEl = document.getElementById('fret-click-total');
        this.scoreEl = document.getElementById('fret-click-score');

        this.finalScoreEl = document.getElementById('fret-click-final-score');
        this.finalTotalEl = document.getElementById('fret-click-final-total');
        this.avgTimeEl = document.getElementById('fret-click-avg-time');

        this.startBtn.addEventListener('click', () => this.startGame());
        this.submitBtn.addEventListener('click', () => this.checkAnswer());
        this.restartBtn.addEventListener('click', () => this.resetGame());
    },

    startGame() {
        this.totalRounds = parseInt(this.questionsSelect.value);
        this.currentRound = 0;
        this.score = 0;
        this.times = [];

        this.setupEl.classList.add('hidden');
        this.resultsEl.classList.add('hidden');
        this.gameEl.classList.remove('hidden');

        this.totalEl.textContent = this.totalRounds;
        this.updateDisplay();
        this.nextRound();
    },

    nextRound() {
        this.currentRound++;
        this.selectedPositions.clear();
        this.updateDisplay();

        // Get random note
        this.targetNote = Fretboard.getRandomNote();
        this.targetEl.textContent = this.targetNote;

        // Render interactive fretboard
        this.fretCircles = Fretboard.render(this.fretboardEl, {
            interactive: true,
            onFretClick: (string, fret, circle) => this.handleFretClick(string, fret, circle)
        });

        // Clear feedback
        this.feedbackEl.textContent = '';
        this.feedbackEl.className = 'feedback';

        // Start timer
        this.roundStartTime = performance.now();
    },

    handleFretClick(string, fret, circle) {
        const key = `${string}-${fret}`;

        if (this.selectedPositions.has(key)) {
            // Deselect
            this.selectedPositions.delete(key);
            circle.classList.remove('selected');
        } else {
            // Select
            this.selectedPositions.add(key);
            circle.classList.add('selected');
        }
    },

    checkAnswer() {
        const timeTaken = (performance.now() - this.roundStartTime) / 1000;
        this.times.push(timeTaken);

        // Get correct positions
        const correctPositions = Fretboard.getNotePositions(this.targetNote);
        const correctSet = new Set(correctPositions.map(p => `${p.string}-${p.fret}`));

        // Calculate results
        let correctClicks = 0;
        let wrongClicks = 0;
        let missedNotes = 0;

        // Check user selections
        this.selectedPositions.forEach(key => {
            if (correctSet.has(key)) {
                correctClicks++;
            } else {
                wrongClicks++;
            }
        });

        // Check for missed notes
        correctSet.forEach(key => {
            if (!this.selectedPositions.has(key)) {
                missedNotes++;
            }
        });

        // Visual feedback
        correctPositions.forEach(pos => {
            const circle = this.fretCircles[pos.string][pos.fret];
            const key = `${pos.string}-${pos.fret}`;

            if (this.selectedPositions.has(key)) {
                circle.classList.remove('selected');
                circle.classList.add('correct');
            } else {
                circle.classList.add('missed');
            }
        });

        // Mark wrong clicks
        this.selectedPositions.forEach(key => {
            if (!correctSet.has(key)) {
                const [string, fret] = key.split('-').map(Number);
                const circle = this.fretCircles[string][fret];
                circle.classList.remove('selected');
                circle.classList.add('wrong');
            }
        });

        // Determine if round was perfect
        const isPerfect = wrongClicks === 0 && missedNotes === 0;
        if (isPerfect) {
            this.score++;
            this.feedbackEl.textContent = `Perfect! Found all ${correctPositions.length} notes in ${timeTaken.toFixed(2)}s`;
            this.feedbackEl.className = 'feedback correct';
        } else {
            this.feedbackEl.textContent = `${correctClicks}/${correctPositions.length} correct, ${wrongClicks} wrong clicks, ${missedNotes} missed`;
            this.feedbackEl.className = 'feedback incorrect';
        }

        this.updateDisplay();

        // Move to next round or show results
        setTimeout(() => {
            if (this.currentRound >= this.totalRounds) {
                this.showResults();
            } else {
                this.nextRound();
            }
        }, 2000);
    },

    updateDisplay() {
        this.currentEl.textContent = this.currentRound;
        this.scoreEl.textContent = this.score;
    },

    showResults() {
        this.gameEl.classList.add('hidden');
        this.resultsEl.classList.remove('hidden');

        const avgTime = this.times.length > 0
            ? (this.times.reduce((a, b) => a + b, 0) / this.times.length).toFixed(2)
            : 0;

        this.finalScoreEl.textContent = this.score;
        this.finalTotalEl.textContent = this.totalRounds;
        this.avgTimeEl.textContent = avgTime;
    },

    resetGame() {
        this.resultsEl.classList.add('hidden');
        this.setupEl.classList.remove('hidden');
    }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    FretboardClick.init();
});
