import { RepositoryResult, RepositoryError } from '../../../../platform/persistence';
import { Bill, BillId, BillPayment } from '../../domain';

export interface IBillRepository {
  findById(id: BillId): Promise<RepositoryResult<Bill | null, RepositoryError>>;
  findUpcoming(
    userId: string,
    windowDays: number,
    asOf: Date
  ): Promise<RepositoryResult<Bill[], RepositoryError>>;
  save(bill: Bill): Promise<RepositoryResult<void, RepositoryError>>;
  savePaymentAndBill(
    payment: BillPayment,
    updatedBill: Bill
  ): Promise<RepositoryResult<void, RepositoryError>>;
}
