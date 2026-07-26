import { IAIInsightsProvider, IInsightsReadRepository } from '../application';
import { GeminiAIInsightsProvider, InMemoryInsightsReadRepository } from '../../../platform/persistence/insights';
import { reportingModule } from '../../reporting/composition/ReportingModule';
import { IReportingRepository } from '../../reporting/domain';
import { 
  GetSpendingInsightsUseCase, 
  GetCashFlowForecastUseCase, 
  DismissInsightUseCase 
} from '../application';
import { InsightsController } from '../presentation/controllers/InsightsController';

export class InsightsModule {
  public readonly insightsRepository: IInsightsReadRepository;
  public readonly aiProvider: IAIInsightsProvider;
  public readonly reportingRepository: IReportingRepository;
  public readonly getSpendingInsightsUseCase: GetSpendingInsightsUseCase;
  public readonly getCashFlowForecastUseCase: GetCashFlowForecastUseCase;
  public readonly dismissInsightUseCase: DismissInsightUseCase;
  public readonly insightsController: InsightsController;

  constructor(
    repo?: IInsightsReadRepository, 
    provider?: IAIInsightsProvider,
    reportingRepo?: IReportingRepository
  ) {
    this.insightsRepository = repo ?? new InMemoryInsightsReadRepository();
    this.aiProvider = provider ?? new GeminiAIInsightsProvider();
    this.reportingRepository = reportingRepo ?? reportingModule.reportingRepository;

    this.getSpendingInsightsUseCase = new GetSpendingInsightsUseCase(
      this.reportingRepository,
      this.aiProvider,
      this.insightsRepository
    );

    this.getCashFlowForecastUseCase = new GetCashFlowForecastUseCase(
      this.reportingRepository,
      this.aiProvider
    );

    this.dismissInsightUseCase = new DismissInsightUseCase(this.insightsRepository);

    this.insightsController = new InsightsController(
      this.getSpendingInsightsUseCase,
      this.getCashFlowForecastUseCase,
      this.dismissInsightUseCase
    );

    Object.freeze(this);
  }
}

export const insightsModule = new InsightsModule();
