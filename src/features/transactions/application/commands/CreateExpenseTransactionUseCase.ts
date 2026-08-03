import { AccountId, CurrencyCode } from '../../../accounts/domain';
import { CategoryValidationService } from '../../../categories/application/services/CategoryValidationService';
import { IAccountRepository } from '../../../accounts/application/repositories/IAccountRepository';
import {
  Transaction,
  TransactionId,
  Money,
  TransactionDescription,
} from '../../domain';
import { ITransactionRepository } from '../repositories/ITransactionRepository';
import { CreateExpenseCommand } from './CreateExpenseCommand';
import { TransactionDTO } from '../dto/TransactionDTO';
import { TransactionDTOMapper } from '../mappers/TransactionDTOMapper';
import { AccountNotFoundError } from '../../../accounts/application/errors/AccountApplicationError';

export class CreateExpenseTransactionUseCase {
  constructor(
    private readonly transactionRepository: ITransactionRepository,
    private readonly accountRepository: IAccountRepository,
    private readonly categoryValidationService?: CategoryValidationService
  ) {
    Object.freeze(this);
  }

  public async execute(command: CreateExpenseCommand): Promise<TransactionDTO> {
    const accountId = new AccountId(command.accountId);
    const accountResult = await this.accountRepository.getById(accountId);

    if (!accountResult.success || !accountResult.data) {
      throw new AccountNotFoundError(command.accountId);
    }

    if (this.categoryValidationService && command.categoryId) {
      await this.categoryValidationService.validateCategoryForKind(command.categoryId, 'EXPENSE');
    }

    const transaction = Transaction.createExpense({
      id: new TransactionId(command.id || crypto.randomUUID()),
      accountId,
      amount: new Money(command.amount),
      currencyCode: new CurrencyCode(command.currencyCode),
      description: new TransactionDescription(command.description),
      categoryId: command.categoryId,
      occurredAt: command.occurredAt,
    });

    const saveResult = await this.transactionRepository.save(transaction);
    if (!saveResult.success) {
      throw saveResult.error;
    }

    return TransactionDTOMapper.toDTO(transaction);
  }
}
