// Triads module - Triad diagrams for all inversions and string sets

const Triads = {
    // Triad types with intervals (semitones from root)
    TRIAD_TYPES: [
        { name: 'Major', symbol: '', intervals: [0, 4, 7] },
        { name: 'Minor', symbol: 'm', intervals: [0, 3, 7] },
        { name: 'Diminished', symbol: 'dim', intervals: [0, 3, 6] },
        { name: 'Augmented', symbol: 'aug', intervals: [0, 4, 8] }
    ],

    // String sets (groups of 3 adjacent strings)
    // Each set defines: name, string indices (low to high), open string note indices
    STRING_SETS: [
        { name: 'E-A-D', strings: [0, 1, 2], openNotes: [4, 9, 2] },
        { name: 'A-D-G', strings: [1, 2, 3], openNotes: [9, 2, 7] },
        { name: 'D-G-B', strings: [2, 3, 4], openNotes: [2, 7, 11] },
        { name: 'G-B-e', strings: [3, 4, 5], openNotes: [7, 11, 4] }
    ],

    // Inversion names
    INVERSIONS: ['Root Position', '1st Inversion', '2nd Inversion'],

    // Note names
    NOTE_NAMES: ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'],

    // Standard tuning
    TUNING: [4, 9, 2, 7, 11, 4], // E, A, D, G, B, E

    currentRoot: 0, // C
    currentType: 'all',

    init() {
        this.rootSelect = document.getElementById('triad-root');
        this.typeSelect = document.getElementById('triad-type');
        this.diagramsContainer = document.getElementById('triads-diagrams');

        // Reset to default state
        this.rootSelect.value = this.currentRoot;
        this.typeSelect.value = this.currentType;

        this.rootSelect.addEventListener('change', () => {
            this.currentRoot = parseInt(this.rootSelect.value);
            this.updateDisplay();
        });

        this.typeSelect.addEventListener('change', () => {
            this.currentType = this.typeSelect.value;
            this.updateDisplay();
        });

        this.updateDisplay();
    },

    // Get the fret number for a given note on a given string
    getFretForNote(stringIndex, noteIndex) {
        const openNote = this.TUNING[stringIndex];
        let fret = (noteIndex - openNote + 12) % 12;
        return fret;
    },

    // Calculate triad voicing for a given root, triad type, string set, and inversion
    getTriadVoicing(rootNote, triadType, stringSet, inversion) {
        const intervals = triadType.intervals;

        // Get the three notes of the triad
        const notes = intervals.map(interval => (rootNote + interval) % 12);

        // Reorder notes based on inversion
        // Root position: [root, 3rd, 5th]
        // 1st inversion: [3rd, 5th, root]
        // 2nd inversion: [5th, root, 3rd]
        let orderedNotes;
        switch (inversion) {
            case 0: // Root position
                orderedNotes = [notes[0], notes[1], notes[2]];
                break;
            case 1: // 1st inversion
                orderedNotes = [notes[1], notes[2], notes[0]];
                break;
            case 2: // 2nd inversion
                orderedNotes = [notes[2], notes[0], notes[1]];
                break;
        }

        // Calculate fret for each string
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

        // Normalize frets to be close together (shift octave if needed)
        const minFret = Math.min(...voicing.map(v => v.fret));
        const maxFret = Math.max(...voicing.map(v => v.fret));

        // If spread is too wide, try shifting individual notes
        if (maxFret - minFret > 5) {
            voicing.forEach(v => {
                if (v.fret - minFret > 5) {
                    v.fret -= 12;
                }
            });
        }

        // If any fret is negative, shift everything up by 12
        const newMin = Math.min(...voicing.map(v => v.fret));
        if (newMin < 0) {
            voicing.forEach(v => v.fret += 12);
        }

        return voicing;
    },

    updateDisplay() {
        this.diagramsContainer.innerHTML = '';
        const rootName = this.NOTE_NAMES[this.currentRoot];

        // Filter triad types based on selection
        const typesToShow = this.currentType === 'all'
            ? this.TRIAD_TYPES
            : this.TRIAD_TYPES.filter(t => t.name.toLowerCase() === this.currentType);

        typesToShow.forEach(triadType => {
            const section = document.createElement('div');
            section.className = 'triad-type-section';

            // Header
            const header = document.createElement('div');
            header.className = 'triad-type-header';

            const typeName = document.createElement('div');
            typeName.className = 'triad-type-name';
            typeName.textContent = `${rootName} ${triadType.name}`;

            const typeNotes = document.createElement('div');
            typeNotes.className = 'triad-type-notes';
            const triadNotes = triadType.intervals.map(i =>
                this.NOTE_NAMES[(this.currentRoot + i) % 12]
            );
            typeNotes.textContent = triadNotes.join(' - ');

            header.appendChild(typeName);
            header.appendChild(typeNotes);
            section.appendChild(header);

            // Voicings container
            const voicingsContainer = document.createElement('div');
            voicingsContainer.className = 'triad-voicings';

            // Generate voicings for each string set and inversion
            this.STRING_SETS.forEach(stringSet => {
                this.INVERSIONS.forEach((inversionName, inversionIndex) => {
                    const voicing = this.getTriadVoicing(
                        this.currentRoot,
                        triadType,
                        stringSet,
                        inversionIndex
                    );

                    const voicingEl = document.createElement('div');
                    voicingEl.className = 'triad-voicing';

                    const voicingHeader = document.createElement('div');
                    voicingHeader.className = 'triad-voicing-header';

                    const voicingName = document.createElement('div');
                    voicingName.className = 'triad-voicing-name';
                    voicingName.textContent = inversionName;

                    const voicingStrings = document.createElement('div');
                    voicingStrings.className = 'triad-voicing-strings';
                    voicingStrings.textContent = `Strings: ${stringSet.name}`;

                    voicingHeader.appendChild(voicingName);
                    voicingHeader.appendChild(voicingStrings);
                    voicingEl.appendChild(voicingHeader);

                    const container = document.createElement('div');
                    container.className = 'fretboard-container';
                    voicingEl.appendChild(container);

                    voicingsContainer.appendChild(voicingEl);

                    this.renderTriadDiagram(container, voicing, stringSet);
                });
            });

            section.appendChild(voicingsContainer);
            this.diagramsContainer.appendChild(section);
        });
    },

    renderTriadDiagram(container, voicing, stringSet) {
        // Calculate fret range to display
        const frets = voicing.map(v => v.fret);
        const minFret = Math.min(...frets);
        const maxFret = Math.max(...frets);

        // Show a range of frets that includes all notes plus some context
        let startFret = Math.max(0, minFret - 1);
        let endFret = Math.max(startFret + 4, maxFret + 1);

        // Ensure we show at least 4 frets
        if (endFret - startFret < 4) {
            endFret = startFret + 4;
        }

        const fretCount = endFret - startFret;

        // Dimensions (compact for triads)
        const stringSpacing = 20;
        const fretSpacing = 40;
        const padding = { top: 25, right: 15, bottom: 25, left: 35 };
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

        // Draw all 6 strings (high e at top, low E at bottom)
        for (let string = 0; string < 6; string++) {
            const y = padding.top + (5 - string) * stringSpacing;
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', padding.left);
            line.setAttribute('y1', y);
            line.setAttribute('x2', padding.left + fretCount * fretSpacing);
            line.setAttribute('y2', y);

            // Dim strings not in this voicing
            const isActiveString = stringSet.strings.includes(string);
            line.setAttribute('class', `string-line ${string < 2 ? 'thick' : ''}`);
            if (!isActiveString) {
                line.setAttribute('opacity', '0.3');
            }
            svg.appendChild(line);

            // String label
            const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            label.setAttribute('x', padding.left - 18);
            label.setAttribute('y', y + 4);
            label.setAttribute('class', 'string-label');
            label.setAttribute('font-size', '11');
            if (!isActiveString) {
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
            label.setAttribute('y', height - 8);
            label.setAttribute('class', 'fret-label');
            label.setAttribute('font-size', '10');
            label.textContent = fret;
            svg.appendChild(label);
        }

        // Draw triad notes
        voicing.forEach(note => {
            const fretIndex = note.fret - startFret;
            const x = fretIndex === 0 ? padding.left : padding.left + (fretIndex - 0.5) * fretSpacing;
            const y = padding.top + (5 - note.string) * stringSpacing;

            const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle.setAttribute('cx', x);
            circle.setAttribute('cy', y);
            circle.setAttribute('r', 8);
            circle.setAttribute('class', note.isRoot ? 'fret-spot triad-root' : 'fret-spot triad-note');
            svg.appendChild(circle);

            // Add note name
            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', x);
            text.setAttribute('y', y + 3);
            text.setAttribute('text-anchor', 'middle');
            text.setAttribute('font-size', '8');
            text.setAttribute('font-weight', '600');
            text.setAttribute('fill', note.isRoot ? '#1a1a2e' : '#fff');
            text.textContent = this.NOTE_NAMES[note.noteIndex];
            svg.appendChild(text);
        });

        container.appendChild(svg);
    }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    Triads.init();
});
