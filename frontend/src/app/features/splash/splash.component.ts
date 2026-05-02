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
  styles: `
    .splash-page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1.5rem;
      position: relative;
      overflow: hidden;
      background: radial-gradient(
        ellipse 120% 80% at 50% 20%,
        rgba(0, 229, 255, 0.08),
        transparent 55%
      ),
      radial-gradient(
        ellipse 80% 60% at 80% 90%,
        rgba(124, 77, 255, 0.12),
        transparent 50%
      ),
      var(--bg-primary);
    }

    .waves-bg {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: flex-end;
      justify-content: center;
      gap: 6px;
      padding-bottom: 15vh;
      pointer-events: none;
      opacity: 0.35;
    }

    .waves-bg .bar {
      width: 8px;
      height: 40px;
      border-radius: 4px;
      background: linear-gradient(
        180deg,
        var(--accent-cyan),
        var(--accent-purple)
      );
      animation: barWave 1.2s ease-in-out infinite;
    }

    @keyframes barWave {
      0%,
      100% {
        transform: scaleY(0.35);
        opacity: 0.5;
      }
      50% {
        transform: scaleY(1.2);
        opacity: 1;
      }
    }

    .how-it-works {
      text-align: left;
      margin-bottom: 1.35rem;
    }

    .how-title {
      margin: 0 0 0.65rem;
      font-size: 0.72rem;
      font-weight: 600;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: var(--text-muted2);
      text-align: center;
    }

    .steps {
      margin: 0;
      padding: 0 0 0 1.2rem;
      font-size: 0.86rem;
      line-height: 1.5;
      color: var(--text-muted);
    }

    .steps li {
      margin-bottom: 0.55rem;
    }

    .steps li:last-child {
      margin-bottom: 0;
    }

    .step-lead {
      display: block;
      font-weight: 600;
      color: var(--accent-cyan);
      font-size: 0.8rem;
      margin-bottom: 0.15rem;
    }

    .demo-note {
      margin: 0.85rem 0 0;
      padding: 0.55rem 0.65rem;
      font-size: 0.8rem;
      line-height: 1.45;
      color: var(--text-muted);
      background: rgba(0, 229, 255, 0.08);
      border: 1px solid rgba(0, 229, 255, 0.2);
      border-radius: 10px;
    }

    .demo-label {
      display: block;
      font-weight: 600;
      color: var(--accent-cyan);
      font-size: 0.75rem;
      margin-bottom: 0.2rem;
    }

    .glass-card {
      position: relative;
      z-index: 1;
      width: 100%;
      max-width: 440px;
      padding: 2rem 1.75rem;
      text-align: center;
      background: rgba(21, 32, 43, 0.72);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1px solid rgba(0, 229, 255, 0.2);
      border-radius: 16px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.35),
        0 0 0 1px rgba(124, 77, 255, 0.08) inset;
    }

    .logo-ring {
      display: flex;
      justify-content: center;
      margin-bottom: 0.5rem;
    }

    .logo {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 96px;
      height: 96px;
      border-radius: 50%;
      background: rgba(0, 229, 255, 0.1);
      border: 2px solid rgba(0, 229, 255, 0.35);
      animation: logoPulse 2.5s ease-in-out infinite;
    }

    @keyframes logoPulse {
      0%,
      100% {
        box-shadow: 0 0 0 0 rgba(0, 229, 255, 0.35);
        transform: scale(1);
      }
      50% {
        box-shadow: 0 0 28px 6px rgba(0, 229, 255, 0.2);
        transform: scale(1.03);
      }
    }

    .brand {
      margin: 0.5rem 0 0.35rem;
      font-size: 1.85rem;
      font-weight: 700;
      letter-spacing: -0.02em;
    }
    .w {
      color: var(--text-primary);
    }
    .c {
      color: var(--accent-cyan);
    }
    .ai {
      color: var(--accent-purple);
      font-weight: 600;
      margin-left: 0.15em;
    }

    .tagline {
      color: var(--text-muted);
      font-size: 0.95rem;
      font-weight: 400;
      margin: 0 0 1.25rem;
      line-height: 1.45;
    }

    .pulse-bar {
      width: 100%;
      height: 4px;
      border-radius: 999px;
      margin-bottom: 1.5rem;
      background: linear-gradient(
        90deg,
        transparent,
        var(--accent-cyan),
        var(--accent-purple),
        transparent
      );
      background-size: 200% 100%;
      animation: shimmer 3s linear infinite;
    }

    @keyframes shimmer {
      0% {
        background-position: 200% 0;
      }
      100% {
        background-position: -200% 0;
      }
    }

    .actions {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .link-btn {
      text-decoration: none;
      width: 100%;
      border-radius: 12px;
    }

    .btn-outline {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      padding: 0.75rem 1rem;
      border: 2px solid var(--accent-purple);
      border-radius: 12px;
      background: transparent;
      color: #fff;
      font-weight: 600;
      cursor: pointer;
      text-decoration: none;
      transition: background 0.2s, color 0.2s;
    }

    .btn-outline:hover {
      background: rgba(124, 77, 255, 0.15);
    }

    .link-demo {
      margin-top: 0.25rem;
      font-size: 0.88rem;
      color: var(--accent-cyan);
      text-decoration: none;
    }

    .link-demo:hover {
      text-decoration: underline;
    }
  `,
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
      void this.router.navigateByUrl('/app/dashboard');
    }
  }
}
