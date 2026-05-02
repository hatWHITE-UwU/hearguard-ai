import { Injectable, signal, computed } from '@angular/core';

export const FREQUENCIES = [250, 500, 1000, 2000, 4000, 8000] as const;
export type Ear = 'left' | 'right';

export interface FrequencyScoreRow {
  hz: number;
  score: number;
  ear: Ear;
}

export interface HabitPayload {
  headphoneHours: number;
  volumeLevel: number;
  noiseExposure: number;
  occupationRisk: number;
  smoking: number;
  occupationLabel?: string;
  headphoneUseLabel?: string;
  volumeLabel?: string;
  noiseWorkLabel?: string;
  substancesLabel?: string;
}

@Injectable({ providedIn: 'root' })
export class HearingTestService {
  readonly habitData = signal<HabitPayload | null>(null);

  private ctx: AudioContext | null = null;
  private osc: OscillatorNode | null = null;
  private gain: GainNode | null = null;
  private pan: StereoPannerNode | null = null;
  private analyser: AnalyserNode | null = null;

  readonly volume = signal(0.3);
  readonly currentStepIndex = signal(0);
  readonly scores = signal<FrequencyScoreRow[]>([]);

  readonly steps = computed(() => {
    const out: { hz: number; ear: Ear }[] = [];
    for (const ear of ['left', 'right'] as Ear[]) {
      for (const hz of FREQUENCIES) {
        out.push({ hz, ear });
      }
    }
    return out;
  });

  readonly currentStep = computed(() => this.steps()[this.currentStepIndex()]);

  readonly isComplete = computed(
    () => this.currentStepIndex() >= this.steps().length,
  );

  /** score = round((1 - gain) * 10) cuando percibe; 0 si no escucha */
  calculateScoreFromGain(g: number): number {
    const clamped = Math.min(1, Math.max(0.01, g));
    return Math.round((1 - clamped) * 10);
  }

  ensureContext(): AudioContext {
    if (!this.ctx) {
      this.ctx = new AudioContext();
    }
    return this.ctx;
  }

  startTone(hz: number, ear: Ear): void {
    this.stopTone();
    const ctx = this.ensureContext();
    this.analyser = ctx.createAnalyser();
    this.analyser.fftSize = 2048;

    this.gain = ctx.createGain();
    this.gain.gain.value = this.volume();

    this.pan = ctx.createStereoPanner();
    this.pan.pan.value = ear === 'left' ? -1 : 1;

    this.osc = ctx.createOscillator();
    this.osc.type = 'sine';
    this.osc.frequency.value = hz;

    this.osc.connect(this.gain);
    this.gain.connect(this.pan);
    this.pan.connect(this.analyser);
    this.analyser.connect(ctx.destination);

    this.osc.start();
  }

  setGainLive(value: number): void {
    this.volume.set(value);
    if (this.gain) {
      this.gain.gain.value = value;
    }
  }

  stopTone(): void {
    try {
      this.osc?.stop();
    } catch {
      /* ignore */
    }
    this.osc?.disconnect();
    this.gain?.disconnect();
    this.pan?.disconnect();
    this.analyser?.disconnect();
    this.osc = null;
    this.gain = null;
    this.pan = null;
    this.analyser = null;
  }

  captureAnalyser(): AnalyserNode | null {
    return this.analyser;
  }

  recordHeard(): void {
    const step = this.currentStep();
    if (!step) return;
    const g = this.volume();
    const score = this.calculateScoreFromGain(g);
    this.scores.update((s) => [...s, { hz: step.hz, ear: step.ear, score }]);
    this.advance();
  }

  recordNotHeard(): void {
    const step = this.currentStep();
    if (!step) return;
    this.scores.update((s) => [...s, { hz: step.hz, ear: step.ear, score: 0 }]);
    this.advance();
  }

  private advance(): void {
    this.stopTone();
    this.currentStepIndex.update((i) => i + 1);
  }

  resetFlow(): void {
    this.stopTone();
    this.currentStepIndex.set(0);
    this.scores.set([]);
  }

  /** Rellena hábitos + puntuaciones para demo / resultados sin servidor. */
  seedDemoSession(overallTarget = 7): void {
    this.stopTone();
    this.habitData.set({
      headphoneHours: 2,
      volumeLevel: 4,
      noiseExposure: 3,
      occupationRisk: 2,
      smoking: 1,
      occupationLabel: 'Oficina',
      headphoneUseLabel: '1–3 h',
      volumeLabel: 'Medio',
      noiseWorkLabel: 'Ocasional',
      substancesLabel: 'No',
    });
    const rows: FrequencyScoreRow[] = [];
    let i = 0;
    for (const ear of ['left', 'right'] as Ear[]) {
      for (const hz of FREQUENCIES) {
        const jitter = (i % 4) - 1.5;
        const score = Math.min(
          10,
          Math.max(0, Math.round(overallTarget + jitter)),
        );
        rows.push({ hz, ear, score });
        i += 1;
      }
    }
    this.scores.set(rows);
    this.currentStepIndex.set(this.steps().length);
  }
}
