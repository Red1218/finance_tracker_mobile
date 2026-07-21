import { SupabaseExpenseRepository } from '../../../platform/persistence/expenses';
import {
  CreateExpenseUseCase,
  UpdateExpenseUseCase,
  DeleteExpenseUseCase,
  RestoreExpenseUseCase,
  ListExpensesUseCase,
} from '../application';
import { SupabaseCategoryRepository } from '../../../platform/persistence/categories';

export class ExpensesModule {
  public readonly createExpenseUseCase: CreateExpenseUseCase;
  public readonly updateExpenseUseCase: UpdateExpenseUseCase;
  public readonly deleteExpenseUseCase: DeleteExpenseUseCase;
  public readonly restoreExpenseUseCase: RestoreExpenseUseCase;
  public readonly listExpensesUseCase: ListExpensesUseCase;

  constructor(
    expenseRepository: SupabaseExpenseRepository = new SupabaseExpenseRepository(),
    categoryRepository: SupabaseCategoryRepository = new SupabaseCategoryRepository()
  ) {
    this.createExpenseUseCase = new CreateExpenseUseCase(expenseRepository, categoryRepository);
    this.updateExpenseUseCase = new UpdateExpenseUseCase(expenseRepository, categoryRepository);
    this.deleteExpenseUseCase = new DeleteExpenseUseCase(expenseRepository);
    this.restoreExpenseUseCase = new RestoreExpenseUseCase(expenseRepository);
    this.listExpensesUseCase = new ListExpensesUseCase(expenseRepository);
    
    Object.freeze(this);
  }
}
