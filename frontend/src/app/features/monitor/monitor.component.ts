import { Component, inject, OnDestroy, OnInit, computed } from '@angular/core';
import { Router } from '@angular/router';
import { Chart, registerables } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { NoiseMonitorService } from './noise-monitor.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

Chart.register(...registerables);

@Component({
  selector: 'hg-monitor',
  standalone: true,
  imports: [BaseChartDirective],
  template: `
    <div class="page">
      <header class="head">
        <button type="button" class="ghost" (click)="router.navigateByUrl('/app/dashboard')">
          ←
        </button>
        <h2>Monitoreo en vivo</h2>
      </header>
      <p class="source">🎤 Micrófono del dispositivo</p>
      <div class="gauge">
        <span class="db">{{ noise.dbLevel() }}</span>
        <span class="unit">dB (estimado)</span>
        <span class="tag" [style.color]="risk().color">{{ risk().tag }}</span>
      </div>
      <canvas
        baseChart
        [data]="chartData"
        [options]="chartOptions"
        type="line"
      ></canvas>
      <p class="muted small">
        OMS: &lt;70 dB exposición segura / &gt;85 dB riesgo. Valor aproximado
        según micrófono.
      </p>
    </div>
  `,
  styles: `
    .page {
      padding: 1rem;
      max-width: 600px;
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
      cursor: pointer;
    }
    .source {
      color: var(--text-muted);
      font-size: 0.9rem;
    }
    .gauge {
      text-align: center;
      margin: 1rem 0;
    }
    .db {
      font-size: 2.75rem;
      font-weight: 700;
      color: var(--accent-cyan);
    }
    .unit {
      display: block;
      color: var(--text-muted);
      font-size: 0.85rem;
    }
    .tag {
      display: block;
      margin-top: 0.5rem;
      font-weight: 600;
    }
    .muted {
      color: var(--text-muted);
    }
    .small {
      font-size: 0.8rem;
    }
  `,
})
export class MonitorComponent implements OnInit, OnDestroy {
  readonly noise = inject(NoiseMonitorService);
  readonly router = inject(Router);
  private readonly http = inject(HttpClient);

  readonly risk = computed(() =>
    this.noise.classifyRisk(this.noise.dbLevel()),
  );

  chartData: any = { labels: [], datasets: [] };
  chartOptions: any = {
    responsive: true,
    scales: {
      y: { min: 0, max: 120 },
    },
    plugins: {
      annotation: {},
    },
  };

  ngOnInit(): void {
    this.noise.startMic().catch(() => {
      /* permiso denegado */
    });
    this.http
      .get(`${environment.apiUrl}/api/noise/stats/today`)
      .subscribe({ error: () => undefined });
  }

  ngOnDestroy(): void {
    void this.noise.stop();
  }
}
