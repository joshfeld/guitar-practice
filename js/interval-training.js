// Interval Ear Training module

const IntervalTraining = {
    INTERVALS: [
        { semitones: 1, name: 'Minor 2nd', short: 'm2' },
        { semitones: 2, name: 'Major 2nd', short: 'M2' },
        { semitones: 3, name: 'Minor 3rd', short: 'm3' },
        { semitones: 4, name: 'Major 3rd', short: 'M3' },
        { semitones: 5, name: 'Perfect 4th', short: 'P4' },
        { semitones: 6, name: 'Tritone', short: 'TT' },
        { semitones: 7, name: 'Perfect 5th', short: 'P5' },
        { semitones: 8, name: 'Minor 6th', short: 'm6' },
        { semitones: 9, name: 'Major 6th', short: 'M6' },
        { semitones: 10, name: 'Minor 7th', short: 'm7' },
        { semitones: 11, name: 'Major 7th', short: 'M7' },
        { semitones: 12, name: 'Octave', short: 'P8' }
    ],

    // Reference frequencies for random base notes (A2 to A4 range)
    BASE_FREQ_MIN: 110,  // A2
    BASE_FREQ_MAX: 440,  // A4

    // State
    selectedIntervals: [],
    direction: 'ascending',
    totalQuestions: 10,
    currentQuestion: 0,
    score: 0,
    times: [],
    currentInterval: null,
    currentDirection: null,
    currentBaseFreq: null,
    questionStartTime: null,
    answered: false,

    init() {
        this.setupEl = document.getElementById('interval-setup');
        this.gameEl = document.getElementById('interval-game');
        this.resultsEl = document.getElementById('interval-results');

        this.startBtn = document.getElementById('interval-start');
        this.replayBtn = document.getElementById('interval-replay');
        this.feedbackEl = document.getElementById('interval-feedback');
        this.restartBtn = document.getElementById('interval-restart');
        this.answersEl = document.getElementById('interval-answers');
        this.directionPromptEl = document.getElementById('interval-direction-prompt');

        this.currentEl = document.getElementById('interval-current');
        this.totalEl = document.getElementById('interval-total');
        this.scoreEl = document.getElementById('interval-score');

        this.finalScoreEl = document.getElementById('interval-final-score');
        this.finalTotalEl = document.getElementById('interval-final-total');
        this.avgTimeEl = document.getElementById('interval-avg-time');

        this.questionsSelect = document.getElementById('interval-questions');
        this.directionSelect = document.getElementById('interval-direction');

        // Reset selects to defaults on init
        this.questionsSelect.value = '10';
        this.directionSelect.value = 'ascending';

        this.startBtn.addEventListener('click', () => this.startGame());
        this.replayBtn.addEventListener('click', () => this.playInterval());
        this.restartBtn.addEventListener('click', () => this.resetGame());

        // Set up select/deselect all
        document.getElementById('interval-select-all').addEventListener('click', () => {
            document.querySelectorAll('.interval-checkbox input').forEach(cb => cb.checked = true);
        });
        document.getElementById('interval-deselect-all').addEventListener('click', () => {
            document.querySelectorAll('.interval-checkbox input').forEach(cb => cb.checked = false);
        });
    },

    getSelectedIntervals() {
        const selected = [];
        document.querySelectorAll('.interval-checkbox input:checked').forEach(cb => {
            const semitones = parseInt(cb.value);
            const interval = this.INTERVALS.find(i => i.semitones === semitones);
            if (interval) selected.push(interval);
        });
        return selected;
    },

    startGame() {
        this.selectedIntervals = this.getSelectedIntervals();
        if (this.selectedIntervals.length < 2) {
            const setupFeedback = document.getElementById('interval-setup-feedback');
            setupFeedback.textContent = 'Select at least 2 intervals.';
            setupFeedback.className = 'feedback incorrect';
            setTimeout(() => {
                setupFeedback.className = 'feedback hidden';
            }, 2000);
            return;
        }

        this.direction = this.directionSelect.value;
        this.totalQuestions = parseInt(this.questionsSelect.value);
        this.currentQuestion = 0;
        this.score = 0;
        this.times = [];

        this.setupEl.classList.add('hidden');
        this.resultsEl.classList.add('hidden');
        this.gameEl.classList.remove('hidden');

        this.totalEl.textContent = this.totalQuestions;
        this.buildAnswerButtons();
        this.nextQuestion();
    },

    buildAnswerButtons() {
        this.answersEl.innerHTML = '';
        this.selectedIntervals.forEach(interval => {
            const btn = document.createElement('button');
            btn.className = 'btn btn-interval';
            btn.textContent = interval.name;
            btn.addEventListener('click', () => this.handleAnswer(interval, btn));
            this.answersEl.appendChild(btn);
        });
    },

    nextQuestion() {
        this.currentQuestion++;
        this.answered = false;
        this.currentEl.textContent = this.currentQuestion;
        this.scoreEl.textContent = this.score;

        // Pick random interval
        this.currentInterval = this.selectedIntervals[
            Math.floor(Math.random() * this.selectedIntervals.length)
        ];

        // Pick direction
        if (this.direction === 'both') {
            this.currentDirection = Math.random() < 0.5 ? 'ascending' : 'descending';
        } else {
            this.currentDirection = this.direction;
        }

        // Show direction if mode is "both"
        if (this.direction === 'both') {
            this.directionPromptEl.textContent = this.currentDirection === 'ascending' ? '↑ Ascending' : '↓ Descending';
            this.directionPromptEl.classList.remove('hidden');
        } else {
            this.directionPromptEl.classList.add('hidden');
        }

        // Pick random base frequency (semitone-quantized within range)
        const minSemitone = 0;
        const maxSemitone = Math.floor(12 * Math.log2(this.BASE_FREQ_MAX / this.BASE_FREQ_MIN));
        const semitone = Math.floor(Math.random() * (maxSemitone + 1));
        this.currentBaseFreq = this.BASE_FREQ_MIN * Math.pow(2, semitone / 12);

        // Reset button states
        this.answersEl.querySelectorAll('.btn-interval').forEach(btn => {
            btn.className = 'btn btn-interval';
            btn.disabled = false;
        });

        // Clear feedback
        this.feedbackEl.textContent = '';
        this.feedbackEl.className = 'feedback';

        // Play the interval
        this.playInterval();

        this.questionStartTime = performance.now();
    },

    playFrequency(freq, startTime) {
        if (!Fretboard.audioContext) {
            Fretboard.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (Fretboard.audioContext.state === 'suspended') {
            Fretboard.audioContext.resume();
        }

        const ctx = Fretboard.audioContext;
        const now = ctx.currentTime + startTime;

        const harmonics = [1, 2, 3, 4, 5, 6];
        const harmonicGains = [1, 0.5, 0.33, 0.25, 0.2, 0.15];

        const masterGain = ctx.createGain();
        masterGain.connect(ctx.destination);
        masterGain.gain.setValueAtTime(0.3, now);
        masterGain.gain.exponentialRampToValueAtTime(0.001, now + 2);

        harmonics.forEach((harmonic, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq * harmonic, now);

            gain.gain.setValueAtTime(harmonicGains[i], now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + (2 / harmonic));

            osc.connect(gain);
            gain.connect(masterGain);

            osc.start(now);
            osc.stop(now + 2);
        });
    },

    playInterval() {
        const baseFreq = this.currentBaseFreq;
        const semitones = this.currentInterval.semitones;
        const secondFreq = this.currentDirection === 'ascending'
            ? baseFreq * Math.pow(2, semitones / 12)
            : baseFreq / Math.pow(2, semitones / 12);

        this.playFrequency(baseFreq, 0);
        this.playFrequency(secondFreq, 0.7);
    },

    handleAnswer(interval, btn) {
        if (this.answered) return;
        this.answered = true;

        const timeTaken = (performance.now() - this.questionStartTime) / 1000;
        this.times.push(timeTaken);

        const isCorrect = interval.semitones === this.currentInterval.semitones;

        // Disable all buttons and highlight correct/incorrect
        this.answersEl.querySelectorAll('.btn-interval').forEach(b => {
            b.disabled = true;
            if (b.textContent === this.currentInterval.name) {
                b.classList.add('correct-answer');
            }
        });

        if (isCorrect) {
            this.score++;
            btn.classList.add('correct-answer');
            this.feedbackEl.textContent = `Correct! ${this.currentInterval.name} (${timeTaken.toFixed(2)}s)`;
            this.feedbackEl.className = 'feedback correct';
        } else {
            btn.classList.add('wrong-answer');
            this.feedbackEl.textContent = `Incorrect. It was ${this.currentInterval.name}.`;
            this.feedbackEl.className = 'feedback incorrect';
        }

        this.scoreEl.textContent = this.score;

        setTimeout(() => {
            if (this.currentQuestion >= this.totalQuestions) {
                this.showResults();
            } else {
                this.nextQuestion();
            }
        }, 1500);
    },

    showResults() {
        this.gameEl.classList.add('hidden');
        this.resultsEl.classList.remove('hidden');

        const avgTime = this.times.length > 0
            ? (this.times.reduce((a, b) => a + b, 0) / this.times.length).toFixed(2)
            : 0;

        this.finalScoreEl.textContent = this.score;
        this.finalTotalEl.textContent = this.totalQuestions;
        this.avgTimeEl.textContent = avgTime;
    },

    resetGame() {
        this.resultsEl.classList.add('hidden');
        this.setupEl.classList.remove('hidden');
    }
};

document.addEventListener('DOMContentLoaded', () => {
    IntervalTraining.init();
});
