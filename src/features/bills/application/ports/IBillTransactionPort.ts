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
  /**
   * Voids an auto-created expense transaction when the subsequent bill payment persistence
   * (savePaymentAndBill) fails. This is the compensation mechanism for AUTO_CREATE mode
   * to prevent orphan transactions in the ledger.
   *
   * MUST NOT be called for LINK_EXISTING or UNLINKED modes.
   * If rollback itself fails, the caller still throws REPOSITORY_ERROR.
   *
   * @see ADR-022 § 19 — Transaction Compensation Architecture
   */
  rollbackExpenseTransaction(
    transactionId: string
  ): Promise<RepositoryResult<void, RepositoryError>>;
}
