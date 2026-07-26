import { SupabaseBudgetRepository } from '../infrastructure/repositories/SupabaseBudgetRepository';
import { SupabaseCategoryRepository } from '../../../platform/persistence/categories/SupabaseCategoryRepository';
import { SupabaseTransactionRepository } from '../../../platform/persistence/transactions/SupabaseTransactionRepository';
import {
  CreateBudgetUseCase,
  UpdateBudgetUseCase,
  ArchiveBudgetUseCase,
  RestoreBudgetUseCase,
  ListBudgetsUseCase,
  GetBudgetSummaryUseCase,
  IBudgetRepository,
} from '../application';
import { ICategoryRepository } from '../../categories/application';
import { ITransactionRepository } from '../../transactions/application';
import { BudgetController } from '../presentation/controllers/BudgetController';

export class BudgetsModule {
  public readonly createBudgetUseCase: CreateBudgetUseCase;
  public readonly updateBudgetUseCase: UpdateBudgetUseCase;
  public readonly archiveBudgetUseCase: ArchiveBudgetUseCase;
  public readonly restoreBudgetUseCase: RestoreBudgetUseCase;
  public readonly listBudgetsUseCase: ListBudgetsUseCase;
  public readonly getBudgetSummaryUseCase: GetBudgetSummaryUseCase;
  public readonly controller: BudgetController;

  constructor(
    repository: IBudgetRepository = new SupabaseBudgetRepository(),
    categoryRepository: ICategoryRepository = new SupabaseCategoryRepository(),
    transactionRepository: ITransactionRepository = new SupabaseTransactionRepository()
  ) {
    this.createBudgetUseCase = new CreateBudgetUseCase(repository, categoryRepository);
    this.updateBudgetUseCase = new UpdateBudgetUseCase(repository);
    this.archiveBudgetUseCase = new ArchiveBudgetUseCase(repository);
    this.restoreBudgetUseCase = new RestoreBudgetUseCase(repository);
    this.listBudgetsUseCase = new ListBudgetsUseCase(repository);
    this.getBudgetSummaryUseCase = new GetBudgetSummaryUseCase(repository, transactionRepository);

    this.controller = new BudgetController(
      this.createBudgetUseCase,
      this.updateBudgetUseCase,
      this.archiveBudgetUseCase,
      this.restoreBudgetUseCase,
      this.listBudgetsUseCase,
      this.getBudgetSummaryUseCase
    );

    Object.freeze(this);
  }
}
