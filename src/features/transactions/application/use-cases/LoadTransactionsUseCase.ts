import { AccountId } from '../../../accounts/domain';
import { Transaction, TransactionType, TransactionTypeKind } from '../../domain';
import { ITransactionRepository, TransactionFilter } from '../repositories/ITransactionRepository';

export interface LoadTransactionsQuery {
  accountId: string;
  type?: TransactionTypeKind;
  categoryId?: string | null;
  startDate?: Date;
  endDate?: Date;
  includeVoided?: boolean;
}

export class LoadTransactionsUseCase {
  constructor(private readonly transactionRepo: ITransactionRepository) {}

  public async execute(query: LoadTransactionsQuery): Promise<Transaction[]> {
    const accId = new AccountId(query.accountId);

    const filter: TransactionFilter = {
      accountId: accId,
      type: query.type ? new TransactionType(query.type) : undefined,
      categoryId: query.categoryId,
      startDate: query.startDate,
      endDate: query.endDate,
      includeVoided: query.includeVoided,
    };

    const result = await this.transactionRepo.getByAccountId(accId, filter);

    if (!result.success) {
      throw result.error;
    }

    return result.data;
  }
}
