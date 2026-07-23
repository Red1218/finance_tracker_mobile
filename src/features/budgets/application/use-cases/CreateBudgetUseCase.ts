import { IBudgetRepository } from '../repositories/IBudgetRepository';
import { ICategoryRepository } from '../../../categories/application/repositories/ICategoryRepository';
import { CreateBudgetRequest } from '../requests/CreateBudgetRequest';
import { UseCaseResult } from './UseCaseTypes';
import { executeUseCase } from './UseCaseHelpers';
import { Budget, BudgetId, BudgetAmount, BudgetPeriod, BudgetDomainError } from '../../domain';

import { generateUUID } from '../../../../core/utils/uuid';
import { CategoryId } from '../../../categories/domain';
import { CurrencyCode } from '../../../expenses/domain/value-objects/CurrencyCode';
import { Result } from '../../../../platform/persistence';

export class CreateBudgetUseCase {
  constructor(
    private readonly budgetRepository: IBudgetRepository,
    private readonly categoryRepository: ICategoryRepository
  ) {
    Object.freeze(this);
  }

  public async execute(request: CreateBudgetRequest): Promise<UseCaseResult<Budget>> {
    return executeUseCase(async () => {
      let categoryIsActive = true;
      let categoryIdObj: CategoryId | null = null;

      if (request.categoryId) {
        categoryIdObj = new CategoryId(request.categoryId);
        
        const catResult = await this.categoryRepository.getById(categoryIdObj);
        if (!catResult.success) {
          return catResult;
        }
        
        if (!catResult.data) {
          return Result.failure(
            new BudgetDomainError('CATEGORY_MISMATCH', 'The specified category does not exist.')
          );
        }
        
        categoryIsActive = !catResult.data.isArchived;
      }

      const period = request.period as BudgetPeriod;

      const overlapResult = await this.budgetRepository.findOverlappingBudget(
        categoryIdObj,
        period,
        request.startDate,
        request.endDate
      );

      if (!overlapResult.success) {
        return overlapResult;
      }

      if (overlapResult.data) {
        return Result.failure(
          new BudgetDomainError('DUPLICATE_BUDGET', 'A budget for this category and period already exists.')
        );
      }

      const budget = Budget.create({
        id: new BudgetId(generateUUID()),
        categoryId: categoryIdObj,
        amount: new BudgetAmount(request.amount),
        currency: new CurrencyCode(request.currencyCode),
        period,
        startDate: request.startDate,
        endDate: request.endDate
      }, categoryIsActive);

      const createResult = await this.budgetRepository.create(budget);
      if (!createResult.success) {
        return createResult;
      }

      return Result.success(budget);
    });
  }
}
