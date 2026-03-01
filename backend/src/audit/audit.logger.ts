import { AuditEvent } from "../models/audit.model";

// Centralized, append-only in-memory audit logging for the prototype runtime.
export class AuditLogger {
  private readonly events: AuditEvent[] = [];

  log(event: AuditEvent): void {
    this.events.push(event);
    // Keep a console signal for local dev/demo.
    // eslint-disable-next-line no-console
    console.log("[AUDIT]", JSON.stringify(event));
  }

  listAll(): AuditEvent[] {
    return [...this.events].sort((a, b) =>
      a.timestamp.localeCompare(b.timestamp)
    );
  }

  listForCase(caseId: number): AuditEvent[] {
    return this.events
      .filter((e) => e.caseId === caseId)
      .sort((a, b) => a.timestamp.localeCompare(b.timestamp));
  }
}

export const auditLogger = new AuditLogger();

