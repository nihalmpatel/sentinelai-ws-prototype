import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ComplianceService, EvaluateResponse } from '../../core/services/compliance.service';
import type { Case } from '../../core/models/case.model';
import type { Decision } from '../../core/models/decision.model';

@Component({
  selector: 'sentinel-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit {
  title = 'Sentinel – Compliance Decision Demo';

  cases: Case[] = [];
  selectedCase: Case | null = null;

  isLoadingCases = false;
  isEvaluating = false;
  errorMessage: string | null = null;

  constructor(private readonly compliance: ComplianceService) {}

  ngOnInit(): void {
    this.loadCases();
  }

  loadCases(): void {
    this.isLoadingCases = true;
    this.errorMessage = null;

    this.compliance.getCases().subscribe({
      next: (cases) => {
        this.cases = cases;
        if (!this.selectedCase && cases.length > 0) {
          this.selectedCase = cases[0];
        } else if (
          this.selectedCase &&
          !cases.find((c) => c.id === this.selectedCase?.id)
        ) {
          this.selectedCase = cases[0] ?? null;
        }
        this.isLoadingCases = false;
      },
      error: () => {
        this.errorMessage = 'Failed to load cases from backend.';
        this.isLoadingCases = false;
      }
    });
  }

  selectCase(caseItem: Case): void {
    this.errorMessage = null;

    this.compliance.getCase(caseItem.id).subscribe({
      next: (fullCase) => {
        this.selectedCase = fullCase;
      },
      error: () => {
        this.errorMessage = 'Failed to load case detail.';
      }
    });
  }

  evaluateSample(): void {
    this.isEvaluating = true;
    this.errorMessage = null;

    this.compliance.evaluateSampleTransaction().subscribe({
      next: (response: EvaluateResponse) => {
        this.selectedCase = response.case;
        this.isEvaluating = false;
        this.loadCases();
      },
      error: () => {
        this.errorMessage = 'Failed to evaluate sample transaction.';
        this.isEvaluating = false;
      }
    });
  }

  private getRiskLevelScoreForCase(caseItem: Case | null): number | null {
    const riskScore = caseItem?.riskProfile?.score;
    return typeof riskScore === 'number' ? riskScore : null;
  }

  getRiskLevelLabelForCase(
    caseItem: Case | null
  ): 'LOW' | 'MEDIUM' | 'HIGH' | null {
    const score = this.getRiskLevelScoreForCase(caseItem);
    if (score === null) {
      return null;
    }

    if (score < 0.33) {
      return 'LOW';
    }

    if (score < 0.66) {
      return 'MEDIUM';
    }

    return 'HIGH';
  }

  getRiskBadgeClassForCase(caseItem: Case | null): string {
    const level = this.getRiskLevelLabelForCase(caseItem);
    if (level === 'LOW') {
      return 'bg-emerald-500/10 text-emerald-300 border-emerald-500/40';
    }
    if (level === 'MEDIUM') {
      return 'bg-amber-500/10 text-amber-300 border-amber-500/40';
    }
    if (level === 'HIGH') {
      return 'bg-rose-500/10 text-rose-300 border-rose-500/40';
    }
    return 'bg-slate-700/50 text-slate-200 border-slate-500/40';
  }

  getOutcomeLabel(decision: Decision | undefined): string {
    if (!decision) {
      return 'Pending AI draft';
    }

    switch (decision.outcome) {
      case 'approve':
        return 'Approve / No action needed';
      case 'review':
        return 'Manual review recommended';
      case 'decline':
        return 'Decline / High-risk';
      default:
        return decision.outcome;
    }
  }
}

