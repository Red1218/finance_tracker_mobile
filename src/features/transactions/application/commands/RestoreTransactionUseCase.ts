import { TransactionId } from '../../domain';
import { ITransactionRepository } from '../repositories/ITransactionRepository';
import { RestoreTransactionCommand } from './RestoreTransactionCommand';
import { TransactionNotFoundError } from '../errors/TransactionApplicationError';

export class RestoreTransactionUseCase {
  constructor(private readonly transactionRepository: ITransactionRepository) {
    Object.freeze(this);
  }

  public async execute(command: RestoreTransactionCommand): Promise<void> {
    const tId = new TransactionId(command.transactionId);
    const getResult = await this.transactionRepository.getById(tId);

    if (!getResult.success || !getResult.data) {
      throw new TransactionNotFoundError(command.transactionId);
    }

    const restored = getResult.data.restore();
    const saveResult = await this.transactionRepository.save(restored);
    if (!saveResult.success) {
      throw saveResult.error;
    }
  }
}
