/**
 * Quantum Audio Engine
 * Pure Web Audio API hardware speaker synthesizer and PCM WAV voice pulse player.
 * Bypasses browser autoplay restrictions using dynamic PCM WAV data URIs.
 */

function generateEmergencyWavDataUri(): string {
  const sampleRate = 8000;
  const duration = 1.2; // 1.2s sound pulse
  const numSamples = Math.floor(sampleRate * duration);
  const buffer = new Uint8Array(44 + numSamples);

  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) buffer[offset + i] = str.charCodeAt(i);
  };
  const writeUint32 = (offset: number, val: number) => {
    buffer[offset] = val & 0xff;
    buffer[offset + 1] = (val >> 8) & 0xff;
    buffer[offset + 2] = (val >> 16) & 0xff;
    buffer[offset + 3] = (val >> 24) & 0xff;
  };
  const writeUint16 = (offset: number, val: number) => {
    buffer[offset] = val & 0xff;
    buffer[offset + 1] = (val >> 8) & 0xff;
  };

  writeString(0, "RIFF");
  writeUint32(4, 36 + numSamples);
  writeString(8, "WAVE");
  writeString(12, "fmt ");
  writeUint32(16, 16); // Subchunk1Size
  writeUint16(20, 1);  // AudioFormat (PCM)
  writeUint16(22, 1);  // NumChannels (Mono)
  writeUint32(24, sampleRate);
  writeUint32(28, sampleRate); // ByteRate
  writeUint16(32, 1);  // BlockAlign
  writeUint16(34, 8);  // BitsPerSample
  writeString(36, "data");
  writeUint32(40, numSamples);

  // Audio PCM Samples: High-pitched priority dual siren (520Hz -> 1040Hz)
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const freq = 520 + 520 * Math.sin(2 * Math.PI * 3 * t);
    const sample = Math.sin(2 * Math.PI * freq * t);
    buffer[44 + i] = Math.floor(128 + sample * 124);
  }

  let binary = "";
  for (let i = 0; i < buffer.length; i++) {
    binary += String.fromCharCode(buffer[i]);
  }
  return "data:audio/wav;base64," + btoa(binary);
}

class QuantumAudioEngine {
  private ctx: AudioContext | null = null;
  private pcmDataUri: string | null = null;
  private isWarmedUp = false;

  constructor() {
    if (typeof window !== "undefined") {
      const initOnUserGesture = () => {
        this.warmup();
        window.removeEventListener("click", initOnUserGesture);
        window.removeEventListener("touchstart", initOnUserGesture);
        window.removeEventListener("keydown", initOnUserGesture);
      };
      window.addEventListener("click", initOnUserGesture);
      window.addEventListener("touchstart", initOnUserGesture);
      window.addEventListener("keydown", initOnUserGesture);
    }
  }

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
      this.isWarmedUp = true;
    } catch {
      // Ignore warmup errors
    }
  }

  /**
   * Synthesize dual-tone emergency harmonic chime sweep (HTML5 Audio + Web Audio)
   */
  public playEmergencyChime(): void {
    // 1. Play HTML5 Audio PCM Siren Fallback (bypasses Web Audio autoplay suspension)
    try {
      if (!this.pcmDataUri) {
        this.pcmDataUri = generateEmergencyWavDataUri();
      }
      const audio = new Audio(this.pcmDataUri);
      audio.volume = 1.0;
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.warn("[QuantumAudio] HTML5 Audio autoplay fallback blocked:", err);
        });
      }
    } catch (e) {
      // ignore
    }

    // 2. Synthesize via Web Audio API Context
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const now = ctx.currentTime;

      // Pulse 1: 520Hz to 1040Hz
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();

      osc1.type = "sine";
      osc1.frequency.setValueAtTime(520, now);
      osc1.frequency.exponentialRampToValueAtTime(1040, now + 0.35);

      gain1.gain.setValueAtTime(0.05, now);
      gain1.gain.linearRampToValueAtTime(0.5, now + 0.05);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

      osc1.connect(gain1);
      gain1.connect(ctx.destination);

      osc1.start(now);
      osc1.stop(now + 0.45);

      // Pulse 2: 650Hz to 1300Hz with 0.5s delay
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();

      osc2.type = "sine";
      osc2.frequency.setValueAtTime(650, now + 0.5);
      osc2.frequency.exponentialRampToValueAtTime(1300, now + 0.85);

      gain2.gain.setValueAtTime(0.05, now + 0.5);
      gain2.gain.linearRampToValueAtTime(0.55, now + 0.55);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.95);

      osc2.connect(gain2);
      gain2.connect(ctx.destination);

      osc2.start(now + 0.5);
      osc2.stop(now + 0.95);
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
