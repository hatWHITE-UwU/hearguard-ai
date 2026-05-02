import { Component, input, computed } from '@angular/core';

@Component({
  selector: 'hg-gauge',
  standalone: true,
  template: `
    <svg viewBox="0 0 120 120" width="140" height="140">
      <circle
        cx="60"
        cy="60"
        r="48"
        fill="none"
        stroke="var(--border)"
        stroke-width="10"
      />
      <circle
        cx="60"
        cy="60"
        r="48"
        fill="none"
        [attr.stroke]="color()"
        stroke-width="10"
        stroke-linecap="round"
        [attr.stroke-dasharray]="dash()"
        stroke-dashoffset="0"
        transform="rotate(-90 60 60)"
      />
      <text
        x="60"
        y="58"
        text-anchor="middle"
        fill="var(--text-primary)"
        font-size="14"
        font-weight="600"
      >
        {{ label() }}
      </text>
      <text
        x="60"
        y="78"
        text-anchor="middle"
        fill="var(--text-muted)"
        font-size="11"
      >
        {{ sublabel() }}
      </text>
    </svg>
  `,
})
export class GaugeComponent {
  readonly score = input(0);
  readonly max = input(100);
  readonly label = input('');
  readonly sublabel = input('');

  readonly color = computed(() => {
    const s = this.score();
    if (s < 26) return 'var(--success)';
    if (s < 51) return 'var(--warning)';
    return 'var(--danger)';
  });

  readonly dash = computed(() => {
    const pct = Math.min(1, this.score() / (this.max() || 100));
    const c = 2 * Math.PI * 48;
    return `${c * pct} ${c}`;
  });
}
