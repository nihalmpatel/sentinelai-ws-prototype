import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {
  ComplianceService,
  EvaluateRequest,
  EvaluateResponse,
  PaginationInfo,
} from '../../core/services/compliance.service';
import type { Case } from '../../core/models/case.model';
import type { CaseStatus } from '../../core/models/case.model';
import { RiskBadgeComponent } from '../../shared/risk-badge.component';

type SortField = 'id' | 'status' | 'risk' | 'updatedAt';
type SortDirection = 'asc' | 'desc';

interface SimPreset {
  label: string;
  request: EvaluateRequest;
}

@Component({
  selector: 'sentinel-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, RiskBadgeComponent],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit {
  title = 'Sentinel – Compliance Decision Demo';

  cases: Case[] = [];

  isLoadingCases = false;
  isEvaluating = false;
  errorMessage: string | null = null;

  // ── Filtering (FR-FE-02) ──
  filterStatus: CaseStatus | '' = '';
  filterRisk: 'LOW' | 'MEDIUM' | 'HIGH' | '' = '';
  filterSearchTerm = '';

  // ── Sorting (FR-FE-02) ──
  sortField: SortField = 'id';
  sortDirection: SortDirection = 'desc';

  // ── Simulation form (US-07) ──
  showSimForm = false;
  simUserId = 1;
  simAmount = 1500;
  simCurrency = 'USD';
  simMerchant = 'Demo Electronics';
  simLocation = 'Online';

  // ── Pagination (API-02) ──
  pagination: PaginationInfo = { page: 1, limit: 20, total: 0, totalPages: 1 };

  readonly presets: SimPreset[] = [
    {
      label: 'Low risk ($200, Online)',
      request: {
        userId: 1,
        amount: 200,
        currency: 'USD',
        merchant: 'Grocery Store',
        location: 'Online',
      },
    },
    {
      label: 'Medium risk ($3 000, NY)',
      request: {
        userId: 2,
        amount: 3000,
        currency: 'USD',
        merchant: 'Luxury Goods',
        location: 'New York',
      },
    },
    {
      label: 'High risk ($12 000, Berlin)',
      request: {
        userId: 3,
        amount: 12000,
        currency: 'EUR',
        merchant: 'Wire Transfer',
        location: 'Berlin',
      },
    },
    {
      label: 'Structuring ($9 800 × user 3)',
      request: {
        userId: 3,
        amount: 9800,
        currency: 'USD',
        merchant: 'Cash Deposit',
        location: 'Chicago',
      },
    },
    {
      label: 'Geo-velocity (user 4, Tokyo)',
      request: {
        userId: 4,
        amount: 5000,
        currency: 'JPY',
        merchant: 'Electronics',
        location: 'Tokyo',
      },
    },
  ];

  constructor(private readonly compliance: ComplianceService) {}

  ngOnInit(): void {
    this.loadCases();
  }

  /** Filtered & sorted view of cases. */
  get filteredCases(): Case[] {
    let result = [...this.cases];

    // Status filter
    if (this.filterStatus) {
      result = result.filter((c) => c.status === this.filterStatus);
    }

    // Risk-level filter (derived from score)
    if (this.filterRisk) {
      result = result.filter((c) => {
        const score = c.riskProfile?.score;
        if (score == null) return this.filterRisk === '';
        const level = score < 0.33 ? 'LOW' : score < 0.66 ? 'MEDIUM' : 'HIGH';
        return level === this.filterRisk;
      });
    }

    // Free-text search on case id, userId, or context
    if (this.filterSearchTerm.trim()) {
      const term = this.filterSearchTerm.trim().toLowerCase();
      result = result.filter(
        (c) =>
          String(c.id).includes(term) ||
          String(c.userId).includes(term) ||
          JSON.stringify(c.context ?? {})
            .toLowerCase()
            .includes(term),
      );
    }

    // Sort
    const dir = this.sortDirection === 'asc' ? 1 : -1;
    result.sort((a, b) => {
      switch (this.sortField) {
        case 'id':
          return (a.id - b.id) * dir;
        case 'status':
          return a.status.localeCompare(b.status) * dir;
        case 'risk':
          return (
            ((a.riskProfile?.score ?? 0) - (b.riskProfile?.score ?? 0)) * dir
          );
        case 'updatedAt':
          return a.updatedAt.localeCompare(b.updatedAt) * dir;
        default:
          return 0;
      }
    });

    return result;
  }

  getDecisionLabel(c: Case): 'APPROVED' | 'OVERRIDDEN' | 'PENDING' {
    if (c.status === 'APPROVED') return 'APPROVED';
    if (c.status === 'OVERRIDDEN') return 'OVERRIDDEN';
    return 'PENDING';
  }

  toggleSort(field: SortField): void {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'desc';
    }
  }

  clearFilters(): void {
    this.filterStatus = '';
    this.filterRisk = '';
    this.filterSearchTerm = '';
  }

  loadCases(): void {
    this.isLoadingCases = true;
    this.errorMessage = null;

    this.compliance
      .getCases(this.pagination.page, this.pagination.limit)
      .subscribe({
        next: (res) => {
          this.cases = res.cases;
          this.pagination = res.pagination;
          this.isLoadingCases = false;
        },
        error: () => {
          this.errorMessage = 'Failed to load cases from backend.';
          this.isLoadingCases = false;
        },
      });
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.pagination.totalPages) return;
    this.pagination = { ...this.pagination, page };
    this.loadCases();
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
      },
    });
  }

  // ── Simulation (US-07) ──
  applyPreset(preset: SimPreset): void {
    this.simUserId = preset.request.userId;
    this.simAmount = preset.request.amount;
    this.simCurrency = preset.request.currency;
    this.simMerchant = preset.request.merchant;
    this.simLocation = preset.request.location;
  }

  evaluateCustom(): void {
    this.isEvaluating = true;
    this.errorMessage = null;

    const request: EvaluateRequest = {
      userId: this.simUserId,
      amount: this.simAmount,
      currency: this.simCurrency,
      merchant: this.simMerchant,
      location: this.simLocation,
    };

    this.compliance.evaluateTransaction(request).subscribe({
      next: () => {
        this.isEvaluating = false;
        this.loadCases();
      },
      error: () => {
        this.errorMessage = 'Failed to evaluate custom transaction.';
        this.isEvaluating = false;
      },
    });
  }
}
