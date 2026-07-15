import { IBudgetRepository } from '../repositories';
import { 
  Budget, 
  BudgetId, 
  BudgetAmount, 
  BudgetPeriod, 
  BudgetStatus,
  BudgetDomainError
} from '../../domain';
import { CurrencyCode, SupportedCurrency } from '../../../expenses/domain/value-objects/CurrencyCode';
import { CategoryId } from '../../../categories/domain/value-objects/CategoryId';
import { CreateBudgetRequest } from './CreateBudgetRequest';
import { UseCaseResult } from './UseCaseTypes';
import { executeUseCase } from './UseCaseHelpers';

export class CreateBudgetUseCase {
  constructor(private readonly budgetRepository: IBudgetRepository) {
    Object.freeze(this);
  }

  public async execute(request: CreateBudgetRequest): Promise<UseCaseResult> {
    return executeUseCase(async () => {
      const budgetId = new BudgetId(crypto.randomUUID());
      const categoryId = request.categoryId ? new CategoryId(request.categoryId) : null;
      const amount = new BudgetAmount(request.amount);
      const currency = new CurrencyCode(request.currency as SupportedCurrency);
      const period = new BudgetPeriod(request.period);
      const status = new BudgetStatus('Active');

      // Check for duplicates
      const existing = await this.budgetRepository.list({
        categoryId,
        period,
      });

      if (existing.success && existing.data.length > 0) {
        throw new BudgetDomainError('DUPLICATE_BUDGET', 'Budget for this category and period already exists');
      }

      const budget = new Budget({
        id: budgetId,
        categoryId,
        amount,
        currency,
        period,
        status,
        deletedAt: null,
      });

      return await this.budgetRepository.create(budget);
    });
  }
}
