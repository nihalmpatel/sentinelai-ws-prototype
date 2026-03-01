import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import type { AuditEvent } from '../../core/models/audit.model';

@Component({
  selector: 'sentinel-audit-panel',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-3">
      <div class="mb-2 flex items-center justify-between">
        <div class="text-xs font-semibold uppercase tracking-wide text-slate-300">
          Audit trail
        </div>
        <div class="text-[11px] text-slate-500">Read-only · chronological</div>
      </div>

      <div *ngIf="!events || events.length === 0" class="text-xs text-slate-500">
        No audit events recorded yet for this case.
      </div>

      <ol *ngIf="events && events.length > 0" class="space-y-2">
        <li
          *ngFor="let e of events"
          class="rounded-lg border border-slate-800 bg-slate-950/40 px-3 py-2"
        >
          <div class="flex items-center justify-between gap-3">
            <div class="text-xs text-slate-200">
              <span class="font-semibold">{{ e.actorType }}</span>
              <span class="text-slate-400">·</span>
              <span class="font-medium">{{ e.action }}</span>
              <span *ngIf="e.actorId" class="text-slate-400">({{ e.actorId }})</span>
            </div>
            <div class="text-[11px] text-slate-500">
              {{ e.timestamp | date: 'short' }}
            </div>
          </div>

          <pre
            *ngIf="e.metadata"
            class="mt-2 overflow-auto rounded-md border border-slate-800 bg-slate-950/60 p-2 text-[11px] text-slate-300"
          >{{ e.metadata | json }}</pre>
        </li>
      </ol>
    </div>
  `,
})
export class AuditPanelComponent {
  @Input() events: AuditEvent[] | null | undefined;
}

