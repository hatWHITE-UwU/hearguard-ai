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
  styleUrl: './recommendations.component.scss',
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
