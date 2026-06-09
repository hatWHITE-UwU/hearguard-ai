import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'hg-splash',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="splash-page">
      <div class="waves-bg" aria-hidden="true">
        @for (i of waveBars; track i) {
          <span class="bar" [style.animation-delay.ms]="i * 120"></span>
        }
      </div>
      <div class="glass-card">
        <div class="logo-ring">
          <div class="logo" aria-hidden="true">
            <svg viewBox="0 0 120 120" width="72" height="72">
              <path
                fill="var(--accent-cyan)"
                d="M60 12c-18 0-32 14-32 32v32c0 10 8 18 18 18h4V44c0-6 5-11 11-11s11 5 11 11v50h4c10 0 18-8 18-18V44c0-18-14-32-32-32z"
              />
            </svg>
          </div>
        </div>
        <h1 class="brand">
          <span class="w">Hear</span><span class="c">Guard</span>
          <span class="ai">AI</span>
        </h1>
        <p class="tagline">Cuida tu audición, protege tu futuro</p>
        <div class="pulse-bar" aria-hidden="true"></div>

        <section class="how-it-works" aria-labelledby="how-title">
          <h2 id="how-title" class="how-title">Cómo funciona</h2>
          <ol class="steps">
            <li>
              <span class="step-lead">Cuenta</span>
              Inicia sesión o regístrate para guardar tu historial y resultados de
              forma privada.
            </li>
            <li>
              <span class="step-lead">Panel</span>
              Ahí ves tu riesgo auditivo, exposición al ruido y accesos a prueba,
              monitoreo, historial y consejos.
            </li>
            <li>
              <span class="step-lead">Prueba y seguimiento</span>
              Completa el cuestionario de audición y tus hábitos; revisa resultados
              y vuelve cuando quieras para comparar.
            </li>
          </ol>
          @if (publicDemo) {
            <p class="demo-note">
              <span class="demo-label">Modo demo</span>
              Puedes entrar al panel con datos de ejemplo sin crear cuenta (enlace
              abajo).
            </p>
          }
        </section>

        @if (hasRealSession()) {
          <a routerLink="/app/dashboard" class="hg-btn-primary link-btn">
            Ir al panel
          </a>
        } @else {
          <div class="actions">
            <a routerLink="/login" class="hg-btn-primary link-btn">
              Iniciar sesión
            </a>
            <a routerLink="/register" class="btn-outline link-btn">
              Registrarse
            </a>
            @if (publicDemo) {
              <a routerLink="/app/dashboard" class="link-demo">Ver demo sin cuenta</a>
            }
          </div>
        }
      </div>
    </div>
  `,
  styleUrl: './splash.component.scss',
})
export class SplashComponent implements OnInit {
  readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  readonly publicDemo = environment.publicDemo;
  readonly waveBars = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

  /** Sesión real = JWT guardado (no el usuario demo sin token). */
  hasRealSession(): boolean {
    return !!this.auth.getAccessToken();
  }

  ngOnInit(): void {
    this.auth.loadUserFromStorage();
    if (this.auth.getAccessToken()) {
      this.router.navigateByUrl('/app/dashboard').catch(() => {});
    }
  }
}
