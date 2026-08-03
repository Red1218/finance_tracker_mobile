import { Transaction } from '../../domain';
import { TransactionDTO } from '../../application/dto/TransactionDTO';
import { TransactionViewModel } from '../models/TransactionViewModel';

export class TransactionViewModelMapper {
  public static mapToViewModel(input: Transaction | TransactionDTO): TransactionViewModel {
    const isDto = typeof input.id === 'string' && 'occurredAt' in input;

    const idStr = isDto ? (input as TransactionDTO).id : (input as Transaction).id.value;
    const accountIdStr = isDto ? (input as TransactionDTO).accountId : (input as Transaction).accountId.value;
    const categoryIdStr = input.categoryId;
    const rawType = isDto ? (input as TransactionDTO).type : (input as Transaction).type.kind;
    const typeStr = TransactionViewModelMapper.mapType(rawType);
    const amountVal = isDto ? (input as TransactionDTO).amount : (input as Transaction).amount.value;
    const currencyCodeStr = isDto ? (input as TransactionDTO).currencyCode : (input as Transaction).currencyCode.value;
    const descriptionStr = isDto
      ? (input as TransactionDTO).description
      : (input as Transaction).description ? (input as Transaction).description.value : '';
    const transferGroupIdStr = isDto
      ? (input as TransactionDTO).transferGroupId
      : (input as Transaction).transferGroupId ? (input as Transaction).transferGroupId!.value : null;
    const occurredAtDate = isDto
      ? new Date((input as TransactionDTO).occurredAt)
      : (input as Transaction).transactionDate.value;
    const isVoidedBool = isDto ? (input as TransactionDTO).isArchived : (input as Transaction).isVoided;

    const isOutflow = typeStr === 'EXPENSE' || typeStr === 'TRANSFER_OUT';
    const prefix = isOutflow ? '-' : '+';

    const formattedAmount = `${prefix}${currencyCodeStr === 'INR' ? '₹' : ''}${amountVal.toLocaleString(
      'en-IN',
      { minimumFractionDigits: 2, maximumFractionDigits: 2 }
    )}`;

    let typeLabel = 'Expense';
    let badgeColor = '#EF4444';

    if (typeStr === 'INCOME') {
      typeLabel = 'Income';
      badgeColor = '#10B981';
    } else if (typeStr === 'TRANSFER_OUT') {
      typeLabel = 'Transfer Out';
      badgeColor = '#F59E0B';
    } else if (typeStr === 'TRANSFER_IN') {
      typeLabel = 'Transfer In';
      badgeColor = '#3B82F6';
    }

    const formattedDate = occurredAtDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    return {
      id: idStr,
      accountId: accountIdStr,
      categoryId: categoryIdStr,
      type: typeStr,
      typeLabel,
      amount: amountVal,
      formattedAmount,
      currencyCode: currencyCodeStr,
      description: descriptionStr,
      transferGroupId: transferGroupIdStr,
      transactionDateIso: occurredAtDate.toISOString(),
      formattedDate,
      isVoided: isVoidedBool,
      badgeColor: isVoidedBool ? '#9CA3AF' : badgeColor,
    };
  }

  private static mapType(type: string): TransactionViewModel['type'] {
    switch (type) {
      case 'EXPENSE':
      case 'INCOME':
      case 'TRANSFER_OUT':
      case 'TRANSFER_IN':
        return type;
      default:
        throw new Error(`Unsupported transaction type: ${type}`);
    }
  }
}
