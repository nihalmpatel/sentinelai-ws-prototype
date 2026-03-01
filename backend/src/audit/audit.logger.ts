// Centralized, append-only audit logging will live here.

export interface AuditEvent {
  id: string;
  type: string;
  caseId?: string | number;
  createdAt: string;
  payload?: unknown;
}

export class AuditLogger {
  log(event: AuditEvent): void {
    // In the prototype we may just console.log or keep in-memory events.
    // Persistence or external sinks can be plugged in later.
    console.log("[AUDIT]", JSON.stringify(event));
  }
}

export const auditLogger = new AuditLogger();

