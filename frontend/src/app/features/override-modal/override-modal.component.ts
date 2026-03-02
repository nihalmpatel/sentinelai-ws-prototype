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
      <div
        class="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
        (click)="cancel.emit()"
      ></div>

      <div class="absolute inset-0 flex items-center justify-center p-4">
        <div
          class="w-full max-w-xl rounded-2xl border border-slate-800/60 bg-slate-900 shadow-2xl shadow-slate-950/50"
        >
          <div class="border-b border-slate-800/60 px-5 py-4">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div
                  class="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-500/10"
                >
                  <svg
                    class="h-4 w-4 text-rose-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125"
                    />
                  </svg>
                </div>
                <div>
                  <div class="text-sm font-semibold text-slate-50">
                    Override AI Decision
                  </div>
                  <div class="text-[11px] text-slate-500">
                    Requires explicit rationale
                  </div>
                </div>
              </div>
              <button
                type="button"
                class="rounded-lg border border-slate-700/40 bg-slate-800/30 p-1.5 text-slate-400 transition hover:bg-slate-700/40 hover:text-slate-200"
                (click)="cancel.emit()"
              >
                <svg
                  class="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>

          <div class="px-5 py-4 space-y-4">
            <div
              class="rounded-lg border border-indigo-500/30 bg-indigo-500/5 p-3"
            >
              <div
                class="text-[10px] font-semibold uppercase tracking-wider text-indigo-300/60"
              >
                AI Recommendation
              </div>
              <div class="mt-1 text-sm font-medium text-indigo-100">
                {{ aiRecommendedAction || 'Unknown' }}
              </div>
            </div>

            <div class="space-y-1.5">
              <label
                class="text-[10px] font-semibold uppercase tracking-wider text-slate-500"
                >Final Action</label
              >
              <select
                class="w-full rounded-lg border border-slate-700/60 bg-slate-950/60 px-3 py-2 text-sm text-slate-50 transition focus:border-indigo-500/50 focus:outline-none focus:ring-1 focus:ring-indigo-500/30"
                [(ngModel)]="finalAction"
              >
                <option [ngValue]="'NO_ACTION'">NO_ACTION</option>
                <option [ngValue]="'MONITOR'">MONITOR</option>
                <option [ngValue]="'TEMP_HOLD'">TEMP_HOLD</option>
                <option [ngValue]="'ESCALATE'">ESCALATE</option>
              </select>
            </div>

            <div class="space-y-1.5">
              <label
                class="text-[10px] font-semibold uppercase tracking-wider text-slate-500"
                >Rationale</label
              >
              <textarea
                class="min-h-[96px] w-full rounded-lg border border-slate-700/60 bg-slate-950/60 px-3 py-2 text-sm text-slate-50 transition focus:border-indigo-500/50 focus:outline-none focus:ring-1 focus:ring-indigo-500/30"
                [(ngModel)]="rationale"
                placeholder="Explain why you are overriding the AI recommendation..."
              ></textarea>
              <div
                *ngIf="rationale.trim().length === 0"
                class="text-[10px] text-rose-400/80"
              >
                Rationale is required for all overrides.
              </div>
            </div>

            <div
              class="rounded-lg border border-slate-800/60 bg-slate-950/30 p-3 space-y-3"
            >
              <div
                class="text-[10px] font-semibold uppercase tracking-wider text-slate-500"
              >
                Irreversible Actions
              </div>

              <label
                class="flex items-center gap-2 text-xs text-slate-300 cursor-pointer"
              >
                <input
                  type="checkbox"
                  class="rounded border-slate-600"
                  [(ngModel)]="enableIrreversible"
                />
                Trigger an irreversible action
              </label>

              <div *ngIf="enableIrreversible" class="space-y-3">
                <select
                  class="w-full rounded-lg border border-slate-700/60 bg-slate-950/60 px-3 py-2 text-sm text-slate-50 transition focus:border-rose-500/50 focus:outline-none"
                  [(ngModel)]="irreversibleAction"
                >
                  <option [ngValue]="'PERMANENT_ACCOUNT_CLOSURE'">
                    PERMANENT_ACCOUNT_CLOSURE
                  </option>
                  <option [ngValue]="'LAW_ENFORCEMENT_REPORT'">
                    LAW_ENFORCEMENT_REPORT
                  </option>
                </select>

                <div
                  class="rounded-lg border border-rose-500/30 bg-rose-500/5 p-3"
                >
                  <label class="flex items-start gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      class="mt-0.5 rounded border-rose-500/50"
                      [(ngModel)]="confirmedIrreversible"
                    />
                    <div class="text-xs text-rose-200">
                      <div class="font-semibold">Confirmation required</div>
                      <div class="mt-0.5 text-rose-300/70">
                        I understand this action is irreversible and I am
                        explicitly confirming it.
                      </div>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            <div
              class="flex items-center justify-end gap-2 pt-2 border-t border-slate-800/40"
            >
              <button
                type="button"
                class="rounded-lg border border-slate-700/40 bg-slate-800/30 px-4 py-2 text-xs text-slate-300 transition hover:bg-slate-700/40"
                (click)="cancel.emit()"
              >
                Cancel
              </button>
              <button
                type="button"
                class="rounded-lg bg-rose-500 px-4 py-2 text-xs font-semibold text-white shadow-sm shadow-rose-500/25 transition hover:bg-rose-400 disabled:cursor-not-allowed disabled:opacity-60"
                [disabled]="!canSubmit"
                (click)="onSubmit()"
              >
                Submit Override
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
