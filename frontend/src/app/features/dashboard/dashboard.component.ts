import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ComplianceService, EvaluateResponse } from '../../core/services/compliance.service';
import type { Case } from '../../core/models/case.model';
import { RiskBadgeComponent } from '../../shared/risk-badge.component';

@Component({
  selector: 'sentinel-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, RiskBadgeComponent],
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit {
  title = 'Sentinel – Compliance Decision Demo';

  cases: Case[] = [];

  isLoadingCases = false;
  isEvaluating = false;
  errorMessage: string | null = null;

  constructor(private readonly compliance: ComplianceService) {}

  ngOnInit(): void {
    this.loadCases();
  }

  getDecisionLabel(c: Case): 'APPROVED' | 'OVERRIDDEN' | 'PENDING' {
    if (c.status === 'APPROVED') return 'APPROVED';
    if (c.status === 'OVERRIDDEN') return 'OVERRIDDEN';
    return 'PENDING';
  }

  loadCases(): void {
    this.isLoadingCases = true;
    this.errorMessage = null;

    this.compliance.getCases().subscribe({
      next: (cases) => {
        this.cases = cases;
        this.isLoadingCases = false;
      },
      error: () => {
        this.errorMessage = 'Failed to load cases from backend.';
        this.isLoadingCases = false;
      }
    });
  }

  evaluateSample(): void {
    this.isEvaluating = true;
    this.errorMessage = null;

    this.compliance.evaluateSampleTransaction().subscribe({
      next: (response: EvaluateResponse) => {
        this.isEvaluating = false;
        this.loadCases();
      },
      error: () => {
        this.errorMessage = 'Failed to evaluate sample transaction.';
        this.isEvaluating = false;
      }
    });
  }
}

