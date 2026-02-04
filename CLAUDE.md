# Guitar Practice App - Development Guide

## Project Overview

A browser-based guitar learning app with eight modules organized into three categories:
- **Practice Aids:** Metronome
- **Interactive Learning:** Note Identification game, Fretboard Click game, Root ID game
- **Studying:** Scale diagrams (CAGED), Triad voicing diagrams, Chord Progressions

Built with vanilla HTML/CSS/JavaScript—no frameworks, no build step, no dependencies.

**Live site:** https://joshfeld.github.io/guitar-practice/

## Architecture Decisions

**Why vanilla JS?** The user explicitly requested minimal bloat. This app is simple enough that frameworks add complexity without benefit. The Web Audio API handles all audio needs natively.

**Why SVG for fretboard?** SVG provides clean scaling, easy interactivity (click events on elements), and simple styling via CSS classes. The fretboard is rendered programmatically in `fretboard.js`.

**Single-page app:** Navigation is handled by showing/hiding `<section>` elements with the `.module` class. No routing library needed.

## Key Files

| File | Purpose |
|------|---------|
| `js/fretboard.js` | **Shared module.** Fretboard data (tuning, notes), SVG rendering, note calculations, audio playback. Used by games and study modules. |
| `js/metronome.js` | Web Audio API metronome with precise scheduling. Uses oscillators for click sounds. |
| `js/note-identification.js` | Game: highlight a fret, user types the note name. Tracks timing and accuracy. |
| `js/fretboard-click.js` | Game: show a note name, user clicks all matching frets. Tracks perfect rounds. |
| `js/root-id.js` | Game: identify root note in triad shapes by pattern recognition. Supports Major, Minor, Dim triads. |
| `js/scales.js` | CAGED scale diagrams. Shows 5 shape positions for Major, Minor, Pentatonic Major/Minor scales. |
| `js/triads.js` | Triad voicing diagrams. Shows all inversions across 4 string sets for Major, Minor, Dim, Aug triads. |
| `js/chord-progressions.js` | Diatonic chord progressions. Shows chords and common progressions for all 7 modes. |
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

- **Module pattern:** Each JS file defines a single object (e.g., `Metronome`, `Scales`) with `init()` called on DOMContentLoaded
- **CSS classes for state:** `.active`, `.hidden`, `.correct`, `.incorrect`, `.highlighted`, `.selected`
- **Enharmonic handling:** Answers accept both sharp and flat names (F# = Gb). See `Fretboard.ENHARMONICS` and `checkAnswer()`
- **Form state on refresh:** Modules should reset dropdowns/controls to default values in `init()` to prevent browser-restored values from causing state mismatch

## Pre-Commit Workflow

**When the user requests a commit (or commit and push), perform the following checks before committing. Allow the user to review all changes before the commit is made.**

1. **Security review:** Check all new/modified code for vulnerabilities:
   - XSS: Ensure user input is never inserted via `innerHTML`. Use `textContent` or DOM methods.
   - No hardcoded secrets or credentials
   - Validate that select/input values come from expected sources

2. **README check:** If the commit adds new features, updates functionality, or changes the project structure:
   - Update `README.md` to document the changes
   - Keep feature descriptions concise and organized by category

3. **User review:** Present the changes and allow the user to review before executing the commit.

## Common Tasks

**Add a new module:**
1. Add HTML section in `index.html` with class `module`
2. Add nav button in appropriate category with `data-module="your-module-id"`
3. Create `js/your-module.js` following existing module pattern
4. Add script tag in `index.html`
5. Add CSS styles in `styles.css` (including responsive styles in media query)

**Modify fretboard appearance:**
- Dimensions: `stringSpacing`, `fretSpacing`, `padding` in `Fretboard.render()` or module-specific render functions
- Colors/styles: CSS classes in `styles.css` (`.fret-spot`, `.string-line`, `.root`, `.scale-note`, etc.)

**Add new scale type:**
- Add entry to `SCALE_INTERVALS` in `scales.js`
- Add display name to `SCALE_NAMES`
- Add button in `index.html` scale-types div

**Add new triad type:**
- Add entry to `TRIAD_TYPES` in `triads.js`
- Add option to `#triad-type` select in `index.html`

**Add new mode to chord progressions:**
- Add entry to `MODES` object in `chord-progressions.js` with intervals, qualities, numerals, and progressions
- Add option to `#progression-scale` select in `index.html`

## Testing

No test framework. Open `index.html` in browser and manually test. For WSL: `explorer.exe index.html`

## Potential Enhancements

If extending this app, consider:
- Chord identification game
- Progress tracking with localStorage
- Custom tuning support (data model already supports it—just change `TUNING` array)
- Replay button for note audio in games
- Seventh chord voicings (extend triads module)
- Arpeggio patterns
