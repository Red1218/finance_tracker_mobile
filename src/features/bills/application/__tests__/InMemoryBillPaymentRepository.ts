import { IBillPaymentRepository } from '../ports/IBillPaymentRepository';
import { BillId, BillPayment } from '../../domain';
import { RepositoryResult, Result, RepositoryError } from '../../../../platform/persistence';

export class InMemoryBillPaymentRepository implements IBillPaymentRepository {
  private payments = new Map<string, BillPayment>();

  private getKey(billId: string, occurrenceKey: string): string {
    return `${billId}:${occurrenceKey}`;
  }

  public async findPaymentByOccurrence(
    billId: BillId,
    occurrenceKey: string
  ): Promise<RepositoryResult<BillPayment | null, RepositoryError>> {
    const key = this.getKey(billId.value, occurrenceKey);
    const payment = this.payments.get(key) ?? null;
    return Result.success(payment);
  }

  public async save(payment: BillPayment): Promise<RepositoryResult<void, RepositoryError>> {
    const key = this.getKey(payment.billId.value, payment.occurrenceKey);
    this.payments.set(key, payment);
    return Result.success(undefined);
  }

  public clear(): void {
    this.payments.clear();
  }
}
