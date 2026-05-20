import { DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { environment } from '../../../environments/environment';
import type { ApiEnvelope } from '../../shared/models/auth.model';

interface Device {
  _id: string;
  name: string;
  type: 'arduino' | 'esp32' | 'other';
  hardwareId?: string;
  firmwareVersion?: string;
  isActive: boolean;
  lastSeenAt?: string;
  createdAt: string;
}

@Component({
  selector: 'hg-devices',
  standalone: true,
  imports: [ReactiveFormsModule, DatePipe],
  template: `
    <div class="page">

      <!-- API key revealed after creation -->
      @if (newKey()) {
        <div class="key-banner" role="alert">
          <div class="key-banner-head">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0110 0v4" stroke-linecap="round"/>
            </svg>
            <strong>Guarda esta clave ahora — no se mostrará de nuevo</strong>
          </div>
          <p class="key-hint">Cópiala en el firmware de tu dispositivo (X-Device-Key).</p>
          <div class="key-box">
            <code class="key-code">{{ newKey() }}</code>
            <button type="button" class="copy-btn" (click)="copyKey()" [attr.aria-label]="copied() ? 'Copiado' : 'Copiar clave'">
              @if (copied()) {
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                  <path d="M20 6L9 17l-5-5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              } @else {
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                  <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" stroke-linecap="round"/>
                </svg>
              }
              {{ copied() ? 'Copiado' : 'Copiar' }}
            </button>
          </div>
          <button type="button" class="key-dismiss" (click)="newKey.set(null); copied.set(false)">
            Entendido, la guardé
          </button>
        </div>
      }

      <!-- Lista de dispositivos -->
      <section class="section">
        <div class="section-head">
          <div>
            <h2 class="section-title">Mis dispositivos</h2>
            <p class="section-hint">Arduino / ESP32 conectados a tu cuenta</p>
          </div>
          <button type="button" class="add-btn" (click)="toggleForm()" [attr.aria-expanded]="showForm()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
              <path d="M12 5v14M5 12h14" stroke-linecap="round"/>
            </svg>
            Registrar
          </button>
        </div>

        @if (showForm()) {
          <form [formGroup]="form" (ngSubmit)="create()" class="form-card hg-card">
            <h3 class="form-title">Nuevo dispositivo</h3>
            <div class="field">
              <label class="hg-label" for="dev-name">Nombre *</label>
              <input id="dev-name" class="hg-input" formControlName="name" placeholder="Ej. Sensor sala, Arduino 1…" maxlength="120" />
              @if (form.controls.name.touched && form.controls.name.invalid) {
                <p class="field-err">Introduce un nombre (máx. 120 caracteres).</p>
              }
            </div>
            <div class="field-row">
              <div class="field">
                <label class="hg-label" for="dev-type">Tipo</label>
                <select id="dev-type" class="hg-input" formControlName="type">
                  <option value="arduino">Arduino</option>
                  <option value="esp32">ESP32</option>
                  <option value="other">Otro</option>
                </select>
              </div>
              <div class="field">
                <label class="hg-label" for="dev-hw">ID de hardware</label>
                <input id="dev-hw" class="hg-input" formControlName="hardwareId" placeholder="Opcional" maxlength="120" />
              </div>
            </div>
            <div class="field">
              <label class="hg-label" for="dev-fw">Versión de firmware</label>
              <input id="dev-fw" class="hg-input" formControlName="firmwareVersion" placeholder="Ej. 1.0.0" maxlength="80" />
            </div>
            @if (createError()) {
              <p class="api-error" role="alert">{{ createError() }}</p>
            }
            <div class="form-actions">
              <button type="button" class="cancel-btn" (click)="toggleForm()">Cancelar</button>
              <button type="submit" class="hg-btn-primary submit-btn" [disabled]="creating()">
                {{ creating() ? 'Registrando…' : 'Registrar dispositivo' }}
              </button>
            </div>
          </form>
        }

        @if (loading()) {
          <p class="loading-msg muted">Cargando dispositivos…</p>
        } @else if (devices().length === 0 && !showForm()) {
          <div class="empty hg-card">
            <div class="empty-icon" aria-hidden="true">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <rect x="2" y="3" width="20" height="14" rx="2"/>
                <path d="M8 21h8M12 17v4" stroke-linecap="round"/>
              </svg>
            </div>
            <p class="empty-msg">No tienes dispositivos registrados todavía.</p>
            <p class="empty-hint muted">Conecta un Arduino o ESP32 con el sensor KY-037 y regístralo aquí para enviar lecturas automáticamente.</p>
            <button type="button" class="hg-btn-primary empty-btn" (click)="showForm.set(true)">Registrar mi primer dispositivo</button>
          </div>
        } @else {
          <ul class="device-list" role="list">
            @for (d of devices(); track d._id) {
              <li class="device-card hg-card">
                <div class="device-icon" [class.device-icon--esp]="d.type === 'esp32'" aria-hidden="true">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <rect x="4" y="4" width="16" height="16" rx="2"/>
                    <circle cx="12" cy="12" r="3"/>
                    <path d="M12 2v2M12 20v2M2 12h2M20 12h2" stroke-linecap="round"/>
                  </svg>
                </div>
                <div class="device-main">
                  <div class="device-top">
                    <span class="device-name">{{ d.name }}</span>
                    <span class="device-type-badge">{{ d.type }}</span>
                    <span class="device-status" [class.device-status--on]="d.isActive">
                      {{ d.isActive ? 'Activo' : 'Inactivo' }}
                    </span>
                  </div>
                  @if (d.hardwareId) {
                    <p class="device-meta">HW: {{ d.hardwareId }}</p>
                  }
                  @if (d.firmwareVersion) {
                    <p class="device-meta">FW: {{ d.firmwareVersion }}</p>
                  }
                  <p class="device-dates">
                    Registrado: {{ d.createdAt | date:'mediumDate' }}
                    @if (d.lastSeenAt) {
                      · Última lectura: {{ d.lastSeenAt | date:'short' }}
                    } @else {
                      · <em class="muted">Sin lecturas aún</em>
                    }
                  </p>
                </div>
              </li>
            }
          </ul>
        }
      </section>

      <!-- Guía de uso -->
      <section class="section">
        <h2 class="section-title">Cómo conectar tu dispositivo</h2>
        <div class="guide hg-card">
          <ol class="guide-steps">
            <li>
              <span class="step-num">1</span>
              <div>
                <strong>Registra el dispositivo</strong>
                <p>Usa el botón "Registrar" de arriba para obtener una <code>apiKey</code> única.</p>
              </div>
            </li>
            <li>
              <span class="step-num">2</span>
              <div>
                <strong>Configura el firmware</strong>
                <p>En tu sketch de Arduino / código ESP32, añade la clave en la cabecera HTTP:</p>
                <pre class="code-block">X-Device-Key: TU_API_KEY</pre>
              </div>
            </li>
            <li>
              <span class="step-num">3</span>
              <div>
                <strong>Envía lecturas</strong>
                <p>Haz <code>POST {{ apiBase }}/api/noise/iot</code> con el cuerpo:</p>
                <pre class="code-block">&#123; "dbLevel": 72 &#125;</pre>
              </div>
            </li>
          </ol>
        </div>
      </section>

    </div>
  `,
  styles: `
    .page {
      padding: var(--space-md) var(--space-gutter) var(--space-xl);
      max-width: 660px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: var(--space-md);
    }

    /* ── API key banner ── */
    .key-banner {
      padding: var(--space-gutter);
      border-radius: var(--radius-card);
      background: rgba(34, 197, 94, 0.08);
      border: 1px solid rgba(34, 197, 94, 0.4);
      display: flex;
      flex-direction: column;
      gap: var(--space-sm);
    }

    .key-banner-head {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: var(--success);
      font-size: 0.9rem;
    }

    .key-hint {
      margin: 0;
      font-size: 0.8rem;
      color: var(--text-muted);
    }

    .key-box {
      display: flex;
      align-items: center;
      gap: var(--space-sm);
      padding: 0.65rem var(--space-gutter);
      border-radius: 8px;
      background: var(--bg-lowest);
      border: 1px solid rgba(34, 197, 94, 0.25);
      overflow: hidden;
    }

    .key-code {
      flex: 1;
      font-family: 'Courier New', monospace;
      font-size: 0.78rem;
      color: var(--success);
      word-break: break-all;
      overflow-wrap: anywhere;
    }

    .copy-btn {
      flex-shrink: 0;
      display: flex;
      align-items: center;
      gap: 5px;
      padding: 5px 12px;
      border-radius: 6px;
      border: 1px solid rgba(34, 197, 94, 0.4);
      background: rgba(34, 197, 94, 0.1);
      color: var(--success);
      font-size: 0.75rem;
      font-weight: 600;
      font-family: inherit;
      cursor: pointer;
      white-space: nowrap;
      transition: background 0.15s;
    }

    .copy-btn:hover { background: rgba(34, 197, 94, 0.18); }
    .copy-btn:focus-visible { outline: 2px solid var(--success); outline-offset: 2px; }

    .key-dismiss {
      align-self: flex-start;
      border: none;
      background: none;
      padding: 0;
      font-size: 0.82rem;
      font-weight: 600;
      color: var(--success);
      cursor: pointer;
      text-decoration: underline;
      font-family: inherit;
    }

    /* ── Section ── */
    .section { display: flex; flex-direction: column; gap: var(--space-sm); }

    .section-head {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: var(--space-gutter);
    }

    .section-title {
      font-size: 0.78rem;
      font-weight: 600;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--text-muted2);
      margin: 0 0 2px;
    }

    .section-hint {
      font-size: 0.72rem;
      color: var(--text-muted2);
      margin: 0;
    }

    .add-btn {
      flex-shrink: 0;
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 7px 14px;
      border-radius: var(--radius-input);
      border: 1px solid rgba(0, 229, 255, 0.4);
      background: rgba(0, 229, 255, 0.08);
      color: var(--accent-cyan);
      font-size: 0.82rem;
      font-weight: 600;
      font-family: inherit;
      cursor: pointer;
      transition: background 0.15s, border-color 0.15s;
    }

    .add-btn:hover { background: rgba(0, 229, 255, 0.14); border-color: rgba(0, 229, 255, 0.65); }
    .add-btn:focus-visible { outline: 2px solid var(--accent-cyan); outline-offset: 2px; }

    /* ── Form ── */
    .form-card {
      padding: var(--space-gutter);
      display: flex;
      flex-direction: column;
      gap: var(--space-sm);
    }

    .form-title {
      font-size: 0.95rem;
      font-weight: 600;
      color: var(--text-primary);
      margin: 0 0 var(--space-xs);
    }

    .field { display: flex; flex-direction: column; gap: 0.35rem; }

    .field-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--space-sm);
    }

    .field-err {
      color: var(--danger);
      font-size: 0.75rem;
      margin: 0;
    }

    .api-error {
      padding: 0.55rem 0.75rem;
      border-radius: 8px;
      background: rgba(255, 107, 107, 0.1);
      border: 1px solid rgba(255, 107, 107, 0.35);
      color: #ffb4b4;
      font-size: 0.82rem;
      margin: 0;
    }

    .form-actions {
      display: flex;
      gap: var(--space-sm);
      padding-top: var(--space-xs);
    }

    .cancel-btn {
      flex: 1;
      padding: 0.75rem;
      border-radius: var(--radius-input);
      border: 1px solid var(--border-strong);
      background: transparent;
      color: var(--text-muted);
      font-weight: 600;
      font-family: inherit;
      cursor: pointer;
    }

    .cancel-btn:hover { background: rgba(255,255,255,0.04); }

    .submit-btn { flex: 2; border-radius: var(--radius-input); }

    /* ── Loading ── */
    .loading-msg { font-size: 0.88rem; margin: 0; padding: var(--space-md) 0; }

    /* ── Empty ── */
    .empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--space-sm);
      padding: var(--space-lg) var(--space-gutter);
      text-align: center;
    }

    .empty-icon {
      width: 64px; height: 64px;
      display: flex; align-items: center; justify-content: center;
      border-radius: 50%;
      background: rgba(0, 229, 255, 0.06);
      border: 1px solid rgba(0, 229, 255, 0.2);
      color: var(--accent-cyan);
    }

    .empty-msg {
      margin: 0;
      font-size: 0.95rem;
      font-weight: 600;
      color: var(--text-primary);
    }

    .empty-hint {
      margin: 0;
      font-size: 0.82rem;
      line-height: 1.5;
      max-width: 400px;
    }

    .empty-btn { border-radius: var(--radius-input); max-width: 300px; }

    /* ── Device list ── */
    .device-list {
      list-style: none;
      margin: 0; padding: 0;
      display: flex;
      flex-direction: column;
      gap: var(--space-sm);
    }

    .device-card {
      display: flex;
      align-items: flex-start;
      gap: var(--space-gutter);
      padding: var(--space-gutter);
      margin: 0;
    }

    .device-icon {
      flex-shrink: 0;
      width: 44px; height: 44px;
      display: flex; align-items: center; justify-content: center;
      border-radius: 10px;
      background: rgba(0, 229, 255, 0.08);
      border: 1px solid rgba(0, 229, 255, 0.2);
      color: var(--accent-cyan);
    }

    .device-icon--esp {
      background: rgba(124, 77, 255, 0.08);
      border-color: rgba(124, 77, 255, 0.25);
      color: #c0acff;
    }

    .device-main { flex: 1; min-width: 0; }

    .device-top {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 6px;
      margin-bottom: 4px;
    }

    .device-name {
      font-size: 0.95rem;
      font-weight: 600;
      color: var(--text-primary);
    }

    .device-type-badge {
      font-size: 0.62rem;
      font-weight: 600;
      padding: 2px 8px;
      border-radius: var(--radius-pill);
      background: rgba(0, 229, 255, 0.1);
      border: 1px solid rgba(0, 229, 255, 0.25);
      color: var(--accent-cyan);
      text-transform: uppercase;
      letter-spacing: 0.06em;
    }

    .device-status {
      font-size: 0.62rem;
      font-weight: 600;
      padding: 2px 8px;
      border-radius: var(--radius-pill);
      background: rgba(255, 107, 107, 0.1);
      border: 1px solid rgba(255, 107, 107, 0.25);
      color: var(--danger);
      text-transform: uppercase;
    }

    .device-status--on {
      background: rgba(34, 197, 94, 0.1);
      border-color: rgba(34, 197, 94, 0.25);
      color: var(--success);
    }

    .device-meta {
      font-size: 0.72rem;
      color: var(--text-muted2);
      margin: 0 0 2px;
    }

    .device-dates {
      font-size: 0.72rem;
      color: var(--text-muted2);
      margin: 4px 0 0;
    }

    /* ── Guide ── */
    .guide { padding: var(--space-gutter); }

    .guide-steps {
      list-style: none;
      margin: 0; padding: 0;
      display: flex;
      flex-direction: column;
      gap: var(--space-md);
    }

    .guide-steps li {
      display: flex;
      gap: var(--space-gutter);
      align-items: flex-start;
    }

    .step-num {
      flex-shrink: 0;
      width: 28px; height: 28px;
      border-radius: 50%;
      background: rgba(0, 229, 255, 0.12);
      border: 1px solid rgba(0, 229, 255, 0.3);
      color: var(--accent-cyan);
      font-size: 0.8rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .guide-steps li > div { flex: 1; }

    .guide-steps strong {
      display: block;
      font-size: 0.9rem;
      color: var(--text-primary);
      margin-bottom: 4px;
    }

    .guide-steps p {
      font-size: 0.82rem;
      color: var(--text-muted);
      margin: 0 0 var(--space-xs);
      line-height: 1.5;
    }

    .code-block {
      display: block;
      padding: 0.5rem 0.75rem;
      border-radius: 6px;
      background: var(--bg-lowest);
      border: 1px solid var(--border);
      font-family: 'Courier New', monospace;
      font-size: 0.75rem;
      color: var(--accent-cyan);
      overflow-x: auto;
      white-space: pre;
    }

    .muted { color: var(--text-muted); }

    @media (min-width: 768px) {
      .page { padding: var(--space-lg) var(--space-margin); }
    }
  `,
})
export class DevicesComponent implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly fb = inject(FormBuilder);

  readonly apiBase = environment.apiUrl || globalThis.location.origin;
  readonly loading = signal(true);
  readonly devices = signal<Device[]>([]);
  readonly showForm = signal(false);
  readonly creating = signal(false);
  readonly createError = signal<string | null>(null);
  readonly newKey = signal<string | null>(null);
  readonly copied = signal(false);

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(120)]],
    type: ['arduino'],
    hardwareId: [''],
    firmwareVersion: [''],
  });

  ngOnInit(): void {
    this.loadDevices();
  }

  private loadDevices(): void {
    this.loading.set(true);
    this.http
      .get<ApiEnvelope<{ items: Device[] }>>(`${environment.apiUrl}/api/devices`)
      .subscribe({
        next: (r) => { this.devices.set(r.data.items); this.loading.set(false); },
        error: () => this.loading.set(false),
      });
  }

  toggleForm(): void {
    this.showForm.update((v) => !v);
    if (!this.showForm()) {
      this.form.reset({ name: '', type: 'arduino', hardwareId: '', firmwareVersion: '' });
      this.createError.set(null);
    }
  }

  create(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.creating.set(true);
    this.createError.set(null);
    const v = this.form.getRawValue();
    this.http
      .post<ApiEnvelope<{ device: Device; apiKey: string }>>(`${environment.apiUrl}/api/devices`, {
        name: v.name,
        type: v.type,
        ...(v.hardwareId ? { hardwareId: v.hardwareId } : {}),
        ...(v.firmwareVersion ? { firmwareVersion: v.firmwareVersion } : {}),
      })
      .subscribe({
        next: (r) => {
          this.devices.update((list) => [r.data.device, ...list]);
          this.newKey.set(r.data.apiKey);
          this.showForm.set(false);
          this.form.reset({ name: '', type: 'arduino', hardwareId: '', firmwareVersion: '' });
          this.creating.set(false);
        },
        error: (err) => {
          this.creating.set(false);
          const msg = err?.error?.message;
          this.createError.set(msg || 'No se pudo registrar el dispositivo.');
        },
      });
  }

  copyKey(): void {
    const k = this.newKey();
    if (!k) return;
    navigator.clipboard.writeText(k).then(() => {
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 2000);
    });
  }
}
