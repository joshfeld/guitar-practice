// Chord Progressions module - Diatonic chords with roman numerals and common progressions

const ChordProgressions = {
    // Note names
    NOTE_NAMES: ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'],

    // Scale/mode definitions with intervals, chord qualities, roman numerals, and common progressions
    MODES: {
        'major': {
            name: 'Major (Ionian)',
            intervals: [0, 2, 4, 5, 7, 9, 11],
            qualities: ['M', 'm', 'm', 'M', 'M', 'm', 'dim'],
            numerals: ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'],
            progressions: [
                { name: 'Classic', chords: [0, 3, 4, 0], display: 'I - IV - V - I' },
                { name: 'Pop', chords: [0, 4, 5, 3], display: 'I - V - vi - IV' },
                { name: '50s', chords: [0, 5, 3, 4], display: 'I - vi - IV - V' },
                { name: 'Jazz ii-V-I', chords: [1, 4, 0], display: 'ii - V - I' },
                { name: 'Pachelbel', chords: [0, 4, 5, 2, 3, 0, 3, 4], display: 'I - V - vi - iii - IV - I - IV - V' }
            ]
        },
        'minor': {
            name: 'Natural Minor (Aeolian)',
            intervals: [0, 2, 3, 5, 7, 8, 10],
            qualities: ['m', 'dim', 'M', 'm', 'm', 'M', 'M'],
            numerals: ['i', 'ii°', 'III', 'iv', 'v', 'VI', 'VII'],
            progressions: [
                { name: 'Andalusian', chords: [0, 6, 5, 4], display: 'i - VII - VI - v' },
                { name: 'Minor Classic', chords: [0, 3, 4, 0], display: 'i - iv - v - i' },
                { name: 'Epic', chords: [0, 5, 2, 6], display: 'i - VI - III - VII' },
                { name: 'Emotional', chords: [0, 3, 6, 5], display: 'i - iv - VII - VI' }
            ]
        },
        'dorian': {
            name: 'Dorian',
            intervals: [0, 2, 3, 5, 7, 9, 10],
            qualities: ['m', 'm', 'M', 'M', 'm', 'dim', 'M'],
            numerals: ['i', 'ii', 'III', 'IV', 'v', 'vi°', 'VII'],
            progressions: [
                { name: 'Dorian Vamp', chords: [0, 3], display: 'i - IV' },
                { name: 'So What', chords: [0, 1, 0], display: 'i - ii - i' },
                { name: 'Funk', chords: [0, 3, 6, 0], display: 'i - IV - VII - i' },
                { name: 'Santana', chords: [0, 6, 3, 0], display: 'i - VII - IV - i' }
            ]
        },
        'phrygian': {
            name: 'Phrygian',
            intervals: [0, 1, 3, 5, 7, 8, 10],
            qualities: ['m', 'M', 'M', 'm', 'dim', 'M', 'm'],
            numerals: ['i', 'II', 'III', 'iv', 'v°', 'VI', 'vii'],
            progressions: [
                { name: 'Phrygian Cadence', chords: [0, 1], display: 'i - II' },
                { name: 'Flamenco', chords: [0, 1, 2, 1], display: 'i - II - III - II' },
                { name: 'Metal', chords: [0, 1, 0, 6], display: 'i - II - i - vii' },
                { name: 'Spanish', chords: [0, 6, 5, 1], display: 'i - vii - VI - II' }
            ]
        },
        'lydian': {
            name: 'Lydian',
            intervals: [0, 2, 4, 6, 7, 9, 11],
            qualities: ['M', 'M', 'm', 'dim', 'M', 'm', 'm'],
            numerals: ['I', 'II', 'iii', '#iv°', 'V', 'vi', 'vii'],
            progressions: [
                { name: 'Lydian Float', chords: [0, 1], display: 'I - II' },
                { name: 'Dreamy', chords: [0, 1, 0, 4], display: 'I - II - I - V' },
                { name: 'Film Score', chords: [0, 1, 6, 0], display: 'I - II - vii - I' },
                { name: 'Ethereal', chords: [0, 5, 1, 0], display: 'I - vi - II - I' }
            ]
        },
        'mixolydian': {
            name: 'Mixolydian',
            intervals: [0, 2, 4, 5, 7, 9, 10],
            qualities: ['M', 'm', 'dim', 'M', 'm', 'm', 'M'],
            numerals: ['I', 'ii', 'iii°', 'IV', 'v', 'vi', 'VII'],
            progressions: [
                { name: 'Rock Mixo', chords: [0, 6, 3], display: 'I - VII - IV' },
                { name: 'Hey Jude', chords: [0, 6, 0, 3], display: 'I - VII - I - IV' },
                { name: 'Sweet Home', chords: [0, 3, 6, 0], display: 'I - IV - VII - I' },
                { name: 'Blues Rock', chords: [0, 3, 0, 6], display: 'I - IV - I - VII' }
            ]
        },
        'locrian': {
            name: 'Locrian',
            intervals: [0, 1, 3, 5, 6, 8, 10],
            qualities: ['dim', 'M', 'm', 'm', 'M', 'M', 'm'],
            numerals: ['i°', 'II', 'iii', 'iv', 'V', 'VI', 'vii'],
            progressions: [
                { name: 'Locrian Resolve', chords: [0, 1], display: 'i° - II' },
                { name: 'Dark Tension', chords: [0, 4, 5, 0], display: 'i° - V - VI - i°' },
                { name: 'Avant-garde', chords: [0, 2, 3, 1], display: 'i° - iii - iv - II' }
            ]
        }
    },

    // Chord type display suffixes
    CHORD_SUFFIXES: {
        'M': '',
        'm': 'm',
        'dim': 'dim'
    },

    // Standard tuning
    TUNING: [4, 9, 2, 7, 11, 4], // E, A, D, G, B, E

    // Common chord voicings (fret positions for each string, -1 = muted)
    CHORD_VOICINGS: {
        'dim': [
            { name: 'E-shape', rootString: 0, shape: [0, -1, 2, 3, 2, -1], rootOffset: 0 },
            { name: 'A-shape', rootString: 1, shape: [-1, 0, 1, 2, 1, -1], rootOffset: 0 },
            { name: 'D-shape', rootString: 2, shape: [-1, -1, 0, 1, 0, 1], rootOffset: 0 }
        ]
    },

    currentKey: 0,
    currentScale: 'major',

    init() {
        this.keySelect = document.getElementById('progression-key');
        this.scaleSelect = document.getElementById('progression-scale');
        this.nameEl = document.getElementById('progression-name');
        this.chordsContainer = document.getElementById('progression-chords');
        this.diagramsContainer = document.getElementById('progression-diagrams');

        // Reset to default state
        this.keySelect.value = this.currentKey;
        this.scaleSelect.value = this.currentScale;

        this.keySelect.addEventListener('change', () => {
            this.currentKey = parseInt(this.keySelect.value);
            this.updateDisplay();
        });

        this.scaleSelect.addEventListener('change', () => {
            this.currentScale = this.scaleSelect.value;
            this.updateDisplay();
        });

        this.updateDisplay();
    },

    getMode() {
        return this.MODES[this.currentScale];
    },

    getChordRoot(degree) {
        const mode = this.getMode();
        const interval = mode.intervals[degree];
        return (this.currentKey + interval) % 12;
    },

    getChordName(degree) {
        const mode = this.getMode();
        const root = this.getChordRoot(degree);
        const quality = mode.qualities[degree];
        return this.NOTE_NAMES[root] + this.CHORD_SUFFIXES[quality];
    },

    needsDiagram(degree) {
        const mode = this.getMode();
        const quality = mode.qualities[degree];
        return quality === 'dim';
    },

    getChordNotes(rootNote, quality) {
        let intervals;
        switch (quality) {
            case 'M': intervals = [0, 4, 7]; break;
            case 'm': intervals = [0, 3, 7]; break;
            case 'dim': intervals = [0, 3, 6]; break;
            default: intervals = [0, 4, 7];
        }
        return intervals.map(i => (rootNote + i) % 12);
    },

    updateDisplay() {
        const mode = this.getMode();
        const keyName = this.NOTE_NAMES[this.currentKey];
        this.nameEl.textContent = `${keyName} ${mode.name}`;

        this.renderChords();
        this.renderProgressions();
        this.renderDiagrams();
    },

    renderChords() {
        const mode = this.getMode();
        this.chordsContainer.innerHTML = '';

        for (let degree = 0; degree < 7; degree++) {
            const chordEl = document.createElement('div');
            chordEl.className = 'progression-chord';
            if (this.needsDiagram(degree)) {
                chordEl.classList.add('has-diagram');
            }

            const numeralEl = document.createElement('div');
            numeralEl.className = 'chord-numeral';
            numeralEl.textContent = mode.numerals[degree];

            const nameEl = document.createElement('div');
            nameEl.className = 'chord-name';
            nameEl.textContent = this.getChordName(degree);

            chordEl.appendChild(numeralEl);
            chordEl.appendChild(nameEl);
            this.chordsContainer.appendChild(chordEl);
        }
    },

    renderProgressions() {
        const mode = this.getMode();

        // Remove existing progressions section if present
        const existing = document.getElementById('common-progressions');
        if (existing) existing.remove();

        const section = document.createElement('div');
        section.id = 'common-progressions';
        section.className = 'common-progressions';

        const header = document.createElement('h3');
        header.className = 'progressions-header';
        header.textContent = 'Common Progressions';
        section.appendChild(header);

        const list = document.createElement('div');
        list.className = 'progressions-list';

        mode.progressions.forEach(prog => {
            const progEl = document.createElement('div');
            progEl.className = 'progression-item';

            const nameEl = document.createElement('span');
            nameEl.className = 'progression-item-name';
            nameEl.textContent = prog.name;

            const chordsEl = document.createElement('span');
            chordsEl.className = 'progression-item-chords';

            // Build chord names from indices
            const chordNames = prog.chords.map(idx => this.getChordName(idx)).join(' - ');
            chordsEl.textContent = chordNames;

            const numeralsEl = document.createElement('span');
            numeralsEl.className = 'progression-item-numerals';
            numeralsEl.textContent = prog.display;

            progEl.appendChild(nameEl);
            progEl.appendChild(chordsEl);
            progEl.appendChild(numeralsEl);
            list.appendChild(progEl);
        });

        section.appendChild(list);

        // Insert after chords container
        this.chordsContainer.parentNode.insertBefore(section, this.diagramsContainer);
    },

    renderDiagrams() {
        const mode = this.getMode();
        this.diagramsContainer.innerHTML = '';

        for (let degree = 0; degree < 7; degree++) {
            if (!this.needsDiagram(degree)) continue;

            const quality = mode.qualities[degree];
            const rootNote = this.getChordRoot(degree);
            const chordName = this.getChordName(degree);
            const numeral = mode.numerals[degree];
            const chordNotes = this.getChordNotes(rootNote, quality);

            const voicings = this.CHORD_VOICINGS[quality] || [];

            const section = document.createElement('div');
            section.className = 'chord-diagram-section';

            const header = document.createElement('div');
            header.className = 'chord-diagram-header';

            const title = document.createElement('div');
            title.className = 'chord-diagram-title';
            title.textContent = `${chordName} (${numeral})`;

            const subtitle = document.createElement('div');
            subtitle.className = 'chord-diagram-subtitle';
            subtitle.textContent = `Notes: ${chordNotes.map(n => this.NOTE_NAMES[n]).join(' - ')}`;

            header.appendChild(title);
            header.appendChild(subtitle);
            section.appendChild(header);

            const voicingsContainer = document.createElement('div');
            voicingsContainer.className = 'triad-voicings';

            voicings.forEach(voicing => {
                const voicingEl = document.createElement('div');
                voicingEl.className = 'triad-voicing';

                const voicingHeader = document.createElement('div');
                voicingHeader.className = 'triad-voicing-header';

                const voicingName = document.createElement('div');
                voicingName.className = 'triad-voicing-name';
                voicingName.textContent = voicing.name;

                voicingHeader.appendChild(voicingName);
                voicingEl.appendChild(voicingHeader);

                const container = document.createElement('div');
                container.className = 'fretboard-container';
                voicingEl.appendChild(container);

                voicingsContainer.appendChild(voicingEl);

                this.renderChordDiagram(container, voicing, rootNote, chordNotes);
            });

            section.appendChild(voicingsContainer);
            this.diagramsContainer.appendChild(section);
        }
    },

    renderChordDiagram(container, voicing, rootNote, chordNotes) {
        const rootString = voicing.rootString;
        const openNote = this.TUNING[rootString];
        const baseFret = (rootNote - openNote + 12) % 12;

        const frets = voicing.shape.map((shapeFret, stringIdx) => {
            if (shapeFret === -1) return -1;
            return baseFret + shapeFret;
        });

        const playedFrets = frets.filter(f => f >= 0);
        const minFret = Math.min(...playedFrets);
        const maxFret = Math.max(...playedFrets);

        let startFret = Math.max(0, minFret - 1);
        let endFret = Math.max(startFret + 4, maxFret + 1);

        if (endFret - startFret < 4) {
            endFret = startFret + 4;
        }

        const fretCount = endFret - startFret;

        const stringSpacing = 20;
        const fretSpacing = 40;
        const padding = { top: 25, right: 15, bottom: 25, left: 35 };
        const width = padding.left + padding.right + (fretCount * fretSpacing);
        const height = padding.top + padding.bottom + (5 * stringSpacing);

        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', width);
        svg.setAttribute('height', height);
        svg.setAttribute('viewBox', `0 0 ${width} ${height}`);

        const nutLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        nutLine.setAttribute('x1', padding.left);
        nutLine.setAttribute('y1', padding.top);
        nutLine.setAttribute('x2', padding.left);
        nutLine.setAttribute('y2', padding.top + 5 * stringSpacing);
        nutLine.setAttribute('class', startFret === 0 ? 'nut' : 'fret-line');
        svg.appendChild(nutLine);

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

        for (let string = 0; string < 6; string++) {
            const y = padding.top + (5 - string) * stringSpacing;
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', padding.left);
            line.setAttribute('y1', y);
            line.setAttribute('x2', padding.left + fretCount * fretSpacing);
            line.setAttribute('y2', y);

            const isMuted = frets[string] === -1;
            line.setAttribute('class', `string-line ${string < 2 ? 'thick' : ''}`);
            if (isMuted) {
                line.setAttribute('opacity', '0.3');
            }
            svg.appendChild(line);

            const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            label.setAttribute('x', padding.left - 18);
            label.setAttribute('y', y + 4);
            label.setAttribute('class', 'string-label');
            label.setAttribute('font-size', '11');
            if (isMuted) {
                label.textContent = 'x';
                label.setAttribute('fill', 'var(--text-secondary)');
            } else {
                label.textContent = Fretboard.STRING_NAMES[string];
            }
            svg.appendChild(label);
        }

        for (let i = 0; i <= fretCount; i++) {
            const fret = startFret + i;
            const x = i === 0 ? padding.left : padding.left + (i - 0.5) * fretSpacing;
            const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            label.setAttribute('x', x);
            label.setAttribute('y', height - 8);
            label.setAttribute('class', 'fret-label');
            label.setAttribute('font-size', '10');
            label.textContent = fret;
            svg.appendChild(label);
        }

        frets.forEach((fret, string) => {
            if (fret === -1) return;

            const fretIndex = fret - startFret;
            const x = fretIndex === 0 ? padding.left : padding.left + (fretIndex - 0.5) * fretSpacing;
            const y = padding.top + (5 - string) * stringSpacing;

            const noteIndex = (this.TUNING[string] + fret) % 12;
            const isRoot = noteIndex === rootNote;

            const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle.setAttribute('cx', x);
            circle.setAttribute('cy', y);
            circle.setAttribute('r', 8);
            circle.setAttribute('class', isRoot ? 'fret-spot chord-root' : 'fret-spot chord-note');
            svg.appendChild(circle);

            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', x);
            text.setAttribute('y', y + 3);
            text.setAttribute('text-anchor', 'middle');
            text.setAttribute('font-size', '8');
            text.setAttribute('font-weight', '600');
            text.setAttribute('fill', isRoot ? '#1a1a2e' : '#fff');
            text.textContent = this.NOTE_NAMES[noteIndex];
            svg.appendChild(text);
        });

        container.appendChild(svg);
    }
};

document.addEventListener('DOMContentLoaded', () => {
    ChordProgressions.init();
});
