// Root ID Game module - Find the root note in a triad shape

const RootID = {
    // Triad types (excluding Augmented due to symmetry)
    TRIAD_TYPES: {
        'major': { name: 'Major', key: 'major', intervals: [0, 4, 7] },
        'minor': { name: 'Minor', key: 'minor', intervals: [0, 3, 7] },
        'dim': { name: 'Diminished', key: 'dim', intervals: [0, 3, 6] }
    },

    // String sets for triad voicings
    STRING_SETS: [
        { name: 'E-A-D', strings: [0, 1, 2] },
        { name: 'A-D-G', strings: [1, 2, 3] },
        { name: 'D-G-B', strings: [2, 3, 4] },
        { name: 'G-B-e', strings: [3, 4, 5] }
    ],

    // Note names
    NOTE_NAMES: ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'],

    // Standard tuning
    TUNING: [4, 9, 2, 7, 11, 4],

    totalQuestions: 10,
    currentQuestion: 0,
    score: 0,
    times: [],
    currentTriad: null,
    questionStartTime: null,
    previousKey: null, // To avoid repeating same shape
    selectedType: 'all',

    init() {
        this.setupEl = document.getElementById('root-id-setup');
        this.gameEl = document.getElementById('root-id-game');
        this.resultsEl = document.getElementById('root-id-results');
        this.fretboardEl = document.getElementById('root-id-fretboard');

        this.typeSelect = document.getElementById('root-id-type');
        this.questionsSelect = document.getElementById('root-id-questions');
        this.startBtn = document.getElementById('root-id-start');
        this.feedbackEl = document.getElementById('root-id-feedback');
        this.restartBtn = document.getElementById('root-id-restart');
        this.triadTypeEl = document.getElementById('root-id-triad-type');

        this.currentEl = document.getElementById('root-id-current');
        this.totalEl = document.getElementById('root-id-total');
        this.scoreEl = document.getElementById('root-id-score');

        this.finalScoreEl = document.getElementById('root-id-final-score');
        this.finalTotalEl = document.getElementById('root-id-final-total');
        this.avgTimeEl = document.getElementById('root-id-avg-time');

        this.startBtn.addEventListener('click', () => this.startGame());
        this.restartBtn.addEventListener('click', () => this.resetGame());
    },

    // Get fret for a note on a given string
    getFretForNote(stringIndex, noteIndex) {
        const openNote = this.TUNING[stringIndex];
        return (noteIndex - openNote + 12) % 12;
    },

    // Get available triad types based on selection
    getAvailableTypes() {
        if (this.selectedType === 'all') {
            return Object.values(this.TRIAD_TYPES);
        }
        return [this.TRIAD_TYPES[this.selectedType]];
    },

    // Generate a random triad voicing
    generateTriad() {
        // Pick random root note (doesn't matter for display, just for generating shape)
        const rootNote = Math.floor(Math.random() * 12);

        // Pick random triad type from available types
        const availableTypes = this.getAvailableTypes();
        const triadType = availableTypes[Math.floor(Math.random() * availableTypes.length)];

        // Pick random string set
        const stringSet = this.STRING_SETS[Math.floor(Math.random() * this.STRING_SETS.length)];

        // Pick random inversion (0 = root, 1 = 1st, 2 = 2nd)
        const inversion = Math.floor(Math.random() * 3);

        // Create a unique key for this shape combination
        const shapeKey = `${triadType.key}-${stringSet.name}-${inversion}`;

        // Get the three notes of the triad
        const notes = triadType.intervals.map(i => (rootNote + i) % 12);

        // Reorder based on inversion
        let orderedNotes;
        switch (inversion) {
            case 0: orderedNotes = [notes[0], notes[1], notes[2]]; break;
            case 1: orderedNotes = [notes[1], notes[2], notes[0]]; break;
            case 2: orderedNotes = [notes[2], notes[0], notes[1]]; break;
        }

        // Calculate frets for each string
        const voicing = stringSet.strings.map((stringIdx, i) => {
            const noteIdx = orderedNotes[i];
            let fret = this.getFretForNote(stringIdx, noteIdx);
            return {
                string: stringIdx,
                fret: fret,
                noteIndex: noteIdx,
                isRoot: noteIdx === rootNote
            };
        });

        // Normalize frets to be close together
        const minFret = Math.min(...voicing.map(v => v.fret));
        const maxFret = Math.max(...voicing.map(v => v.fret));

        if (maxFret - minFret > 5) {
            voicing.forEach(v => {
                if (v.fret - minFret > 5) {
                    v.fret -= 12;
                }
            });
        }

        const newMin = Math.min(...voicing.map(v => v.fret));
        if (newMin < 0) {
            voicing.forEach(v => v.fret += 12);
        }

        return {
            rootNote,
            triadType,
            stringSet,
            inversion,
            voicing,
            shapeKey
        };
    },

    startGame() {
        this.selectedType = this.typeSelect.value;
        this.totalQuestions = parseInt(this.questionsSelect.value);
        this.currentQuestion = 0;
        this.score = 0;
        this.times = [];
        this.previousKey = null;

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

        // Generate triad, ensuring shape differs from previous
        let triad;
        let attempts = 0;
        do {
            triad = this.generateTriad();
            attempts++;
        } while (this.previousKey && triad.shapeKey === this.previousKey && attempts < 20);

        this.currentTriad = triad;
        this.previousKey = triad.shapeKey;

        // Update triad type display (not the root note)
        this.triadTypeEl.textContent = `${triad.triadType.name} Triad`;

        // Render the fretboard with the triad
        this.renderFretboard();

        // Clear feedback
        this.feedbackEl.textContent = '';
        this.feedbackEl.className = 'feedback';

        // Start timer
        this.questionStartTime = performance.now();
    },

    renderFretboard() {
        const voicing = this.currentTriad.voicing;
        const frets = voicing.map(v => v.fret);
        const minFret = Math.min(...frets);
        const maxFret = Math.max(...frets);

        let startFret = Math.max(0, minFret - 1);
        let endFret = Math.max(startFret + 4, maxFret + 1);

        if (endFret - startFret < 4) {
            endFret = startFret + 4;
        }

        const fretCount = endFret - startFret;

        // Dimensions
        const stringSpacing = 28;
        const fretSpacing = 55;
        const padding = { top: 35, right: 25, bottom: 35, left: 45 };
        const width = padding.left + padding.right + (fretCount * fretSpacing);
        const height = padding.top + padding.bottom + (5 * stringSpacing);

        // Create SVG
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', width);
        svg.setAttribute('height', height);
        svg.setAttribute('viewBox', `0 0 ${width} ${height}`);

        // Draw nut or starting fret line
        const nutLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        nutLine.setAttribute('x1', padding.left);
        nutLine.setAttribute('y1', padding.top);
        nutLine.setAttribute('x2', padding.left);
        nutLine.setAttribute('y2', padding.top + 5 * stringSpacing);
        nutLine.setAttribute('class', startFret === 0 ? 'nut' : 'fret-line');
        svg.appendChild(nutLine);

        // Draw frets
        for (let i = 1; i <= fretCount; i++) {
            const x = padding.left + i * fretSpacing;
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', x);
            line.setAttribute('y1', padding.top);
            line.setAttribute('x2', x);
            line.setAttribute('y2', padding.top + 5 * stringSpacing);
            line.setAttribute('class', 'fret-line');
            svg.appendChild(line);
        }

        // Draw strings
        const activeStrings = this.currentTriad.stringSet.strings;
        for (let string = 0; string < 6; string++) {
            const y = padding.top + (5 - string) * stringSpacing;
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', padding.left);
            line.setAttribute('y1', y);
            line.setAttribute('x2', padding.left + fretCount * fretSpacing);
            line.setAttribute('y2', y);

            const isActive = activeStrings.includes(string);
            line.setAttribute('class', `string-line ${string < 2 ? 'thick' : ''}`);
            if (!isActive) {
                line.setAttribute('opacity', '0.3');
            }
            svg.appendChild(line);

            // String label
            const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            label.setAttribute('x', padding.left - 22);
            label.setAttribute('y', y + 5);
            label.setAttribute('class', 'string-label');
            if (!isActive) {
                label.setAttribute('opacity', '0.3');
            }
            label.textContent = Fretboard.STRING_NAMES[string];
            svg.appendChild(label);
        }

        // Draw fret numbers
        for (let i = 0; i <= fretCount; i++) {
            const fret = startFret + i;
            const x = i === 0 ? padding.left : padding.left + (i - 0.5) * fretSpacing;
            const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            label.setAttribute('x', x);
            label.setAttribute('y', height - 12);
            label.setAttribute('class', 'fret-label');
            label.textContent = fret;
            svg.appendChild(label);
        }

        // Draw clickable triad notes (without showing note names)
        voicing.forEach((note, noteIdx) => {
            const fretIndex = note.fret - startFret;
            const x = fretIndex === 0 ? padding.left : padding.left + (fretIndex - 0.5) * fretSpacing;
            const y = padding.top + (5 - note.string) * stringSpacing;

            // Clickable circle
            const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle.setAttribute('cx', x);
            circle.setAttribute('cy', y);
            circle.setAttribute('r', 14);
            circle.setAttribute('class', 'fret-spot interactive scale-note');
            circle.setAttribute('data-note-idx', noteIdx);
            circle.style.cursor = 'pointer';

            circle.addEventListener('click', () => this.handleNoteClick(noteIdx, circle));

            svg.appendChild(circle);
        });

        // Clear and append
        this.fretboardEl.innerHTML = '';
        this.fretboardEl.appendChild(svg);
    },

    handleNoteClick(noteIdx, circle) {
        const timeTaken = (performance.now() - this.questionStartTime) / 1000;
        this.times.push(timeTaken);

        const clickedNote = this.currentTriad.voicing[noteIdx];
        const isCorrect = clickedNote.isRoot;

        // Visual feedback on all notes - show note names now
        const svg = this.fretboardEl.querySelector('svg');
        const circles = svg.querySelectorAll('.fret-spot');
        const voicing = this.currentTriad.voicing;

        voicing.forEach((note, idx) => {
            const c = circles[idx];
            const cx = c.getAttribute('cx');
            const cy = c.getAttribute('cy');

            c.classList.remove('scale-note', 'interactive');
            if (note.isRoot) {
                c.classList.add('correct');
            } else if (idx === noteIdx) {
                c.classList.add('wrong');
            }

            // Add note name text
            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', cx);
            text.setAttribute('y', parseFloat(cy) + 4);
            text.setAttribute('text-anchor', 'middle');
            text.setAttribute('font-size', '11');
            text.setAttribute('font-weight', '600');
            text.setAttribute('fill', note.isRoot ? '#1a1a2e' : '#fff');
            text.setAttribute('pointer-events', 'none');
            text.textContent = this.NOTE_NAMES[note.noteIndex];
            svg.appendChild(text);
        });

        if (isCorrect) {
            this.score++;
            this.feedbackEl.textContent = `Correct! (${timeTaken.toFixed(2)}s)`;
            this.feedbackEl.className = 'feedback correct';
        } else {
            this.feedbackEl.textContent = `Incorrect. The root is highlighted in green.`;
            this.feedbackEl.className = 'feedback incorrect';
        }

        this.updateDisplay();

        // Move to next question or show results
        setTimeout(() => {
            if (this.currentQuestion >= this.totalQuestions) {
                this.showResults();
            } else {
                this.nextQuestion();
            }
        }, 1500);
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
    },

    resetGame() {
        this.resultsEl.classList.add('hidden');
        this.setupEl.classList.remove('hidden');
    }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    RootID.init();
});
