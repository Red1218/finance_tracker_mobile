import { AccountId } from '../value-objects/AccountId';

export class AccountArchivedEvent {
  public readonly eventName = 'AccountArchived';
  public readonly occurredAt: Date;

  constructor(public readonly accountId: AccountId, public readonly archivedAt: Date) {
    this.occurredAt = new Date();
    Object.freeze(this);
  }
}
