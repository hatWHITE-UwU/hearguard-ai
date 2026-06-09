import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, OnInit, signal } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'hg-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="login-page">
      <div class="waves-bg" aria-hidden="true">
        @for (i of waveBars; track i) {
          <span class="bar" [style.animation-delay.ms]="i * 120"></span>
        }
      </div>

      <div class="glass-card">
        <a routerLink="/" class="link-back">← Volver al inicio</a>

        <div class="brand-row" aria-hidden="true">
          <div class="logo-mini">
            <svg viewBox="0 0 120 120" width="40" height="40">
              <path
                fill="var(--accent-cyan)"
                d="M60 12c-18 0-32 14-32 32v32c0 10 8 18 18 18h4V44c0-6 5-11 11-11s11 5 11 11v50h4c10 0 18-8 18-18V44c0-18-14-32-32-32z"
              />
            </svg>
          </div>
          <span class="brand-text"
            ><span class="w">Hear</span><span class="c">Guard</span
            ><span class="ai">AI</span></span
          >
        </div>

        <h1 class="title">¡Bienvenido!</h1>
        <p id="login-desc" class="subtitle">
          Inicia sesión para continuar en HearGuard AI.
        </p>

        <form
          [formGroup]="form"
          (ngSubmit)="submit()"
          class="form"
          aria-describedby="login-desc"
        >
          <div class="field">
            <label class="hg-label" for="login-email">Correo electrónico</label>
            <input
              id="login-email"
              class="hg-input field-input"
              type="email"
              formControlName="email"
              autocomplete="email"
              [attr.aria-invalid]="emailInvalid()"
              [attr.aria-describedby]="emailDescribedBy()"
            />
            @if (form.controls.email.touched && form.controls.email.errors?.['required']) {
              <p id="login-email-err" class="field-error" role="alert">
                Introduce tu correo.
              </p>
            }
            @if (
              form.controls.email.touched &&
              form.controls.email.value &&
              form.controls.email.errors?.['email']
            ) {
              <p id="login-email-format" class="field-error" role="alert">
                Introduce un correo válido (ejemplo&#64;correo.com).
              </p>
            }
          </div>

          <div class="field">
            <div class="label-row">
              <label class="hg-label" for="login-password">Contraseña</label>
              <button
                type="button"
                class="toggle-pw"
                (click)="toggleShowPassword()"
                [attr.aria-pressed]="showPassword()"
                [attr.aria-label]="
                  showPassword() ? 'Ocultar contraseña' : 'Mostrar contraseña'
                "
              >
                {{ showPassword() ? 'Ocultar' : 'Mostrar' }}
              </button>
            </div>
            <input
              id="login-password"
              class="hg-input field-input"
              [type]="showPassword() ? 'text' : 'password'"
              formControlName="password"
              autocomplete="current-password"
              [attr.aria-invalid]="passwordInvalid()"
              [attr.aria-describedby]="passwordDescribedBy()"
            />
            @if (form.controls.password.touched && form.controls.password.errors?.['required']) {
              <p id="login-password-req" class="field-error" role="alert">
                Introduce tu contraseña.
              </p>
            }
            @if (
              form.controls.password.touched &&
              form.controls.password.errors?.['minlength']
            ) {
              <p id="login-password-len" class="field-error" role="alert">
                La contraseña debe tener al menos 8 caracteres.
              </p>
            }
          </div>

          <div class="remember-row">
            <label class="remember">
              <input type="checkbox" formControlName="rememberMe" />
              <span>Recordarme</span>
            </label>
            <button
              type="button"
              class="forgot-link"
              (click)="onForgotPassword()"
            >
              ¿Olvidaste tu contraseña?
            </button>
          </div>
          @if (forgotHint()) {
            <p class="forgot-hint" role="status">
              Recuperación de cuenta disponible próximamente. Si necesitas ayuda,
              contacta a soporte.
            </p>
          }

          <div
            class="api-error-region"
            aria-live="polite"
            aria-atomic="true"
          >
            @if (error()) {
              <p id="login-api-error" class="api-error" role="status">
                {{ error() }}
              </p>
            }
          </div>

          <button
            class="hg-btn-primary submit-btn"
            type="submit"
            [disabled]="loading()"
            [attr.aria-busy]="loading()"
          >
            {{ loading() ? 'Entrando…' : 'Iniciar sesión' }}
          </button>
        </form>

        <p class="foot">
          ¿No tienes cuenta?
          <a routerLink="/register">Regístrate</a>
        </p>
      </div>
    </div>
  `,
  styleUrl: './login.component.scss',
})
export class LoginComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly waveBars = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly showPassword = signal(false);
  readonly forgotHint = signal(false);

  private static readonly REMEMBER_EMAIL_KEY = 'hearguard_remember_email';

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    rememberMe: [true],
  });

  ngOnInit(): void {
    this.auth.loadUserFromStorage();
    if (this.auth.getAccessToken()) {
      this.router.navigateByUrl('/app/dashboard').catch(() => {});
    }
    const saved = localStorage.getItem(LoginComponent.REMEMBER_EMAIL_KEY);
    if (saved) {
      this.form.patchValue({ email: saved });
    }
  }

  onForgotPassword(): void {
    this.forgotHint.set(true);
  }

  toggleShowPassword(): void {
    this.showPassword.update((v) => !v);
  }

  emailInvalid(): boolean {
    const c = this.form.controls.email;
    return c.touched && c.invalid;
  }

  passwordInvalid(): boolean {
    const c = this.form.controls.password;
    return c.touched && c.invalid;
  }

  emailDescribedBy(): string | null {
    const c = this.form.controls.email;
    if (!c.touched || !c.invalid) {
      return null;
    }
    if (c.errors?.['required']) {
      return 'login-email-err';
    }
    if (c.errors?.['email']) {
      return 'login-email-format';
    }
    return null;
  }

  passwordDescribedBy(): string | null {
    const c = this.form.controls.password;
    if (!c.touched || !c.invalid) {
      return null;
    }
    if (c.errors?.['required']) {
      return 'login-password-req';
    }
    if (c.errors?.['minlength']) {
      return 'login-password-len';
    }
    return null;
  }

  submit(): void {
    this.error.set(null);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading.set(true);
    const raw = this.form.getRawValue();
    this.auth
      .login({ email: raw.email, password: raw.password })
      .subscribe({
      next: () => {
        if (raw.rememberMe) {
          localStorage.setItem(LoginComponent.REMEMBER_EMAIL_KEY, raw.email);
        } else {
          localStorage.removeItem(LoginComponent.REMEMBER_EMAIL_KEY);
        }
        this.router.navigateByUrl('/app/dashboard').catch(() => {});
      },
      error: (err: unknown) => {
        this.loading.set(false);
        this.error.set(this.messageFromHttpError(err));
      },
    });
  }

  private messageFromHttpError(err: unknown): string {
    if (err instanceof HttpErrorResponse) {
      if (err.status === 0) {
        return 'No se pudo conectar con el servidor. Comprueba tu conexión o que el backend esté en marcha.';
      }
      const body = err.error as
        | { message?: string; error?: string }
        | string
        | null
        | undefined;
      const msg =
        body && typeof body === 'object' && typeof body.message === 'string'
          ? body.message
          : null;
      if (msg) {
        return msg;
      }
      if (err.status === 401) {
        return 'Correo o contraseña incorrectos. Vuelve a intentarlo.';
      }
      if (err.status === 400) {
        return 'Revisa los datos del formulario e inténtalo de nuevo.';
      }
      if (err.status >= 500) {
        return 'El servidor no está disponible en este momento. Inténtalo más tarde.';
      }
    }
    return 'No se pudo iniciar sesión. Inténtalo de nuevo.';
  }
}
