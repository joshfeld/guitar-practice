// Fretboard data and rendering utilities

const Fretboard = {
    // Note names (using sharps)
    NOTES: ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'],

    // Open string frequencies in Hz (standard tuning E2, A2, D3, G3, B3, E4)
    STRING_FREQUENCIES: [82.41, 110.00, 146.83, 196.00, 246.94, 329.63],

    // Audio context (created on first use)
    audioContext: null,

    // Enharmonic equivalents for answer validation
    ENHARMONICS: {
        'C#': 'Db', 'Db': 'C#',
        'D#': 'Eb', 'Eb': 'D#',
        'F#': 'Gb', 'Gb': 'F#',
        'G#': 'Ab', 'Ab': 'G#',
        'A#': 'Bb', 'Bb': 'A#'
    },

    // Standard tuning: string open note indices (low E to high E)
    // Index into NOTES array
    TUNING: [4, 9, 2, 7, 11, 4], // E, A, D, G, B, E

    // String names for display
    STRING_NAMES: ['E', 'A', 'D', 'G', 'B', 'e'],

    // Number of frets to display
    FRET_COUNT: 12,

    // Fret marker positions (dots on guitar)
    FRET_MARKERS: [3, 5, 7, 9, 12],
    DOUBLE_MARKERS: [12],

    // Get note name at a specific string and fret
    getNoteAt(string, fret) {
        const openNote = this.TUNING[string];
        const noteIndex = (openNote + fret) % 12;
        return this.NOTES[noteIndex];
    },

    // Check if an answer matches the correct note (handles enharmonics)
    checkAnswer(answer, correctNote) {
        const normalized = answer.charAt(0).toUpperCase() + answer.slice(1).toLowerCase();
        if (normalized === correctNote) return true;
        if (this.ENHARMONICS[correctNote] === normalized) return true;
        return false;
    },

    // Get all positions of a specific note on the fretboard
    getNotePositions(noteName) {
        const positions = [];
        const targetNote = noteName.charAt(0).toUpperCase() + noteName.slice(1).toLowerCase();

        for (let string = 0; string < 6; string++) {
            for (let fret = 0; fret <= this.FRET_COUNT; fret++) {
                const note = this.getNoteAt(string, fret);
                if (note === targetNote || this.ENHARMONICS[note] === targetNote) {
                    positions.push({ string, fret });
                }
            }
        }
        return positions;
    },

    // Get a random fret position
    getRandomPosition() {
        const string = Math.floor(Math.random() * 6);
        const fret = Math.floor(Math.random() * (this.FRET_COUNT + 1));
        return { string, fret };
    },

    // Get a random note name
    getRandomNote() {
        return this.NOTES[Math.floor(Math.random() * 12)];
    },

    // Play the note at a given string/fret position
    playNote(string, fret) {
        // Create audio context on first use
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }

        // Resume if suspended (browser autoplay policy)
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }

        const ctx = this.audioContext;
        const now = ctx.currentTime;

        // Calculate frequency: open string frequency * 2^(fret/12)
        const baseFreq = this.STRING_FREQUENCIES[string];
        const frequency = baseFreq * Math.pow(2, fret / 12);

        // Create a plucked string sound using multiple oscillators
        const harmonics = [1, 2, 3, 4, 5, 6];
        const harmonicGains = [1, 0.5, 0.33, 0.25, 0.2, 0.15];

        // Master gain for overall volume
        const masterGain = ctx.createGain();
        masterGain.connect(ctx.destination);
        masterGain.gain.setValueAtTime(0.3, now);
        masterGain.gain.exponentialRampToValueAtTime(0.001, now + 2);

        harmonics.forEach((harmonic, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(frequency * harmonic, now);

            // Higher harmonics decay faster (simulates string damping)
            gain.gain.setValueAtTime(harmonicGains[i], now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + (2 / harmonic));

            osc.connect(gain);
            gain.connect(masterGain);

            osc.start(now);
            osc.stop(now + 2);
        });
    },

    // Render fretboard as SVG
    render(container, options = {}) {
        const {
            interactive = false,
            highlightedPosition = null,
            onFretClick = null
        } = options;

        // Dimensions
        const stringSpacing = 30;
        const fretSpacing = 60;
        const padding = { top: 40, right: 30, bottom: 40, left: 50 };
        const width = padding.left + padding.right + (this.FRET_COUNT * fretSpacing);
        const height = padding.top + padding.bottom + (5 * stringSpacing);

        // Create SVG
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', width);
        svg.setAttribute('height', height);
        svg.setAttribute('viewBox', `0 0 ${width} ${height}`);

        // Draw fret markers (dots)
        this.FRET_MARKERS.forEach(fret => {
            const x = padding.left + (fret - 0.5) * fretSpacing;
            const isDouble = this.DOUBLE_MARKERS.includes(fret);

            if (isDouble) {
                // Double dot at 12th fret
                const circle1 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                circle1.setAttribute('cx', x);
                circle1.setAttribute('cy', padding.top + 1 * stringSpacing);
                circle1.setAttribute('r', 6);
                circle1.setAttribute('class', 'fret-marker');
                svg.appendChild(circle1);

                const circle2 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                circle2.setAttribute('cx', x);
                circle2.setAttribute('cy', padding.top + 4 * stringSpacing);
                circle2.setAttribute('r', 6);
                circle2.setAttribute('class', 'fret-marker');
                svg.appendChild(circle2);
            } else {
                // Single dot
                const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                circle.setAttribute('cx', x);
                circle.setAttribute('cy', padding.top + 2.5 * stringSpacing);
                circle.setAttribute('r', 6);
                circle.setAttribute('class', 'fret-marker');
                svg.appendChild(circle);
            }
        });

        // Draw nut (0th fret)
        const nut = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        nut.setAttribute('x1', padding.left);
        nut.setAttribute('y1', padding.top);
        nut.setAttribute('x2', padding.left);
        nut.setAttribute('y2', padding.top + 5 * stringSpacing);
        nut.setAttribute('class', 'nut');
        svg.appendChild(nut);

        // Draw frets
        for (let fret = 1; fret <= this.FRET_COUNT; fret++) {
            const x = padding.left + fret * fretSpacing;
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', x);
            line.setAttribute('y1', padding.top);
            line.setAttribute('x2', x);
            line.setAttribute('y2', padding.top + 5 * stringSpacing);
            line.setAttribute('class', 'fret-line');
            svg.appendChild(line);
        }

        // Draw strings (flipped: high e at top, low E at bottom - like tab)
        for (let string = 0; string < 6; string++) {
            const y = padding.top + (5 - string) * stringSpacing;
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', padding.left);
            line.setAttribute('y1', y);
            line.setAttribute('x2', padding.left + this.FRET_COUNT * fretSpacing);
            line.setAttribute('y2', y);
            line.setAttribute('class', `string-line ${string < 2 ? 'thick' : ''}`);
            svg.appendChild(line);

            // String label
            const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            label.setAttribute('x', padding.left - 25);
            label.setAttribute('y', y + 5);
            label.setAttribute('class', 'string-label');
            label.textContent = this.STRING_NAMES[string];
            svg.appendChild(label);
        }

        // Draw fret numbers
        for (let fret = 0; fret <= this.FRET_COUNT; fret++) {
            const x = fret === 0 ? padding.left : padding.left + (fret - 0.5) * fretSpacing;
            const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            label.setAttribute('x', x);
            label.setAttribute('y', height - 15);
            label.setAttribute('class', 'fret-label');
            label.textContent = fret;
            svg.appendChild(label);
        }

        // Store fret circles for later reference
        const fretCircles = [];

        // Draw clickable/highlightable fret positions (flipped to match strings)
        for (let string = 0; string < 6; string++) {
            fretCircles[string] = [];
            for (let fret = 0; fret <= this.FRET_COUNT; fret++) {
                const x = fret === 0 ? padding.left : padding.left + (fret - 0.5) * fretSpacing;
                const y = padding.top + (5 - string) * stringSpacing;

                const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                circle.setAttribute('cx', x);
                circle.setAttribute('cy', y);
                circle.setAttribute('r', 12);
                circle.setAttribute('class', 'fret-spot');
                circle.setAttribute('data-string', string);
                circle.setAttribute('data-fret', fret);

                if (interactive) {
                    circle.classList.add('interactive');
                    circle.addEventListener('click', () => {
                        if (onFretClick) {
                            onFretClick(string, fret, circle);
                        }
                    });
                }

                if (highlightedPosition &&
                    highlightedPosition.string === string &&
                    highlightedPosition.fret === fret) {
                    circle.classList.add('highlighted');
                }

                svg.appendChild(circle);
                fretCircles[string][fret] = circle;
            }
        }

        // Clear and append to container
        container.innerHTML = '';
        container.appendChild(svg);

        return fretCircles;
    }
};
