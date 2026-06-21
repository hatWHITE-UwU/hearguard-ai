import { HttpErrorResponse } from '@angular/common/http';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Component, inject, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'hg-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="register-page">
      <div class="waves-bg" aria-hidden="true">
        @for (i of waveBars; track i) {
          <span class="bar" [style.animation-delay.ms]="i * 120"></span>
        }
      </div>

      <div class="glass-card">
        <div class="reg-header">
          <a
            routerLink="/login"
            class="back-arrow"
            aria-label="Volver al inicio de sesión"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true">
              <path d="M15 6l-6 6 6 6" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </a>
          <h1 class="title title--inline">Crear cuenta</h1>
        </div>

        <p id="register-desc" class="subtitle">
          Completa tus datos para empezar a cuidar tu audición con IA.
        </p>

        <form
          [formGroup]="form"
          (ngSubmit)="submit()"
          class="form"
          aria-describedby="register-desc"
        >
          <div class="field">
            <label class="hg-label" for="register-name">Nombre</label>
            <input
              id="register-name"
              class="hg-input field-input"
              type="text"
              formControlName="name"
              autocomplete="name"
              maxlength="120"
              [attr.aria-invalid]="nameInvalid()"
              [attr.aria-describedby]="nameDescribedBy()"
            />
            @if (form.controls.name.touched && form.controls.name.errors?.['required']) {
              <p id="register-name-req" class="field-error" role="alert">
                Introduce tu nombre.
              </p>
            }
            @if (form.controls.name.touched && form.controls.name.errors?.['maxlength']) {
              <p id="register-name-len" class="field-error" role="alert">
                El nombre no puede superar los 120 caracteres.
              </p>
            }
          </div>

          <div class="field">
            <label class="hg-label" for="register-email">Correo electrónico</label>
            <input
              id="register-email"
              class="hg-input field-input"
              type="email"
              formControlName="email"
              autocomplete="email"
              [attr.aria-invalid]="emailInvalid()"
              [attr.aria-describedby]="emailDescribedBy()"
            />
            @if (form.controls.email.touched && form.controls.email.errors?.['required']) {
              <p id="register-email-req" class="field-error" role="alert">
                Introduce tu correo.
              </p>
            }
            @if (
              form.controls.email.touched &&
              form.controls.email.value &&
              form.controls.email.errors?.['email']
            ) {
              <p id="register-email-format" class="field-error" role="alert">
                Introduce un correo válido (ejemplo&#64;correo.com).
              </p>
            }
          </div>

          <div class="field">
            <div class="label-row">
              <label class="hg-label" for="register-password">Contraseña</label>
              <button
                type="button"
                class="toggle-pw"
                (click)="toggleShowPassword()"
                [attr.aria-pressed]="showPassword()"
                [attr.aria-label]="
                  showPassword() ? 'Ocultar contraseñas' : 'Mostrar contraseñas'
                "
              >
                {{ showPassword() ? 'Ocultar' : 'Mostrar' }}
              </button>
            </div>
            <input
              id="register-password"
              class="hg-input field-input"
              [type]="showPassword() ? 'text' : 'password'"
              formControlName="password"
              autocomplete="new-password"
              [attr.aria-invalid]="passwordInvalid()"
              [attr.aria-describedby]="passwordDescribedBy()"
            />
            @if (form.controls.password.touched && form.controls.password.errors?.['required']) {
              <p id="register-password-req" class="field-error" role="alert">
                Elige una contraseña.
              </p>
            }
            @if (
              form.controls.password.touched &&
              form.controls.password.errors?.['minlength']
            ) {
              <p id="register-password-len" class="field-error" role="alert">
                La contraseña debe tener al menos 8 caracteres.
              </p>
            }
            @if (form.controls.password.touched && form.controls.password.errors?.['pattern']) {
              <p id="register-password-pattern" class="field-error" role="alert">
                Incluye al menos una mayúscula y un número.
              </p>
            }
          </div>

          <div class="field">
            <label class="hg-label" for="register-confirm">Confirmar contraseña</label>
            <input
              id="register-confirm"
              class="hg-input field-input"
              [type]="showPassword() ? 'text' : 'password'"
              formControlName="confirm"
              autocomplete="new-password"
              [attr.aria-invalid]="confirmInvalid()"
              [attr.aria-describedby]="confirmDescribedBy()"
            />
            @if (form.controls.confirm.touched && form.controls.confirm.errors?.['required']) {
              <p id="register-confirm-req" class="field-error" role="alert">
                Repite la contraseña para confirmarla.
              </p>
            }
            @if (form.touched && form.hasError('mismatch')) {
              <p id="register-mismatch" class="field-error" role="alert">
                Las contraseñas no coinciden. Revisa ambos campos.
              </p>
            }
          </div>

          <div
            class="api-error-region"
            aria-live="polite"
            aria-atomic="true"
          >
            @if (error()) {
              <p id="register-api-error" class="api-error" role="status">
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
            {{ loading() ? 'Creando cuenta…' : 'Registrarme' }}
          </button>
        </form>

        <p class="foot">
          ¿Ya tienes cuenta?
          <a routerLink="/login">Inicia sesión</a>
        </p>
      </div>
    </div>
  `,
  styles: `
    .register-page {
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

    .glass-card {
      position: relative;
      z-index: 1;
      width: 100%;
      max-width: 420px;
      padding: 1.75rem 1.75rem 1.5rem;
      background: rgba(21, 32, 43, 0.72);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1px solid rgba(0, 229, 255, 0.2);
      border-radius: 16px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.35),
        0 0 0 1px rgba(124, 77, 255, 0.08) inset;
    }

    .reg-header {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 0.75rem;
    }

    .back-arrow {
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      color: var(--accent-cyan);
      text-decoration: none;
      border-radius: 10px;
    }

    .back-arrow:hover {
      background: rgba(0, 229, 255, 0.08);
    }

    .back-arrow:focus-visible {
      outline: 2px solid var(--accent-cyan);
      outline-offset: 2px;
    }

    .title {
      margin: 0;
      font-size: 1.45rem;
      font-weight: 600;
      text-align: center;
      color: var(--text-primary);
    }

    .title--inline {
      flex: 1;
      text-align: left;
      font-size: 1.35rem;
    }

    .subtitle {
      margin: 0 0 1.25rem;
      text-align: center;
      font-size: 0.92rem;
      color: var(--text-muted);
      line-height: 1.45;
    }

    .form {
      text-align: left;
    }

    .field {
      margin-bottom: 1rem;
    }

    .field-input {
      border-radius: 10px;
      border: 1px solid rgba(0, 229, 255, 0.15);
      background: rgba(13, 17, 23, 0.65);
    }

    .field-input:focus-visible {
      outline: 2px solid var(--accent-cyan);
      outline-offset: 1px;
    }

    .label-row {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: 0.5rem;
    }

    .label-row .hg-label {
      margin-bottom: 0.35rem;
    }

    .toggle-pw {
      border: none;
      background: none;
      color: var(--accent-cyan);
      font-size: 0.8rem;
      font-weight: 600;
      cursor: pointer;
      padding: 0;
      text-decoration: underline;
      font-family: inherit;
    }

    .toggle-pw:focus-visible {
      outline: 2px solid var(--accent-cyan);
      outline-offset: 2px;
      border-radius: 4px;
    }

    .field-error {
      color: var(--danger);
      font-size: 0.8rem;
      margin: 0.35rem 0 0;
    }

    .api-error-region {
      min-height: 1.25rem;
      margin-bottom: 0.5rem;
    }

    .api-error {
      margin: 0;
      padding: 0.6rem 0.65rem;
      border-radius: 8px;
      background: rgba(255, 77, 77, 0.12);
      border: 1px solid rgba(255, 77, 77, 0.35);
      color: #ffb4b4;
      font-size: 0.85rem;
      line-height: 1.4;
    }

    .submit-btn {
      border-radius: 12px;
      margin-top: 0.25rem;
    }

    .foot {
      margin: 1.15rem 0 0;
      text-align: center;
      font-size: 0.9rem;
      color: var(--text-muted);
    }

    .foot a {
      font-weight: 600;
    }

    .foot a:focus-visible {
      outline: 2px solid var(--accent-cyan);
      outline-offset: 2px;
      border-radius: 4px;
    }
  `,
})
export class RegisterComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly waveBars = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly showPassword = signal(false);

  readonly form = this.fb.nonNullable.group(
    {
      name: ['', [Validators.required, Validators.maxLength(120)]],
      email: ['', [Validators.required, Validators.email]],
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
          Validators.pattern(/^(?=.*[A-Z])(?=.*\d)/),
        ],
      ],
      confirm: ['', Validators.required],
    },
    { validators: [RegisterComponent.matchPasswords] },
  );

  ngOnInit(): void {
    this.auth.loadUserFromStorage();
    if (this.auth.getAccessToken()) {
      this.router.navigateByUrl('/app/dashboard').catch(() => {});
    }
  }

  toggleShowPassword(): void {
    this.showPassword.update((v) => !v);
  }

  static matchPasswords(c: AbstractControl): ValidationErrors | null {
    const p = c.get('password')?.value;
    const q = c.get('confirm')?.value;
    if (p && q && p !== q) return { mismatch: true };
    return null;
  }

  nameInvalid(): boolean {
    const c = this.form.controls.name;
    return c.touched && c.invalid;
  }

  emailInvalid(): boolean {
    const c = this.form.controls.email;
    return c.touched && c.invalid;
  }

  passwordInvalid(): boolean {
    const c = this.form.controls.password;
    return c.touched && c.invalid;
  }

  confirmInvalid(): boolean {
    const c = this.form.controls.confirm;
    const mismatch = this.form.touched && this.form.hasError('mismatch');
    return (c.touched && c.invalid) || mismatch;
  }

  nameDescribedBy(): string | null {
    const c = this.form.controls.name;
    if (!c.touched || !c.invalid) return null;
    if (c.errors?.['required']) return 'register-name-req';
    if (c.errors?.['maxlength']) return 'register-name-len';
    return null;
  }

  emailDescribedBy(): string | null {
    const c = this.form.controls.email;
    if (!c.touched || !c.invalid) return null;
    if (c.errors?.['required']) return 'register-email-req';
    if (c.errors?.['email']) return 'register-email-format';
    return null;
  }

  passwordDescribedBy(): string | null {
    const c = this.form.controls.password;
    if (!c.touched || !c.invalid) return null;
    if (c.errors?.['required']) return 'register-password-req';
    if (c.errors?.['minlength']) return 'register-password-len';
    if (c.errors?.['pattern']) return 'register-password-pattern';
    return null;
  }

  confirmDescribedBy(): string | null {
    const c = this.form.controls.confirm;
    const ids: string[] = [];
    if (c.touched && c.errors?.['required']) {
      ids.push('register-confirm-req');
    }
    if (this.form.touched && this.form.hasError('mismatch')) {
      ids.push('register-mismatch');
    }
    return ids.length ? ids.join(' ') : null;
  }

  submit(): void {
    this.error.set(null);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { name, email, password } = this.form.getRawValue();
    this.loading.set(true);
    this.auth.register({ name, email, password }).subscribe({
      next: () => this.router.navigateByUrl('/app/dashboard'),
      error: (err: unknown) => {
        this.loading.set(false);
        this.error.set(this.messageFromHttpError(err));
      },
    });
  }

  private messageFromHttpError(err: unknown): string {
    if (!(err instanceof HttpErrorResponse)) {
      return 'No se pudo crear la cuenta. Inténtalo de nuevo.';
    }
    if (err.status === 0) {
      return 'No se pudo conectar con el servidor. Comprueba tu conexión o que el backend esté en marcha.';
    }
    const body = err.error as
      | { message?: string; error?: string }
      | string
      | null
      | undefined;
    if (body && typeof body === 'object' && typeof body.message === 'string') {
      return body.message;
    }
    return statusToRegisterMessage(err.status);
  }
}

function statusToRegisterMessage(status: number): string {
  if (status === 409) {
    return 'Este correo ya está registrado. Prueba a iniciar sesión.';
  }
  if (status === 400) {
    return 'Revisa los datos del formulario e inténtalo de nuevo.';
  }
  if (status === 404) {
    return 'No se encontró el servicio de registro. Comprueba que el backend esté activo y la URL del API en el entorno.';
  }
  if (status >= 500) {
    return 'El servidor no está disponible en este momento. Inténtalo más tarde.';
  }
  return 'No se pudo crear la cuenta. Inténtalo de nuevo.';
}
