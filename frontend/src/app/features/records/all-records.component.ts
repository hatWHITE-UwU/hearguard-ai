import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
  DEMO_UNIFIED_RECORDS,
  type DemoUnifiedRecord,
} from '../../core/data/demo-mocks';
import type { NoiseRecord, EvaluationItem } from '../../shared/models/api.model';
import { RiskBadgeComponent } from '../../shared/components/risk-badge/risk-badge.component';
import { EvaluationService } from '../../core/services/evaluation.service';
import { NoiseService } from '../../core/services/noise.service';

type SourceTag = 'demo' | 'servidor';

interface Row {
  id: string;
  source: SourceTag;
  type: DemoUnifiedRecord['type'];
  at: string;
  title: string;
  detail: string;
  riskTag?: string;
  score?: number;
  route?: string[];
}

function routeForDemoRecord(d: DemoUnifiedRecord): string[] | undefined {
  switch (d.type) {
    case 'evaluation':
      return ['/app/results', d.id];
    case 'tip':
      return ['/app/recommendations'];
    case 'noise':
      return ['/app/monitor'];
    default:
      return undefined;
  }
}

@Component({
  selector: 'hg-all-records',
  standalone: true,
  imports: [DatePipe, DecimalPipe, RouterLink, RiskBadgeComponent],
  template: `
    <div class="page">
      @if (environment.useDemoMocks) {
        <div class="banner" role="status">
          <span class="banner-tag">Origen</span>
          <p class="banner-copy">
            Incluye <strong>10 registros demo</strong>
            @if (serverCount() > 0) {
              y <strong>{{ serverCount() }}</strong> desde el servidor.
            }
          </p>
        </div>
      }

      <p class="lede muted">
        Más reciente primero. “Demo” son ejemplos cuando el API aún no tiene
        datos.
      </p>

      <ul class="dense-list" role="list">
        @for (r of rows(); track r.id) {
          <li
            class="row hg-card"
            [class.demo]="r.source === 'demo'"
            [attr.data-source]="r.source"
          >
            <div class="main">
              <div class="topline">
                <span class="type">{{ labelType(r.type) }}</span>
                @if (r.source === 'demo') {
                  <span class="pill">Demo</span>
                }
              </div>
              <strong class="title">{{ r.title }}</strong>
              <p class="detail">{{ r.detail }}</p>
              <time class="when">{{ r.at | date : 'medium' }}</time>
            </div>
            <div class="side">
              @if (r.riskTag) {
                <hg-risk-badge [level]="r.riskTag" />
              }
              @if (r.score != null) {
                <span class="score"
                  >Score {{ r.score | number : '1.1-1' }}</span
                >
              }
              @if (r.route) {
                <a [routerLink]="r.route" class="link">Ver</a>
              }
            </div>
          </li>
        } @empty {
          <li class="empty muted">Sin registros.</li>
        }
      </ul>
    </div>
  `,
  styleUrl: './all-records.component.scss',
})
export class AllRecordsComponent implements OnInit {
  private readonly evalService = inject(EvaluationService);
  private readonly noiseService = inject(NoiseService);

  readonly environment = environment;
  readonly rows = signal<Row[]>([]);
  readonly serverCount = computed(
    () => this.rows().filter((r) => r.source === 'servidor').length,
  );

  ngOnInit(): void {
    const demoRows: Row[] = environment.useDemoMocks
      ? DEMO_UNIFIED_RECORDS.map((d) => ({
          id: d.id,
          source: 'demo' as const,
          type: d.type,
          at: d.at,
          title: d.title,
          detail: d.detail,
          riskTag: d.riskTag,
          score: d.score,
          route: routeForDemoRecord(d),
        }))
      : [];

    forkJoin({
      noise: this.noiseService.getList().pipe(
        map((r) => r.data?.items ?? []),
        catchError(() => of([] as NoiseRecord[])),
      ),
      evals: this.evalService.getList().pipe(
        map((r) => r.data?.items ?? []),
        catchError(() => of([] as EvaluationItem[])),
      ),
    }).subscribe(({ noise, evals }) => {
      const fromApi: Row[] = [];

      for (const n of noise) {
        fromApi.push({
          id: `srv-noise-${n._id}`,
          source: 'servidor',
          type: 'noise',
          at: n.recordedAt || new Date().toISOString(),
          title: 'Registro de ruido',
          detail: `${n.dbLevel ?? '—'} dB`,
          riskTag: n.riskTag,
        });
      }

      for (const e of evals) {
        fromApi.push({
          id: `srv-eval-${e._id}`,
          source: 'servidor',
          type: 'evaluation',
          at: e.takenAt || new Date().toISOString(),
          title: 'Evaluación auditiva',
          detail: 'Resultados guardados',
          score: e.overallScore,
          route: ['/app/results', e._id],
        });
      }

      const merged = [...fromApi, ...demoRows].sort(
        (a, b) => new Date(b.at).getTime() - new Date(a.at).getTime(),
      );
      this.rows.set(merged);
    });
  }

  labelType(t: DemoUnifiedRecord['type']): string {
    switch (t) {
      case 'noise':
        return 'Ruido';
      case 'evaluation':
        return 'Evaluación';
      default:
        return 'Consejo';
    }
  }
}
