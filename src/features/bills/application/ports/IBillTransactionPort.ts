import { RepositoryResult, RepositoryError } from '../../../../platform/persistence';

export interface CreateExpenseTransactionPortParams {
  userId: string;
  accountId: string;
  amount: number;
  currencyCode: string;
  description: string;
  categoryId?: string | null;
  transactionDate: Date;
}

export interface IBillTransactionPort {
  createExpenseTransaction(
    params: CreateExpenseTransactionPortParams
  ): Promise<RepositoryResult<string, RepositoryError>>;
  verifyTransactionExists(
    transactionId: string
  ): Promise<RepositoryResult<boolean, RepositoryError>>;
}
