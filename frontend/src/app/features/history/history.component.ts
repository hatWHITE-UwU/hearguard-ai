import { DatePipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { environment } from '../../../environments/environment';
import { DEMO_UNIFIED_RECORDS } from '../../core/data/demo-mocks';
import { RiskBadgeComponent } from '../../shared/components/risk-badge/risk-badge.component';
import type { ApiEnvelope } from '../../shared/models/auth.model';
import type { NoiseRecord, EvaluationItem, PaginatedList } from '../../shared/models/api.model';

@Component({
  selector: 'hg-history',
  standalone: true,
  imports: [RouterLink, RiskBadgeComponent, DatePipe],
  template: `
    <div class="page">
      <p class="intro muted">
        Filtra por tipo. Desde aquí puedes
        <a routerLink="/app/records">ver todos los registros unificados</a>.
      </p>

      <div
        class="tabs"
        role="tablist"
        aria-label="Tipo de historial"
      >
        <button
          type="button"
          role="tab"
          [attr.aria-selected]="tab() === 'noise'"
          [class.on]="tab() === 'noise'"
          (click)="tab.set('noise')"
        >
          Ruido
        </button>
        <button
          type="button"
          role="tab"
          [attr.aria-selected]="tab() === 'eval'"
          [class.on]="tab() === 'eval'"
          (click)="tab.set('eval')"
        >
          Pruebas
        </button>
        <button
          type="button"
          role="tab"
          [attr.aria-selected]="tab() === 'tips'"
          [class.on]="tab() === 'tips'"
          (click)="tab.set('tips')"
        >
          Recomendaciones
        </button>
      </div>

      @if (tab() === 'noise') {
        <ul class="dense-list" role="list">
          @for (n of noise(); track n._id) {
            <li class="list-item hg-card">
              <div class="item-main">
                <time class="item-time">{{ n.recordedAt | date : 'short' }}</time>
                <span class="item-metric">{{ n.dbLevel }} dB</span>
              </div>
              <hg-risk-badge [level]="n.riskTag" />
            </li>
          } @empty {
            <li class="empty muted">Sin registros de ruido.</li>
          }
        </ul>
      } @else if (tab() === 'eval') {
        <ul class="dense-list" role="list">
          @for (e of evals(); track e._id) {
            <li>
              <a
                class="list-item hg-card link"
                [routerLink]="['/app/results', e._id]"
              >
                <div class="item-main">
                  <time class="item-time">{{ e.takenAt | date : 'short' }}</time>
                  <span class="item-metric"
                    >Score {{ e.overallScore ?? '—' }}</span
                  >
                </div>
                <span class="chev" aria-hidden="true"></span>
              </a>
            </li>
          } @empty {
            <li class="empty muted">Sin evaluaciones.</li>
          }
        </ul>
      } @else {
        <p class="muted hint">
          Abre
          <a routerLink="/app/recommendations">Recomendaciones</a>
          en el menú inferior para ver la lista completa de consejos.
        </p>
      }
    </div>
  `,
  styles: `
    .page {
      padding: var(--space-md) var(--space-gutter) var(--space-xl);
    }

    .intro {
      font-size: 0.82rem;
      line-height: 1.45;
      margin: 0 0 var(--space-md);
    }

    .intro a {
      color: var(--surface-tint);
      font-weight: 500;
    }

    .tabs {
      display: flex;
      gap: 6px;
      margin-bottom: var(--space-md);
      padding: 4px;
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius-card);
    }

    .tabs button {
      flex: 1;
      padding: 8px 6px;
      border: none;
      border-radius: 10px;
      background: transparent;
      color: var(--text-muted);
      font-size: 0.78rem;
      font-weight: 500;
      font-family: inherit;
      cursor: pointer;
      transition:
        background 0.15s ease,
        color 0.15s ease;
    }

    .tabs button:focus-visible {
      outline: 2px solid var(--accent-cyan);
      outline-offset: 1px;
    }

    .tabs button.on {
      color: var(--text-primary);
      background: rgba(0, 229, 255, 0.12);
      box-shadow: 0 0 0 1px rgba(0, 229, 255, 0.25);
    }

    .dense-list {
      list-style: none;
      margin: 0;
      padding: 0;
      display: flex;
      flex-direction: column;
      gap: var(--space-sm);
    }

    .list-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--space-sm);
      margin: 0;
      padding: 10px var(--space-gutter);
      min-height: 52px;
    }

    .list-item.link {
      text-decoration: none;
      color: inherit;
    }

    .list-item.link:hover {
      border-color: rgba(0, 229, 255, 0.3);
      background: rgba(0, 229, 255, 0.04);
    }

    .list-item.link:focus-visible {
      outline: 2px solid var(--accent-cyan);
      outline-offset: 2px;
    }

    .item-main {
      display: flex;
      flex-direction: column;
      gap: 2px;
      min-width: 0;
    }

    .item-time {
      font-size: 0.72rem;
      font-weight: 500;
      color: var(--text-muted2);
    }

    .item-metric {
      font-size: 0.9rem;
      font-weight: 600;
      color: var(--text-primary);
    }

    .chev {
      width: 8px;
      height: 8px;
      border-right: 2px solid var(--text-muted);
      border-bottom: 2px solid var(--text-muted);
      transform: rotate(-45deg);
      flex-shrink: 0;
      opacity: 0.7;
    }

    .empty {
      padding: var(--space-md) 0;
      font-size: 0.88rem;
    }

    .hint {
      font-size: 0.88rem;
      line-height: 1.5;
      margin: 0;
    }

    .hint a {
      color: var(--surface-tint);
    }

    .muted {
      color: var(--text-muted);
    }
  `,
})
export class HistoryComponent implements OnInit {
  private readonly http = inject(HttpClient);

  readonly tab = signal<'noise' | 'eval' | 'tips'>('noise');
  readonly noise = signal<NoiseRecord[]>([]);
  readonly evals = signal<EvaluationItem[]>([]);

  ngOnInit(): void {
    this.http
      .get<ApiEnvelope<PaginatedList<NoiseRecord>>>(`${environment.apiUrl}/api/noise?limit=50`)
      .subscribe({
        next: (r) => {
          const api = r.data?.items || [];
          if (!environment.useDemoMocks) {
            this.noise.set(api);
            return;
          }
          const demoNoise = DEMO_UNIFIED_RECORDS.filter((d) => d.type === 'noise').map(
            (d) => ({
              _id: d.id,
              dbLevel: Number(d.detail.match(/\d+/)?.[0]) || 55,
              riskTag: d.riskTag || 'moderado',
              recordedAt: d.at,
            }),
          );
          this.noise.set([...api, ...demoNoise]);
        },
        error: () => {
          if (environment.useDemoMocks) {
            this.noise.set(
              DEMO_UNIFIED_RECORDS.filter((d) => d.type === 'noise').map((d) => ({
                _id: d.id,
                dbLevel: Number(d.detail.match(/\d+/)?.[0]) || 55,
                riskTag: d.riskTag || 'moderado',
                recordedAt: d.at,
              })),
            );
          }
        },
      });
    this.http
      .get<ApiEnvelope<PaginatedList<EvaluationItem>>>(`${environment.apiUrl}/api/evaluations?limit=50`)
      .subscribe({
        next: (r) => {
          const api = r.data?.items || [];
          if (!environment.useDemoMocks) {
            this.evals.set(api);
            return;
          }
          const demoEval = DEMO_UNIFIED_RECORDS.filter(
            (d) => d.type === 'evaluation',
          ).map((d) => ({
            _id: d.id,
            overallScore: d.score ?? 7,
            takenAt: d.at,
            status: 'demo',
          }));
          this.evals.set([...api, ...demoEval]);
        },
        error: () => {
          if (environment.useDemoMocks) {
            this.evals.set(
              DEMO_UNIFIED_RECORDS.filter((d) => d.type === 'evaluation').map(
                (d) => ({
                  _id: d.id,
                  overallScore: d.score ?? 7,
                  takenAt: d.at,
                  status: 'demo',
                }),
              ),
            );
          }
        },
      });
  }
}
