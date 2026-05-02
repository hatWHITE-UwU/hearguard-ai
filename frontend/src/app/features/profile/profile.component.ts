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
      <h2>Perfil</h2>
      <div class="avatar">{{ initial() }}</div>
      <p class="name">{{ auth.currentUser()?.name }}</p>
      <p class="muted">{{ auth.currentUser()?.email }}</p>
      <form [formGroup]="form" (ngSubmit)="save()" class="hg-card">
        <label class="hg-label">Edad</label>
        <input class="hg-input" type="number" formControlName="age" />
        <label class="hg-label" style="margin-top:0.75rem">Género</label>
        <select class="hg-input" formControlName="gender">
          <option value="male">Masculino</option>
          <option value="female">Femenino</option>
          <option value="other">Otro</option>
          <option value="prefer_not_say">Prefiero no decir</option>
        </select>
        <label class="hg-label" style="margin-top:0.75rem">Ocupación</label>
        <input class="hg-input" formControlName="occupation" />
        <label class="hg-label" style="margin-top:0.75rem">Ciudad</label>
        <input class="hg-input" formControlName="city" />
        <label class="row"
          ><input type="checkbox" formControlName="reminders" /> Recordatorios</label
        >
        <label class="row"
          ><input type="checkbox" formControlName="darkTheme" /> Tema oscuro</label
        >
        <button class="hg-btn-primary" type="submit" [disabled]="saving()">
          Guardar
        </button>
      </form>
      <button type="button" class="logout" (click)="out()">Cerrar sesión</button>
    </div>
  `,
  styles: `
    .page {
      padding: 1rem;
      padding-bottom: 5rem;
      max-width: 440px;
      margin: 0 auto;
    }
    .avatar {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      background: var(--accent-purple);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      font-weight: 700;
      margin: 1rem 0 0.5rem;
    }
    .name {
      font-weight: 600;
      margin: 0;
    }
    .muted {
      color: var(--text-muted);
      margin-top: 0.25rem;
    }
    form {
      margin-top: 1rem;
    }
    .row {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin: 0.5rem 0;
      font-size: 0.9rem;
    }
    .logout {
      margin-top: 1rem;
      width: 100%;
      padding: 0.75rem;
      border-radius: 8px;
      border: 1px solid var(--danger);
      background: transparent;
      color: var(--danger);
      font-weight: 600;
      cursor: pointer;
    }
  `,
})
export class ProfileComponent {
  readonly auth = inject(AuthService);
  private readonly http = inject(HttpClient);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);

  readonly saving = signal(false);

  readonly form = this.fb.group({
    age: [null as number | null],
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
          settings: {
            reminders: !!v.reminders,
            darkTheme: !!v.darkTheme,
            volumeUnit: 'dba',
          },
        });
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
        settings: {
          reminders: v.reminders,
          darkTheme: v.darkTheme,
          volumeUnit: 'dba',
        },
      })
      .subscribe({
        next: (r) => {
          this.auth.currentUser.set(r.data.user);
          this.saving.set(false);
        },
        error: () => this.saving.set(false),
      });
  }

  out(): void {
    this.auth.logout();
    this.router.navigateByUrl('/');
  }
}
