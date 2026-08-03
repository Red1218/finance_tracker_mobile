import { IBudgetRepository } from '../repositories/IBudgetRepository';
import { ICategoryRepository } from '../../../categories/application/repositories/ICategoryRepository';
import { Budget, BudgetId, BudgetAmount, BudgetPeriod, BudgetPeriodType, BudgetDomainError } from '../../domain';
import { generateUUID } from '../../../../core/utils/uuid';
import { CategoryId } from '../../../categories/domain';
import { CurrencyCode } from '../../../accounts/domain/value-objects/CurrencyCode';

export interface CreateBudgetCommand {
  id?: string;
  categoryId?: string | null; // null = Overall Budget
  amount: number;
  currencyCode: string;
  periodKind: BudgetPeriodType;
  startDate: Date;
  endDate: Date;
}

export class CreateBudgetUseCase {
  constructor(
    private readonly budgetRepository: IBudgetRepository,
    private readonly categoryRepository: ICategoryRepository
  ) {
    Object.freeze(this);
  }

  public async execute(command: CreateBudgetCommand): Promise<Budget> {
    let categoryIsActive = true;
    let categoryIdObj: CategoryId | null = null;

    if (command.categoryId) {
      categoryIdObj = new CategoryId(command.categoryId);
      const catResult = await this.categoryRepository.getById(categoryIdObj);
      if (!catResult.success) {
        throw catResult.error;
      }
      if (!catResult.data) {
        throw new BudgetDomainError('CATEGORY_MISMATCH', `Category "${command.categoryId}" not found.`);
      }
      categoryIsActive = !catResult.data.isArchived;
    }

    const period = new BudgetPeriod(command.periodKind, command.startDate, command.endDate);

    const overlapResult = await this.budgetRepository.findOverlappingBudget(categoryIdObj, period);
    if (!overlapResult.success) {
      throw overlapResult.error;
    }

    if (overlapResult.data) {
      throw new BudgetDomainError(
        'OVERLAPPING_BUDGET',
        'An active budget of the same scope already intersects with this date range.'
      );
    }

    const budget = Budget.create(
      {
        id: new BudgetId(command.id ?? generateUUID()),
        categoryId: categoryIdObj,
        amount: new BudgetAmount(command.amount),
        currency: new CurrencyCode(command.currencyCode),
        period,
        archivedAt: null,
      },
      categoryIsActive
    );

    const saveResult = await this.budgetRepository.save(budget);
    if (!saveResult.success) {
      throw saveResult.error;
    }

    return budget;
  }
}
