import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

type RiskLabel = 'LOW' | 'MEDIUM' | 'HIGH' | 'UNKNOWN';

@Component({
  selector: 'sentinel-risk-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span
      class="inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium"
      [ngClass]="badgeClass"
    >
      {{ text }}
    </span>
  `,
})
export class RiskBadgeComponent {
  @Input() score: number | null | undefined;
  @Input() prefix = '';

  private get label(): RiskLabel {
    const score = this.score;
    if (typeof score !== 'number' || Number.isNaN(score)) {
      return 'UNKNOWN';
    }
    if (score < 0.33) return 'LOW';
    if (score < 0.66) return 'MEDIUM';
    return 'HIGH';
  }

  get text(): string {
    const label = this.label;
    const base = label === 'UNKNOWN' ? 'RISK: UNKNOWN' : `RISK: ${label}`;
    return this.prefix ? `${this.prefix}${base}` : base;
  }

  get badgeClass(): string {
    switch (this.label) {
      case 'LOW':
        return 'bg-emerald-500/10 text-emerald-300 border-emerald-500/40';
      case 'MEDIUM':
        return 'bg-amber-500/10 text-amber-300 border-amber-500/40';
      case 'HIGH':
        return 'bg-rose-500/10 text-rose-300 border-rose-500/40';
      default:
        return 'bg-slate-700/50 text-slate-200 border-slate-500/40';
    }
  }
}

