import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

type RiskLabel = 'LOW' | 'MEDIUM' | 'HIGH' | 'UNKNOWN';

@Component({
  selector: 'sentinel-risk-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span
      class="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold tracking-wide"
      [ngClass]="badgeClass"
    >
      <span class="h-1.5 w-1.5 rounded-full" [ngClass]="dotClass"></span>
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
    if (label === 'UNKNOWN') return 'N/A';
    return label;
  }

  get dotClass(): string {
    switch (this.label) {
      case 'LOW':
        return 'bg-emerald-400';
      case 'MEDIUM':
        return 'bg-amber-400';
      case 'HIGH':
        return 'bg-rose-400';
      default:
        return 'bg-slate-400';
    }
  }

  get badgeClass(): string {
    switch (this.label) {
      case 'LOW':
        return 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30';
      case 'MEDIUM':
        return 'bg-amber-500/10 text-amber-300 border-amber-500/30';
      case 'HIGH':
        return 'bg-rose-500/10 text-rose-300 border-rose-500/30';
      default:
        return 'bg-slate-700/30 text-slate-400 border-slate-600/30';
    }
  }
}
