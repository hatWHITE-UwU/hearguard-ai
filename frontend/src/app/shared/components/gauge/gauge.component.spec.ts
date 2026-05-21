import { TestBed } from '@angular/core/testing';
import { GaugeComponent } from './gauge.component';

describe('GaugeComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GaugeComponent],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(GaugeComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  describe('color()', () => {
    it('returns success color when score < 26', () => {
      const fixture = TestBed.createComponent(GaugeComponent);
      fixture.componentRef.setInput('score', 10);
      fixture.detectChanges();
      expect(fixture.componentInstance.color()).toBe('var(--success)');
    });

    it('returns warning color when 26 <= score < 51', () => {
      const fixture = TestBed.createComponent(GaugeComponent);
      fixture.componentRef.setInput('score', 40);
      fixture.detectChanges();
      expect(fixture.componentInstance.color()).toBe('var(--warning)');
    });

    it('returns danger color when score >= 51', () => {
      const fixture = TestBed.createComponent(GaugeComponent);
      fixture.componentRef.setInput('score', 75);
      fixture.detectChanges();
      expect(fixture.componentInstance.color()).toBe('var(--danger)');
    });
  });

  describe('dash()', () => {
    it('computes correct dasharray for score 0', () => {
      const fixture = TestBed.createComponent(GaugeComponent);
      fixture.componentRef.setInput('score', 0);
      fixture.componentRef.setInput('max', 100);
      fixture.detectChanges();
      const c = 2 * Math.PI * 48;
      expect(fixture.componentInstance.dash()).toBe(`0 ${c}`);
    });

    it('computes correct dasharray for score 50', () => {
      const fixture = TestBed.createComponent(GaugeComponent);
      fixture.componentRef.setInput('score', 50);
      fixture.componentRef.setInput('max', 100);
      fixture.detectChanges();
      const c = 2 * Math.PI * 48;
      expect(fixture.componentInstance.dash()).toBe(`${c * 0.5} ${c}`);
    });

    it('clamps to 1 when score > max', () => {
      const fixture = TestBed.createComponent(GaugeComponent);
      fixture.componentRef.setInput('score', 200);
      fixture.componentRef.setInput('max', 100);
      fixture.detectChanges();
      const c = 2 * Math.PI * 48;
      expect(fixture.componentInstance.dash()).toBe(`${c} ${c}`);
    });

    it('uses 100 as denominator when max is 0', () => {
      const fixture = TestBed.createComponent(GaugeComponent);
      fixture.componentRef.setInput('score', 50);
      fixture.componentRef.setInput('max', 0);
      fixture.detectChanges();
      const c = 2 * Math.PI * 48;
      expect(fixture.componentInstance.dash()).toBe(`${c * 0.5} ${c}`);
    });
  });
});
