import { Component, inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { HearingTestService } from '../hearing-test.service';

@Component({
  selector: 'hg-habit-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <div class="page">
      <h2>Hábitos auditivos</h2>
      <p class="muted">Responde antes de la prueba tonal</p>
      <form [formGroup]="form" (ngSubmit)="next()" class="hg-card">
        <label class="hg-label">¿A qué te dedicas?</label>
        <select class="hg-input" formControlName="occupation">
          <option value="construcción">Construcción</option>
          <option value="música">Música</option>
          <option value="oficina">Oficina</option>
          <option value="educación">Educación</option>
          <option value="industria">Industria</option>
          <option value="otro">Otro</option>
        </select>
        <label class="hg-label" style="margin-top:0.75rem"
          >Uso de audífonos al día</label
        >
        <select class="hg-input" formControlName="headphones">
          <option value="lt1">&lt; 1h</option>
          <option value="1-3">1–3h</option>
          <option value="3-5">3–5h</option>
          <option value="gt5">&gt; 5h</option>
        </select>
        <label class="hg-label" style="margin-top:0.75rem"
          >Volumen habitual</label
        >
        <select class="hg-input" formControlName="volume">
          <option value="bajo">Bajo</option>
          <option value="medio">Medio</option>
          <option value="alto">Alto</option>
          <option value="muy">Muy alto</option>
        </select>
        <label class="hg-label" style="margin-top:0.75rem"
          >Ruido fuerte en el trabajo</label
        >
        <select class="hg-input" formControlName="noiseWork">
          <option value="no">No</option>
          <option value="ocasional">Ocasionalmente</option>
          <option value="si">Sí, frecuentemente</option>
        </select>
        <label class="hg-label" style="margin-top:0.75rem"
          >Tabaco / alcohol</label
        >
        <select class="hg-input" formControlName="substances">
          <option value="no">No</option>
          <option value="ocasional">Ocasionalmente</option>
          <option value="si">Sí</option>
        </select>
        <button class="hg-btn-primary" style="margin-top:1rem" type="submit">
          Continuar
        </button>
        @if (showDemoTools) {
          <p class="demo-tools">
            <button type="button" class="linkish" (click)="fillExample()">
              Rellenar hábitos de ejemplo
            </button>
            <button type="button" class="linkish" (click)="jumpToResults()">
              Saltar prueba → ver resultados demo
            </button>
          </p>
        }
      </form>
    </div>
  `,
  styleUrl: './habit-form.component.scss',
})
export class HabitFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly hearing = inject(HearingTestService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly showDemoTools = environment.publicDemo || environment.useDemoMocks;

  readonly form = this.fb.nonNullable.group({
    occupation: ['oficina', Validators.required],
    headphones: ['lt1', Validators.required],
    volume: ['medio', Validators.required],
    noiseWork: ['no', Validators.required],
    substances: ['no', Validators.required],
  });

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((q) => {
      if (q.get('demo') === '1') {
        this.fillExample();
      }
    });
  }

  fillExample(): void {
    this.form.patchValue({
      occupation: 'oficina',
      headphones: '1-3',
      volume: 'medio',
      noiseWork: 'ocasional',
      substances: 'no',
    });
  }

  jumpToResults(): void {
    this.fillExample();
    this.persistHabitsToService();
    this.hearing.seedDemoSession(7.2);
    this.router.navigateByUrl('/app/results/new').catch(() => {});
  }

  next(): void {
    this.persistHabitsToService();
    this.hearing.resetFlow();
    this.router.navigateByUrl('/app/hearing/test').catch(() => {});
  }

  private persistHabitsToService(): void {
    const v = this.form.getRawValue();
    const occMap: Record<string, number> = {
      oficina: 0,
      educación: 1,
      música: 2,
      industria: 3,
      construcción: 3,
      otro: 1,
    };
    const hpMap: Record<string, number> = {
      lt1: 0.5,
      '1-3': 2,
      '3-5': 4,
      gt5: 6,
    };
    const volMap: Record<string, number> = {
      bajo: 25,
      medio: 50,
      alto: 75,
      muy: 92,
    };
    const noiseMap: Record<string, number> = { no: 0, ocasional: 1, si: 2 };
    const subMap: Record<string, number> = { no: 0, ocasional: 1, si: 2 };

    this.hearing.habitData.set({
      occupationRisk: occMap[v.occupation] ?? 1,
      headphoneHours: hpMap[v.headphones] ?? 1,
      volumeLevel: volMap[v.volume] ?? 50,
      noiseExposure: noiseMap[v.noiseWork] ?? 0,
      smoking: subMap[v.substances] ?? 0,
      occupationLabel: v.occupation,
      headphoneUseLabel: v.headphones,
      volumeLabel: v.volume,
      noiseWorkLabel: v.noiseWork,
      substancesLabel: v.substances,
    });
  }
}
