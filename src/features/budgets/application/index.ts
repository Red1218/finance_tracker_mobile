export * from './dto/BudgetDTO';
export * from './mappers/BudgetDTOMapper';
export * from './errors/BudgetApplicationError';
export * from './ports/IBudgetRepository';
export * from './commands/CreateBudgetCommand';
export * from './commands/CreateBudgetUseCase';
export * from './commands/UpdateBudgetCommand';
export * from './commands/UpdateBudgetUseCase';
export * from './commands/ArchiveBudgetCommand';
export * from './commands/ArchiveBudgetUseCase';
export * from './commands/RestoreBudgetCommand';
export * from './commands/RestoreBudgetUseCase';
export * from './queries/ListBudgetsQueryUseCase';
export * from './projections/GetBudgetSummaryProjection';

import { ListBudgetsQueryUseCase } from './queries/ListBudgetsQueryUseCase';
import { GetBudgetSummaryProjection } from './projections/GetBudgetSummaryProjection';
import { BudgetSummaryDTO } from './dto/BudgetDTO';

export class ListBudgetsUseCase extends ListBudgetsQueryUseCase {}
export class GetBudgetSummaryUseCase extends GetBudgetSummaryProjection {}

export type ListBudgetsQuery = boolean | { includeArchived?: boolean };
export type GetBudgetSummaryQuery = string | { budgetId: string };
export type BudgetSummary = BudgetSummaryDTO;
