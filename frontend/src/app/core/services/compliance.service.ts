import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import type { Case } from '../models/case.model';
import type { RiskProfile } from '../models/risk.model';
import type {
  DecisionDraft,
  RecommendedAction,
} from '../models/decision.model';
import type {
  HumanReview,
  IrreversibleAction,
  ReviewType,
} from '../models/review.model';
import { environment } from '../../../environments/environment';

export interface EvaluateRequest {
  userId: number;
  amount: number;
  currency: string;
  merchant: string;
  location: string;
}

export interface EvaluateResponse {
  caseId: number;
  case: Case;
  riskProfile?: RiskProfile;
  decisionDraft: DecisionDraft;
}

export interface SubmitReviewRequest {
  reviewerId: string;
  type: ReviewType;
  finalAction?: RecommendedAction;
  rationale?: string;
  irreversibleAction?: IrreversibleAction;
  confirmedIrreversible?: boolean;
}

export interface SubmitReviewResponse {
  case: Case;
  review: HumanReview;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface CaseListResponse {
  cases: Case[];
  pagination: PaginationInfo;
}

@Injectable({
  providedIn: 'root',
})
export class ComplianceService {
  private readonly baseUrl = environment.apiUrl;

  constructor(private readonly http: HttpClient) {}

  getCases(page = 1, limit = 20): Observable<CaseListResponse> {
    return this.http.get<CaseListResponse>(
      `${this.baseUrl}/cases?page=${page}&limit=${limit}`,
    );
  }

  getCase(id: number): Observable<Case> {
    return this.http.get<Case>(`${this.baseUrl}/cases/${id}`);
  }

  submitReview(
    caseId: number,
    request: SubmitReviewRequest,
  ): Observable<SubmitReviewResponse> {
    return this.http.post<SubmitReviewResponse>(
      `${this.baseUrl}/cases/${caseId}/reviews`,
      request,
    );
  }

  evaluateSampleTransaction(userId = 1): Observable<EvaluateResponse> {
    const payload = {
      userId,
      amount: 1500,
      currency: 'USD',
      merchant: 'Demo Electronics',
      location: 'Online',
    };

    return this.http.post<EvaluateResponse>(
      `${this.baseUrl}/evaluate`,
      payload,
    );
  }

  /**
   * Evaluate with fully configurable parameters (US-07).
   */
  evaluateTransaction(request: EvaluateRequest): Observable<EvaluateResponse> {
    return this.http.post<EvaluateResponse>(
      `${this.baseUrl}/evaluate`,
      request,
    );
  }
}
