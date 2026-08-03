import { TransactionId } from '../../domain';
import { ITransactionRepository } from '../repositories/ITransactionRepository';
import { ArchiveTransactionCommand } from './ArchiveTransactionCommand';
import { TransactionNotFoundError } from '../errors/TransactionApplicationError';

export class ArchiveTransactionUseCase {
  constructor(private readonly transactionRepository: ITransactionRepository) {
    Object.freeze(this);
  }

  public async execute(command: string | ArchiveTransactionCommand): Promise<void> {
    const rawId = typeof command === 'string' ? command : (command.transactionId || (command as any).id);
    if (!rawId) {
      throw new TransactionNotFoundError('');
    }
    const tId = new TransactionId(rawId);
    const getResult = await this.transactionRepository.getById(tId);

    if (!getResult.success || !getResult.data) {
      throw new TransactionNotFoundError(rawId);
    }

    const archived = getResult.data.archive();
    const saveResult = await this.transactionRepository.save(archived);
    if (!saveResult.success) {
      throw saveResult.error;
    }
  }
}
