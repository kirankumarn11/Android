/**
 * Haptic Feedback Service
 * Uses the Web Vibration API (navigator.vibrate) to deliver tactile feedback for UI interactions.
 * Also provides visual/audio micro-signals for platforms without physical vibration hardware.
 */

import { HapticIntensity } from '../types';

export type HapticPatternType =
  | 'light'
  | 'medium'
  | 'heavy'
  | 'selection'
  | 'success'
  | 'celebration'
  | 'warning'
  | 'water_drop';

class HapticService {
  private enabled: boolean = true;
  private intensity: HapticIntensity = 'medium';
  private listeners: ((type: HapticPatternType) => void)[] = [];

  constructor() {
    // Check initial settings if stored
    try {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('hydroflow_settings_v1');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (typeof parsed.hapticFeedbackEnabled === 'boolean') {
            this.enabled = parsed.hapticFeedbackEnabled;
          }
          if (parsed.hapticIntensity) {
            this.intensity = parsed.hapticIntensity;
          }
        }
      }
    } catch {
      // ignore
    }
  }

  public setConfig(enabled: boolean, intensity: HapticIntensity = 'medium') {
    this.enabled = enabled;
    this.intensity = intensity;
  }

  public isSupported(): boolean {
    return typeof navigator !== 'undefined' && 'vibrate' in navigator;
  }

  public onHapticTrigger(listener: (type: HapticPatternType) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify(type: HapticPatternType) {
    this.listeners.forEach((l) => {
      try {
        l(type);
      } catch {
        // ignore
      }
    });
  }

  private scale(ms: number): number {
    switch (this.intensity) {
      case 'light':
        return Math.max(5, Math.round(ms * 0.6));
      case 'heavy':
        return Math.round(ms * 1.6);
      case 'medium':
      default:
        return ms;
    }
  }

  public trigger(type: HapticPatternType = 'medium'): boolean {
    this.notify(type);

    if (!this.enabled) return false;
    if (!this.isSupported()) return false;

    try {
      switch (type) {
        case 'light':
        case 'selection':
          return navigator.vibrate(this.scale(15));

        case 'medium':
          return navigator.vibrate(this.scale(32));

        case 'heavy':
          return navigator.vibrate(this.scale(65));

        case 'water_drop':
          // Micro-flutter: a rapid droplet feel [15ms tap, 30ms gap, 25ms tap]
          return navigator.vibrate([this.scale(15), 30, this.scale(25)]);

        case 'success':
          // Ascending tactile buzz
          return navigator.vibrate([
            this.scale(20),
            40,
            this.scale(35),
            40,
            this.scale(60),
          ]);

        case 'celebration':
          // Goal unlocked fanfare pattern
          return navigator.vibrate([
            this.scale(30),
            50,
            this.scale(40),
            50,
            this.scale(70),
            80,
            this.scale(100),
          ]);

        case 'warning':
          return navigator.vibrate([this.scale(60), 60, this.scale(60)]);

        default:
          return navigator.vibrate(this.scale(30));
      }
    } catch {
      return false;
    }
  }

  // Convenience methods
  public light() {
    return this.trigger('light');
  }

  public selection() {
    return this.trigger('selection');
  }

  public medium() {
    return this.trigger('medium');
  }

  public heavy() {
    return this.trigger('heavy');
  }

  public waterDrop() {
    return this.trigger('water_drop');
  }

  public success() {
    return this.trigger('success');
  }

  public celebration() {
    return this.trigger('celebration');
  }

  public warning() {
    return this.trigger('warning');
  }
}

export const hapticService = new HapticService();
