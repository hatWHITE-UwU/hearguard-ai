import { Component, inject, signal, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { DEMO_RECOMMENDATION_BULLETS } from '../../core/data/demo-mocks';
import { EvaluationService } from '../../core/services/evaluation.service';

@Component({
  selector: 'hg-recommendations',
  standalone: true,
  imports: [],
  template: `
    <div class="page">
      <header class="head">
        <button type="button" class="ghost" (click)="router.navigateByUrl('/app/dashboard')">
          ←
        </button>
        <h2>Recomendaciones</h2>
      </header>
      <p class="lead">
        Estimaciones basadas en hábitos y prueba tonal. No sustituyen criterio
        médico.
      </p>
      @if (items().length === 0) {
        <p class="muted">Completa una evaluación para ver consejos.</p>
      } @else {
        <div class="top hg-card">
          <h3>Prioritario</h3>
          <p>{{ items()[0] }}</p>
        </div>
        <h3>Consejos para ti</h3>
        @for (t of items(); track $index) {
          <div class="row hg-card">
            <span>›</span>
            <span>{{ t }}</span>
          </div>
        }
      }
      <button type="button" class="hg-btn-primary" (click)="done()">
        Entendido
      </button>
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
      cursor: pointer;
    }
    .lead {
      color: var(--text-muted);
      font-size: 0.9rem;
    }
    .top h3 {
      margin-top: 0;
      color: var(--accent-cyan);
    }
    .row {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 0.5rem;
      align-items: center;
    }
    button.hg-btn-primary {
      margin-top: 1.25rem;
    }
    .muted {
      color: var(--text-muted);
    }
  `,
})
export class RecommendationsComponent implements OnInit {
  private readonly evalService = inject(EvaluationService);
  readonly router = inject(Router);
  readonly items = signal<string[]>([]);

  ngOnInit(): void {
    this.evalService.getLatest().subscribe({
        next: () => {
          if (environment.useDemoMocks) {
            this.items.set([...DEMO_RECOMMENDATION_BULLETS]);
            return;
          }
          this.items.set([
            'Reduce el volumen de auriculares por debajo del 60%.',
            'Descansa tus oídos cada 45–60 minutos.',
            'Usa protección en ambientes muy ruidosos.',
            'Programa una evaluación anual con audiólogo.',
          ]);
        },
        error: () => {
          this.items.set(
            environment.useDemoMocks
              ? [...DEMO_RECOMMENDATION_BULLETS]
              : [
                  'Consulta con un audiólogo para interpretar tus resultados.',
                ],
          );
        },
      });
  }

  done(): void {
    this.router.navigateByUrl('/app/dashboard');
  }
}
