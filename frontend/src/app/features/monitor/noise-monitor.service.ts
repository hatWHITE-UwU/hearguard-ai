import { Injectable, signal } from '@angular/core';

export interface RiskUi {
  tag: string;
  color: string;
}

@Injectable({ providedIn: 'root' })
export class NoiseMonitorService {
  readonly dbLevel = signal(0);
  readonly history = signal<{ t: number; db: number }[]>([]);
  private stream: MediaStream | null = null;
  private ctx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private timer: ReturnType<typeof setInterval> | null = null;

  classifyRisk(db: number): RiskUi {
    if (db < 55) return { tag: 'Bajo', color: '#22C55E' };
    if (db < 75) return { tag: 'Moderado', color: '#F59E0B' };
    if (db < 95) return { tag: 'Alto', color: '#FF8C00' };
    return { tag: 'Muy Alto', color: '#FF4D4D' };
  }

  async startMic(): Promise<void> {
    await this.stop();
    this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    this.ctx = new AudioContext();
    const src = this.ctx.createMediaStreamSource(this.stream);
    this.analyser = this.ctx.createAnalyser();
    this.analyser.fftSize = 2048;
    src.connect(this.analyser);
    this.timer = setInterval(() => this.sample(), 1000);
  }

  async stop(): Promise<void> {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
    this.analyser?.disconnect();
    this.ctx?.close();
    this.stream?.getTracks().forEach((t) => t.stop());
    this.analyser = null;
    this.ctx = null;
    this.stream = null;
  }

  private sample(): void {
    if (!this.analyser) return;
    const buf = new Float32Array(this.analyser.fftSize);
    this.analyser.getFloatTimeDomainData(buf);
    let sum = 0;
    for (const sample of buf) sum += sample * sample;
    const rms = Math.sqrt(sum / buf.length);
    const db = Math.round(20 * Math.log10(rms + 1e-7) + 94);
    const clamped = Math.max(30, Math.min(120, db));
    this.dbLevel.set(clamped);
    this.history.update((h) => {
      const next = [...h, { t: Date.now(), db: clamped }];
      return next.slice(-30);
    });
  }
}
