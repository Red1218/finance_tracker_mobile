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
      list = list.filter((t) => t.accountId.equals(filters.accountId!));
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
      list = list.filter((t) => t.type.equals(filters.type!));
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
    const matches = Array.from(this.store.values()).filter(
      (t) => t.transferGroupId?.equals(transferGroupId)
    );
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
    transferGroupId: TransferReference,
    voidedAt: Date = new Date()
  ): Promise<RepositoryResult<void, RepositoryError>> {
    for (const [id, t] of this.store.entries()) {
      if (t.transferGroupId?.equals(transferGroupId)) {
        this.store.set(id, t.voidTransaction(voidedAt));
      }
    }
    return Result.success(undefined);
  }

  public async getAccountLedgerSummary(
    accountId: AccountId
  ): Promise<RepositoryResult<AccountLedgerSummary, RepositoryError>> {
    const accountTransactions = Array.from(this.store.values()).filter(
      (t) => t.accountId.equals(accountId) && !t.isVoided
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
      accountId,
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
