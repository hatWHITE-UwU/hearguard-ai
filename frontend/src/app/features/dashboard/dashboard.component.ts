import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { environment } from '../../../environments/environment';
import {
  DEMO_AVG_NOISE_DB,
  DEMO_DASHBOARD_RISK_LABEL,
  DEMO_DASHBOARD_RISK_SCORE,
  demoNoiseChartLabels,
  demoNoiseChartValues,
} from '../../core/data/demo-mocks';
import { AuthService } from '../../core/services/auth.service';
import { EvaluationService } from '../../core/services/evaluation.service';
import { NoiseService } from '../../core/services/noise.service';
import type { ChartData, ChartOptions } from 'chart.js';
import { GaugeComponent } from '../../shared/components/gauge/gauge.component';
import { BaseChartDirective } from 'ng2-charts';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

const CHART_LINE = '#00e5ff';
const CHART_FILL = 'rgba(0, 229, 255, 0.14)';

@Component({
  selector: 'hg-dashboard',
  standalone: true,
  imports: [RouterLink, GaugeComponent, BaseChartDirective],
  template: `
    <div class="page">
      <section class="hero">
        <p class="hi">Hola, {{ greetName() }}</p>
        <p class="muted">Resumen de tu salud auditiva</p>
      </section>

      @if (showDemoBanner) {
        <div class="demo-banner" role="status">
          <span class="demo-tag">Demo</span>
          <p class="demo-copy">
            Datos y gráficos de ejemplo activos.
            <a routerLink="/app/records">Ver registros</a>
            ·
            <a routerLink="/app/hearing/habits" [queryParams]="{ demo: '1' }"
              >Probar flujo</a
            >
          </p>
        </div>
      }

      <section class="section">
        <h2 class="section-title">Nivel de riesgo actual</h2>
        <p class="section-hint">Basado en tu última evaluación</p>
        <div class="hg-card card-elevated risk-card">
          <div class="row">
            <hg-gauge
              [score]="riskScore()"
              [max]="100"
              [label]="riskLabel()"
              [sublabel]="'/ 100'"
            />
          </div>
        </div>
      </section>

      <section class="section">
        <h2 class="section-title">Exposición al ruido hoy</h2>
        <p class="section-hint">Promedio de decibelios del día</p>
        <div class="hg-card card-elevated">
          <p class="big">{{ avgNoise() }} <span class="big-unit">dB</span></p>
          <div class="chart-wrap">
            <canvas
              baseChart
              [data]="noiseChart"
              [options]="noiseOpts"
              type="line"
            ></canvas>
          </div>
        </div>
      </section>

      <section class="section">
        <h2 class="section-title">Acciones rápidas</h2>
        <p class="section-hint">Prueba auditiva, monitoreo e historial</p>
        <div class="quick-list">
          <a class="quick-tile hg-card" routerLink="/app/hearing/habits">
            <span class="quick-icon" aria-hidden="true">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M4 16v2a2 2 0 002 2h2M4 8V6a2 2 0 012-2h2M16 20h2a2 2 0 002-2v-2M16 4h2a2 2 0 012 2v2" stroke-linecap="round" />
                <path d="M8 10c0-2.21 1.79-4 4-4s4 1.79 4 4v4c0 2.21-1.79 4-4 4s-4-1.79-4-4v-4z" stroke-linejoin="round" />
              </svg>
            </span>
            <span class="quick-text">
              <span class="tile-label">Prueba auditiva</span>
              <span class="tile-sub">Cuestionario y hábitos</span>
            </span>
          </a>
          <a class="quick-tile hg-card" routerLink="/app/monitor">
            <span class="quick-icon quick-icon--violet" aria-hidden="true">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M4 12v8h4v-8H4zm6-6v14h4V6h-4zm6 4v10h4V10h-4z" stroke-linejoin="round" />
              </svg>
            </span>
            <span class="quick-text">
              <span class="tile-label">Monitoreo en vivo</span>
              <span class="tile-sub">Nivel de ruido actual</span>
            </span>
          </a>
          <a class="quick-tile hg-card" routerLink="/app/history">
            <span class="quick-icon" aria-hidden="true">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M4 6h16M4 12h10M4 18h16" stroke-linecap="round" />
                <circle cx="18" cy="12" r="2" />
              </svg>
            </span>
            <span class="quick-text">
              <span class="tile-label">Historial</span>
              <span class="tile-sub">Ruido y pruebas</span>
            </span>
          </a>
        </div>
      </section>
    </div>
  `,
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  readonly showDemoBanner = environment.publicDemo || environment.useDemoMocks;

  private applyDemoNoiseChart(): void {
    this.avgNoise.set(DEMO_AVG_NOISE_DB);
    this.noiseChart = {
      labels: demoNoiseChartLabels(),
      datasets: [
        {
          label: 'dB (demo)',
          data: demoNoiseChartValues(),
          borderColor: CHART_LINE,
          backgroundColor: CHART_FILL,
          tension: 0.35,
          fill: true,
        },
      ],
    };
  }

  readonly auth = inject(AuthService);
  private readonly evalService = inject(EvaluationService);
  private readonly noiseService = inject(NoiseService);

  readonly greetName = computed(() => {
    const n = this.auth.currentUser()?.name?.trim();
    if (!n) return 'usuario';
    return n.split(/\s+/)[0] || 'usuario';
  });

  readonly riskScore = signal(20);
  readonly riskLabel = signal('Bajo');
  readonly avgNoise = signal(0);

  noiseChart: ChartData<'line'> = { labels: ['1', '2', '3'], datasets: [] };
  noiseOpts: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { intersect: false, mode: 'index' },
    scales: {
      x: {
        ticks: { color: '#849396', maxRotation: 0 },
        grid: { color: 'rgba(255,255,255,0.06)' },
      },
      y: {
        ticks: { color: '#849396' },
        grid: { color: 'rgba(255,255,255,0.06)' },
      },
    },
    plugins: { legend: { display: false } },
    elements: {
      line: { tension: 0.35 },
      point: { radius: 0, hitRadius: 8, hoverRadius: 4 },
    },
  };

  ngOnInit(): void {
    this.auth.loadUserFromStorage();
    this.evalService.getLatest().subscribe({
        next: (r) => {
          const first = r.data?.items?.[0];
          if (first?.overallScore != null) {
            this.riskScore.set(Math.min(100, (10 - first.overallScore) * 10));
            this.riskLabel.set('Estimación');
          } else if (environment.useDemoMocks) {
            this.riskScore.set(DEMO_DASHBOARD_RISK_SCORE);
            this.riskLabel.set(DEMO_DASHBOARD_RISK_LABEL);
          }
        },
        error: () => {
          if (environment.useDemoMocks) {
            this.riskScore.set(DEMO_DASHBOARD_RISK_SCORE);
            this.riskLabel.set(DEMO_DASHBOARD_RISK_LABEL);
          }
        },
      });
    this.noiseService.getStatsToday().subscribe({
      next: (r) => {
        const d = r.data;
        const avg = d?.avgDb;
        if (avg) this.avgNoise.set(avg);
        if (avg) {
          this.noiseChart = {
            labels: ['muestra'],
            datasets: [
              {
                data: [avg],
                borderColor: CHART_LINE,
                backgroundColor: CHART_FILL,
                tension: 0.35,
                fill: true,
              },
            ],
          };
        } else if (environment.useDemoMocks) {
          this.applyDemoNoiseChart();
        }
      },
      error: () => {
        if (environment.useDemoMocks) this.applyDemoNoiseChart();
      },
    });
  }
}
