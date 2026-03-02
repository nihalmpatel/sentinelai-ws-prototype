import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import type { AuditEvent } from '../../core/models/audit.model';

@Component({
  selector: 'sentinel-audit-panel',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="rounded-xl border border-slate-800/60 bg-slate-900/40 p-5">
      <div class="flex items-center gap-2 mb-4">
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
            d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span class="text-xs font-semibold text-slate-300">Audit Trail</span>
        <span class="text-[10px] text-slate-600"
          >read-only · chronological</span
        >
      </div>

      <div
        *ngIf="!events || events.length === 0"
        class="text-xs text-slate-500"
      >
        No audit events recorded yet.
      </div>

      <div *ngIf="events && events.length > 0" class="relative">
        <!-- Timeline line -->
        <div
          class="absolute left-[7px] top-2 bottom-2 w-px bg-slate-800/60"
        ></div>

        <div
          *ngFor="let e of events; let i = index"
          class="relative pl-6 pb-4 last:pb-0"
        >
          <!-- Timeline dot -->
          <div
            class="absolute left-0 top-1.5 h-3.5 w-3.5 rounded-full border-2"
            [ngClass]="{
              'border-indigo-500 bg-indigo-500/20': e.actorType === 'AI',
              'border-emerald-500 bg-emerald-500/20': e.actorType === 'HUMAN',
              'border-slate-500 bg-slate-500/20': e.actorType === 'SYSTEM',
            }"
          ></div>

          <div
            class="rounded-lg border border-slate-800/40 bg-slate-950/30 p-3"
          >
            <div class="flex items-center justify-between gap-3">
              <div class="flex items-center gap-2 text-xs">
                <span
                  class="inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-semibold"
                  [ngClass]="{
                    'bg-indigo-500/10 text-indigo-300': e.actorType === 'AI',
                    'bg-emerald-500/10 text-emerald-300':
                      e.actorType === 'HUMAN',
                    'bg-slate-500/10 text-slate-400': e.actorType === 'SYSTEM',
                  }"
                  >{{ e.actorType }}</span
                >
                <span class="font-medium text-slate-200">{{ e.action }}</span>
                <span *ngIf="e.actorId" class="text-slate-500"
                  >({{ e.actorId }})</span
                >
              </div>
              <span class="text-[11px] text-slate-500 whitespace-nowrap">{{
                e.timestamp | date: 'MMM d, HH:mm:ss'
              }}</span>
            </div>

            <pre
              *ngIf="e.metadata"
              class="mt-2 overflow-auto rounded-md border border-slate-800/40 bg-slate-950/40 p-2 text-[11px] text-slate-400 max-h-32"
              >{{ e.metadata | json }}</pre
            >
          </div>
        </div>
      </div>
    </div>
  `,
})
export class AuditPanelComponent {
  @Input() events: AuditEvent[] | null | undefined;
}
