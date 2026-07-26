import { AccountId } from '../../../accounts/domain';
import { Transaction, TransactionId, TransactionType, TransferReference } from '../../domain';
import { RepositoryResult, RepositoryError } from '../../../../platform/persistence';

export interface TransactionFilter {
  accountId?: AccountId;
  type?: TransactionType;
  categoryId?: string | null;
  startDate?: Date;
  endDate?: Date;
  includeVoided?: boolean;
}

export interface AccountLedgerSummary {
  accountId: AccountId;
  totalIncome: number;
  totalExpense: number;
  totalTransfersIn: number;
  totalTransfersOut: number;
}

export interface ITransactionRepository {
  getById(id: TransactionId): Promise<RepositoryResult<Transaction | null, RepositoryError>>;
  getByAccountId(accountId: AccountId, filter?: TransactionFilter): Promise<RepositoryResult<Transaction[], RepositoryError>>;
  listTransactions(filter?: TransactionFilter): Promise<RepositoryResult<Transaction[], RepositoryError>>;
  getByTransferGroupId(transferGroupId: TransferReference): Promise<RepositoryResult<Transaction[], RepositoryError>>;
  save(transaction: Transaction): Promise<RepositoryResult<void, RepositoryError>>;
  saveMany(transactions: Transaction[]): Promise<RepositoryResult<void, RepositoryError>>;
  voidTransaction(id: TransactionId, voidedAt?: Date): Promise<RepositoryResult<void, RepositoryError>>;
  voidTransferGroup(transferGroupId: TransferReference, voidedAt?: Date): Promise<RepositoryResult<void, RepositoryError>>;
  getAccountLedgerSummary(accountId: AccountId): Promise<RepositoryResult<AccountLedgerSummary, RepositoryError>>;
}
