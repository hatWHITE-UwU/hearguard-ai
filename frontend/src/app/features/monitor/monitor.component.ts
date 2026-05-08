import { Component, inject, OnDestroy, OnInit, computed, effect, signal } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Chart, registerables } from 'chart.js';
import type { ChartData, ChartOptions } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { NoiseMonitorService } from './noise-monitor.service';
import { environment } from '../../../environments/environment';

Chart.register(...registerables);

const LINE_COLOR = '#00e5ff';
const FILL_COLOR = 'rgba(0, 229, 255, 0.12)';

@Component({
  selector: 'hg-monitor',
  standalone: true,
  imports: [BaseChartDirective],
  template: `
    <div class="page">
      <section class="hero-card hg-card">
        <p class="source-label">Micrófono del dispositivo</p>
        <div class="db-display">
          <span class="db-value" [style.color]="risk().color">{{ noise.dbLevel() }}</span>
          <span class="db-unit">dB</span>
        </div>
        <span class="risk-tag" [style.color]="risk().color" [style.border-color]="risk().color + '55'">
          {{ risk().tag }}
        </span>
        <p class="oms-note">OMS: &lt;70 dB exposición segura · &gt;85 dB riesgo auditivo</p>
      </section>

      <section class="chart-section hg-card">
        <h3 class="chart-title">Historial en tiempo real</h3>
        <p class="chart-hint">Últimas {{ noise.history().length }} muestras (1 / seg)</p>
        <div class="chart-wrap">
          <canvas baseChart [data]="chartData" [options]="chartOptions" type="line"></canvas>
        </div>
      </section>

      <div class="actions">
        <button type="button" class="hg-btn-primary save-btn" (click)="saveReading()" [disabled]="saving()">
          {{ saving() ? 'Guardando…' : 'Guardar lectura' }}
        </button>
      </div>
    </div>
  `,
  styles: `
    .page {
      padding: var(--space-md) var(--space-gutter) var(--space-xl);
      max-width: 600px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: var(--space-md);
    }

    .hero-card {
      text-align: center;
      padding: var(--space-lg) var(--space-gutter);
    }

    .source-label {
      font-size: 0.72rem;
      font-weight: 600;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: var(--text-muted2);
      margin: 0 0 var(--space-md);
    }

    .db-display {
      display: flex;
      align-items: baseline;
      justify-content: center;
      gap: 0.35rem;
      margin-bottom: var(--space-sm);
    }

    .db-value {
      font-size: 4.5rem;
      font-weight: 700;
      line-height: 1;
      letter-spacing: -0.04em;
      transition: color 0.4s ease;
    }

    .db-unit {
      font-size: 1.25rem;
      font-weight: 500;
      color: var(--text-muted);
      align-self: flex-end;
      padding-bottom: 0.6rem;
    }

    .risk-tag {
      display: inline-block;
      padding: 4px 16px;
      border-radius: var(--radius-pill);
      border: 1px solid;
      font-size: 0.78rem;
      font-weight: 600;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      margin-bottom: var(--space-sm);
      transition: color 0.4s ease, border-color 0.4s ease;
    }

    .oms-note {
      font-size: 0.75rem;
      color: var(--text-muted2);
      margin: 0;
      line-height: 1.5;
    }

    .chart-section {
      padding: var(--space-gutter);
    }

    .chart-title {
      font-size: 0.88rem;
      font-weight: 600;
      color: var(--text-primary);
      margin: 0 0 0.15rem;
    }

    .chart-hint {
      font-size: 0.72rem;
      color: var(--text-muted2);
      margin: 0 0 var(--space-sm);
    }

    .chart-wrap {
      height: 160px;
    }

    .actions {
      display: flex;
      flex-direction: column;
      gap: var(--space-sm);
    }

    .save-btn {
      border-radius: var(--radius-input);
    }

    @media (min-width: 768px) {
      .page { padding: var(--space-lg) var(--space-margin); }
      .db-value { font-size: 5.5rem; }
      .chart-wrap { height: 200px; }
    }
  `,
})
export class MonitorComponent implements OnInit, OnDestroy {
  readonly noise = inject(NoiseMonitorService);
  readonly router = inject(Router);
  private readonly http = inject(HttpClient);

  readonly risk = computed(() => this.noise.classifyRisk(this.noise.dbLevel()));
  readonly saving = signal(false);

  chartData: ChartData<'line'> = { labels: [], datasets: [{ data: [], borderColor: LINE_COLOR, backgroundColor: FILL_COLOR, tension: 0.35, fill: true, pointRadius: 0 }] };
  readonly chartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    animation: false,
    scales: {
      y: { min: 30, max: 120, ticks: { color: '#849396' }, grid: { color: 'rgba(255,255,255,0.06)' } },
      x: { ticks: { display: false }, grid: { display: false } },
    },
    plugins: { legend: { display: false } },
    elements: { line: { tension: 0.35 }, point: { radius: 0, hitRadius: 8, hoverRadius: 4 } },
  };

  constructor() {
    effect(() => {
      const h = this.noise.history();
      this.chartData = {
        labels: h.map((_, i) => String(i)),
        datasets: [{
          data: h.map((p) => p.db),
          borderColor: LINE_COLOR,
          backgroundColor: FILL_COLOR,
          tension: 0.35,
          fill: true,
          pointRadius: 0,
        }],
      };
    });
  }

  ngOnInit(): void {
    void this.noise.startMic().catch((_err: unknown) => undefined);
  }

  ngOnDestroy(): void {
    void this.noise.stop();
  }

  saveReading(): void {
    const db = this.noise.dbLevel();
    if (!db || this.saving()) return;
    this.saving.set(true);
    this.http.post(`${environment.apiUrl}/api/noise`, { dbLevel: db, source: 'app' }).subscribe({
      next: () => { this.saving.set(false); },
      error: () => { this.saving.set(false); },
    });
  }
}
