import { SupabaseBudgetRepository } from '../infrastructure/repositories/SupabaseBudgetRepository';
import { SupabaseCategoryRepository } from '../../../platform/persistence/categories/SupabaseCategoryRepository';
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
    const categoryRepository = new SupabaseCategoryRepository();
    this.createBudgetUseCase = new CreateBudgetUseCase(repository, categoryRepository);
    this.updateBudgetUseCase = new UpdateBudgetUseCase(repository);
    this.deleteBudgetUseCase = new DeleteBudgetUseCase(repository);
    this.listBudgetsUseCase = new ListBudgetsUseCase(repository);
    this.cloneBudgetPeriodUseCase = new CloneBudgetPeriodUseCase(repository, categoryRepository);
    this.getBudgetSummaryUseCase = new GetBudgetSummaryUseCase(repository);
    
    Object.freeze(this);
  }
}
