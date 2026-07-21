import { IExpenseRepository } from '../repositories';
import { ICategoryRepository } from '../../../categories/application/repositories/ICategoryRepository';
import { 
  Expense, 
  ExpenseId, 
  ExpenseAmount, 
  CurrencyCode, 
  ExpenseDate, 
  PaymentMethod, 
  ExpenseNote, 
  MerchantName,
  SupportedCurrency
} from '../../domain';
import { CategoryId } from '../../../categories/domain';
import { CreateExpenseRequest } from './CreateExpenseRequest';
import { UseCaseResult } from './UseCaseTypes';
import { executeUseCase } from './UseCaseHelpers';
import { fetchCategoryOrError } from '../../../categories/application/use-cases/UseCaseHelpers';
import { ExpenseDomainError } from '../../domain/errors/ExpenseDomainError';
import { Result } from '../../../../platform/persistence';

export class CreateExpenseUseCase {
  constructor(
    private readonly expenseRepository: IExpenseRepository,
    private readonly categoryRepository: ICategoryRepository
  ) {
    Object.freeze(this);
  }

  public async execute(request: CreateExpenseRequest): Promise<UseCaseResult> {
    return executeUseCase(async () => {
      const categoryId = new CategoryId(request.categoryId);
      
      const categoryResult = await fetchCategoryOrError(this.categoryRepository, categoryId);
      if (!categoryResult.success) {
        return categoryResult;
      }
      if (categoryResult.data!.isArchived) {
        return Result.failure(
          new ExpenseDomainError(
            'ARCHIVED_CATEGORY_SELECTION',
            'Cannot assign an expense to an archived category.'
          )
        );
      }

      const expenseId = new ExpenseId(crypto.randomUUID());
      const amount = new ExpenseAmount(request.amount);
      const currency = new CurrencyCode(request.currency as SupportedCurrency);
      const date = new ExpenseDate(request.date);
      const paymentMethod = new PaymentMethod(request.paymentMethod);
      const note = request.note ? new ExpenseNote(request.note) : undefined;
      const merchant = request.merchant ? new MerchantName(request.merchant) : undefined;

      const expense = new Expense({
        id: expenseId,
        categoryId,
        amount,
        currency,
        date,
        paymentMethod,
        note,
        merchant,
      });

      return await this.expenseRepository.create(expense);
    });
  }
}
