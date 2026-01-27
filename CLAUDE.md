# Guitar Practice App - Development Guide

## Project Overview

A browser-based guitar learning app with three modules: metronome, note identification game, and fretboard click game. Built with vanilla HTML/CSS/JavaScript—no frameworks, no build step, no dependencies.

## Architecture Decisions

**Why vanilla JS?** The user explicitly requested minimal bloat. This app is simple enough that frameworks add complexity without benefit. The Web Audio API handles all audio needs natively.

**Why SVG for fretboard?** SVG provides clean scaling, easy interactivity (click events on elements), and simple styling via CSS classes. The fretboard is rendered programmatically in `fretboard.js`.

**Single-page app:** Navigation is handled by showing/hiding `<section>` elements with the `.module` class. No routing library needed.

## Key Files

| File | Purpose |
|------|---------|
| `js/fretboard.js` | **Shared module.** Fretboard data (tuning, notes), SVG rendering, note calculations, audio playback. Used by both games. |
| `js/metronome.js` | Web Audio API metronome with precise scheduling. Uses oscillators for click sounds. |
| `js/note-identification.js` | Game: highlight a fret, user types the note name. Tracks timing and accuracy. |
| `js/fretboard-click.js` | Game: show a note name, user clicks all matching frets. Tracks perfect rounds. |
| `css/styles.css` | Dark theme with CSS custom properties. All styling in one file. |

## Fretboard Data Model

```javascript
// String indices 0-5: low E, A, D, G, B, high e
TUNING: [4, 9, 2, 7, 11, 4]  // Semitones from C (E=4, A=9, etc.)

// Fret 0 = open string, frets 1-12 displayed
// Note at position = (TUNING[string] + fret) % 12 → index into NOTES array
```

**Fretboard orientation:** Rendered like guitar tablature—high e string at top, low E at bottom. This is done by inverting the Y coordinate: `y = padding.top + (5 - string) * stringSpacing`

## Audio

- **Metronome:** Simple oscillator clicks at 800Hz (beat) / 1000Hz (downbeat)
- **Note playback:** Plucked string simulation using multiple triangle wave harmonics with exponential decay. Frequencies calculated from open string Hz × 2^(fret/12)

Both use Web Audio API. AudioContext is created lazily on first user interaction (browser autoplay policy).

## Conventions

- **Module pattern:** Each JS file defines a single object (e.g., `Metronome`, `NoteIdentification`) with `init()` called on DOMContentLoaded
- **CSS classes for state:** `.active`, `.hidden`, `.correct`, `.incorrect`, `.highlighted`, `.selected`
- **Enharmonic handling:** Answers accept both sharp and flat names (F# = Gb). See `Fretboard.ENHARMONICS` and `checkAnswer()`

## Common Tasks

**Add a new game module:**
1. Add HTML section in `index.html` with class `module`
2. Add nav button with `data-module="your-module-id"`
3. Create `js/your-module.js` following existing module pattern
4. Add script tag in `index.html`

**Modify fretboard appearance:**
- Dimensions: `stringSpacing`, `fretSpacing`, `padding` in `Fretboard.render()`
- Colors/styles: CSS classes in `styles.css` (`.fret-spot`, `.string-line`, etc.)

**Add new time signature:**
- Add option to `#time-sig` select in `index.html`
- `Metronome` reads value as beats per measure, no JS changes needed

## Testing

No test framework. Open `index.html` in browser and manually test. For WSL: `explorer.exe index.html`

## Potential Enhancements

If extending this app, consider:
- Chord diagrams / chord identification game
- Scale practice mode
- Progress tracking with localStorage
- Custom tuning support (data model already supports it—just change `TUNING` array)
- Replay button for note audio in games
