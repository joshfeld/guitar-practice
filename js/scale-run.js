// Scale Run exercise module - full-neck scale diagram with CAGED position bands

const ScaleRun = {
    SCALE_INTERVALS: {
        'major': [0, 2, 4, 5, 7, 9, 11],
        'minor': [0, 2, 3, 5, 7, 8, 10]
    },

    // CAGED shapes - same base positions as the Scales study module
    // colorIndex is stable so colors stay consistent regardless of sort order
    CAGED_SHAPES: [
        { name: 'E Shape', baseStart: 0, fretSpan: 4, colorIndex: 0 },
        { name: 'D Shape', baseStart: 2, fretSpan: 4, colorIndex: 1 },
        { name: 'C Shape', baseStart: 4, fretSpan: 4, colorIndex: 2 },
        { name: 'A Shape', baseStart: 7, fretSpan: 4, colorIndex: 3 },
        { name: 'G Shape', baseStart: 9, fretSpan: 4, colorIndex: 4 },
    ],

    // One distinct color per CAGED shape, chosen to avoid root (amber) and scale-note (indigo)
    POSITION_COLORS: ['#3b82f6', '#8b5cf6', '#10b981', '#f97316', '#ec4899'],

    KEY_NAMES: ['C', 'C#/Db', 'D', 'D#/Eb', 'E', 'F', 'F#/Gb', 'G', 'G#/Ab', 'A', 'A#/Bb', 'B'],
    TUNING: [4, 9, 2, 7, 11, 4], // E, A, D, G, B, E

    currentKey: 0,
    currentScale: 'major',

    init() {
        this.keySelect = document.getElementById('scale-run-key');
        this.scaleNameEl = document.getElementById('scale-run-name');
        this.scaleNotesEl = document.getElementById('scale-run-notes');
        this.diagramContainer = document.getElementById('scale-run-diagram');
        this.legendContainer = document.getElementById('scale-run-legend');
        this.typeBtns = document.querySelectorAll('.scale-run-type-btn');

        // Reset to defaults (prevents browser from restoring stale state)
        this.keySelect.value = this.currentKey;
        this.typeBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.scale === this.currentScale);
        });

        this.keySelect.addEventListener('change', () => {
            this.currentKey = parseInt(this.keySelect.value);
            this.updateDisplay();
        });

        this.typeBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.typeBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentScale = btn.dataset.scale;
                this.updateDisplay();
            });
        });

        this.updateDisplay();
    },

    getNoteIndex(string, fret) {
        return (this.TUNING[string] + fret) % 12;
    },

    getScaleNotes() {
        const intervals = this.SCALE_INTERVALS[this.currentScale];
        return intervals.map(i => (this.currentKey + i) % 12);
    },

    isRoot(noteIndex) {
        return noteIndex === this.currentKey;
    },

    // Calculate each CAGED position's fret range for the current key, sorted low to high
    getPositions() {
        const keyOffset = (this.currentKey - 4 + 12) % 12;
        return this.CAGED_SHAPES.map(shape => {
            let startFret = shape.baseStart + keyOffset;
            if (startFret >= 12) startFret -= 12;
            return {
                name: shape.name,
                startFret,
                endFret: Math.min(startFret + shape.fretSpan, 12),
                color: this.POSITION_COLORS[shape.colorIndex]
            };
        }).sort((a, b) => a.startFret - b.startFret);
    },

    updateDisplay() {
        const keyName = this.KEY_NAMES[this.currentKey].split('/')[0];
        const scaleName = this.currentScale === 'major' ? 'Major' : 'Minor';
        this.scaleNameEl.textContent = `${keyName} ${scaleName}`;

        const scaleNoteIndices = this.getScaleNotes();
        const scaleNoteNames = scaleNoteIndices.map(i => Fretboard.NOTES[i]);
        this.scaleNotesEl.textContent = scaleNoteNames.join(' – ');

        this.renderDiagram();
        this.renderLegend();
    },

    renderLegend() {
        const positions = this.getPositions();
        this.legendContainer.innerHTML = '';
        positions.forEach(pos => {
            const item = document.createElement('div');
            item.className = 'scale-run-legend-item';

            const swatch = document.createElement('span');
            swatch.className = 'scale-run-legend-swatch';
            swatch.style.backgroundColor = pos.color;

            const label = document.createTextNode(
                `${pos.name}  (frets ${pos.startFret}–${pos.endFret})`
            );

            item.appendChild(swatch);
            item.appendChild(label);
            this.legendContainer.appendChild(item);
        });
    },

    renderDiagram() {
        const scaleNotes = this.getScaleNotes();
        const positions = this.getPositions();
        const fretCount = 12;

        const stringSpacing = 28;
        const fretSpacing = 55;
        // Extra top padding to hold position name labels above the fretboard
        const padding = { top: 55, right: 25, bottom: 35, left: 45 };
        const width = padding.left + padding.right + (fretCount * fretSpacing);
        const height = padding.top + padding.bottom + (5 * stringSpacing);

        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', width);
        svg.setAttribute('height', height);
        svg.setAttribute('viewBox', `0 0 ${width} ${height}`);

        // --- CAGED position bands (drawn first so everything else sits on top) ---
        positions.forEach(pos => {
            if (pos.endFret <= pos.startFret) return;
            const x1 = padding.left + pos.startFret * fretSpacing;
            const x2 = padding.left + pos.endFret * fretSpacing;
            const bandH = 5 * stringSpacing;

            const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            rect.setAttribute('x', x1);
            rect.setAttribute('y', padding.top);
            rect.setAttribute('width', x2 - x1);
            rect.setAttribute('height', bandH);
            rect.setAttribute('fill', pos.color);
            rect.setAttribute('fill-opacity', '0.15');
            rect.setAttribute('stroke', pos.color);
            rect.setAttribute('stroke-opacity', '0.3');
            rect.setAttribute('stroke-width', '1');
            rect.setAttribute('rx', '3');
            svg.appendChild(rect);

            // Position name label in the top padding area, centered over the band
            const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            label.setAttribute('x', (x1 + x2) / 2);
            label.setAttribute('y', padding.top - 10);
            label.setAttribute('text-anchor', 'middle');
            label.setAttribute('font-size', '11');
            label.setAttribute('font-weight', '700');
            label.setAttribute('fill', pos.color);
            label.textContent = pos.name;
            svg.appendChild(label);
        });

        // --- Fret position markers (dots between strings) ---
        [3, 5, 7, 9, 12].forEach(fret => {
            const x = padding.left + (fret - 0.5) * fretSpacing;
            if (fret === 12) {
                const c1 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                c1.setAttribute('cx', x);
                c1.setAttribute('cy', padding.top + 1 * stringSpacing);
                c1.setAttribute('r', 5);
                c1.setAttribute('class', 'fret-marker');
                svg.appendChild(c1);

                const c2 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                c2.setAttribute('cx', x);
                c2.setAttribute('cy', padding.top + 4 * stringSpacing);
                c2.setAttribute('r', 5);
                c2.setAttribute('class', 'fret-marker');
                svg.appendChild(c2);
            } else {
                const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                c.setAttribute('cx', x);
                c.setAttribute('cy', padding.top + 2.5 * stringSpacing);
                c.setAttribute('r', 5);
                c.setAttribute('class', 'fret-marker');
                svg.appendChild(c);
            }
        });

        // --- Nut ---
        const nut = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        nut.setAttribute('x1', padding.left);
        nut.setAttribute('y1', padding.top);
        nut.setAttribute('x2', padding.left);
        nut.setAttribute('y2', padding.top + 5 * stringSpacing);
        nut.setAttribute('class', 'nut');
        svg.appendChild(nut);

        // --- Fret lines ---
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

        // --- Strings and string labels (high e at top, low E at bottom) ---
        for (let string = 0; string < 6; string++) {
            const y = padding.top + (5 - string) * stringSpacing;

            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', padding.left);
            line.setAttribute('y1', y);
            line.setAttribute('x2', padding.left + fretCount * fretSpacing);
            line.setAttribute('y2', y);
            line.setAttribute('class', `string-line ${string < 2 ? 'thick' : ''}`);
            svg.appendChild(line);

            const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            label.setAttribute('x', padding.left - 22);
            label.setAttribute('y', y + 4);
            label.setAttribute('class', 'string-label');
            label.textContent = Fretboard.STRING_NAMES[string];
            svg.appendChild(label);
        }

        // --- Fret numbers along the bottom ---
        for (let i = 0; i <= fretCount; i++) {
            const x = i === 0 ? padding.left : padding.left + (i - 0.5) * fretSpacing;
            const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            label.setAttribute('x', x);
            label.setAttribute('y', height - 10);
            label.setAttribute('class', 'fret-label');
            label.textContent = i;
            svg.appendChild(label);
        }

        // --- Scale note dots with note names ---
        for (let string = 0; string < 6; string++) {
            for (let i = 0; i <= fretCount; i++) {
                const noteIndex = this.getNoteIndex(string, i);

                if (scaleNotes.includes(noteIndex)) {
                    const x = i === 0 ? padding.left : padding.left + (i - 0.5) * fretSpacing;
                    const y = padding.top + (5 - string) * stringSpacing;
                    const isRoot = this.isRoot(noteIndex);

                    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                    circle.setAttribute('cx', x);
                    circle.setAttribute('cy', y);
                    circle.setAttribute('r', 11);
                    circle.setAttribute('class', isRoot ? 'fret-spot root' : 'fret-spot scale-note');
                    svg.appendChild(circle);

                    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                    text.setAttribute('x', x);
                    text.setAttribute('y', y + 4);
                    text.setAttribute('text-anchor', 'middle');
                    text.setAttribute('font-size', '10');
                    text.setAttribute('font-weight', '600');
                    text.setAttribute('fill', isRoot ? '#1a1a2e' : '#fff');
                    text.textContent = Fretboard.NOTES[noteIndex];
                    svg.appendChild(text);
                }
            }
        }

        this.diagramContainer.innerHTML = '';
        this.diagramContainer.appendChild(svg);
    }
};

document.addEventListener('DOMContentLoaded', () => {
    ScaleRun.init();
});
