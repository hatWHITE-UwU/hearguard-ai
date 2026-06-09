import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Chart, registerables } from 'chart.js';
import type { ChartData, ChartOptions } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { environment } from '../../../environments/environment';
import {
  DEMO_EVAL_STATIC,
  evaluationBarChartData,
  averageScoreFromRows,
} from '../../core/data/demo-mocks';
import { HearingTestService } from '../hearing-test/hearing-test.service';
import type { FrequencyScoreRow } from '../hearing-test/hearing-test.service';
import { GaugeComponent } from '../../shared/components/gauge/gauge.component';
import { EvaluationService } from '../../core/services/evaluation.service';

Chart.register(...registerables);

@Component({
  selector: 'hg-results',
  standalone: true,
  imports: [BaseChartDirective, RouterLink, GaugeComponent],
  template: `
    <div class="page">
      <header class="head">
        <button type="button" class="ghost" (click)="router.navigateByUrl('/app/dashboard')">
          ←
        </button>
        <h2>Resultados</h2>
      </header>
      @if (loading()) {
        <p class="muted">Procesando…</p>
      } @else if (error()) {
        <p class="danger">{{ error() }}</p>
      } @else {
        <div class="center">
          <hg-gauge
            [score]="overall() * 10"
            [max]="100"
            [label]="label()"
            [sublabel]="overall().toFixed(1) + ' / 10'"
          />
        </div>
        <h3>Detalle por frecuencia (promedio L/R)</h3>
        <canvas
          baseChart
          [data]="chartData"
          [options]="chartOptions"
          type="bar"
        ></canvas>
        <p class="disclaimer muted">
          Estimación orientativa. Consulta con un audiólogo.
        </p>
        <a routerLink="/app/recommendations" class="hg-btn-primary link"
          >Ver recomendaciones</a
        >
      }
    </div>
  `,
  styleUrl: './results.component.scss',
})
export class ResultsComponent implements OnInit {
  readonly hearing = inject(HearingTestService);
  private readonly evalService = inject(EvaluationService);
  private readonly route = inject(ActivatedRoute);
  readonly router = inject(Router);

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly overall = signal(0);
  readonly label = signal('Resumen');
  readonly riskScore = signal<number | null>(null);

  chartData: ChartData<'bar'> = { labels: [], datasets: [] };
  chartOptions: ChartOptions<'bar'> = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: {
      y: { min: 0, max: 10, ticks: { color: '#8BA3B8' } },
      x: { ticks: { color: '#8BA3B8' } },
    },
  };

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id === 'new') {
      this.saveNew();
    } else if (id && DEMO_EVAL_STATIC[id]) {
      const d = DEMO_EVAL_STATIC[id];
      this.overall.set(d.overall);
      this.label.set(d.label);
      this.chartData = evaluationBarChartData(d.rows);
      this.loading.set(false);
    } else if (id) {
      this.evalService
        .getById(id)
        .subscribe({
          next: (res) => {
            const ev = res.data.evaluation;
            this.overall.set(ev.overallScore ?? 0);
            this.label.set('Evaluación auditiva');
            if (ev.frequencyScores?.length) {
              this.buildChart(ev.frequencyScores);
            }
            this.loading.set(false);
          },
          error: () => {
            this.loading.set(false);
            this.error.set('No se pudo cargar la evaluación.');
          },
        });
    } else {
      this.loading.set(false);
      this.error.set('Ruta no válida.');
    }
  }

  private saveNew(): void {
    const rows = this.hearing.scores();
    const habit = this.hearing.habitData();
    if (!habit || rows.length === 0) {
      this.loading.set(false);
      this.error.set('No hay datos de prueba. Vuelve a la prueba auditiva.');
      return;
    }
    const body = {
      frequencyScores: rows.map((r) => ({
        hz: r.hz,
        score: r.score,
        ear: r.ear,
      })),
      habitData: habit,
    };
    this.evalService
      .create(body)
      .subscribe({
        next: (res) => {
          const ev = res.data.evaluation;
          this.overall.set(ev.overallScore ?? 0);
          this.label.set(
            res.data.riskResult?.riskLevel
              ? 'Riesgo: ' + res.data.riskResult.riskLevel
              : 'Promedio prueba',
          );
          if (res.data.riskResult?.riskScore != null) {
            this.riskScore.set(res.data.riskResult.riskScore);
          }
          this.buildChart(rows);
          this.loading.set(false);
        },
        error: () => {
          if (environment.publicDemo || environment.useDemoMocks) {
            const rows = this.hearing.scores();
            const avg = averageScoreFromRows(rows);
            this.overall.set(Math.round(avg * 10) / 10);
            this.label.set('Modo demo (sin servidor)');
            this.chartData = evaluationBarChartData(rows);
            this.loading.set(false);
            this.error.set(null);
            return;
          }
          this.loading.set(false);
          this.error.set('No se pudo guardar la evaluación.');
        },
      });
  }

  private buildChart(rows: FrequencyScoreRow[]): void {
    this.chartData = evaluationBarChartData(rows);
  }
}
