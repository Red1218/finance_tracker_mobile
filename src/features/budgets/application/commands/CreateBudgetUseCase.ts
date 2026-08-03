import {
  Budget,
  BudgetId,
  BudgetAmount,
  BudgetPeriod,
  BudgetPeriodType,
} from '../../domain';
import { CategoryId } from '../../../categories/domain';
import { CurrencyCode } from '../../../accounts/domain';
import { IBudgetRepository } from '../repositories/IBudgetRepository';
import { ICategoryRepository } from '../../../categories/application/repositories/ICategoryRepository';
import { CreateBudgetCommand } from './CreateBudgetCommand';
import { BudgetDTO } from '../dto/BudgetDTO';
import { BudgetDTOMapper } from '../mappers/BudgetDTOMapper';
import { CategoryNotFoundError } from '../../../categories/application/errors/CategoryApplicationError';
import { BudgetOverlapError } from '../errors/BudgetApplicationError';

export class CreateBudgetUseCase {
  constructor(
    private readonly budgetRepository: IBudgetRepository,
    private readonly categoryRepository: ICategoryRepository
  ) {
    Object.freeze(this);
  }

  public async execute(command: CreateBudgetCommand): Promise<BudgetDTO> {
    const categoryId = command.categoryId ? new CategoryId(command.categoryId) : null;

    if (categoryId) {
      const catResult = await this.categoryRepository.getById(categoryId);
      if (!catResult.success || !catResult.data) {
        throw new CategoryNotFoundError(command.categoryId!);
      }
      if (catResult.data.isArchived) {
        throw new Error('Inactive or archived categories cannot receive new budgets.');
      }
    }

    const period = new BudgetPeriod(
      command.periodKind as BudgetPeriodType,
      command.startDate,
      command.endDate
    );

    const existingResult = typeof (this.budgetRepository as any).getAll === 'function'
      ? await (this.budgetRepository as any).getAll(false)
      : await this.budgetRepository.list(false);
    if (existingResult.success) {
      const matchingScope = existingResult.data.filter((b: any) => {
        if (categoryId === null) return b.isOverall;
        return b.categoryId && b.categoryId.equals(categoryId);
      });

      for (const existingBudget of matchingScope) {
        if (existingBudget.overlaps(period)) {
          throw new BudgetOverlapError();
        }
      }
    }

    const budget = Budget.create({
      id: new BudgetId(command.id || crypto.randomUUID()),
      categoryId,
      amount: new BudgetAmount(command.amount),
      currency: new CurrencyCode(command.currencyCode),
      period,
    });

    const saveResult = await this.budgetRepository.save(budget);
    if (!saveResult.success) {
      throw saveResult.error;
    }

    return BudgetDTOMapper.toDTO(budget);
  }
}
