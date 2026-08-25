import { IReportingRepository } from '../domain';
import { SupabaseReportingRepository } from '../../../platform/persistence/reporting/SupabaseReportingRepository';
import { 
  GetFinancialSummaryUseCase, 
  GetCategoryBreakdownUseCase, 
  GetMonthlyTrendUseCase,
  GetDashboardSummaryUseCase,
  GetBudgetPerformanceUseCase,
  GetLargestTransactionsUseCase,
  GetMonthOverMonthComparisonUseCase,
  GetSpendingForecastUseCase,
  ExportReportUseCase,
  IPdfReportGenerator,
  ICsvReportGenerator,
  IShareProvider
} from '../application';
import { ReportingController } from '../presentation/controllers/ReportingController';
import { AnalyticsTabController } from '../presentation/controllers/AnalyticsTabController';
import { CsvReportGeneratorImpl } from '../infrastructure/export/CsvReportGeneratorImpl';
import { PdfReportGeneratorImpl } from '../infrastructure/export/PdfReportGeneratorImpl';
import { ReactNativeShareProviderImpl } from '../../../platform/system/ReactNativeShareProviderImpl';
import { RuleBasedAIInsightsProvider } from '../../insights/infrastructure/providers/RuleBasedAIInsightsProvider';

export class ReportingModule {
  public readonly reportingRepository: IReportingRepository;
  public readonly pdfGenerator: IPdfReportGenerator;
  public readonly csvGenerator: ICsvReportGenerator;
  public readonly shareProvider: IShareProvider;

  public readonly getFinancialSummaryUseCase: GetFinancialSummaryUseCase;
  public readonly getCategoryBreakdownUseCase: GetCategoryBreakdownUseCase;
  public readonly getMonthlyTrendUseCase: GetMonthlyTrendUseCase;
  public readonly getDashboardSummaryUseCase: GetDashboardSummaryUseCase;
  public readonly getBudgetPerformanceUseCase: GetBudgetPerformanceUseCase;
  public readonly getLargestTransactionsUseCase: GetLargestTransactionsUseCase;
  public readonly getMonthOverMonthComparisonUseCase: GetMonthOverMonthComparisonUseCase;
  public readonly getSpendingForecastUseCase: GetSpendingForecastUseCase;
  public readonly exportReportUseCase: ExportReportUseCase;

  public readonly reportingController: ReportingController;
  public readonly analyticsTabController: AnalyticsTabController;

  constructor(repository?: IReportingRepository) {
    this.reportingRepository = repository ?? new SupabaseReportingRepository();
    this.pdfGenerator = new PdfReportGeneratorImpl();
    this.csvGenerator = new CsvReportGeneratorImpl();
    this.shareProvider = new ReactNativeShareProviderImpl();

    const insightsProvider = new RuleBasedAIInsightsProvider();

    this.getFinancialSummaryUseCase = new GetFinancialSummaryUseCase(this.reportingRepository);
    this.getCategoryBreakdownUseCase = new GetCategoryBreakdownUseCase(this.reportingRepository);
    this.getMonthlyTrendUseCase = new GetMonthlyTrendUseCase(this.reportingRepository);
    this.getDashboardSummaryUseCase = new GetDashboardSummaryUseCase(this.reportingRepository);
    this.getBudgetPerformanceUseCase = new GetBudgetPerformanceUseCase(this.reportingRepository);
    this.getLargestTransactionsUseCase = new GetLargestTransactionsUseCase(this.reportingRepository);
    this.getMonthOverMonthComparisonUseCase = new GetMonthOverMonthComparisonUseCase(this.reportingRepository);
    this.getSpendingForecastUseCase = new GetSpendingForecastUseCase(this.reportingRepository, insightsProvider);
    this.exportReportUseCase = new ExportReportUseCase(
      this.reportingRepository,
      this.pdfGenerator,
      this.csvGenerator,
      this.shareProvider
    );

    this.reportingController = new ReportingController(
      this.getFinancialSummaryUseCase,
      this.getCategoryBreakdownUseCase,
      this.getMonthlyTrendUseCase
    );

    this.analyticsTabController = new AnalyticsTabController(
      this.getMonthOverMonthComparisonUseCase,
      this.getSpendingForecastUseCase,
      this.exportReportUseCase,
      insightsProvider
    );

    Object.freeze(this);
  }
}

export const reportingModule = new ReportingModule();
