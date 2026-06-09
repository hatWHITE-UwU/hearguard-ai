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
  styleUrl: './monitor.component.scss',
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
    this.noise.startMic().catch((_err: unknown) => undefined);
  }

  ngOnDestroy(): void {
    this.noise.stop().catch(() => {});
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
