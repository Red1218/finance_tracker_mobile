import { IBillRepository } from '../ports/IBillRepository';
import { ICategoryRepository } from '../../../categories/application/repositories/ICategoryRepository';
import { GetUpcomingBillsQuery } from '../dto/GetUpcomingBillsQuery';
import { UpcomingBillDTO } from '../dto/UpcomingBillDTO';
import { BillSchedulingService } from '../../domain';
import { BillApplicationError } from '../errors/BillApplicationError';
import { CategoryId } from '../../../categories/domain';

export class GetUpcomingBillsUseCase {
  constructor(
    private readonly billRepository: IBillRepository,
    private readonly categoryRepository?: ICategoryRepository
  ) {
    Object.freeze(this);
  }

  public async execute(query: GetUpcomingBillsQuery): Promise<UpcomingBillDTO[]> {
    const windowDays = query.windowDays ?? 30;
    const asOf = query.asOfDate ?? new Date();

    const upcomingResult = await this.billRepository.findUpcoming(query.userId, windowDays, asOf);
    if (!upcomingResult.success) {
      throw new BillApplicationError(
        'REPOSITORY_ERROR',
        `Failed to fetch upcoming bills: ${upcomingResult.error.message}`
      );
    }

    const bills = upcomingResult.data ?? [];
    const activeBills = bills.filter((b) => !b.isArchived);

    const categoryMap = new Map<string, string>();
    if (this.categoryRepository) {
      const categoryIds = Array.from(
        new Set(activeBills.map((b) => b.categoryId).filter((id): id is string => id !== null))
      );

      await Promise.all(
        categoryIds.map(async (catIdStr) => {
          const catResult = await this.categoryRepository!.getById(new CategoryId(catIdStr));
          if (catResult.success && catResult.data) {
            categoryMap.set(catIdStr, catResult.data.name.value);
          }
        })
      );
    }

    const dtos: UpcomingBillDTO[] = activeBills.map((bill) => {
      const status = BillSchedulingService.resolveStatus(bill, asOf);
      const activeStatus = status === 'Archived' ? 'Upcoming' : status;
      const daysUntil = bill.nextDueDate.daysUntilDue(asOf);

      let urgency: 'critical' | 'high' | 'medium' | 'low';
      if (activeStatus === 'Overdue') {
        urgency = 'critical';
      } else if (activeStatus === 'DueToday' || daysUntil <= 3) {
        urgency = 'high';
      } else if (daysUntil <= 14) {
        urgency = 'medium';
      } else {
        urgency = 'low';
      }

      let dueDateLabel: string;
      if (activeStatus === 'DueToday') {
        dueDateLabel = 'Due Today';
      } else if (daysUntil === 1) {
        dueDateLabel = 'Tomorrow';
      } else if (daysUntil > 1) {
        dueDateLabel = `In ${daysUntil} days`;
      } else {
        dueDateLabel = `Overdue by ${Math.abs(daysUntil)} days`;
      }

      const categoryName = bill.categoryId ? categoryMap.get(bill.categoryId) ?? null : null;

      return {
        billId: bill.id.value,
        billName: bill.name.value,
        amount: bill.amount.amount,
        currencyCode: bill.amount.currencyCode.value,
        nextDueDate: bill.nextDueDate.value.toISOString(),
        dueDateLabel,
        status: activeStatus,
        urgency,
        categoryId: bill.categoryId,
        categoryName,
        recurrenceType: bill.recurrence.type,
      };
    });

    // Sort chronologically by nextDueDate ASC
    dtos.sort((a, b) => new Date(a.nextDueDate).getTime() - new Date(b.nextDueDate).getTime());

    return dtos;
  }
}
