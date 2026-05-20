/**
 * Datos de demostración: 10 registros, usuario, hábitos y evaluaciones estáticas.
 */
import type { User } from '../../shared/models/user.model';
import type { HabitPayload, FrequencyScoreRow, Ear } from '../../features/hearing-test/hearing-test.service';
import { FREQUENCIES } from '../../features/hearing-test/hearing-test.service';

export type DemoRecordType = 'noise' | 'evaluation' | 'tip';

export interface DemoUnifiedRecord {
  id: string;
  isDemo: true;
  type: DemoRecordType;
  at: string;
  title: string;
  detail: string;
  riskTag?: string;
  score?: number;
}

function isoHoursAgo(h: number): string {
  return new Date(Date.now() - h * 3_600_000).toISOString();
}

function isoDaysAgo(d: number): string {
  return new Date(Date.now() - d * 86_400_000).toISOString();
}

/** Exactamente 10 filas demo para la vista “Registros”. */
export const DEMO_UNIFIED_RECORDS: DemoUnifiedRecord[] = [
  {
    id: 'demo-1',
    isDemo: true,
    type: 'noise',
    at: isoHoursAgo(2),
    title: 'Calle céntrica',
    detail: 'Exposición estimada 62 dB',
    riskTag: 'moderado',
  },
  {
    id: 'demo-2',
    isDemo: true,
    type: 'evaluation',
    at: isoHoursAgo(8),
    title: 'Prueba tonal breve',
    detail: 'Evaluación en aplicación',
    score: 7.2,
  },
  {
    id: 'demo-3',
    isDemo: true,
    type: 'noise',
    at: isoHoursAgo(14),
    title: 'Transporte público',
    detail: '71 dB pico estimado',
    riskTag: 'alto',
  },
  {
    id: 'demo-4',
    isDemo: true,
    type: 'tip',
    at: isoDaysAgo(1),
    title: 'Consejo',
    detail: 'Descansa el oído 5 min cada hora con auriculares.',
  },
  {
    id: 'demo-5',
    isDemo: true,
    type: 'noise',
    at: isoDaysAgo(1),
    title: 'Oficina abierta',
    detail: '54 dB promedio',
    riskTag: 'bajo',
  },
  {
    id: 'demo-6',
    isDemo: true,
    type: 'evaluation',
    at: isoDaysAgo(2),
    title: 'Chequeo semanal',
    detail: 'Seguimiento de hábitos',
    score: 6.8,
  },
  {
    id: 'demo-7',
    isDemo: true,
    type: 'tip',
    at: isoDaysAgo(2),
    title: 'Consejo',
    detail: 'Evita subir el volumen por encima del 60% en móvil.',
  },
  {
    id: 'demo-8',
    isDemo: true,
    type: 'noise',
    at: isoDaysAgo(3),
    title: 'Gimnasio',
    detail: '68 dB con música ambiental',
    riskTag: 'moderado',
  },
  {
    id: 'demo-9',
    isDemo: true,
    type: 'evaluation',
    at: isoDaysAgo(5),
    title: 'Primera línea base',
    detail: 'Registro inicial HearGuard',
    score: 8.1,
  },
  {
    id: 'demo-10',
    isDemo: true,
    type: 'tip',
    at: isoDaysAgo(7),
    title: 'Consejo',
    detail: 'Usa tapones en conciertos o obras prolongadas.',
  },
];

export const DEMO_RECOMMENDATION_BULLETS: string[] = [
  'Reduce el volumen de auriculares por debajo del 60%.',
  'Descansa tus oídos cada 45–60 minutos.',
  'Usa protección en ambientes muy ruidosos (>85 dB).',
  'Programa una evaluación anual con audiólogo.',
  'Evita exponerte más de 8 h/día a ruido > 85 dB.',
];

export const DEMO_USER: User = {
  id: 'demo-user',
  name: 'Usuario Demo',
  email: 'demo@hearguard.app',
  age: 28,
  gender: 'prefer_not_say',
  occupation: 'Oficina',
  city: 'Lima',
  settings: {
    reminders: true,
    darkTheme: true,
    volumeUnit: 'dba',
  },
};

export const DEMO_HABIT: HabitPayload = {
  headphoneHours: 2,
  volumeLevel: 4,
  noiseExposure: 3,
  occupationRisk: 2,
  smoking: 1,
  occupationLabel: 'Oficina',
  headphoneUseLabel: '1–3 h',
  volumeLabel: 'Medio',
  noiseWorkLabel: 'Ocasional',
  substancesLabel: 'No',
};

/** Filas de puntuación para completar la prueba y ver /results/new sin API. */
export function buildDemoFrequencyScores(overallTarget: number): FrequencyScoreRow[] {
  const rows: FrequencyScoreRow[] = [];
  let i = 0;
  for (const ear of ['left', 'right'] as Ear[]) {
    for (const hz of FREQUENCIES) {
      const jitter = (i % 4) - 1.5;
      const score = Math.min(
        10,
        Math.max(0, Math.round(overallTarget + jitter)),
      );
      rows.push({ hz, ear, score });
      i += 1;
    }
  }
  return rows;
}

export interface DemoEvalStatic {
  overall: number;
  label: string;
  rows: FrequencyScoreRow[];
}

export const DEMO_EVAL_STATIC: Record<string, DemoEvalStatic> = {
  'demo-2': {
    overall: 7.2,
    label: 'Riesgo estimado: moderado (demo)',
    rows: buildDemoFrequencyScores(7.2),
  },
  'demo-6': {
    overall: 6.8,
    label: 'Riesgo estimado: moderado (demo)',
    rows: buildDemoFrequencyScores(6.8),
  },
  'demo-9': {
    overall: 8.1,
    label: 'Riesgo estimado: bajo (demo)',
    rows: buildDemoFrequencyScores(8.1),
  },
};

export function demoNoiseChartLabels(): string[] {
  return ['Lun', 'Mar', 'Mié', 'Jue', 'Vie'];
}

export function demoNoiseChartValues(): number[] {
  return [48, 55, 52, 61, 49];
}

/** Alineado con mock UI (gauge ~65, etiqueta moderado). */
export const DEMO_DASHBOARD_RISK_SCORE = 65;
export const DEMO_DASHBOARD_RISK_LABEL = 'Moderado';
export const DEMO_AVG_NOISE_DB = 78;

/** Gráfico de barras por frecuencia (mismo criterio que ResultsComponent). */
export function evaluationBarChartData(rows: FrequencyScoreRow[]): {
  labels: string[];
  datasets: { data: number[]; backgroundColor: string[] }[];
} {
  const map = new Map<number, number[]>();
  for (const r of rows) {
    const a = map.get(r.hz) || [];
    a.push(r.score);
    map.set(r.hz, a);
  }
  const labels: string[] = [];
  const data: number[] = [];
  for (const hz of FREQUENCIES) {
    labels.push(`${hz} Hz`);
    const arr = map.get(hz) || [0];
    data.push(arr.reduce((x, y) => x + y, 0) / arr.length);
  }
  return {
    labels,
    datasets: [
      {
        data,
        backgroundColor: data.map((s) => {
          if (s >= 7.5) return '#22C55E';
          if (s >= 5) return '#F59E0B';
          return '#FF4D4D';
        }),
      },
    ],
  };
}

export function averageScoreFromRows(rows: FrequencyScoreRow[]): number {
  if (!rows.length) return 0;
  return rows.reduce((a, r) => a + r.score, 0) / rows.length;
}
