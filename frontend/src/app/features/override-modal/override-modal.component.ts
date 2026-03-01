import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import type { RecommendedAction } from '../../core/models/decision.model';
import type { IrreversibleAction } from '../../core/models/review.model';

export interface OverrideSubmission {
  finalAction: RecommendedAction;
  rationale: string;
  irreversibleAction?: IrreversibleAction;
  confirmedIrreversible?: boolean;
}

@Component({
  selector: 'sentinel-override-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div *ngIf="open" class="fixed inset-0 z-50">
      <div class="absolute inset-0 bg-slate-950/70" (click)="cancel.emit()"></div>

      <div class="absolute inset-0 flex items-center justify-center p-4">
        <div class="w-full max-w-xl rounded-2xl border border-slate-800 bg-slate-900 shadow-xl">
          <div class="border-b border-slate-800 px-5 py-4">
            <div class="flex items-center justify-between">
              <div>
                <div class="text-sm font-semibold text-slate-50">Override AI decision</div>
                <div class="mt-1 text-xs text-slate-400">
                  Requires an explicit final decision and a rationale.
                </div>
              </div>
              <button
                type="button"
                class="rounded-md border border-slate-700 bg-slate-950/50 px-2 py-1 text-xs text-slate-200 hover:bg-slate-800/60"
                (click)="cancel.emit()"
              >
                Close
              </button>
            </div>
          </div>

          <div class="px-5 py-4 space-y-4">
            <div class="rounded-lg border border-indigo-500/50 bg-indigo-950/30 p-3 text-xs text-indigo-100">
              <div class="font-semibold uppercase tracking-wide">AI recommendation</div>
              <div class="mt-1 text-sm text-indigo-50">
                {{ aiRecommendedAction || 'Unknown' }}
              </div>
            </div>

            <div class="space-y-1.5">
              <label class="text-xs font-semibold uppercase tracking-wide text-slate-300">
                Final action (human)
              </label>
              <select
                class="w-full rounded-md border border-slate-700 bg-slate-950/40 px-3 py-2 text-sm text-slate-50"
                [(ngModel)]="finalAction"
              >
                <option [ngValue]="'NO_ACTION'">NO_ACTION</option>
                <option [ngValue]="'MONITOR'">MONITOR</option>
                <option [ngValue]="'TEMP_HOLD'">TEMP_HOLD</option>
                <option [ngValue]="'ESCALATE'">ESCALATE</option>
              </select>
            </div>

            <div class="space-y-1.5">
              <label class="text-xs font-semibold uppercase tracking-wide text-slate-300">
                Rationale (required)
              </label>
              <textarea
                class="min-h-[96px] w-full rounded-md border border-slate-700 bg-slate-950/40 px-3 py-2 text-sm text-slate-50"
                [(ngModel)]="rationale"
                placeholder="Explain why you are overriding the AI recommendation…"
              ></textarea>
              <div *ngIf="rationale.trim().length === 0" class="text-[11px] text-rose-200/80">
                Rationale is required for overrides.
              </div>
            </div>

            <div class="rounded-lg border border-slate-800 bg-slate-950/30 p-3 space-y-2">
              <div class="text-xs font-semibold uppercase tracking-wide text-slate-300">
                Irreversible actions (human-only)
              </div>

              <div class="flex items-center gap-2 text-xs text-slate-300">
                <input type="checkbox" [(ngModel)]="enableIrreversible" />
                <span>Trigger an irreversible action (demo)</span>
              </div>

              <div *ngIf="enableIrreversible" class="space-y-2">
                <select
                  class="w-full rounded-md border border-slate-700 bg-slate-950/40 px-3 py-2 text-sm text-slate-50"
                  [(ngModel)]="irreversibleAction"
                >
                  <option [ngValue]="'PERMANENT_ACCOUNT_CLOSURE'">
                    PERMANENT_ACCOUNT_CLOSURE
                  </option>
                  <option [ngValue]="'LAW_ENFORCEMENT_REPORT'">LAW_ENFORCEMENT_REPORT</option>
                </select>

                <div class="flex items-start gap-2 rounded-md border border-rose-500/40 bg-rose-950/30 p-2">
                  <input type="checkbox" [(ngModel)]="confirmedIrreversible" />
                  <div class="text-xs text-rose-100">
                    <div class="font-semibold">Confirmation required</div>
                    <div class="text-rose-100/80">
                      I understand this action is irreversible and I am explicitly confirming it.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                class="rounded-md border border-slate-700 bg-slate-950/40 px-4 py-2 text-sm text-slate-100 hover:bg-slate-800/60"
                (click)="cancel.emit()"
              >
                Cancel
              </button>
              <button
                type="button"
                class="rounded-md bg-rose-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-rose-400 disabled:cursor-not-allowed disabled:opacity-60"
                [disabled]="!canSubmit"
                (click)="onSubmit()"
              >
                Submit override
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class OverrideModalComponent {
  @Input() open = false;
  @Input() aiRecommendedAction: RecommendedAction | null | undefined;

  @Output() cancel = new EventEmitter<void>();
  @Output() submit = new EventEmitter<OverrideSubmission>();

  finalAction: RecommendedAction = 'MONITOR';
  rationale = '';

  enableIrreversible = false;
  irreversibleAction: IrreversibleAction = 'PERMANENT_ACCOUNT_CLOSURE';
  confirmedIrreversible = false;

  get canSubmit(): boolean {
    const rationaleOk = this.rationale.trim().length > 0;
    if (!rationaleOk) return false;
    if (!this.enableIrreversible) return true;
    return this.confirmedIrreversible === true;
  }

  onSubmit(): void {
    const payload: OverrideSubmission = {
      finalAction: this.finalAction,
      rationale: this.rationale.trim(),
    };
    if (this.enableIrreversible) {
      payload.irreversibleAction = this.irreversibleAction;
      payload.confirmedIrreversible = this.confirmedIrreversible;
    }
    this.submit.emit(payload);
  }
}

