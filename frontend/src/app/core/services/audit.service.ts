import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import type { AuditEvent } from '../models/audit.model';
import { environment } from '../../../environments/environment';

interface CaseAuditResponse {
  caseId: number;
  events: AuditEvent[];
}

@Injectable({
  providedIn: 'root',
})
export class AuditService {
  private readonly baseUrl = environment.apiUrl;

  constructor(private readonly http: HttpClient) {}

  getCaseAudit(caseId: number): Observable<AuditEvent[]> {
    return this.http
      .get<CaseAuditResponse>(`${this.baseUrl}/cases/${caseId}/audit`)
      .pipe(map((res) => res.events));
  }
}

