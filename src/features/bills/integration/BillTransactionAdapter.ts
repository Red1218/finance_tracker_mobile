import { Result, RepositoryResult, RepositoryError } from '../../../platform/persistence';
import {
  IBillTransactionPort,
  CreateExpenseTransactionPortParams,
} from '../application/ports/IBillTransactionPort';
import {
  CreateExpenseTransactionUseCase,
  ITransactionRepository,
  VoidTransactionUseCase,
} from '../../transactions/application';
import { TransactionId } from '../../transactions/domain';

export class BillTransactionAdapter implements IBillTransactionPort {
  constructor(
    private readonly createExpenseUseCase: CreateExpenseTransactionUseCase,
    private readonly transactionRepository: ITransactionRepository,
    private readonly voidTransactionUseCase: VoidTransactionUseCase
  ) {}

  public async createExpenseTransaction(
    params: CreateExpenseTransactionPortParams
  ): Promise<RepositoryResult<string, RepositoryError>> {
    try {
      const transactionId = crypto.randomUUID();

      const transaction = await this.createExpenseUseCase.execute({
        id: transactionId,
        accountId: params.accountId,
        amount: params.amount,
        currencyCode: params.currencyCode,
        description: params.description,
        categoryId: params.categoryId,
        occurredAt: params.transactionDate,
      });

      return Result.success(transaction.id);
    } catch (error) {
      return Result.failure(
        new RepositoryError(
          'UNKNOWN_PERSISTENCE_ERROR',
          (error as Error).message ?? 'Failed to create expense transaction for bill payment',
          { params },
          error
        )
      );
    }
  }

  public async verifyTransactionExists(
    transactionId: string
  ): Promise<RepositoryResult<boolean, RepositoryError>> {
    try {
      const tId = new TransactionId(transactionId);
      const getResult = await this.transactionRepository.getById(tId);

      if (!getResult.success) {
        return Result.failure(getResult.error);
      }

      const exists = getResult.data !== null && !getResult.data.isVoided;
      return Result.success(exists);
    } catch (error) {
      return Result.failure(
        new RepositoryError(
          'UNKNOWN_PERSISTENCE_ERROR',
          (error as Error).message ?? 'Failed to verify transaction existence',
          { transactionId },
          error
        )
      );
    }
  }

  public async rollbackExpenseTransaction(
    transactionId: string
  ): Promise<RepositoryResult<void, RepositoryError>> {
    try {
      await this.voidTransactionUseCase.execute(transactionId);
      return Result.success(undefined);
    } catch (error) {
      return Result.failure(
        new RepositoryError(
          'UNKNOWN_PERSISTENCE_ERROR',
          (error as Error).message ?? 'Failed to rollback expense transaction',
          { transactionId },
          error
        )
      );
    }
  }
}
