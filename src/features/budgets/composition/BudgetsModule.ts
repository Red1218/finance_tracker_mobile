import { SupabaseBudgetRepository } from '../infrastructure/repositories/SupabaseBudgetRepository';
import {
  CreateBudgetUseCase,
  UpdateBudgetUseCase,
  DeleteBudgetUseCase,
  ListBudgetsUseCase,
  GetBudgetSummaryUseCase,
  CloneBudgetPeriodUseCase,
} from '../application';

export class BudgetsModule {
  public readonly createBudgetUseCase: CreateBudgetUseCase;
  public readonly updateBudgetUseCase: UpdateBudgetUseCase;
  public readonly deleteBudgetUseCase: DeleteBudgetUseCase;
  public readonly listBudgetsUseCase: ListBudgetsUseCase;
  public readonly cloneBudgetPeriodUseCase: CloneBudgetPeriodUseCase;
  public readonly getBudgetSummaryUseCase: GetBudgetSummaryUseCase;

  constructor(repository: SupabaseBudgetRepository = new SupabaseBudgetRepository()) {
    this.createBudgetUseCase = new CreateBudgetUseCase(repository);
    this.updateBudgetUseCase = new UpdateBudgetUseCase(repository);
    this.deleteBudgetUseCase = new DeleteBudgetUseCase(repository);
    this.listBudgetsUseCase = new ListBudgetsUseCase(repository);
    this.cloneBudgetPeriodUseCase = new CloneBudgetPeriodUseCase(repository);
    this.getBudgetSummaryUseCase = new GetBudgetSummaryUseCase(repository);
    
    Object.freeze(this);
  }
}
