import { IBillRepository } from '../ports/IBillRepository';
import { Bill, BillId, BillPayment } from '../../domain';
import { RepositoryResult, Result, RepositoryError } from '../../../../platform/persistence';
import { InMemoryBillPaymentRepository } from './InMemoryBillPaymentRepository';


export class InMemoryBillRepository implements IBillRepository {
  private bills = new Map<string, Bill>();

  constructor(private paymentRepo?: InMemoryBillPaymentRepository) {}

  public setPaymentRepository(paymentRepo: InMemoryBillPaymentRepository): void {
    this.paymentRepo = paymentRepo;
  }

  public async findById(id: BillId): Promise<RepositoryResult<Bill | null, RepositoryError>> {
    const bill = this.bills.get(id.value) ?? null;
    return Result.success(bill);
  }

  public async findUpcoming(
    userId: string,
    windowDays: number,
    asOf: Date
  ): Promise<RepositoryResult<Bill[], RepositoryError>> {
    const windowEnd = new Date(asOf.getTime() + windowDays * 86400000);

    const upcoming = Array.from(this.bills.values())
      .filter(
        (b) =>
          b.userId === userId &&
          !b.isArchived &&
          b.nextDueDate.value.getTime() <= windowEnd.getTime()
      )
      .sort((a, b) => a.nextDueDate.value.getTime() - b.nextDueDate.value.getTime());

    return Result.success(upcoming);
  }

  public async save(bill: Bill): Promise<RepositoryResult<void, RepositoryError>> {
    this.bills.set(bill.id.value, bill);
    return Result.success(undefined);
  }

  public async savePaymentAndBill(
    payment: BillPayment,
    updatedBill: Bill
  ): Promise<RepositoryResult<void, RepositoryError>> {
    if (this.paymentRepo) {
      const paymentResult = await this.paymentRepo.save(payment);
      if (!paymentResult.success) {
        return Result.failure(paymentResult.error);
      }
    }

    this.bills.set(updatedBill.id.value, updatedBill);
    return Result.success(undefined);
  }


  public clear(): void {
    this.bills.clear();
  }
}
