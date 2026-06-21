/**
 * HearGuard AI — k6 Load & Performance Tests
 *
 * Run locally (all scenarios, ~4 min):
 *   k6 run tests/k6/load-test.js
 *
 * Run smoke only (CI mode, 30 s):
 *   K6_SMOKE_ONLY=true BASE_URL=https://api.hearguard.onrender.com k6 run tests/k6/load-test.js
 *
 * Run all scenarios against production:
 *   BASE_URL=https://hearguard-ai.onrender.com k6 run tests/k6/load-test.js
 *
 * Install k6: https://k6.io/docs/getting-started/installation
 */

import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Counter, Rate, Trend } from 'k6/metrics';
import { htmlReport } from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js';
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.2/index.js';

// ── Custom metrics ────────────────────────────────────────────────────────────

const authErrors    = new Counter('auth_errors');
const noiseErrors   = new Counter('noise_errors');
const successRate   = new Rate('success_rate');
const loginDuration = new Trend('login_duration_ms', true);
const noiseDuration = new Trend('noise_post_duration_ms', true);

// ISO 9126 — Eficiencia › Utilización de recursos
const heapUsedMb  = new Trend('resource_heap_used_mb',  true);
const rssMb       = new Trend('resource_rss_mb',        true);
const uptimeS     = new Trend('resource_uptime_s',      true);
const memWarnings = new Counter('resource_mem_warnings');    // heap > umbral

// ── Scenario definitions ──────────────────────────────────────────────────────

const SMOKE_SCENARIO = {
  executor: 'constant-vus',
  vus: 1,
  duration: '30s',
  tags: { scenario: 'smoke' },
  env: { SCENARIO: 'smoke' },
};

const LOAD_SCENARIO = {
  executor: 'ramping-vus',
  startVUs: 0,
  stages: [
    { duration: '30s', target: 10 },
    { duration: '1m', target: 10 },
    { duration: '15s', target: 0 },
  ],
  tags: { scenario: 'load' },
  env: { SCENARIO: 'load' },
  startTime: '35s',
};

const SPIKE_SCENARIO = {
  executor: 'ramping-vus',
  startVUs: 0,
  stages: [
    { duration: '10s', target: 50 },
    { duration: '30s', target: 50 },
    { duration: '10s', target: 0 },
  ],
  tags: { scenario: 'spike' },
  env: { SCENARIO: 'spike' },
  startTime: '3m',
};

// ── Configuration ─────────────────────────────────────────────────────────────

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';
const TEST_PASSWORD = __ENV.TEST_PASSWORD || 'HGload#test1'; // NOSONAR — load test credential, not a real secret
const SMOKE_ONLY = __ENV.K6_SMOKE_ONLY === 'true';

export const options = {
  scenarios: SMOKE_ONLY
    ? { smoke: SMOKE_SCENARIO }
    : { smoke: SMOKE_SCENARIO, load: LOAD_SCENARIO, spike: SPIKE_SCENARIO },

  thresholds: {
    http_req_duration:       ['p(95)<2000', 'p(99)<5000'],
    http_req_failed:         ['rate<0.05'],
    success_rate:            ['rate>0.95'],
    login_duration_ms:       ['p(90)<1500'],
    noise_post_duration_ms:  ['p(90)<1000'],
    // ISO 9126 — Utilización de recursos
    resource_heap_used_mb:   ['p(95)<200'],  // heap < 200 MB en el p95
    resource_rss_mb:         ['p(95)<350'],  // RSS  < 350 MB en el p95
    resource_mem_warnings:   ['count<5'],    // menos de 5 picos de heap > 150 MB
  },
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function headers(token) {
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

function uniqueEmail() {
  return `k6_${Date.now()}_${Math.random().toString(36).slice(2)}@test.com`;
}

// ── Main VU function ──────────────────────────────────────────────────────────

export default function vuLoop() {
  const email = uniqueEmail();
  let token = null;

  group('Health', () => {
    const res = http.get(`${BASE_URL}/health`);
    check(res, {
      'health 200': (r) => r.status === 200,
      'health ok': (r) => JSON.parse(r.body).data?.status === 'ok',
    });
  });

  sleep(0.5);

  group('Register', () => {
    const res = http.post(
      `${BASE_URL}/api/auth/register`,
      JSON.stringify({ name: 'Load Tester', email, password: TEST_PASSWORD }),
      { headers: headers() },
    );
    const ok = check(res, {
      'register 201': (r) => r.status === 201,
      'register token present': (r) => !!JSON.parse(r.body).data?.accessToken,
    });
    if (!ok) authErrors.add(1);
    successRate.add(ok);
    if (res.status === 201) token = JSON.parse(res.body).data.accessToken;
  });

  sleep(0.5);

  group('Login', () => {
    const start = Date.now();
    const res = http.post(
      `${BASE_URL}/api/auth/login`,
      JSON.stringify({ email, password: TEST_PASSWORD }),
      { headers: headers() },
    );
    loginDuration.add(Date.now() - start);
    const ok = check(res, {
      'login 200': (r) => r.status === 200,
      'login token present': (r) => !!JSON.parse(r.body).data?.accessToken,
    });
    if (!ok) authErrors.add(1);
    successRate.add(ok);
    if (res.status === 200) token = JSON.parse(res.body).data.accessToken;
  });

  if (!token) return;

  sleep(0.5);

  group('Noise POST', () => {
    const dbLevel = Math.floor(Math.random() * 80) + 30;
    const start = Date.now();
    const res = http.post(
      `${BASE_URL}/api/noise`,
      JSON.stringify({ dbLevel, source: 'app' }),
      { headers: headers(token) },
    );
    noiseDuration.add(Date.now() - start);
    const ok = check(res, {
      'noise 201': (r) => r.status === 201,
      'noise riskTag present': (r) => !!JSON.parse(r.body).data?.record?.riskTag,
    });
    if (!ok) noiseErrors.add(1);
    successRate.add(ok);
  });

  sleep(0.5);

  group('Noise GET', () => {
    const res = http.get(`${BASE_URL}/api/noise?limit=10`, { headers: headers(token) });
    check(res, {
      'noise list 200': (r) => r.status === 200,
      'noise items array': (r) => Array.isArray(JSON.parse(r.body).data?.items),
    });
  });

  sleep(0.5);

  group('Noise stats', () => {
    const today = http.get(`${BASE_URL}/api/noise/stats/today`, { headers: headers(token) });
    check(today, { 'stats/today 200': (r) => r.status === 200 });
    const week = http.get(`${BASE_URL}/api/noise/stats/week`, { headers: headers(token) });
    check(week, { 'stats/week 200': (r) => r.status === 200 });
  });

  sleep(0.5);

  // ISO 9126 — Eficiencia › Utilización de recursos
  group('Resource utilization', () => {
    const res = http.get(`${BASE_URL}/metrics`);
    const ok = check(res, {
      'metrics 200':            (r) => r.status === 200,
      'metrics has memory':     (r) => !!JSON.parse(r.body).data?.memory,
      'metrics has cpu':        (r) => !!JSON.parse(r.body).data?.cpu,
    });

    if (ok && res.status === 200) {
      const d = JSON.parse(res.body).data;
      const heap = d.memory.heap_used_mb;
      const rss  = d.memory.rss_mb;

      heapUsedMb.add(heap);
      rssMb.add(rss);
      uptimeS.add(d.uptime_s);

      // registrar advertencia si el heap supera 150 MB
      if (heap > 150) {
        memWarnings.add(1);
        console.warn(`[resources] heap alto: ${heap} MB`);
      }
    }
  });

  sleep(0.5);
}

export function setup() {
  console.log(`[k6] Target: ${BASE_URL}`);
  const res = http.get(`${BASE_URL}/health`);
  if (res.status !== 200) {
    throw new Error(`Backend unreachable at ${BASE_URL}/health → HTTP ${res.status}`);
  }
  console.log('[k6] Backend healthy — starting scenarios');
}

// ── Summary report ────────────────────────────────────────────────────────────
// Generates reports/k6/index.html and echoes the text summary to stdout.
// The reports/ directory must exist before k6 runs (CI creates it with mkdir -p).
export function handleSummary(data) {
  return {
    'reports/k6/index.html': htmlReport(data),
    stdout: textSummary(data, { indent: ' ', enableColors: true }),
  };
}
