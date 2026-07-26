import { AccountId } from '../value-objects/AccountId';

export class AccountRenamedEvent {
  public readonly eventName = 'AccountRenamed';
  public readonly occurredAt: Date;

  constructor(
    public readonly accountId: AccountId,
    public readonly oldName: string,
    public readonly newName: string
  ) {
    this.occurredAt = new Date();
    Object.freeze(this);
  }
}
