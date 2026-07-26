import { AccountId, CurrencyCode } from '../../../accounts/domain';
import { IAccountRepository } from '../../../accounts/application';
import {
  Transaction,
  TransactionId,
  Money,
  TransactionDescription,
  TransactionDate,
  TransactionDomainError,
} from '../../domain';
import { ITransactionRepository } from '../repositories/ITransactionRepository';

export interface CreateIncomeCommand {
  id: string;
  accountId: string;
  amount: number;
  currencyCode: string;
  description: string;
  categoryId?: string | null;
  transactionDate?: Date;
}

export class CreateIncomeTransactionUseCase {
  constructor(
    private readonly transactionRepo: ITransactionRepository,
    private readonly accountRepo: IAccountRepository
  ) {}

  public async execute(command: CreateIncomeCommand): Promise<Transaction> {
    const accId = new AccountId(command.accountId);
    const accountResult = await this.accountRepo.getById(accId);

    if (!accountResult.success || !accountResult.data) {
      throw new TransactionDomainError('TRANSACTION_NOT_FOUND', `Account "${command.accountId}" not found.`);
    }

    const account = accountResult.data;

    if (account.isArchived) {
      throw new TransactionDomainError(
        'ARCHIVED_ACCOUNT_TRANSACTION_REJECTED',
        `Cannot record an income transaction against archived account "${account.name.value}".`
      );
    }

    const transaction = Transaction.createIncome({
      id: new TransactionId(command.id),
      accountId: accId,
      amount: new Money(command.amount),
      currencyCode: new CurrencyCode(command.currencyCode),
      description: new TransactionDescription(command.description),
      categoryId: command.categoryId,
      transactionDate: command.transactionDate ? new TransactionDate(command.transactionDate) : undefined,
    });

    await this.transactionRepo.save(transaction);
    return transaction;
  }
}
