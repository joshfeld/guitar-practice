// Metronome module

const Metronome = {
    audioContext: null,
    isRunning: false,
    bpm: 120,
    beatsPerMeasure: 4,
    currentBeat: 0,
    nextNoteTime: 0,
    timerID: null,
    scheduleAheadTime: 0.1, // How far ahead to schedule audio (sec)
    lookahead: 25, // How often to call scheduler (ms)

    init() {
        this.bpmSlider = document.getElementById('bpm-slider');
        this.bpmValue = document.getElementById('bpm-value');
        this.timeSigSelect = document.getElementById('time-sig');
        this.toggleBtn = document.getElementById('metronome-toggle');
        this.beatContainer = document.getElementById('beat-indicators');

        this.bpmSlider.addEventListener('input', () => {
            this.bpm = parseInt(this.bpmSlider.value);
            this.bpmValue.textContent = this.bpm;
        });

        this.timeSigSelect.addEventListener('change', () => {
            this.beatsPerMeasure = parseInt(this.timeSigSelect.value);
            this.createBeatIndicators();
            if (this.isRunning) {
                this.currentBeat = 0;
            }
        });

        this.toggleBtn.addEventListener('click', () => {
            if (this.isRunning) {
                this.stop();
            } else {
                this.start();
            }
        });

        this.createBeatIndicators();
    },

    createBeatIndicators() {
        this.beatContainer.innerHTML = '';
        for (let i = 0; i < this.beatsPerMeasure; i++) {
            const indicator = document.createElement('div');
            indicator.className = 'beat-indicator' + (i === 0 ? ' downbeat' : '');
            this.beatContainer.appendChild(indicator);
        }
        this.indicators = this.beatContainer.querySelectorAll('.beat-indicator');
    },

    start() {
        if (this.isRunning) return;

        // Create audio context on user interaction
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }

        // Resume if suspended
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }

        this.isRunning = true;
        this.currentBeat = 0;
        this.nextNoteTime = this.audioContext.currentTime;
        this.scheduler();

        this.toggleBtn.textContent = 'Stop';
        this.toggleBtn.classList.add('running');
    },

    stop() {
        this.isRunning = false;
        if (this.timerID) {
            clearTimeout(this.timerID);
            this.timerID = null;
        }

        // Clear all indicators
        this.indicators.forEach(ind => ind.classList.remove('active'));

        this.toggleBtn.textContent = 'Start';
        this.toggleBtn.classList.remove('running');
    },

    scheduler() {
        // Schedule notes that need to play before the next interval
        while (this.nextNoteTime < this.audioContext.currentTime + this.scheduleAheadTime) {
            this.scheduleNote(this.currentBeat, this.nextNoteTime);
            this.nextNote();
        }

        if (this.isRunning) {
            this.timerID = setTimeout(() => this.scheduler(), this.lookahead);
        }
    },

    scheduleNote(beat, time) {
        // Create oscillator for click sound
        const osc = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        osc.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        // Downbeat (first beat) is higher pitch and louder
        if (beat === 0) {
            osc.frequency.value = 1000;
            gainNode.gain.value = 0.3;
        } else {
            osc.frequency.value = 800;
            gainNode.gain.value = 0.15;
        }

        osc.start(time);
        osc.stop(time + 0.03); // Short click

        // Schedule visual update
        const delay = (time - this.audioContext.currentTime) * 1000;
        setTimeout(() => {
            this.updateVisual(beat);
        }, Math.max(0, delay));
    },

    updateVisual(beat) {
        if (!this.isRunning) return;

        this.indicators.forEach((ind, i) => {
            if (i === beat) {
                ind.classList.add('active');
            } else {
                ind.classList.remove('active');
            }
        });
    },

    nextNote() {
        // Move to next beat
        const secondsPerBeat = 60.0 / this.bpm;
        this.nextNoteTime += secondsPerBeat;
        this.currentBeat = (this.currentBeat + 1) % this.beatsPerMeasure;
    }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    Metronome.init();
});
