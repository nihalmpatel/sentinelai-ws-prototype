import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import type { RiskSignal } from '../core/models/risk.model';

@Component({
  selector: 'sentinel-signal-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-3">
      <div class="mb-2 flex items-center justify-between">
        <div class="text-xs font-semibold uppercase tracking-wide text-slate-300">
          Risk signals
        </div>
        <div class="text-[11px] text-slate-500">
          Key factors contributing to this risk score
        </div>
      </div>

      <div *ngIf="!signals || signals.length === 0" class="text-xs text-slate-500">
        No explicit risk signals attached yet; this may be a low-risk or unevaluated case.
      </div>

      <ul *ngIf="signals && signals.length > 0" class="space-y-2">
        <li
          *ngFor="let s of signals"
          class="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950/40 px-3 py-2 text-sm"
        >
          <div class="flex items-center gap-2">
            <span class="h-1.5 w-1.5 rounded-full bg-amber-400"></span>
            <span>{{ s.label }}</span>
          </div>
          <span class="text-xs text-slate-400">Weight: {{ s.weight | number: '1.2-2' }}</span>
        </li>
      </ul>
    </div>
  `,
})
export class SignalListComponent {
  @Input() signals: RiskSignal[] | null | undefined;
}

