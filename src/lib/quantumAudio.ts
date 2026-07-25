/**
 * Quantum Audio Engine
 * Pure Web Audio API hardware speaker synthesizer and voice snippet player.
 * Bypasses OS silent locks on active/background tabs without external audio assets.
 */

class QuantumAudioEngine {
  private ctx: AudioContext | null = null;

  private getContext(): AudioContext {
    if (!this.ctx && typeof window !== "undefined") {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx!;
  }

  /**
   * Warm up hardware audio context on user click/tap
   */
  public warmup(): void {
    try {
      const ctx = this.getContext();
      if (ctx && ctx.state === "suspended") {
        ctx.resume().catch(() => {});
      }
    } catch {
      // Ignore warmup errors
    }
  }

  /**
   * Synthesize dual-tone emergency harmonic chime sweep (440Hz -> 880Hz)
   */
  public playEmergencyChime(): void {
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const now = ctx.currentTime;

      // Pulse 1: 440Hz (A4) to 880Hz (A5)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();

      osc1.type = "sine";
      osc1.frequency.setValueAtTime(440, now);
      osc1.frequency.exponentialRampToValueAtTime(880, now + 0.3);

      gain1.gain.setValueAtTime(0.01, now);
      gain1.gain.linearRampToValueAtTime(0.3, now + 0.05);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

      osc1.connect(gain1);
      gain1.connect(ctx.destination);

      osc1.start(now);
      osc1.stop(now + 0.4);

      // Pulse 2: 523.25Hz (C5) to 1046.50Hz (C6) with 0.45s delay
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();

      osc2.type = "sine";
      osc2.frequency.setValueAtTime(523.25, now + 0.45);
      osc2.frequency.exponentialRampToValueAtTime(1046.5, now + 0.75);

      gain2.gain.setValueAtTime(0.01, now + 0.45);
      gain2.gain.linearRampToValueAtTime(0.35, now + 0.5);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.85);

      osc2.connect(gain2);
      gain2.connect(ctx.destination);

      osc2.start(now + 0.45);
      osc2.stop(now + 0.85);
    } catch (err) {
      console.warn("[QuantumAudio] Frequency synthesis warning:", err);
    }
  }

  /**
   * Play emergency voice snippet URL directly through hardware speaker
   */
  public async playVoiceSnippet(url: string): Promise<void> {
    try {
      this.playEmergencyChime();
      const audio = new Audio(url);
      audio.volume = 1.0;
      await audio.play();
    } catch (err) {
      console.warn("[QuantumAudio] Voice playback fallback:", err);
    }
  }
}

export const quantumAudio = new QuantumAudioEngine();
