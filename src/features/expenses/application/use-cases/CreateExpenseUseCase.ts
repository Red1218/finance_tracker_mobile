import { IExpenseRepository } from '../repositories';
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

export class CreateExpenseUseCase {
  constructor(private readonly expenseRepository: IExpenseRepository) {
    Object.freeze(this);
  }

  public async execute(request: CreateExpenseRequest): Promise<UseCaseResult> {
    return executeUseCase(async () => {
      const expenseId = new ExpenseId(crypto.randomUUID());
      const categoryId = new CategoryId(request.categoryId);
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
