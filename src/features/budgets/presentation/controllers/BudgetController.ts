import {
  CreateBudgetUseCase,
  CreateBudgetCommand,
  UpdateBudgetUseCase,
  UpdateBudgetCommand,
  ArchiveBudgetUseCase,
  ArchiveBudgetCommand,
  RestoreBudgetUseCase,
  RestoreBudgetCommand,
  ListBudgetsUseCase,
  ListBudgetsQuery,
  GetBudgetSummaryUseCase,
  GetBudgetSummaryQuery,
  BudgetSummary,
} from '../../application';
import { BudgetViewModelMapper } from '../mappers/BudgetViewModelMapper';
import { BudgetViewModel } from '../models/BudgetViewModel';

export class BudgetController {
  constructor(
    private readonly createBudgetUseCase: CreateBudgetUseCase,
    private readonly updateBudgetUseCase: UpdateBudgetUseCase,
    private readonly archiveBudgetUseCase: ArchiveBudgetUseCase,
    private readonly restoreBudgetUseCase: RestoreBudgetUseCase,
    private readonly listBudgetsUseCase: ListBudgetsUseCase,
    private readonly getBudgetSummaryUseCase: GetBudgetSummaryUseCase
  ) {
    Object.freeze(this);
  }

  public async createBudget(command: CreateBudgetCommand): Promise<BudgetViewModel> {
    const budget = await this.createBudgetUseCase.execute(command);
    return BudgetViewModelMapper.toViewModel(budget);
  }

  public async updateBudget(command: UpdateBudgetCommand): Promise<BudgetViewModel> {
    const budget = await this.updateBudgetUseCase.execute(command);
    return BudgetViewModelMapper.toViewModel(budget);
  }

  public async archiveBudget(command: ArchiveBudgetCommand): Promise<void> {
    await this.archiveBudgetUseCase.execute(command);
  }

  public async restoreBudget(command: RestoreBudgetCommand): Promise<void> {
    await this.restoreBudgetUseCase.execute(command);
  }

  public async listBudgets(query?: ListBudgetsQuery): Promise<BudgetViewModel[]> {
    const budgets = await this.listBudgetsUseCase.execute(query);
    return budgets.map((b) => BudgetViewModelMapper.toViewModel(b));
  }

  public async getBudgetSummary(query: GetBudgetSummaryQuery): Promise<BudgetSummary> {
    return await this.getBudgetSummaryUseCase.execute(query);
  }
}
