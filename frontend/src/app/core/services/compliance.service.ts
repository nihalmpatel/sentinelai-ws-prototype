import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import type { Case } from '../models/case.model';
import type { RiskProfile } from '../models/risk.model';
import type { Decision } from '../models/decision.model';
import { environment } from '../../../environments/environment';

export interface EvaluateResponse {
  caseId: number;
  case: Case;
  riskProfile?: RiskProfile;
  decision: Decision;
}

@Injectable({
  providedIn: 'root',
})
export class ComplianceService {
  private readonly baseUrl = environment.apiUrl;

  constructor(private readonly http: HttpClient) {}

  getCases(): Observable<Case[]> {
    return this.http
      .get<{ cases: Case[] }>(`${this.baseUrl}/cases`)
      .pipe(map((res) => res.cases));
  }

  getCase(id: number): Observable<Case> {
    return this.http.get<Case>(`${this.baseUrl}/cases/${id}`);
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
      payload
    );
  }
}
