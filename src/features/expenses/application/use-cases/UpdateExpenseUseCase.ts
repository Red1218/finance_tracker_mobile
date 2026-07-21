import { IExpenseRepository } from '../repositories';
import { ICategoryRepository } from '../../../categories/application/repositories/ICategoryRepository';
import { 
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
import { UpdateExpenseRequest } from './UpdateExpenseRequest';
import { UseCaseResult } from './UseCaseTypes';
import { executeUseCase, fetchExpenseOrError } from './UseCaseHelpers';
import { fetchCategoryOrError } from '../../../categories/application/use-cases/UseCaseHelpers';
import { ExpenseDomainError } from '../../domain/errors/ExpenseDomainError';
import { Result } from '../../../../platform/persistence';

export class UpdateExpenseUseCase {
  constructor(
    private readonly expenseRepository: IExpenseRepository,
    private readonly categoryRepository: ICategoryRepository
  ) {
    Object.freeze(this);
  }

  public async execute(request: UpdateExpenseRequest): Promise<UseCaseResult> {
    return executeUseCase(async () => {
      const expenseId = new ExpenseId(request.id);
      
      const fetchResult = await fetchExpenseOrError(this.expenseRepository, expenseId);
      if (!fetchResult.success) {
        return fetchResult;
      }

      const expense = fetchResult.data!;

      const updateProps: Parameters<typeof expense.update>[0] = {};

      if (request.categoryId !== undefined && request.categoryId !== expense.categoryId.value) {
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
        updateProps.categoryId = categoryId;
      }
      if (request.amount !== undefined) {
        updateProps.amount = new ExpenseAmount(request.amount);
      }
      if (request.currency !== undefined) {
        updateProps.currency = new CurrencyCode(request.currency as SupportedCurrency);
      }
      if (request.date !== undefined) {
        updateProps.date = new ExpenseDate(request.date);
      }
      if (request.paymentMethod !== undefined) {
        updateProps.paymentMethod = new PaymentMethod(request.paymentMethod);
      }
      if ('note' in request) {
        updateProps.note = request.note === null ? undefined : new ExpenseNote(request.note);
      }
      if ('merchant' in request) {
        updateProps.merchant = request.merchant === null ? undefined : new MerchantName(request.merchant);
      }

      const updatedExpense = expense.update(updateProps);

      return await this.expenseRepository.update(updatedExpense);
    });
  }
}
