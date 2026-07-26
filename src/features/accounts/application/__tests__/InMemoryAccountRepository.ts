import { IAccountRepository } from '../repositories/IAccountRepository';
import { Account, AccountId } from '../../domain';
import { Result, RepositoryResult, RepositoryError } from '../../../../platform/persistence';

export class InMemoryAccountRepository implements IAccountRepository {
  private store: Map<string, Account> = new Map();
  private forceFailureMessage: string | null = null;

  public setForceFailure(message: string) {
    this.forceFailureMessage = message;
  }

  public seed(account: Account) {
    this.store.set(account.id.value, account);
  }

  async getById(id: AccountId): Promise<RepositoryResult<Account | null, RepositoryError>> {
    if (this.forceFailureMessage) {
      return Result.failure(new Error(this.forceFailureMessage) as any);
    }
    return Result.success(this.store.get(id.value) ?? null);
  }

  async getAll(includeArchived = false): Promise<RepositoryResult<Account[], RepositoryError>> {
    if (this.forceFailureMessage) {
      return Result.failure(new Error(this.forceFailureMessage) as any);
    }
    const accounts = Array.from(this.store.values()).filter(
      (a) => includeArchived || !a.isArchived
    );
    return Result.success(accounts);
  }

  async getDefault(): Promise<RepositoryResult<Account | null, RepositoryError>> {
    if (this.forceFailureMessage) {
      return Result.failure(new Error(this.forceFailureMessage) as any);
    }
    const found = Array.from(this.store.values()).find((a) => a.isDefault && !a.isArchived);
    return Result.success(found ?? null);
  }

  async save(account: Account): Promise<RepositoryResult<void, RepositoryError>> {
    if (this.forceFailureMessage) {
      return Result.failure(new Error(this.forceFailureMessage) as any);
    }
    this.store.set(account.id.value, account);
    return Result.success(undefined);
  }

  async setDefaultAccount(accountId: AccountId): Promise<RepositoryResult<void, RepositoryError>> {
    if (this.forceFailureMessage) {
      return Result.failure(new Error(this.forceFailureMessage) as any);
    }

    // Atomic operation: Unset previous defaults and set target account as default
    for (const [id, acc] of this.store.entries()) {
      if (acc.isDefault && id !== accountId.value) {
        this.store.set(id, acc.setDefault(false));
      }
    }

    const target = this.store.get(accountId.value);
    if (target && !target.isArchived) {
      this.store.set(accountId.value, target.setDefault(true));
    }

    return Result.success(undefined);
  }

  async archiveAccount(accountId: AccountId, nextDefaultAccountId?: AccountId): Promise<RepositoryResult<void, RepositoryError>> {
    if (this.forceFailureMessage) {
      return Result.failure(new Error(this.forceFailureMessage) as any);
    }

    const target = this.store.get(accountId.value);
    if (target) {
      this.store.set(accountId.value, target.archive());
    }

    if (nextDefaultAccountId) {
      const nextDefault = this.store.get(nextDefaultAccountId.value);
      if (nextDefault && !nextDefault.isArchived) {
        this.store.set(nextDefaultAccountId.value, nextDefault.setDefault(true));
      }
    }

    return Result.success(undefined);
  }

  async restoreAccount(accountId: AccountId): Promise<RepositoryResult<void, RepositoryError>> {
    if (this.forceFailureMessage) {
      return Result.failure(new Error(this.forceFailureMessage) as any);
    }

    const target = this.store.get(accountId.value);
    if (target) {
      this.store.set(accountId.value, target.restore());
    }

    return Result.success(undefined);
  }

  async existsByName(name: string, excludeAccountId?: string): Promise<RepositoryResult<boolean, RepositoryError>> {
    if (this.forceFailureMessage) {
      return Result.failure(new Error(this.forceFailureMessage) as any);
    }

    const normalized = name.trim().toLowerCase();
    const exists = Array.from(this.store.values()).some(
      (a) =>
        !a.isArchived &&
        a.name.value.toLowerCase() === normalized &&
        (!excludeAccountId || a.id.value !== excludeAccountId)
    );

    return Result.success(exists);
  }

  async getActiveCount(): Promise<RepositoryResult<number, RepositoryError>> {
    if (this.forceFailureMessage) {
      return Result.failure(new Error(this.forceFailureMessage) as any);
    }
    const count = Array.from(this.store.values()).filter((a) => !a.isArchived).length;
    return Result.success(count);
  }
}
