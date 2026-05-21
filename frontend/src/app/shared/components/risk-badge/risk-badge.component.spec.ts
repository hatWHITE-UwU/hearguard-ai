import { TestBed } from '@angular/core/testing';
import { RiskBadgeComponent } from './risk-badge.component';

describe('RiskBadgeComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RiskBadgeComponent],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(RiskBadgeComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  describe('tag()', () => {
    it('replaces underscore with space', () => {
      const fixture = TestBed.createComponent(RiskBadgeComponent);
      fixture.componentRef.setInput('level', 'muy_alto');
      fixture.detectChanges();
      expect(fixture.componentInstance.tag()).toBe('muy alto');
    });
  });

  describe('bg()', () => {
    it('returns red tint for muy_alto', () => {
      const fixture = TestBed.createComponent(RiskBadgeComponent);
      fixture.componentRef.setInput('level', 'muy_alto');
      fixture.detectChanges();
      expect(fixture.componentInstance.bg()).toBe('rgba(255,77,77,0.25)');
    });

    it('returns orange tint for alto', () => {
      const fixture = TestBed.createComponent(RiskBadgeComponent);
      fixture.componentRef.setInput('level', 'alto');
      fixture.detectChanges();
      expect(fixture.componentInstance.bg()).toBe('rgba(245,158,11,0.25)');
    });

    it('returns lighter orange for moderado', () => {
      const fixture = TestBed.createComponent(RiskBadgeComponent);
      fixture.componentRef.setInput('level', 'moderado');
      fixture.detectChanges();
      expect(fixture.componentInstance.bg()).toBe('rgba(245,158,11,0.18)');
    });

    it('returns green tint for bajo', () => {
      const fixture = TestBed.createComponent(RiskBadgeComponent);
      fixture.componentRef.setInput('level', 'bajo');
      fixture.detectChanges();
      expect(fixture.componentInstance.bg()).toBe('rgba(34,197,94,0.22)');
    });
  });

  describe('fg()', () => {
    it('returns danger for muy_alto', () => {
      const fixture = TestBed.createComponent(RiskBadgeComponent);
      fixture.componentRef.setInput('level', 'muy_alto');
      fixture.detectChanges();
      expect(fixture.componentInstance.fg()).toBe('var(--danger)');
    });

    it('returns danger for alto', () => {
      const fixture = TestBed.createComponent(RiskBadgeComponent);
      fixture.componentRef.setInput('level', 'alto');
      fixture.detectChanges();
      expect(fixture.componentInstance.fg()).toBe('var(--danger)');
    });

    it('returns warning for moderado', () => {
      const fixture = TestBed.createComponent(RiskBadgeComponent);
      fixture.componentRef.setInput('level', 'moderado');
      fixture.detectChanges();
      expect(fixture.componentInstance.fg()).toBe('var(--warning)');
    });

    it('returns success for bajo', () => {
      const fixture = TestBed.createComponent(RiskBadgeComponent);
      fixture.componentRef.setInput('level', 'bajo');
      fixture.detectChanges();
      expect(fixture.componentInstance.fg()).toBe('var(--success)');
    });
  });
});
