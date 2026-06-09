import {
  Component,
  inject,
  OnDestroy,
  signal,
  ElementRef,
  viewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { HearingTestService } from './hearing-test.service';

@Component({
  selector: 'hg-hearing-test',
  standalone: true,
  template: `
    <div class="page">
      @if (!hearing.habitData()) {
        <div class="no-habits hg-card">
          <div class="no-habits-icon" aria-hidden="true">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M12 2a5 5 0 00-5 5v2.09a7 7 0 01-1.35 4.15L5 15h14l-.65-1.76A7 7 0 0117 10.09V7a5 5 0 00-5-5z" stroke-linejoin="round"/>
              <path d="M9 18h6a3 3 0 01-6 0z" stroke-linejoin="round"/>
            </svg>
          </div>
          <p class="no-habits-msg">Primero completa el cuestionario de hábitos auditivos.</p>
          <button class="hg-btn-primary" type="button" (click)="goHabits()">
            Ir al cuestionario
          </button>
        </div>
      } @else if (!hearing.isComplete()) {
        <section class="progress-bar-wrap" aria-label="Progreso de la prueba">
          <div class="progress-track">
            <div class="progress-fill" [style.width.%]="progressPct()"></div>
          </div>
          <p class="progress-label">{{ hearing.currentStepIndex() + 1 }} / {{ hearing.steps().length }}</p>
        </section>

        <section class="step-card hg-card">
          <p class="ear-badge" [class.ear-left]="hearing.currentStep().ear === 'left'" [class.ear-right]="hearing.currentStep().ear === 'right'">
            {{ hearing.currentStep().ear === 'left' ? 'Oído izquierdo' : 'Oído derecho' }}
          </p>
          <p class="hz-label">{{ hearing.currentStep().hz }} Hz</p>

          <div class="visualizer" #barHost aria-hidden="true">
            @for (i of bars; track i) {
              <span class="vis-bar"></span>
            }
          </div>

          <button
            type="button"
            class="play-btn"
            (click)="toggle()"
            [class.play-btn--on]="playing()"
            [attr.aria-label]="playing() ? 'Pausar tono' : 'Reproducir tono'"
          >
            @if (playing()) {
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/>
              </svg>
            } @else {
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M5 3l14 9-14 9V3z"/>
              </svg>
            }
          </button>

          <p class="question">¿Escuchas el sonido?</p>

          <div class="vol-row">
            <label class="hg-label" for="vol-range">Volumen</label>
            <input
              id="vol-range"
              type="range"
              class="vol-range"
              min="0.01" max="1" step="0.01"
              [value]="hearing.volume()"
              (input)="onVol($event)"
            />
          </div>

          <div class="cta-row">
            <button
              type="button"
              class="btn-ghost"
              (click)="notHeard()"
            >
              No escucho nada
            </button>
            <button
              type="button"
              class="hg-btn-primary cta-heard"
              (click)="heard()"
            >
              Escuché el sonido
            </button>
          </div>
        </section>
      }
    </div>
  `,
  styleUrl: './hearing-test.component.scss',
})
export class HearingTestComponent implements OnDestroy {
  readonly hearing = inject(HearingTestService);
  private readonly router = inject(Router);

  readonly playing = signal(false);
  readonly bars = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];
  private raf = 0;
  readonly barHost = viewChild<ElementRef<HTMLElement>>('barHost');

  progressPct(): number {
    const total = this.hearing.steps().length;
    if (!total) return 0;
    return Math.round((this.hearing.currentStepIndex() / total) * 100);
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.raf);
    this.hearing.stopTone();
  }

  toggle(): void {
    this.playing.update((p) => !p);
    const step = this.hearing.currentStep();
    if (this.playing() && step) {
      this.hearing.startTone(step.hz, step.ear);
      this.runVisualizer();
    } else {
      cancelAnimationFrame(this.raf);
      this.hearing.stopTone();
      this.resetBars();
    }
  }

  onVol(ev: Event): void {
    const v = Number((ev.target as HTMLInputElement).value);
    this.hearing.setGainLive(v);
  }

  heard(): void {
    this.playing.set(false);
    this.hearing.stopTone();
    this.resetBars();
    this.hearing.recordHeard();
    this.afterStep();
  }

  notHeard(): void {
    this.playing.set(false);
    this.hearing.stopTone();
    this.resetBars();
    this.hearing.recordNotHeard();
    this.afterStep();
  }

  private afterStep(): void {
    if (this.hearing.isComplete()) {
      this.router.navigateByUrl('/app/results/new').catch(() => {});
    }
  }

  goHabits(): void {
    this.router.navigateByUrl('/app/hearing/habits').catch(() => {});
  }

  private resetBars(): void {
    const el = this.barHost()?.nativeElement;
    if (!el) return;
    el.querySelectorAll<HTMLElement>('.vis-bar').forEach((b) => {
      b.style.height = '6px';
    });
  }

  private runVisualizer(): void {
    const tick = () => {
      const el = this.barHost()?.nativeElement;
      const an = this.hearing.captureAnalyser();
      if (!el || !an) return;
      const buf = new Uint8Array(an.frequencyBinCount);
      an.getByteFrequencyData(buf);
      const children = el.querySelectorAll<HTMLElement>('.vis-bar');
      children.forEach((bar, i) => {
        const h = 6 + (buf[i * 4] / 255) * 50;
        bar.style.height = `${h}px`;
      });
      this.raf = requestAnimationFrame(tick);
    };
    cancelAnimationFrame(this.raf);
    this.raf = requestAnimationFrame(tick);
  }
}
