import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import type { Case } from '../../core/models/case.model';
import type { DecisionDraft } from '../../core/models/decision.model';
import type { AuditEvent } from '../../core/models/audit.model';
import { ComplianceService } from '../../core/services/compliance.service';
import { AuditService } from '../../core/services/audit.service';
import { RiskBadgeComponent } from '../../shared/risk-badge.component';
import { SignalListComponent } from '../../shared/signal-list.component';
import { AuditPanelComponent } from '../audit-panel/audit-panel.component';
import {
  OverrideModalComponent,
  OverrideSubmission,
} from '../override-modal/override-modal.component';

@Component({
  selector: 'sentinel-case-view',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    RiskBadgeComponent,
    SignalListComponent,
    AuditPanelComponent,
    OverrideModalComponent,
  ],
  templateUrl: './case-view.component.html',
})
export class CaseViewComponent implements OnInit, OnDestroy {
  caseId: number | null = null;

  caseData: Case | null = null;
  auditEvents: AuditEvent[] = [];

  isLoading = false;
  errorMessage: string | null = null;

  isSubmitting = false;
  isOverrideOpen = false;

  private readonly sub = new Subscription();

  constructor(
    private readonly route: ActivatedRoute,
    private readonly compliance: ComplianceService,
    private readonly audit: AuditService
  ) {}

  ngOnInit(): void {
    this.sub.add(
      this.route.paramMap.subscribe((params) => {
        const raw = params.get('caseId');
        const id = raw ? Number(raw) : NaN;
        this.caseId = Number.isFinite(id) ? id : null;
        this.load();
      })
    );
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  get latestAiDraft(): DecisionDraft | null {
    return this.caseData?.aiDecisions?.length ? this.caseData.aiDecisions.at(-1)! : null;
  }

  load(): void {
    if (this.caseId == null) {
      this.errorMessage = 'Invalid case id.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;

    this.compliance.getCase(this.caseId).subscribe({
      next: (c) => {
        this.caseData = c;
        this.isLoading = false;
        this.loadAudit();
      },
      error: () => {
        this.errorMessage = 'Failed to load case detail.';
        this.isLoading = false;
      },
    });
  }

  loadAudit(): void {
    if (this.caseId == null) return;
    this.audit.getCaseAudit(this.caseId).subscribe({
      next: (events) => {
        // Backend already returns chronological append-only; keep as-is.
        this.auditEvents = events;
      },
      error: () => {
        // Don’t block core UI if audit fetch fails.
        this.auditEvents = [];
      },
    });
  }

  openOverride(): void {
    this.isOverrideOpen = true;
  }

  closeOverride(): void {
    this.isOverrideOpen = false;
  }

  approveAi(): void {
    if (!this.caseId) return;
    this.isSubmitting = true;
    this.errorMessage = null;

    this.compliance
      .submitReview(this.caseId, {
        reviewerId: 'analyst-1',
        type: 'APPROVE_AI',
      })
      .subscribe({
        next: (res) => {
          this.caseData = res.case;
          this.isSubmitting = false;
          this.loadAudit();
        },
        error: (err) => {
          this.errorMessage =
            err?.error?.message || 'Failed to approve AI recommendation.';
          this.isSubmitting = false;
        },
      });
  }

  submitOverride(payload: OverrideSubmission): void {
    if (!this.caseId) return;
    this.isSubmitting = true;
    this.errorMessage = null;

    this.compliance
      .submitReview(this.caseId, {
        reviewerId: 'analyst-1',
        type: 'OVERRIDE',
        finalAction: payload.finalAction,
        rationale: payload.rationale,
        irreversibleAction: payload.irreversibleAction,
        confirmedIrreversible: payload.confirmedIrreversible,
      })
      .subscribe({
        next: (res) => {
          this.caseData = res.case;
          this.isSubmitting = false;
          this.isOverrideOpen = false;
          this.loadAudit();
        },
        error: (err) => {
          this.errorMessage =
            err?.error?.message || 'Failed to submit override.';
          this.isSubmitting = false;
        },
      });
  }
}

