import { IReportingRepository } from '../domain';
import { SupabaseReportingRepository } from '../../../platform/persistence/reporting/SupabaseReportingRepository';
import { 
  GetFinancialSummaryUseCase, 
  GetCategoryBreakdownUseCase, 
  GetMonthlyTrendUseCase,
  GetDashboardSummaryUseCase,
  GetBudgetPerformanceUseCase,
  GetLargestTransactionsUseCase
} from '../application';
import { ReportingController } from '../presentation/controllers/ReportingController';

export class ReportingModule {
  public readonly reportingRepository: IReportingRepository;
  public readonly getFinancialSummaryUseCase: GetFinancialSummaryUseCase;
  public readonly getCategoryBreakdownUseCase: GetCategoryBreakdownUseCase;
  public readonly getMonthlyTrendUseCase: GetMonthlyTrendUseCase;
  public readonly getDashboardSummaryUseCase: GetDashboardSummaryUseCase;
  public readonly getBudgetPerformanceUseCase: GetBudgetPerformanceUseCase;
  public readonly getLargestTransactionsUseCase: GetLargestTransactionsUseCase;
  public readonly reportingController: ReportingController;

  constructor(repository?: IReportingRepository) {
    this.reportingRepository = repository ?? new SupabaseReportingRepository();
    this.getFinancialSummaryUseCase = new GetFinancialSummaryUseCase(this.reportingRepository);
    this.getCategoryBreakdownUseCase = new GetCategoryBreakdownUseCase(this.reportingRepository);
    this.getMonthlyTrendUseCase = new GetMonthlyTrendUseCase(this.reportingRepository);
    this.getDashboardSummaryUseCase = new GetDashboardSummaryUseCase(this.reportingRepository);
    this.getBudgetPerformanceUseCase = new GetBudgetPerformanceUseCase(this.reportingRepository);
    this.getLargestTransactionsUseCase = new GetLargestTransactionsUseCase(this.reportingRepository);

    this.reportingController = new ReportingController(
      this.getFinancialSummaryUseCase,
      this.getCategoryBreakdownUseCase,
      this.getMonthlyTrendUseCase
    );

    Object.freeze(this);
  }
}

export const reportingModule = new ReportingModule();
