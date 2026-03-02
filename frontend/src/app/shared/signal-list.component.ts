import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import type { RiskSignal } from '../core/models/risk.model';

@Component({
  selector: 'sentinel-signal-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="rounded-xl border border-slate-800/60 bg-slate-900/40 p-4">
      <div class="flex items-center gap-2 mb-3">
        <svg
          class="h-4 w-4 text-slate-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="1.5"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5"
          />
        </svg>
        <span class="text-xs font-semibold text-slate-300">Risk Signals</span>
        <span class="text-[10px] text-slate-600">contributing factors</span>
      </div>

      <div
        *ngIf="!signals || signals.length === 0"
        class="text-xs text-slate-500"
      >
        No risk signals detected — low-risk or unevaluated case.
      </div>

      <div *ngIf="signals && signals.length > 0" class="space-y-1.5">
        <div
          *ngFor="let s of signals"
          class="flex items-center justify-between rounded-lg border border-slate-800/40 bg-slate-950/30 px-3 py-2"
        >
          <div class="flex items-center gap-2 text-xs">
            <span
              class="h-1.5 w-1.5 rounded-full"
              [ngClass]="{
                'bg-emerald-400': s.weight < 0.33,
                'bg-amber-400': s.weight >= 0.33 && s.weight < 0.66,
                'bg-rose-400': s.weight >= 0.66,
              }"
            ></span>
            <span class="text-slate-200">{{ s.label }}</span>
          </div>
          <div class="flex items-center gap-2">
            <div class="h-1 w-16 rounded-full bg-slate-800 overflow-hidden">
              <div
                class="h-full rounded-full transition-all"
                [style.width.%]="s.weight * 100"
                [ngClass]="{
                  'bg-emerald-500': s.weight < 0.33,
                  'bg-amber-500': s.weight >= 0.33 && s.weight < 0.66,
                  'bg-rose-500': s.weight >= 0.66,
                }"
              ></div>
            </div>
            <span class="text-[11px] font-mono text-slate-500 w-8 text-right">{{
              s.weight | number: '1.2-2'
            }}</span>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class SignalListComponent {
  @Input() signals: RiskSignal[] | null | undefined;
}
