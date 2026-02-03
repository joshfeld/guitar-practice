// Note Identification Game module

const NoteIdentification = {
    totalQuestions: 10,
    currentQuestion: 0,
    score: 0,
    times: [],
    missed: [],
    currentPosition: null,
    previousNote: null,
    questionStartTime: null,

    init() {
        this.setupEl = document.getElementById('note-id-setup');
        this.gameEl = document.getElementById('note-id-game');
        this.resultsEl = document.getElementById('note-id-results');
        this.fretboardEl = document.getElementById('note-id-fretboard');

        this.questionsSelect = document.getElementById('note-id-questions');
        this.startBtn = document.getElementById('note-id-start');
        this.answerInput = document.getElementById('note-id-answer');
        this.submitBtn = document.getElementById('note-id-submit');
        this.feedbackEl = document.getElementById('note-id-feedback');
        this.restartBtn = document.getElementById('note-id-restart');

        this.currentEl = document.getElementById('note-id-current');
        this.totalEl = document.getElementById('note-id-total');
        this.scoreEl = document.getElementById('note-id-score');

        this.finalScoreEl = document.getElementById('note-id-final-score');
        this.finalTotalEl = document.getElementById('note-id-final-total');
        this.avgTimeEl = document.getElementById('note-id-avg-time');
        this.missedEl = document.getElementById('note-id-missed');

        this.startBtn.addEventListener('click', () => this.startGame());
        this.submitBtn.addEventListener('click', () => this.submitAnswer());
        this.restartBtn.addEventListener('click', () => this.resetGame());

        this.answerInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.submitAnswer();
            }
        });
    },

    startGame() {
        this.totalQuestions = parseInt(this.questionsSelect.value);
        this.currentQuestion = 0;
        this.score = 0;
        this.times = [];
        this.missed = [];
        this.previousNote = null;

        this.setupEl.classList.add('hidden');
        this.resultsEl.classList.add('hidden');
        this.gameEl.classList.remove('hidden');

        this.totalEl.textContent = this.totalQuestions;
        this.updateDisplay();
        this.nextQuestion();
    },

    nextQuestion() {
        this.currentQuestion++;
        this.updateDisplay();

        // Get random position, ensuring note differs from previous (including enharmonics)
        let currentNote;
        do {
            this.currentPosition = Fretboard.getRandomPosition();
            currentNote = Fretboard.getNoteAt(this.currentPosition.string, this.currentPosition.fret);
        } while (Fretboard.isSameNote(currentNote, this.previousNote));
        this.previousNote = currentNote;

        // Render fretboard with highlighted position
        Fretboard.render(this.fretboardEl, {
            interactive: false,
            highlightedPosition: this.currentPosition
        });

        // Play the note
        Fretboard.playNote(this.currentPosition.string, this.currentPosition.fret);

        // Clear input and feedback
        this.answerInput.value = '';
        this.feedbackEl.textContent = '';
        this.feedbackEl.className = 'feedback';
        this.answerInput.focus();

        // Start timer
        this.questionStartTime = performance.now();
    },

    submitAnswer() {
        const answer = this.answerInput.value.trim();
        if (!answer) return;

        const timeTaken = (performance.now() - this.questionStartTime) / 1000;
        this.times.push(timeTaken);

        const correctNote = Fretboard.getNoteAt(this.currentPosition.string, this.currentPosition.fret);
        const isCorrect = Fretboard.checkAnswer(answer, correctNote);

        if (isCorrect) {
            this.score++;
            this.feedbackEl.textContent = `Correct! (${timeTaken.toFixed(2)}s)`;
            this.feedbackEl.className = 'feedback correct';
        } else {
            const enharmonic = Fretboard.ENHARMONICS[correctNote];
            const correctText = enharmonic ? `${correctNote} / ${enharmonic}` : correctNote;
            this.feedbackEl.textContent = `Incorrect. The answer was ${correctText}`;
            this.feedbackEl.className = 'feedback incorrect';
            this.missed.push({
                position: this.currentPosition,
                correctNote: correctNote,
                userAnswer: answer
            });
        }

        this.updateDisplay();

        // Move to next question or show results
        setTimeout(() => {
            if (this.currentQuestion >= this.totalQuestions) {
                this.showResults();
            } else {
                this.nextQuestion();
            }
        }, 1200);
    },

    updateDisplay() {
        this.currentEl.textContent = this.currentQuestion;
        this.scoreEl.textContent = this.score;
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

        // Show missed notes
        this.missedEl.innerHTML = '';
        if (this.missed.length > 0) {
            const header = document.createElement('h4');
            header.textContent = 'Notes to Practice:';
            this.missedEl.appendChild(header);

            const list = document.createElement('ul');
            this.missed.forEach(m => {
                const stringName = Fretboard.STRING_NAMES[m.position.string];
                const li = document.createElement('li');
                li.textContent = `String ${stringName}, Fret ${m.position.fret}: ${m.correctNote} (you said: ${m.userAnswer})`;
                list.appendChild(li);
            });
            this.missedEl.appendChild(list);
        } else {
            const perfect = document.createElement('p');
            perfect.style.color = 'var(--success)';
            perfect.textContent = 'Perfect score!';
            this.missedEl.appendChild(perfect);
        }
    },

    resetGame() {
        this.resultsEl.classList.add('hidden');
        this.setupEl.classList.remove('hidden');
    }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    NoteIdentification.init();
});
