# Guitar Practice

A browser-based app to help learn and practice guitar. No dependencies, no build step—just open and play.

**Try it now:** https://joshfeld.github.io/guitar-practice/

## Features

### Practice Aids

#### Metronome
- Adjustable tempo (40-240 BPM)
- Multiple time signatures: 4/4, 3/4, 6/8, 2/4, 5/4, 7/8
- Visual beat indicators with accented downbeat
- Precise timing using Web Audio API

### Interactive Learning

#### Note Identification
- Random fret highlighted on the fretboard
- Type the note name as fast as you can
- Accepts sharps and flats (F# and Gb are both valid)
- Plays the note audio when highlighted
- Configurable number of questions (5, 10, 15, or 20)
- Tracks response time per question
- Results summary with score, average time, and missed notes

#### Fretboard Click
- Given a note name, click all frets on the fretboard that match
- Interactive fretboard with visual feedback
- Configurable number of rounds
- Results summary with perfect rounds and average time

#### Root ID
- Identify the root note in triad shapes by recognizing the pattern
- Triad types: Major, Minor, Diminished (filter by type or practice all)
- Tests shape recognition across all four string sets and inversions
- Note names revealed after answering
- Configurable number of questions
- Results summary with score and average time

### Studying

#### Scales
- View CAGED scale diagrams for any key
- Scale types: Major, Minor, Pentatonic Major, Pentatonic Minor
- Five fretboard diagrams showing E, D, C, A, and G shapes
- Root notes highlighted in gold, scale notes in purple
- Note names displayed on each position

#### Triads
- View triad voicings for any root note
- Triad types: Major, Minor, Diminished, Augmented
- All three inversions (Root Position, 1st, 2nd)
- Four string sets: E-A-D, A-D-G, D-G-B, G-B-e
- Filter by triad type or view all
- Root notes highlighted in gold

#### Chord Progressions
- View diatonic chords for any key and mode
- All seven modes: Major (Ionian), Natural Minor (Aeolian), Dorian, Phrygian, Lydian, Mixolydian, Locrian
- Shows all seven chords with roman numeral notation
- Common progressions for each mode with chord names
- Fretboard diagrams for diminished chord voicings
- Root notes highlighted in gold

## Project Structure

```
guitar-practice/
├── index.html
├── css/
│   └── styles.css
└── js/
    ├── fretboard.js           # Shared fretboard logic and rendering
    ├── metronome.js           # Metronome module
    ├── note-identification.js # Note ID game
    ├── fretboard-click.js     # Fret Click game
    ├── root-id.js             # Root ID game
    ├── scales.js              # CAGED scale diagrams
    ├── triads.js              # Triad voicing diagrams
    └── chord-progressions.js  # Diatonic chord progressions
```

## Browser Support

Works in all modern browsers (Chrome, Firefox, Safari, Edge). Requires JavaScript enabled and Web Audio API support.
