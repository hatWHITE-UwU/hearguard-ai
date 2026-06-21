import { Component, inject, signal } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { environment } from '../../../environments/environment';
import type { ApiEnvelope } from '../../shared/models/auth.model';
import type { User } from '../../shared/models/user.model';

@Component({
  selector: 'hg-profile',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <div class="page">
      <section class="hero hg-card">
        <div class="avatar">{{ initial() }}</div>
        <div class="hero-info">
          <p class="hero-name">{{ auth.currentUser()?.name }}</p>
          <p class="hero-email">{{ auth.currentUser()?.email }}</p>
        </div>
      </section>

      <section class="section">
        <h2 class="section-title">Datos personales</h2>
        <form [formGroup]="form" (ngSubmit)="save()" class="hg-card form-card">
          <div class="field-row">
            <div class="field">
              <label class="hg-label" for="p-age">Edad</label>
              <input id="p-age" class="hg-input" type="number" formControlName="age" min="1" max="120" />
            </div>
            <div class="field">
              <label class="hg-label" for="p-gender">Género</label>
              <select id="p-gender" class="hg-input" formControlName="gender">
                <option value="male">Masculino</option>
                <option value="female">Femenino</option>
                <option value="other">Otro</option>
                <option value="prefer_not_say">Prefiero no decir</option>
              </select>
            </div>
          </div>
          <div class="field">
            <label class="hg-label" for="p-occ">Ocupación</label>
            <input id="p-occ" class="hg-input" formControlName="occupation" placeholder="Ej. Ingeniero, Estudiante…" />
          </div>
          <div class="field">
            <label class="hg-label" for="p-city">Ciudad</label>
            <input id="p-city" class="hg-input" formControlName="city" placeholder="Ej. Lima, Bogotá…" />
          </div>

          <div class="divider"></div>

          <h3 class="subsection">Preferencias</h3>
          <label class="toggle-row">
            <span class="toggle-label">
              <span class="toggle-name">Recordatorios</span>
              <span class="toggle-hint">Alertas de evaluación periódica</span>
            </span>
            <input type="checkbox" class="sr-only" formControlName="reminders" />
            <span class="toggle-track" [class.on]="form.controls.reminders.value" aria-hidden="true">
              <span class="toggle-thumb"></span>
            </span>
          </label>
          <label class="toggle-row">
            <span class="toggle-label">
              <span class="toggle-name">Tema oscuro</span>
              <span class="toggle-hint">Interfaz en modo oscuro</span>
            </span>
            <input type="checkbox" class="sr-only" formControlName="darkTheme" />
            <span class="toggle-track" [class.on]="form.controls.darkTheme.value" aria-hidden="true">
              <span class="toggle-thumb"></span>
            </span>
          </label>

          @if (saved()) {
            <p class="save-ok" role="status">Cambios guardados correctamente.</p>
          }

          <button class="hg-btn-primary save-btn" type="submit" [disabled]="saving()">
            {{ saving() ? 'Guardando…' : 'Guardar cambios' }}
          </button>
        </form>
      </section>

      <section class="section danger-zone">
        <button type="button" class="logout-btn" (click)="out()">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Cerrar sesión
        </button>
      </section>
    </div>
  `,
  styles: `
    .page {
      padding: var(--space-md) var(--space-gutter) var(--space-xl);
      max-width: 540px;
      margin: 0 auto;
    }

    .hero {
      display: flex;
      align-items: center;
      gap: var(--space-md);
      padding: var(--space-gutter);
      margin-bottom: var(--space-md);
    }

    .avatar {
      flex-shrink: 0;
      width: 64px;
      height: 64px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--accent-purple), var(--accent-cyan));
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.65rem;
      font-weight: 700;
      color: #fff;
      text-shadow: 0 1px 4px rgba(0,0,0,0.4);
    }

    .hero-info {
      min-width: 0;
    }

    .hero-name {
      margin: 0 0 0.2rem;
      font-size: 1.05rem;
      font-weight: 600;
      color: var(--text-primary);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .hero-email {
      margin: 0;
      font-size: 0.82rem;
      color: var(--text-muted);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .section {
      margin-bottom: var(--space-md);
    }

    .section-title {
      font-size: 0.78rem;
      font-weight: 600;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--text-muted2);
      margin: 0 0 var(--space-sm);
    }

    .form-card {
      display: flex;
      flex-direction: column;
      gap: var(--space-sm);
      padding: var(--space-gutter);
    }

    .field-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--space-sm);
    }

    .field {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
    }

    .divider {
      border: none;
      border-top: 1px solid var(--border);
      margin: var(--space-xs) 0;
    }

    .subsection {
      font-size: 0.82rem;
      font-weight: 600;
      color: var(--text-muted);
      margin: 0;
    }

    .toggle-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--space-gutter);
      cursor: pointer;
      padding: 2px 0;
    }

    .toggle-label {
      display: flex;
      flex-direction: column;
      gap: 2px;
      min-width: 0;
    }

    .toggle-name {
      font-size: 0.9rem;
      font-weight: 500;
      color: var(--text-primary);
    }

    .toggle-hint {
      font-size: 0.72rem;
      color: var(--text-muted2);
    }

    .sr-only {
      position: absolute;
      width: 1px; height: 1px;
      overflow: hidden;
      clip: rect(0 0 0 0);
      white-space: nowrap;
    }

    .toggle-track {
      flex-shrink: 0;
      width: 42px;
      height: 24px;
      border-radius: 999px;
      background: var(--bg-card2);
      border: 1px solid var(--border-strong);
      position: relative;
      transition: background 0.2s, border-color 0.2s;
    }

    .toggle-track.on {
      background: rgba(0, 229, 255, 0.25);
      border-color: var(--accent-cyan);
    }

    .toggle-thumb {
      position: absolute;
      top: 3px; left: 3px;
      width: 16px; height: 16px;
      border-radius: 50%;
      background: var(--text-muted2);
      transition: transform 0.2s, background 0.2s;
    }

    .toggle-track.on .toggle-thumb {
      transform: translateX(18px);
      background: var(--accent-cyan);
    }

    .save-ok {
      margin: 0;
      padding: 0.55rem 0.75rem;
      border-radius: 8px;
      background: rgba(34, 197, 94, 0.12);
      border: 1px solid rgba(34, 197, 94, 0.3);
      color: var(--success);
      font-size: 0.82rem;
    }

    .save-btn {
      margin-top: var(--space-xs);
      border-radius: var(--radius-input);
    }

    .danger-zone {
      padding-top: var(--space-xs);
    }

    .logout-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      width: 100%;
      padding: 0.75rem 1rem;
      border-radius: var(--radius-input);
      border: 1px solid rgba(255, 107, 107, 0.4);
      background: rgba(255, 107, 107, 0.06);
      color: var(--danger);
      font-weight: 600;
      font-size: 0.9rem;
      font-family: inherit;
      cursor: pointer;
      transition: background 0.15s, border-color 0.15s;
    }

    .logout-btn:hover {
      background: rgba(255, 107, 107, 0.12);
      border-color: rgba(255, 107, 107, 0.65);
    }

    .logout-btn:focus-visible {
      outline: 2px solid var(--danger);
      outline-offset: 2px;
    }

    @media (min-width: 768px) {
      .page { padding: var(--space-lg) var(--space-margin); }
    }
  `,
})
export class ProfileComponent {
  readonly auth = inject(AuthService);
  private readonly http = inject(HttpClient);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);

  readonly saving = signal(false);
  readonly saved = signal(false);

  readonly form = this.fb.group({
    age: [null as number | null, [Validators.min(1), Validators.max(120)]],
    gender: ['prefer_not_say'],
    occupation: [''],
    city: [''],
    reminders: [true],
    darkTheme: [true],
  });

  constructor() {
    const u = this.auth.currentUser();
    if (u) this.patch(u);
    this.auth.loadUserFromStorage();
    setTimeout(() => {
      const x = this.auth.currentUser();
      if (x) this.patch(x);
    }, 400);
  }

  initial(): string {
    const n = this.auth.currentUser()?.name || 'U';
    return n.trim().charAt(0).toUpperCase();
  }

  private patch(u: User): void {
    this.form.patchValue({
      age: u.age ?? null,
      gender: (u.gender as string) || 'prefer_not_say',
      occupation: u.occupation || '',
      city: u.city || '',
      reminders: u.settings?.reminders ?? true,
      darkTheme: u.settings?.darkTheme ?? true,
    });
  }

  save(): void {
    const v = this.form.getRawValue();
    if (environment.publicDemo && !this.auth.getAccessToken()) {
      const cur = this.auth.currentUser();
      if (cur) {
        this.auth.currentUser.set({
          ...cur,
          age: v.age ?? undefined,
          gender: (v.gender as string) || undefined,
          occupation: v.occupation || undefined,
          city: v.city || undefined,
          settings: { reminders: !!v.reminders, darkTheme: !!v.darkTheme, volumeUnit: 'dba' },
        });
        this.saved.set(true);
        setTimeout(() => this.saved.set(false), 3000);
      }
      return;
    }
    this.saving.set(true);
    this.http
      .patch<ApiEnvelope<{ user: User }>>(`${environment.apiUrl}/api/auth/me`, {
        age: v.age ?? undefined,
        gender: v.gender,
        occupation: v.occupation,
        city: v.city,
        settings: { reminders: v.reminders, darkTheme: v.darkTheme, volumeUnit: 'dba' },
      })
      .subscribe({
        next: (r) => {
          this.auth.currentUser.set(r.data.user);
          this.saving.set(false);
          this.saved.set(true);
          setTimeout(() => this.saved.set(false), 3000);
        },
        error: () => this.saving.set(false),
      });
  }

  out(): void {
    this.auth.logout();
    this.router.navigateByUrl('/');
  }
}
