import { SoundEffect } from "@/types";

class SoundManager {
  private ctx: AudioContext | null = null;
  private muted = false;

  private getContext(): AudioContext {
    if (!this.ctx) {
      this.ctx = new AudioContext();
    }
    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }
    return this.ctx;
  }

  setMuted(muted: boolean) {
    this.muted = muted;
  }

  play(effect: SoundEffect) {
    if (this.muted) return;

    try {
      const ctx = this.getContext();
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      oscillator.connect(gain);
      gain.connect(ctx.destination);

      const now = ctx.currentTime;

      switch (effect) {
        case "success":
          oscillator.type = "sine";
          oscillator.frequency.setValueAtTime(523, now); // C5
          oscillator.frequency.setValueAtTime(659, now + 0.1); // E5
          oscillator.frequency.setValueAtTime(784, now + 0.2); // G5
          gain.gain.setValueAtTime(0.15, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
          oscillator.start(now);
          oscillator.stop(now + 0.4);
          break;

        case "failure":
          oscillator.type = "sawtooth";
          oscillator.frequency.setValueAtTime(200, now);
          oscillator.frequency.exponentialRampToValueAtTime(100, now + 0.3);
          gain.gain.setValueAtTime(0.1, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
          oscillator.start(now);
          oscillator.stop(now + 0.3);
          break;

        case "countdown":
          oscillator.type = "square";
          oscillator.frequency.setValueAtTime(880, now);
          gain.gain.setValueAtTime(0.08, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
          oscillator.start(now);
          oscillator.stop(now + 0.08);
          break;

        case "click":
          oscillator.type = "sine";
          oscillator.frequency.setValueAtTime(1200, now);
          gain.gain.setValueAtTime(0.06, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
          oscillator.start(now);
          oscillator.stop(now + 0.05);
          break;

        case "tension":
          oscillator.type = "sine";
          oscillator.frequency.setValueAtTime(110, now);
          oscillator.frequency.linearRampToValueAtTime(120, now + 2);
          gain.gain.setValueAtTime(0.04, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 2);
          oscillator.start(now);
          oscillator.stop(now + 2);
          break;
      }
    } catch {
      // Audio not available — fail silently
    }
  }
}

export const soundManager = new SoundManager();
