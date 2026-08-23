import { UpcomingBillDTO } from '../../application/dto/UpcomingBillDTO';
import { UpcomingBillItemViewModel } from '../view-models/UpcomingBillsViewModel';

export function formatCurrency(amount: number, currencyCode: string = 'INR'): string {
  const symbolMap: Record<string, string> = {
    INR: '₹',
    USD: '$',
    EUR: '€',
    GBP: '£',
  };
  const symbol = symbolMap[currencyCode.toUpperCase()] ?? `${currencyCode} `;
  const formattedNumber = amount.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${symbol}${formattedNumber}`;
}

export class BillsViewModelMapper {
  public static toItemViewModel(dto: UpcomingBillDTO): UpcomingBillItemViewModel {
    return {
      billId: dto.billId,
      billName: dto.billName,
      formattedAmount: formatCurrency(dto.amount, dto.currencyCode),
      rawAmount: dto.amount,
      currencyCode: dto.currencyCode,
      dueDateLabel: dto.dueDateLabel,
      status: dto.status,
      urgency: dto.urgency,
      categoryName: dto.categoryName,
    };
  }

  public static toItemViewModelList(dtos: readonly UpcomingBillDTO[]): UpcomingBillItemViewModel[] {
    return dtos.map((dto) => BillsViewModelMapper.toItemViewModel(dto));
  }
}
