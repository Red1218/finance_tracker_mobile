import { AccountId } from '../../../accounts/domain';
import { ITransactionRepository } from '../repositories/ITransactionRepository';
import { TransactionDTO } from '../dto/TransactionDTO';
import { TransactionDTOMapper } from '../mappers/TransactionDTOMapper';

export interface LoadTransactionsQuery {
  accountId?: string;
  type?: string;
  categoryId?: string | null;
  startDate?: Date;
  endDate?: Date;
  includeArchived?: boolean;
}

export class LoadTransactionsQueryUseCase {
  constructor(private readonly transactionRepository: ITransactionRepository) {
    Object.freeze(this);
  }

  public async execute(query: LoadTransactionsQuery = {}): Promise<TransactionDTO[]> {
    const result = query.accountId
      ? await this.transactionRepository.getByAccountId(new AccountId(query.accountId), {
          type: query.type as any,
          categoryId: query.categoryId,
          startDate: query.startDate,
          endDate: query.endDate,
        })
      : await this.transactionRepository.listTransactions({
          type: query.type as any,
          categoryId: query.categoryId,
          startDate: query.startDate,
          endDate: query.endDate,
        });

    if (!result.success) {
      throw result.error;
    }

    return result.data.map((t) => TransactionDTOMapper.toDTO(t));
  }
}
