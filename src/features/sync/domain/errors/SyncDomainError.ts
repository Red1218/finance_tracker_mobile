export type SyncDomainErrorCode =
  | 'MAX_RETRIES_EXCEEDED'
  | 'UNRESOLVED_CONFLICT'
  | 'INVALID_SYNC_PAYLOAD'
  | 'INVALID_STATUS_TRANSITION';

export class SyncDomainError extends Error {
  public readonly code: SyncDomainErrorCode;

  constructor(code: SyncDomainErrorCode, message: string) {
    super(message);
    this.name = 'SyncDomainError';
    this.code = code;
    Object.setPrototypeOf(this, SyncDomainError.prototype);
  }
}
