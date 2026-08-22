import { RepositoryResult, RepositoryError } from '../../../../platform/persistence';
import { BillId, BillPayment } from '../../domain';

export interface IBillPaymentRepository {
  findPaymentByOccurrence(
    billId: BillId,
    occurrenceKey: string
  ): Promise<RepositoryResult<BillPayment | null, RepositoryError>>;
  save(payment: BillPayment): Promise<RepositoryResult<void, RepositoryError>>;
}
