import { Transaction } from '../../domain';
import { TransactionViewModel } from '../models/TransactionViewModel';

export class TransactionViewModelMapper {
  public static mapToViewModel(entity: Transaction): TransactionViewModel {
    const isOutflow = entity.type.isExpense() || entity.type.isTransferOut();
    const prefix = isOutflow ? '-' : '+';
    const amountVal = entity.amount.value;

    const formattedAmount = `${prefix}${entity.currencyCode.value === 'INR' ? '₹' : ''}${amountVal.toLocaleString(
      'en-IN',
      { minimumFractionDigits: 2, maximumFractionDigits: 2 }
    )}`;

    let typeLabel = 'Expense';
    let badgeColor = '#EF4444'; // Red

    if (entity.type.isIncome()) {
      typeLabel = 'Income';
      badgeColor = '#10B981'; // Green
    } else if (entity.type.isTransferOut()) {
      typeLabel = 'Transfer Out';
      badgeColor = '#F59E0B'; // Amber
    } else if (entity.type.isTransferIn()) {
      typeLabel = 'Transfer In';
      badgeColor = '#3B82F6'; // Blue
    }

    const date = entity.transactionDate.value;
    const formattedDate = date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    return {
      id: entity.id.value,
      accountId: entity.accountId.value,
      categoryId: entity.categoryId,
      type: entity.type.kind,
      typeLabel,
      amount: amountVal,
      formattedAmount,
      currencyCode: entity.currencyCode.value,
      description: entity.description ? entity.description.value : '',
      transferGroupId: entity.transferGroupId ? entity.transferGroupId.value : null,
      transactionDateIso: date.toISOString(),
      formattedDate,
      isVoided: entity.isVoided,
      badgeColor: entity.isVoided ? '#9CA3AF' : badgeColor,
    };
  }
}
