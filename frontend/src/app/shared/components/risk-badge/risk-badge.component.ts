import { Component, input, computed } from '@angular/core';

@Component({
  selector: 'hg-risk-badge',
  standalone: true,
  template: `
    <span class="badge" [style.background]="bg()" [style.color]="fg()">{{
      tag()
    }}</span>
  `,
  styleUrl: './risk-badge.component.scss',
})
export class RiskBadgeComponent {
  readonly level = input<string>('bajo');

  readonly tag = computed(() => this.level().replace('_', ' '));

  readonly bg = computed(() => {
    const l = this.level();
    if (l.includes('muy')) return 'rgba(255,77,77,0.25)';
    if (l === 'alto') return 'rgba(245,158,11,0.25)';
    if (l === 'moderado') return 'rgba(245,158,11,0.18)';
    return 'rgba(34,197,94,0.22)';
  });

  readonly fg = computed(() => {
    const l = this.level();
    if (l.includes('muy') || l === 'alto') return 'var(--danger)';
    if (l === 'moderado') return 'var(--warning)';
    return 'var(--success)';
  });
}
