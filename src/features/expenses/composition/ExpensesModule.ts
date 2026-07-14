import { SupabaseExpenseRepository } from '../../../platform/persistence/expenses';
import {
  CreateExpenseUseCase,
  UpdateExpenseUseCase,
  DeleteExpenseUseCase,
  ListExpensesUseCase,
} from '../application';

export class ExpensesModule {
  public readonly createExpenseUseCase: CreateExpenseUseCase;
  public readonly updateExpenseUseCase: UpdateExpenseUseCase;
  public readonly deleteExpenseUseCase: DeleteExpenseUseCase;
  public readonly listExpensesUseCase: ListExpensesUseCase;

  constructor(repository: SupabaseExpenseRepository = new SupabaseExpenseRepository()) {
    this.createExpenseUseCase = new CreateExpenseUseCase(repository);
    this.updateExpenseUseCase = new UpdateExpenseUseCase(repository);
    this.deleteExpenseUseCase = new DeleteExpenseUseCase(repository);
    this.listExpensesUseCase = new ListExpensesUseCase(repository);
    
    Object.freeze(this);
  }
}
