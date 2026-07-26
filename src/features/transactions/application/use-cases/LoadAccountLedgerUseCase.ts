import { AccountId } from '../../../accounts/domain';
import { AccountLedgerSummary, ITransactionRepository } from '../repositories/ITransactionRepository';
import { TransactionDomainError } from '../../domain';

export class LoadAccountLedgerUseCase {
  constructor(private readonly transactionRepo: ITransactionRepository) {}

  public async execute(accountId: string): Promise<AccountLedgerSummary> {
    const accId = new AccountId(accountId);
    const result = await this.transactionRepo.getAccountLedgerSummary(accId);

    if (!result.success) {
      throw new TransactionDomainError('TRANSACTION_NOT_FOUND', result.error.message);
    }

    return result.data;
  }
}
