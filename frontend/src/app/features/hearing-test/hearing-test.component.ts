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
      <header class="head">
        <button type="button" class="ghost" (click)="back()">←</button>
        <h2>Prueba auditiva</h2>
      </header>
      @if (!hearing.habitData()) {
        <p class="muted">Primero completa el formulario de hábitos.</p>
        <button class="hg-btn-primary" type="button" (click)="goHabits()">
          Ir a hábitos
        </button>
      } @else if (!hearing.isComplete()) {
        <p class="hz">
          Frecuencia actual:
          <strong>{{ hearing.currentStep().hz }} Hz</strong>
          — {{ hearing.currentStep().ear === 'left' ? 'Izq.' : 'Der.' }}
        </p>
        <div class="bars" #barHost></div>
        <p class="q">¿Escuchas el sonido?</p>
        <p class="muted small">Ajusta el volumen hasta percibirlo</p>
        <div class="controls">
          <button
            type="button"
            class="play"
            (click)="toggle()"
            [class.on]="playing()"
          >
            {{ playing() ? '❚❚' : '▶' }}
          </button>
        </div>
        <label class="hg-label">Volumen (ganancia)</label>
        <input
          type="range"
          min="0.01"
          max="1"
          step="0.01"
          [value]="hearing.volume()"
          (input)="onVol($event)"
        />
        <button
          type="button"
          class="outline hg-btn-primary"
          style="margin-top:1rem;background:transparent;color:var(--accent-cyan);border:1px solid var(--accent-cyan)"
          (click)="notHeard()"
        >
          No escucho nada
        </button>
        <button
          type="button"
          class="hg-btn-primary"
          style="margin-top:0.75rem"
          (click)="heard()"
        >
          Escuché el sonido
        </button>
        <p class="prog">
          {{ hearing.currentStepIndex() + 1 }} / {{ hearing.steps().length }}
        </p>
      }
    </div>
  `,
  styles: `
    .page {
      padding: 1rem;
      max-width: 520px;
      margin: 0 auto;
    }
    .head {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    .ghost {
      background: none;
      border: none;
      color: var(--accent-cyan);
      font-size: 1.25rem;
      cursor: pointer;
    }
    h2 {
      margin: 0;
      font-size: 1.1rem;
    }
    .hz {
      font-size: 1.1rem;
    }
    .bars {
      display: flex;
      align-items: flex-end;
      justify-content: center;
      gap: 4px;
      height: 72px;
      margin: 1rem 0;
    }
    .bar {
      width: 8px;
      border-radius: 4px;
      background: var(--accent-cyan);
      opacity: 0.85;
    }
    .q {
      font-weight: 600;
    }
    .muted {
      color: var(--text-muted);
    }
    .small {
      font-size: 0.85rem;
    }
    .controls {
      display: flex;
      justify-content: center;
      margin: 1rem 0;
    }
    .play {
      width: 56px;
      height: 56px;
      border-radius: 50%;
      border: none;
      background: var(--accent-purple);
      color: #fff;
      font-size: 1.2rem;
      cursor: pointer;
    }
    .play.on {
      opacity: 0.85;
    }
    .prog {
      text-align: center;
      margin-top: 1rem;
      color: var(--text-muted);
    }
  `,
})
export class HearingTestComponent implements OnDestroy {
  readonly hearing = inject(HearingTestService);
  private readonly router = inject(Router);

  readonly playing = signal(false);
  private raf = 0;
  readonly barHost = viewChild<ElementRef<HTMLElement>>('barHost');

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
    }
  }

  onVol(ev: Event): void {
    const v = Number((ev.target as HTMLInputElement).value);
    this.hearing.setGainLive(v);
  }

  heard(): void {
    this.playing.set(false);
    this.hearing.stopTone();
    this.hearing.recordHeard();
    this.afterStep();
  }

  notHeard(): void {
    this.playing.set(false);
    this.hearing.stopTone();
    this.hearing.recordNotHeard();
    this.afterStep();
  }

  private afterStep(): void {
    if (this.hearing.isComplete()) {
      this.router.navigateByUrl('/app/results/new');
    }
  }

  back(): void {
    this.hearing.stopTone();
    this.router.navigateByUrl('/app/hearing/habits');
  }

  goHabits(): void {
    this.router.navigateByUrl('/app/hearing/habits');
  }

  private runVisualizer(): void {
    const tick = () => {
      const el = this.barHost()?.nativeElement;
      const an = this.hearing.captureAnalyser();
      if (!el || !an) return;
      const buf = new Uint8Array(an.frequencyBinCount);
      an.getByteFrequencyData(buf);
      el.innerHTML = '';
      for (let i = 0; i < 15; i++) {
        const h = 8 + (buf[i * 4] / 255) * 56;
        const d = document.createElement('div');
        d.className = 'bar';
        d.style.height = `${h}px`;
        el.appendChild(d);
      }
      this.raf = requestAnimationFrame(tick);
    };
    cancelAnimationFrame(this.raf);
    this.raf = requestAnimationFrame(tick);
  }

}
