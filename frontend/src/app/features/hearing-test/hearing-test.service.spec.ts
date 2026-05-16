import { TestBed } from '@angular/core/testing';
import { HearingTestService, FREQUENCIES } from './hearing-test.service';

describe('HearingTestService', () => {
  let service: HearingTestService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HearingTestService);
  });

  afterEach(() => {
    service.resetFlow();
  });

  // ── Instantiation ────────────────────────────────────────────────────────────

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('starts with currentStepIndex = 0', () => {
    expect(service.currentStepIndex()).toBe(0);
  });

  it('starts with empty scores', () => {
    expect(service.scores()).toHaveLength(0);
  });

  it('starts not complete', () => {
    expect(service.isComplete()).toBe(false);
  });

  // ── steps computed ───────────────────────────────────────────────────────────

  it('has 12 steps (2 ears × 6 frequencies)', () => {
    expect(service.steps()).toHaveLength(12);
  });

  it('first 6 steps are left ear', () => {
    const leftSteps = service.steps().slice(0, 6);
    expect(leftSteps.every((s) => s.ear === 'left')).toBe(true);
  });

  it('last 6 steps are right ear', () => {
    const rightSteps = service.steps().slice(6);
    expect(rightSteps.every((s) => s.ear === 'right')).toBe(true);
  });

  it('covers all expected frequencies for each ear', () => {
    const leftHz = service
      .steps()
      .filter((s) => s.ear === 'left')
      .map((s) => s.hz);
    expect(leftHz).toEqual([...FREQUENCIES]);
  });

  // ── currentStep computed ─────────────────────────────────────────────────────

  it('currentStep returns the step at currentStepIndex', () => {
    expect(service.currentStep()).toEqual({ hz: 250, ear: 'left' });
  });

  // ── calculateScoreFromGain ───────────────────────────────────────────────────

  it('gain=1 → score 0 (barely audible at max)', () => {
    expect(service.calculateScoreFromGain(1)).toBe(0);
  });

  it('gain=0.01 → score 10 (heard at minimum volume)', () => {
    expect(service.calculateScoreFromGain(0.01)).toBe(10);
  });

  it('gain=0.5 → score 5 (mid-range)', () => {
    expect(service.calculateScoreFromGain(0.5)).toBe(5);
  });

  it('gain above 1 clamps to max → score 0', () => {
    expect(service.calculateScoreFromGain(1.5)).toBe(0);
  });

  it('gain below 0.01 clamps to min → score 10', () => {
    expect(service.calculateScoreFromGain(0)).toBe(10);
  });

  it('score is always an integer', () => {
    [0.1, 0.3, 0.7, 0.95].forEach((g) => {
      expect(Number.isInteger(service.calculateScoreFromGain(g))).toBe(true);
    });
  });

  // ── recordHeard ──────────────────────────────────────────────────────────────

  it('recordHeard appends a score row with correct hz and ear', () => {
    service.recordHeard();
    const row = service.scores()[0];
    expect(row.hz).toBe(250);
    expect(row.ear).toBe('left');
  });

  it('recordHeard advances currentStepIndex by 1', () => {
    service.recordHeard();
    expect(service.currentStepIndex()).toBe(1);
  });

  it('recordHeard score = calculateScoreFromGain(volume)', () => {
    const expectedScore = service.calculateScoreFromGain(service.volume());
    service.recordHeard();
    expect(service.scores()[0].score).toBe(expectedScore);
  });

  // ── recordNotHeard ───────────────────────────────────────────────────────────

  it('recordNotHeard appends score=0', () => {
    service.recordNotHeard();
    expect(service.scores()[0].score).toBe(0);
  });

  it('recordNotHeard advances currentStepIndex by 1', () => {
    service.recordNotHeard();
    expect(service.currentStepIndex()).toBe(1);
  });

  it('recordNotHeard uses current step hz and ear', () => {
    service.recordNotHeard();
    const row = service.scores()[0];
    expect(row.hz).toBe(250);
    expect(row.ear).toBe('left');
  });

  // ── isComplete ───────────────────────────────────────────────────────────────

  it('isComplete becomes true after all 12 steps', () => {
    for (let i = 0; i < 12; i++) {
      service.recordHeard();
    }
    expect(service.isComplete()).toBe(true);
  });

  it('isComplete is false with 11 steps recorded', () => {
    for (let i = 0; i < 11; i++) {
      service.recordNotHeard();
    }
    expect(service.isComplete()).toBe(false);
  });

  // ── resetFlow ────────────────────────────────────────────────────────────────

  it('resetFlow sets currentStepIndex back to 0', () => {
    service.recordHeard();
    service.recordHeard();
    service.resetFlow();
    expect(service.currentStepIndex()).toBe(0);
  });

  it('resetFlow clears scores', () => {
    service.recordHeard();
    service.resetFlow();
    expect(service.scores()).toHaveLength(0);
  });

  it('resetFlow restores isComplete to false', () => {
    for (let i = 0; i < 12; i++) service.recordHeard();
    service.resetFlow();
    expect(service.isComplete()).toBe(false);
  });

  // ── seedDemoSession ──────────────────────────────────────────────────────────

  it('seedDemoSession produces exactly 12 score rows', () => {
    service.seedDemoSession();
    expect(service.scores()).toHaveLength(12);
  });

  it('seedDemoSession marks test as complete', () => {
    service.seedDemoSession();
    expect(service.isComplete()).toBe(true);
  });

  it('seedDemoSession sets habitData', () => {
    service.seedDemoSession();
    expect(service.habitData()).not.toBeNull();
  });

  it('seedDemoSession respects overallTarget parameter', () => {
    service.seedDemoSession(9);
    const avg =
      service.scores().reduce((s, r) => s + r.score, 0) / service.scores().length;
    expect(avg).toBeGreaterThanOrEqual(7);
    expect(avg).toBeLessThanOrEqual(10);
  });

  it('seedDemoSession scores are in 0–10 range', () => {
    service.seedDemoSession(5);
    service.scores().forEach((row) => {
      expect(row.score).toBeGreaterThanOrEqual(0);
      expect(row.score).toBeLessThanOrEqual(10);
    });
  });

  // ── setGainLive ──────────────────────────────────────────────────────────────

  it('setGainLive updates the volume signal', () => {
    service.setGainLive(0.75);
    expect(service.volume()).toBe(0.75);
  });

  // ── recordHeard does nothing when test is already complete ───────────────────

  it('does nothing on recordHeard when isComplete', () => {
    for (let i = 0; i < 12; i++) service.recordHeard();
    const scoresBefore = service.scores().length;
    service.recordHeard();
    expect(service.scores().length).toBe(scoresBefore);
  });
});
