export type AuditActorType = 'AI' | 'HUMAN' | 'SYSTEM';

export interface AuditEvent {
  id: string;
  actorType: AuditActorType;
  actorId?: string;
  action: string;
  caseId?: number;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

