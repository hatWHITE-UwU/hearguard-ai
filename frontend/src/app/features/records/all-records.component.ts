import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
  DEMO_UNIFIED_RECORDS,
  type DemoUnifiedRecord,
} from '../../core/data/demo-mocks';
import { RiskBadgeComponent } from '../../shared/components/risk-badge/risk-badge.component';

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
  styles: `
    .page {
      padding: var(--space-md) var(--space-gutter) var(--space-xl);
      max-width: 720px;
      margin: 0 auto;
    }

    .banner {
      display: flex;
      flex-direction: column;
      gap: 6px;
      padding: var(--space-sm) var(--space-gutter);
      margin-bottom: var(--space-md);
      background: rgba(0, 229, 255, 0.08);
      border: 1px solid rgba(0, 229, 255, 0.28);
      border-radius: var(--radius-card);
    }

    .banner-tag {
      font-size: 0.68rem;
      font-weight: 600;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: var(--accent-cyan);
    }

    .banner-copy {
      margin: 0;
      font-size: 0.86rem;
      line-height: 1.45;
      color: var(--text-muted);
    }

    .lede {
      font-size: 0.8rem;
      line-height: 1.45;
      margin: 0 0 var(--space-md);
    }

    .dense-list {
      list-style: none;
      margin: 0;
      padding: 0;
      display: flex;
      flex-direction: column;
      gap: var(--space-sm);
    }

    .row {
      display: flex;
      justify-content: space-between;
      gap: var(--space-gutter);
      align-items: flex-start;
      margin: 0;
      padding: var(--space-sm) var(--space-gutter);
    }

    .row.demo {
      border-left: 3px solid var(--accent-purple);
      padding-left: calc(var(--space-gutter) - 3px);
    }

    .main {
      flex: 1;
      min-width: 0;
    }

    .topline {
      display: flex;
      align-items: center;
      gap: 6px;
      margin-bottom: 4px;
    }

    .type {
      font-size: 0.68rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: var(--text-muted2);
    }

    .pill {
      font-size: 0.62rem;
      font-weight: 600;
      padding: 2px 8px;
      border-radius: var(--radius-pill);
      background: rgba(124, 77, 255, 0.35);
      color: #e8deff;
    }

    .title {
      display: block;
      margin: 0 0 4px;
      font-size: 0.92rem;
      font-weight: 600;
      line-height: 1.3;
      color: var(--text-primary);
    }

    .detail {
      margin: 0 0 6px;
      font-size: 0.82rem;
      line-height: 1.4;
      color: var(--text-muted);
    }

    .when {
      font-size: 0.74rem;
      color: var(--text-muted2);
    }

    .side {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 6px;
      flex-shrink: 0;
    }

    .score {
      font-size: 0.8rem;
      color: var(--accent-cyan);
      font-weight: 600;
    }

    .link {
      font-size: 0.78rem;
      font-weight: 600;
      color: var(--surface-tint);
      text-decoration: none;
    }

    .link:hover {
      text-decoration: underline;
    }

    .link:focus-visible {
      outline: 2px solid var(--accent-cyan);
      outline-offset: 2px;
      border-radius: 4px;
    }

    .empty {
      padding: var(--space-md) 0;
      font-size: 0.88rem;
    }

    .muted {
      color: var(--text-muted);
    }
  `,
})
export class AllRecordsComponent implements OnInit {
  private readonly http = inject(HttpClient);

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
          route:
            d.type === 'evaluation'
              ? ['/app/results', d.id]
              : d.type === 'tip'
                ? ['/app/recommendations']
                : d.type === 'noise'
                  ? ['/app/monitor']
                  : undefined,
        }))
      : [];

    forkJoin({
      noise: this.http
        .get<{ data?: { items?: any[] } }>(
          `${environment.apiUrl}/api/noise?limit=50`,
        )
        .pipe(
          map((r) => r.data?.items ?? []),
          catchError(() => of([] as any[])),
        ),
      evals: this.http
        .get<{ data?: { items?: any[] } }>(
          `${environment.apiUrl}/api/evaluations?limit=50`,
        )
        .pipe(
          map((r) => r.data?.items ?? []),
          catchError(() => of([] as any[])),
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
