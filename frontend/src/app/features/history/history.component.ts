import { DatePipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { environment } from '../../../environments/environment';
import { DEMO_UNIFIED_RECORDS } from '../../core/data/demo-mocks';
import { RiskBadgeComponent } from '../../shared/components/risk-badge/risk-badge.component';
import type { NoiseRecord, EvaluationItem } from '../../shared/models/api.model';
import { EvaluationService } from '../../core/services/evaluation.service';
import { NoiseService } from '../../core/services/noise.service';

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
  styleUrl: './history.component.scss',
})
export class HistoryComponent implements OnInit {
  private readonly noiseService = inject(NoiseService);
  private readonly evalService = inject(EvaluationService);

  readonly tab = signal<'noise' | 'eval' | 'tips'>('noise');
  readonly noise = signal<NoiseRecord[]>([]);
  readonly evals = signal<EvaluationItem[]>([]);

  ngOnInit(): void {
    this.noiseService.getList().subscribe({
        next: (r) => {
          const api = r.data?.items || [];
          if (!environment.useDemoMocks) {
            this.noise.set(api);
            return;
          }
          const demoNoise = DEMO_UNIFIED_RECORDS.filter((d) => d.type === 'noise').map(
            (d) => ({
              _id: d.id,
              dbLevel: Number(/\d+/.exec(d.detail)?.[0]) || 55,
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
                dbLevel: Number(/\d+/.exec(d.detail)?.[0]) || 55,
                riskTag: d.riskTag || 'moderado',
                recordedAt: d.at,
              })),
            );
          }
        },
      });
    this.evalService.getList().subscribe({
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
