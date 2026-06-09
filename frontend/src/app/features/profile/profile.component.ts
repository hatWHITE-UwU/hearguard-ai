import { Component, inject, signal } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { environment } from '../../../environments/environment';
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
  styleUrl: './profile.component.scss',
})
export class ProfileComponent {
  readonly auth = inject(AuthService);
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
    this.auth.patchMe({
      age: v.age ?? undefined,
      gender: v.gender,
      occupation: v.occupation,
      city: v.city,
      settings: { reminders: v.reminders, darkTheme: v.darkTheme, volumeUnit: 'dba' },
    }).subscribe({
      next: () => {
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
