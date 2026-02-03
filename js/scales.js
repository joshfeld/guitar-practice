// Scales module - CAGED scale diagrams

const Scales = {
    // Scale intervals (semitones from root)
    SCALE_INTERVALS: {
        'major': [0, 2, 4, 5, 7, 9, 11],
        'minor': [0, 2, 3, 5, 7, 8, 10],
        'pentatonic-major': [0, 2, 4, 7, 9],
        'pentatonic-minor': [0, 3, 5, 7, 10]
    },

    // Scale display names
    SCALE_NAMES: {
        'major': 'Major',
        'minor': 'Minor',
        'pentatonic-major': 'Pentatonic Major',
        'pentatonic-minor': 'Pentatonic Minor'
    },

    // Key names
    KEY_NAMES: ['C', 'C#/Db', 'D', 'D#/Eb', 'E', 'F', 'F#/Gb', 'G', 'G#/Ab', 'A', 'A#/Bb', 'B'],

    // CAGED shape definitions
    // baseStart: starting fret for key of E (root at fret 0 on low E string)
    // fretSpan: number of frets to display
    CAGED_SHAPES: [
        { name: 'E Shape', baseStart: 0, fretSpan: 4 },
        { name: 'D Shape', baseStart: 2, fretSpan: 4 },
        { name: 'C Shape', baseStart: 4, fretSpan: 4 },
        { name: 'A Shape', baseStart: 7, fretSpan: 4 },
        { name: 'G Shape', baseStart: 9, fretSpan: 4 }
    ],

    // Standard tuning: semitones from C for each open string
    TUNING: [4, 9, 2, 7, 11, 4], // E, A, D, G, B, E

    currentKey: 0, // C
    currentScale: 'major',

    init() {
        this.keySelect = document.getElementById('scale-key');
        this.scaleNameEl = document.getElementById('scale-name');
        this.scaleNotesEl = document.getElementById('scale-notes');
        this.diagramsContainer = document.getElementById('scales-diagrams');
        this.scaleTypeBtns = document.querySelectorAll('.scale-type-btn');

        // Reset controls to default state (browser may restore previous values)
        this.keySelect.value = this.currentKey;
        this.scaleTypeBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.scale === this.currentScale);
        });

        this.keySelect.addEventListener('change', () => {
            this.currentKey = parseInt(this.keySelect.value);
            this.updateDisplay();
        });

        this.scaleTypeBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.scaleTypeBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentScale = btn.dataset.scale;
                this.updateDisplay();
            });
        });

        this.updateDisplay();
    },

    // Get the note index (0-11) at a given string and fret
    getNoteIndex(string, fret) {
        return (this.TUNING[string] + fret) % 12;
    },

    // Get all notes in the current scale as indices (0-11)
    getScaleNotes() {
        const intervals = this.SCALE_INTERVALS[this.currentScale];
        return intervals.map(i => (this.currentKey + i) % 12);
    },

    // Check if a note index is the root
    isRoot(noteIndex) {
        return noteIndex === this.currentKey;
    },

    // Calculate the starting fret for a CAGED shape given the current key
    getShapeStartFret(shape) {
        // Key of E is at fret 0, so offset by (currentKey - 4) semitones
        // But we need to handle wrapping properly
        const keyOffset = (this.currentKey - 4 + 12) % 12; // Distance from E
        let startFret = shape.baseStart + keyOffset;

        // Keep shapes in a reasonable range (prefer lower positions)
        // Fret 12 is the octave, so wrap to fret 0
        if (startFret >= 12) {
            startFret -= 12;
        }

        return startFret;
    },

    updateDisplay() {
        // Update scale name display
        const keyName = this.KEY_NAMES[this.currentKey].split('/')[0]; // Use sharp name
        this.scaleNameEl.textContent = `${keyName} ${this.SCALE_NAMES[this.currentScale]}`;

        // Update scale notes display
        const scaleNoteIndices = this.getScaleNotes();
        const scaleNoteNames = scaleNoteIndices.map(i => Fretboard.NOTES[i]);
        this.scaleNotesEl.textContent = scaleNoteNames.join(' - ');

        // Render all CAGED diagrams
        this.renderDiagrams();
    },

    renderDiagrams() {
        this.diagramsContainer.innerHTML = '';
        const scaleNotes = this.getScaleNotes();

        this.CAGED_SHAPES.forEach(shape => {
            const startFret = this.getShapeStartFret(shape);
            const endFret = startFret + shape.fretSpan;

            const diagram = document.createElement('div');
            diagram.className = 'scale-diagram';

            // Header with shape name and fret range
            const header = document.createElement('div');
            header.className = 'scale-diagram-header';

            const title = document.createElement('span');
            title.className = 'scale-diagram-title';
            title.textContent = shape.name;

            const fretRange = document.createElement('span');
            fretRange.className = 'scale-diagram-frets';
            fretRange.textContent = `Frets ${startFret}-${endFret}`;

            header.appendChild(title);
            header.appendChild(fretRange);
            diagram.appendChild(header);

            // Fretboard container
            const container = document.createElement('div');
            container.className = 'fretboard-container';
            diagram.appendChild(container);

            this.diagramsContainer.appendChild(diagram);

            // Render the mini fretboard
            this.renderMiniFretboard(container, startFret, endFret, scaleNotes);
        });
    },

    renderMiniFretboard(container, startFret, endFret, scaleNotes) {
        const fretCount = endFret - startFret;

        // Dimensions (smaller than main fretboard)
        const stringSpacing = 24;
        const fretSpacing = 50;
        const padding = { top: 30, right: 20, bottom: 30, left: 40 };
        const width = padding.left + padding.right + (fretCount * fretSpacing);
        const height = padding.top + padding.bottom + (5 * stringSpacing);

        // Create SVG
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', width);
        svg.setAttribute('height', height);
        svg.setAttribute('viewBox', `0 0 ${width} ${height}`);

        // Draw fret markers if applicable
        const markerFrets = [3, 5, 7, 9, 12];
        markerFrets.forEach(fret => {
            if (fret > startFret && fret <= endFret) {
                const x = padding.left + (fret - startFret - 0.5) * fretSpacing;
                const isDouble = fret === 12;

                if (isDouble) {
                    const circle1 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                    circle1.setAttribute('cx', x);
                    circle1.setAttribute('cy', padding.top + 1 * stringSpacing);
                    circle1.setAttribute('r', 4);
                    circle1.setAttribute('class', 'fret-marker');
                    svg.appendChild(circle1);

                    const circle2 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                    circle2.setAttribute('cx', x);
                    circle2.setAttribute('cy', padding.top + 4 * stringSpacing);
                    circle2.setAttribute('r', 4);
                    circle2.setAttribute('class', 'fret-marker');
                    svg.appendChild(circle2);
                } else {
                    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                    circle.setAttribute('cx', x);
                    circle.setAttribute('cy', padding.top + 2.5 * stringSpacing);
                    circle.setAttribute('r', 4);
                    circle.setAttribute('class', 'fret-marker');
                    svg.appendChild(circle);
                }
            }
        });

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

        // Draw strings (high e at top, low E at bottom)
        for (let string = 0; string < 6; string++) {
            const y = padding.top + (5 - string) * stringSpacing;
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', padding.left);
            line.setAttribute('y1', y);
            line.setAttribute('x2', padding.left + fretCount * fretSpacing);
            line.setAttribute('y2', y);
            line.setAttribute('class', `string-line ${string < 2 ? 'thick' : ''}`);
            svg.appendChild(line);

            // String label
            const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            label.setAttribute('x', padding.left - 20);
            label.setAttribute('y', y + 4);
            label.setAttribute('class', 'string-label');
            label.textContent = Fretboard.STRING_NAMES[string];
            svg.appendChild(label);
        }

        // Draw fret numbers
        for (let i = 0; i <= fretCount; i++) {
            const fret = startFret + i;
            const x = i === 0 ? padding.left : padding.left + (i - 0.5) * fretSpacing;
            const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            label.setAttribute('x', x);
            label.setAttribute('y', height - 10);
            label.setAttribute('class', 'fret-label');
            label.textContent = fret;
            svg.appendChild(label);
        }

        // Draw scale notes
        for (let string = 0; string < 6; string++) {
            for (let i = 0; i <= fretCount; i++) {
                const fret = startFret + i;
                const noteIndex = this.getNoteIndex(string, fret);

                if (scaleNotes.includes(noteIndex)) {
                    const x = i === 0 ? padding.left : padding.left + (i - 0.5) * fretSpacing;
                    const y = padding.top + (5 - string) * stringSpacing;

                    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                    circle.setAttribute('cx', x);
                    circle.setAttribute('cy', y);
                    circle.setAttribute('r', 10);

                    if (this.isRoot(noteIndex)) {
                        circle.setAttribute('class', 'fret-spot root');
                    } else {
                        circle.setAttribute('class', 'fret-spot scale-note');
                    }

                    svg.appendChild(circle);

                    // Add note name text
                    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                    text.setAttribute('x', x);
                    text.setAttribute('y', y + 4);
                    text.setAttribute('text-anchor', 'middle');
                    text.setAttribute('font-size', '10');
                    text.setAttribute('font-weight', '600');
                    text.setAttribute('fill', this.isRoot(noteIndex) ? '#1a1a2e' : '#fff');
                    text.textContent = Fretboard.NOTES[noteIndex];
                    svg.appendChild(text);
                }
            }
        }

        container.appendChild(svg);
    }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    Scales.init();
});
