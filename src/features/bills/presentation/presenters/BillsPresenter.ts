import { GetUpcomingBillsUseCase } from '../../application/use-cases/GetUpcomingBillsUseCase';
import { MarkBillPaidUseCase } from '../../application/use-cases/MarkBillPaidUseCase';
import { BillsViewModelMapper } from '../mappers/BillsViewModelMapper';
import { UpcomingBillItemViewModel } from '../view-models/UpcomingBillsViewModel';
import { MarkBillPaidResultDTO } from '../../application/dto/MarkBillPaidResultDTO';

export const DEFAULT_DASHBOARD_UPCOMING_BILLS_WINDOW_DAYS = 30;

export interface MarkBillPaidPresenterParams {
  readonly billId: string;
  readonly amount: number;
  readonly currencyCode: string;
  readonly executionMode?: 'UNLINKED' | 'AUTO_CREATE' | 'LINK_EXISTING';
  readonly accountId?: string;
  readonly transactionId?: string;
  readonly paidAt?: Date;
}

export class BillsPresenter {
  constructor(
    private readonly getUpcomingBillsUseCase: GetUpcomingBillsUseCase,
    private readonly markBillPaidUseCase: MarkBillPaidUseCase
  ) {}

  public async loadUpcomingBills(
    userId: string,
    windowDays: number = DEFAULT_DASHBOARD_UPCOMING_BILLS_WINDOW_DAYS
  ): Promise<UpcomingBillItemViewModel[]> {
    const dtos = await this.getUpcomingBillsUseCase.execute({
      userId,
      windowDays,
    });

    return BillsViewModelMapper.toItemViewModelList(dtos);
  }

  public async markBillPaid(
    params: MarkBillPaidPresenterParams
  ): Promise<MarkBillPaidResultDTO> {
    return await this.markBillPaidUseCase.execute({
      billId: params.billId,
      amount: params.amount,
      currencyCode: params.currencyCode,
      executionMode: params.executionMode ?? 'UNLINKED',
      accountId: params.accountId,
      transactionId: params.transactionId,
      paidAt: params.paidAt ?? new Date(),
    });
  }
}
