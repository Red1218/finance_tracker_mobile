import { ITransactionRepository, TransactionFilter, AccountLedgerSummary } from '../repositories/ITransactionRepository';
import { Transaction, TransactionId, TransferReference } from '../../domain';
import { AccountId } from '../../../accounts/domain';
import { RepositoryResult, Result, RepositoryError } from '../../../../platform/persistence';

export class InMemoryTransactionRepository implements ITransactionRepository {
  private store = new Map<string, Transaction>();

  public async getById(id: TransactionId): Promise<RepositoryResult<Transaction | null, RepositoryError>> {
    const t = this.store.get(id.value) ?? null;
    return Result.success(t);
  }

  public async getByAccountId(
    accountId: AccountId,
    filters?: TransactionFilter
  ): Promise<RepositoryResult<Transaction[], RepositoryError>> {
    return this.listTransactions({ ...filters, accountId });
  }

  public async listTransactions(
    filters?: TransactionFilter
  ): Promise<RepositoryResult<Transaction[], RepositoryError>> {
    let list = Array.from(this.store.values());

    if (filters?.accountId) {
      const accVal = typeof filters.accountId === 'string' ? filters.accountId : filters.accountId.value;
      list = list.filter((t) => t.accountId.value === accVal);
    }

    if (!filters?.includeVoided) {
      list = list.filter((t) => !t.isVoided);
    }

    if (filters?.startDate) {
      list = list.filter((t) => t.transactionDate.value >= filters.startDate!);
    }

    if (filters?.endDate) {
      list = list.filter((t) => t.transactionDate.value <= filters.endDate!);
    }

    if (filters?.type) {
      const typeStr = typeof filters.type === 'string' ? filters.type : (filters.type as any).kind;
      list = list.filter((t) => t.type.kind === typeStr);
    }

    if (filters?.categoryId !== undefined) {
      list = list.filter((t) => t.categoryId === filters.categoryId);
    }

    list.sort((a, b) => b.transactionDate.value.getTime() - a.transactionDate.value.getTime());

    return Result.success(list);
  }

  public async getByTransferGroupId(
    transferGroupId: TransferReference
  ): Promise<RepositoryResult<Transaction[], RepositoryError>> {
    const groupVal = typeof transferGroupId === 'string' ? transferGroupId : transferGroupId.value;
    const matches = Array.from(this.store.values()).filter((t) => {
      const tGVal = t.transferGroupId ? (typeof t.transferGroupId === 'string' ? t.transferGroupId : t.transferGroupId.value) : null;
      return tGVal === groupVal;
    });
    return Result.success(matches);
  }

  public async save(transaction: Transaction): Promise<RepositoryResult<void, RepositoryError>> {
    this.store.set(transaction.id.value, transaction);
    return Result.success(undefined);
  }

  public async saveMany(transactions: Transaction[]): Promise<RepositoryResult<void, RepositoryError>> {
    for (const t of transactions) {
      this.store.set(t.id.value, t);
    }
    return Result.success(undefined);
  }

  public async voidTransaction(
    id: TransactionId,
    voidedAt: Date = new Date()
  ): Promise<RepositoryResult<void, RepositoryError>> {
    const t = this.store.get(id.value);
    if (t) {
      this.store.set(id.value, t.voidTransaction(voidedAt));
    }
    return Result.success(undefined);
  }

  public async voidTransferGroup(
    transferGroupId: TransferReference | string,
    voidedAt: Date = new Date()
  ): Promise<RepositoryResult<void, RepositoryError>> {
    const groupVal = typeof transferGroupId === 'string' ? transferGroupId : (transferGroupId as any)?.value ?? String(transferGroupId);
    for (const [id, t] of this.store.entries()) {
      const tGroupVal = t.transferGroupId
        ? (typeof t.transferGroupId === 'string' ? t.transferGroupId : (t.transferGroupId as any).value ?? String(t.transferGroupId))
        : null;
      if (tGroupVal === groupVal) {
        this.store.set(id, t.voidTransaction(voidedAt));
      }
    }
    return Result.success(undefined);
  }

  public async getAccountLedgerSummary(
    accountId: AccountId
  ): Promise<RepositoryResult<AccountLedgerSummary, RepositoryError>> {
    const accVal = typeof accountId === 'string' ? accountId : accountId.value;
    const accountTransactions = Array.from(this.store.values()).filter(
      (t) => t.accountId.value === accVal && !t.isVoided
    );

    let totalIncome = 0;
    let totalExpense = 0;
    let totalTransfersIn = 0;
    let totalTransfersOut = 0;

    for (const t of accountTransactions) {
      if (t.type.isIncome()) {
        totalIncome += t.amount.value;
      } else if (t.type.isExpense()) {
        totalExpense += t.amount.value;
      } else if (t.type.isTransferIn()) {
        totalTransfersIn += t.amount.value;
      } else if (t.type.isTransferOut()) {
        totalTransfersOut += t.amount.value;
      }
    }

    return Result.success({
      accountId: new AccountId(accVal),
      totalIncome,
      totalExpense,
      totalTransfersIn,
      totalTransfersOut,
    });
  }

  public clear(): void {
    this.store.clear();
  }
}
