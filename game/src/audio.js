// All sound is synthesized with WebAudio: no audio files, no network.
// Every cue is a tiny envelope over one or two oscillators.
export class SoundEngine {
  constructor() {
    this.context = null;
    this.muted = false;
    this.master = null;
  }

  ensure() {
    if (this.context) {
      if (this.context.state === 'suspended') void this.context.resume();
      return;
    }
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    this.context = new AudioContext();
    this.master = this.context.createGain();
    this.master.gain.value = 0.16;
    this.master.connect(this.context.destination);
  }

  setMuted(muted) {
    this.muted = muted;
    if (this.master) this.master.gain.value = muted ? 0 : 0.16;
  }

  tone(frequency, startAt, duration, type = 'sine', volume = 1) {
    if (!this.context || this.muted) return;
    const now = this.context.currentTime + startAt;
    const osc = this.context.createOscillator();
    const gain = this.context.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, now);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.5 * volume, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    osc.connect(gain);
    gain.connect(this.master);
    osc.start(now);
    osc.stop(now + duration + 0.05);
  }

  // A bright two-note chime when a difference is found.
  found() {
    this.ensure();
    this.tone(880, 0, 0.22, 'sine', 1);
    this.tone(1318.5, 0.09, 0.34, 'sine', 0.9);
    this.tone(1760, 0.18, 0.3, 'triangle', 0.35);
  }

  // A dull thud for a wrong click.
  miss() {
    this.ensure();
    this.tone(160, 0, 0.18, 'sawtooth', 0.5);
    this.tone(110, 0.05, 0.22, 'sawtooth', 0.4);
  }

  // A soft blip when a hint is spent.
  hint() {
    this.ensure();
    this.tone(1046.5, 0, 0.14, 'sine', 0.8);
    this.tone(784, 0.08, 0.2, 'sine', 0.6);
  }

  // A rising arpeggio when a scene is cleared.
  win() {
    this.ensure();
    [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => {
      this.tone(f, i * 0.11, 0.3, 'triangle', 0.9);
    });
    this.tone(1318.5, 0.48, 0.5, 'sine', 0.7);
  }

  // A short tick when the clock is nearly out.
  tick() {
    this.ensure();
    this.tone(1200, 0, 0.06, 'square', 0.25);
  }

  // A low fanfare for finishing the whole hunt.
  fanfare() {
    this.ensure();
    [523.25, 659.25, 783.99, 1046.5, 783.99, 1046.5, 1318.5].forEach((f, i) => {
      this.tone(f, i * 0.13, 0.32, 'triangle', 0.9);
    });
  }
}
