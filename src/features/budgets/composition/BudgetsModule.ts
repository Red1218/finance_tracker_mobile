import { SupabaseBudgetRepository } from '../../../platform/persistence/budgets';
import {
  CreateBudgetUseCase,
  UpdateBudgetUseCase,
  DeleteBudgetUseCase,
  ListBudgetsUseCase,
  CloneBudgetPeriodUseCase,
} from '../application';

export class BudgetsModule {
  public readonly createBudgetUseCase: CreateBudgetUseCase;
  public readonly updateBudgetUseCase: UpdateBudgetUseCase;
  public readonly deleteBudgetUseCase: DeleteBudgetUseCase;
  public readonly listBudgetsUseCase: ListBudgetsUseCase;
  public readonly cloneBudgetPeriodUseCase: CloneBudgetPeriodUseCase;

  constructor(repository: SupabaseBudgetRepository = new SupabaseBudgetRepository()) {
    this.createBudgetUseCase = new CreateBudgetUseCase(repository);
    this.updateBudgetUseCase = new UpdateBudgetUseCase(repository);
    this.deleteBudgetUseCase = new DeleteBudgetUseCase(repository);
    this.listBudgetsUseCase = new ListBudgetsUseCase(repository);
    this.cloneBudgetPeriodUseCase = new CloneBudgetPeriodUseCase(repository);
    
    Object.freeze(this);
  }
}
