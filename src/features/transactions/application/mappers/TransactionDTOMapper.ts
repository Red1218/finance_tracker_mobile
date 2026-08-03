import { Transaction } from '../../domain';
import { TransactionDTO } from '../dto/TransactionDTO';

export class TransactionDTOMapper {
  public static toDTO(transaction: Transaction): TransactionDTO {
    return Object.freeze({
      id: transaction.id.value,
      accountId: transaction.accountId.value,
      categoryId: transaction.categoryId,
      type: transaction.type.kind,
      amount: transaction.amount.value,
      currencyCode: transaction.currencyCode.value,
      description: transaction.description.value,
      transferGroupId: transaction.transferGroupId ? transaction.transferGroupId.value : null,
      occurredAt: transaction.occurredAt.toISOString(),
      createdAt: transaction.createdAt.toISOString(),
      isArchived: transaction.isArchived,
      archivedAt: transaction.archivedAt ? transaction.archivedAt.toISOString() : null,
    });
  }
}
