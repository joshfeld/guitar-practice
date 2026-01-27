# Guitar Practice

A browser-based app to help learn and practice guitar. No dependencies, no build step—just open and play.

## Features

### Metronome
- Adjustable tempo (40-240 BPM)
- Multiple time signatures: 4/4, 3/4, 6/8, 2/4, 5/4, 7/8
- Visual beat indicators with accented downbeat
- Precise timing using Web Audio API

### Note Identification
- Random fret highlighted on the fretboard
- Type the note name as fast as you can
- Accepts sharps and flats (F# and Gb are both valid)
- Configurable number of questions (5, 10, 15, or 20)
- Tracks response time per question
- Results summary with score, average time, and missed notes

### Fretboard Click
- Given a note name, click all frets on the fretboard that match
- Interactive fretboard with visual feedback
- Configurable number of rounds
- Results summary with perfect rounds and average time

## How to Run

Open `index.html` in any modern web browser.

**From WSL:**
```bash
explorer.exe index.html
```

**From Linux:**
```bash
xdg-open index.html
```

**From macOS:**
```bash
open index.html
```

**From Windows:**
```bash
start index.html
```

Or simply double-click `index.html` in your file manager.

## Project Structure

```
guitar-practice/
├── index.html          # Main app
├── css/
│   └── styles.css      # Styling
└── js/
    ├── fretboard.js    # Shared fretboard logic and rendering
    ├── metronome.js    # Metronome module
    ├── note-identification.js
    └── fretboard-click.js
```

## Browser Support

Works in all modern browsers (Chrome, Firefox, Safari, Edge). Requires JavaScript enabled and Web Audio API support.
