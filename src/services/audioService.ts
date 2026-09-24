import { SoundType } from '../types';

export interface SoundPreset {
  id: SoundType;
  name: string;
  description: string;
  category: 'water' | 'acoustic' | 'ambient';
}

export const SOUND_PRESETS: SoundPreset[] = [
  { id: 'bubble', name: 'Bubble', description: 'Delicate water bubble pop', category: 'water' },
  { id: 'chime', name: 'Chime', description: 'Ethereal crystal wind chime', category: 'ambient' },
  { id: 'nature', name: 'Nature', description: 'Gentle morning bird tone', category: 'ambient' },
  { id: 'droplet', name: 'Droplet', description: 'Realistic crisp water drop', category: 'water' },
  { id: 'gentle', name: 'Gentle', description: 'Soft two-tone acoustic reminder', category: 'acoustic' },
  { id: 'bell', name: 'Crystal Bell', description: 'Rich harmonic bell resonance', category: 'acoustic' },
  { id: 'marimba', name: 'Marimba', description: 'Warm acoustic wooden tap', category: 'acoustic' },
  { id: 'zen', name: 'Zen Bowl', description: 'Calming singing bowl resonance', category: 'ambient' },
];

// Web Audio API offline sound synthesizer
class AudioService {
  private ctx: AudioContext | null = null;

  private getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  // 1. Water Bubble: subtle rising frequency bloop with soft resonance
  public playBubble() {
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // Primary bubble body
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    // Frequency starts around 360Hz and curves quickly upward to 950Hz
    osc.frequency.setValueAtTime(360, now);
    osc.frequency.exponentialRampToValueAtTime(950, now + 0.07);
    osc.frequency.exponentialRampToValueAtTime(750, now + 0.12);

    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.28, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.16);

    // Subtle micro-bubble splash accompaniment
    const microOsc = ctx.createOscillator();
    const microGain = ctx.createGain();
    const microStart = now + 0.04;

    microOsc.type = 'sine';
    microOsc.frequency.setValueAtTime(620, microStart);
    microOsc.frequency.exponentialRampToValueAtTime(1250, microStart + 0.05);

    microGain.gain.setValueAtTime(0.12, microStart);
    microGain.gain.exponentialRampToValueAtTime(0.001, microStart + 0.09);

    microOsc.connect(microGain);
    microGain.connect(ctx.destination);

    microOsc.start(microStart);
    microOsc.stop(microStart + 0.1);
  }

  // 2. Chime: sparkling crystalline wind chime chord with staggered harmonics
  public playChime() {
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    // Ethereal pentatonic chimes: A5 (880), D6 (1174.66), E6 (1318.51), A6 (1760)
    const tones = [
      { freq: 880, delay: 0, gain: 0.12, decay: 0.8 },
      { freq: 1174.66, delay: 0.04, gain: 0.14, decay: 0.9 },
      { freq: 1318.51, delay: 0.08, gain: 0.11, decay: 0.85 },
      { freq: 1760, delay: 0.12, gain: 0.09, decay: 0.7 },
    ];

    tones.forEach((tone) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const startTime = now + tone.delay;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(tone.freq, startTime);

      gain.gain.setValueAtTime(0.001, startTime);
      gain.gain.linearRampToValueAtTime(tone.gain, startTime + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + tone.decay);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + tone.decay);
    });
  }

  // 3. Nature: gentle morning bird chirp / forest glade tone
  public playNature() {
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // First pleasant bird pip (rising then dip)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(1750, now);
    osc1.frequency.exponentialRampToValueAtTime(2450, now + 0.06);
    osc1.frequency.exponentialRampToValueAtTime(2100, now + 0.11);

    gain1.gain.setValueAtTime(0.001, now);
    gain1.gain.linearRampToValueAtTime(0.18, now + 0.015);
    gain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.14);

    osc1.connect(gain1);
    gain1.connect(ctx.destination);

    osc1.start(now);
    osc1.stop(now + 0.15);

    // Second softer response trill
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    const start2 = now + 0.12;

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(2100, start2);
    osc2.frequency.exponentialRampToValueAtTime(2600, start2 + 0.05);
    osc2.frequency.exponentialRampToValueAtTime(2350, start2 + 0.1);

    gain2.gain.setValueAtTime(0.001, start2);
    gain2.gain.linearRampToValueAtTime(0.15, start2 + 0.015);
    gain2.gain.exponentialRampToValueAtTime(0.0001, start2 + 0.22);

    osc2.connect(gain2);
    gain2.connect(ctx.destination);

    osc2.start(start2);
    osc2.stop(start2 + 0.23);
  }

  // 4. Droplet: realistic water droplet
  public playDroplet() {
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    const now = ctx.currentTime;

    // Pitch bends rapidly from 600Hz up to 1200Hz then falls
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(1200, now + 0.08);
    osc.frequency.exponentialRampToValueAtTime(800, now + 0.15);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.2);
  }

  // 5. Gentle: soft dual chime
  public playGentle() {
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const notes = [523.25, 659.25]; // C5, E5
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const startTime = ctx.currentTime + idx * 0.12;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.2, startTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.5);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.5);
    });
  }

  // 6. Bell: harmonic bell chime
  public playBell() {
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const chord = [440, 554.37, 659.25, 880]; // A major
    chord.forEach((freq) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const now = ctx.currentTime;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.8);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.8);
    });
  }

  // 7. Marimba: warm acoustic wooden tap
  public playMarimba() {
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const tones = [587.33, 880]; // D5, A5
    tones.forEach((freq, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const startTime = ctx.currentTime + index * 0.08;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.25, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.25);
    });
  }

  // 8. Zen Bowl: Tibetan singing bowl / meditative resonance
  public playZen() {
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    // Deep warm fundamental with rich octave and minor third overtone
    const harmonics = [
      { freq: 392, gain: 0.18, decay: 1.2 }, // G4
      { freq: 784, gain: 0.09, decay: 0.9 }, // G5
      { freq: 1176, gain: 0.05, decay: 0.7 }, // D6
    ];

    harmonics.forEach((h) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(h.freq, now);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(h.gain, now + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + h.decay);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + h.decay);
    });
  }

  // Goal achievement celebration fanfare
  public playGoalCelebration() {
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const arpeggio = [440, 554.37, 659.25, 880, 1108.73];
    arpeggio.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const startTime = ctx.currentTime + i * 0.1;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.2, startTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.6);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.6);
    });
  }

  public playSound(type: SoundType) {
    switch (type) {
      case 'bubble':
        this.playBubble();
        break;
      case 'chime':
        this.playChime();
        break;
      case 'nature':
        this.playNature();
        break;
      case 'droplet':
        this.playDroplet();
        break;
      case 'gentle':
        this.playGentle();
        break;
      case 'bell':
        this.playBell();
        break;
      case 'marimba':
        this.playMarimba();
        break;
      case 'zen':
        this.playZen();
        break;
      default:
        this.playBubble();
    }
  }
}

export const audioService = new AudioService();
