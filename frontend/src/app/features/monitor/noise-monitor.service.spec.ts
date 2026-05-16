import { TestBed } from '@angular/core/testing';
import { NoiseMonitorService } from './noise-monitor.service';

describe('NoiseMonitorService', () => {
  let service: NoiseMonitorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NoiseMonitorService);
  });

  afterEach(async () => {
    await service.stop();
  });

  // ── Instantiation ────────────────────────────────────────────────────────────

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('starts with dbLevel = 0', () => {
    expect(service.dbLevel()).toBe(0);
  });

  it('starts with empty history', () => {
    expect(service.history()).toHaveLength(0);
  });

  // ── classifyRisk ─────────────────────────────────────────────────────────────

  describe('classifyRisk', () => {
    it('< 55 dB → Bajo (green)', () => {
      const r = service.classifyRisk(40);
      expect(r.tag).toBe('Bajo');
      expect(r.color).toBe('#22C55E');
    });

    it('55 dB → Moderado', () => {
      const r = service.classifyRisk(55);
      expect(r.tag).toBe('Moderado');
    });

    it('74 dB → Moderado (upper boundary)', () => {
      const r = service.classifyRisk(74);
      expect(r.tag).toBe('Moderado');
    });

    it('75 dB → Alto', () => {
      const r = service.classifyRisk(75);
      expect(r.tag).toBe('Alto');
      expect(r.color).toBe('#FF8C00');
    });

    it('94 dB → Alto (upper boundary)', () => {
      const r = service.classifyRisk(94);
      expect(r.tag).toBe('Alto');
    });

    it('95 dB → Muy Alto (red)', () => {
      const r = service.classifyRisk(95);
      expect(r.tag).toBe('Muy Alto');
      expect(r.color).toBe('#FF4D4D');
    });

    it('120 dB → Muy Alto', () => {
      const r = service.classifyRisk(120);
      expect(r.tag).toBe('Muy Alto');
    });

    it('0 dB → Bajo', () => {
      const r = service.classifyRisk(0);
      expect(r.tag).toBe('Bajo');
    });

    const levels = [
      [30, 'Bajo'],
      [54, 'Bajo'],
      [55, 'Moderado'],
      [60, 'Moderado'],
      [75, 'Alto'],
      [85, 'Alto'],
      [95, 'Muy Alto'],
      [110, 'Muy Alto'],
    ] as const;

    levels.forEach(([db, expected]) => {
      it(`${db} dB → ${expected}`, () => {
        expect(service.classifyRisk(db).tag).toBe(expected);
      });
    });
  });

  // ── stop ─────────────────────────────────────────────────────────────────────

  it('stop resolves without error when never started', async () => {
    await expect(service.stop()).resolves.toBeUndefined();
  });

  it('stop can be called multiple times safely', async () => {
    await service.stop();
    await service.stop();
    // No exception thrown
    expect(true).toBe(true);
  });

  // ── startMic error handling ───────────────────────────────────────────────────

  it('startMic rejects when getUserMedia is not available', async () => {
    const originalNav = globalThis.navigator;
    Object.defineProperty(globalThis, 'navigator', {
      value: { mediaDevices: undefined },
      configurable: true,
    });
    await expect(service.startMic()).rejects.toThrow();
    Object.defineProperty(globalThis, 'navigator', {
      value: originalNav,
      configurable: true,
    });
  });

  it('startMic rejects when getUserMedia throws (permission denied)', async () => {
    const originalNav = globalThis.navigator;
    Object.defineProperty(globalThis, 'navigator', {
      value: {
        mediaDevices: {
          getUserMedia: () => Promise.reject(new DOMException('NotAllowedError')),
        },
      },
      configurable: true,
    });
    await expect(service.startMic()).rejects.toBeInstanceOf(DOMException);
    Object.defineProperty(globalThis, 'navigator', {
      value: originalNav,
      configurable: true,
    });
  });
});
