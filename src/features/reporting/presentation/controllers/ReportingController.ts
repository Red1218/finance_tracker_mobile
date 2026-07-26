import { ReportingPeriod } from '../../domain';
import { 
  GetFinancialSummaryUseCase, 
  GetCategoryBreakdownUseCase, 
  GetMonthlyTrendUseCase 
} from '../../application';
import { ReportingViewModel } from '../models/ReportingViewModel';
import { ReportingViewModelMapper } from '../mappers/ReportingViewModelMapper';

export interface ReportingState {
  selectedPeriod: ReportingPeriod;
  viewModel: ReportingViewModel;
  isLoading: boolean;
  error: string | null;
}

export class ReportingController {
  private state: ReportingState = {
    selectedPeriod: ReportingPeriod.MONTH,
    viewModel: {
      selectedPeriod: ReportingPeriod.MONTH,
      financialSummary: null,
      categoryBreakdown: [],
      monthlyTrend: [],
    },
    isLoading: false,
    error: null,
  };

  private listeners: Set<(state: ReportingState) => void> = new Set();

  constructor(
    private readonly getFinancialSummaryUseCase: GetFinancialSummaryUseCase,
    private readonly getCategoryBreakdownUseCase: GetCategoryBreakdownUseCase,
    private readonly getMonthlyTrendUseCase: GetMonthlyTrendUseCase
  ) {}

  public getState(): ReportingState {
    return this.state;
  }

  public subscribe(listener: (state: ReportingState) => void): () => void {
    this.listeners.add(listener);
    listener(this.state);
    return () => this.listeners.delete(listener);
  }

  private updateState(partialState: Partial<ReportingState>): void {
    this.state = { ...this.state, ...partialState };
    this.listeners.forEach((listener) => listener(this.state));
  }

  public async changePeriod(period: ReportingPeriod): Promise<void> {
    this.updateState({ selectedPeriod: period });
    await this.loadReports();
  }

  public async loadReports(): Promise<void> {
    this.updateState({ isLoading: true, error: null });
    try {
      const summaryDto = await this.getFinancialSummaryUseCase.execute({
        periodKind: this.state.selectedPeriod,
      });

      const catBreakdownRes = await this.getCategoryBreakdownUseCase.execute({
        reportingPeriod: this.state.selectedPeriod,
      });

      const monthlyTrendRes = await this.getMonthlyTrendUseCase.execute({
        reportingPeriod: this.state.selectedPeriod,
      });

      const categoryBreakdowns = catBreakdownRes.success
        ? Array.isArray(catBreakdownRes.data)
          ? catBreakdownRes.data
          : catBreakdownRes.data?.items ?? []
        : [];

      const monthlyTrends = monthlyTrendRes.success
        ? Array.isArray(monthlyTrendRes.data)
          ? monthlyTrendRes.data
          : monthlyTrendRes.data?.items ?? []
        : [];

      const fullVm = ReportingViewModelMapper.toFullViewModel({
        selectedPeriod: this.state.selectedPeriod,
        summary: summaryDto,
        categoryBreakdown: categoryBreakdowns as any,
        monthlyTrend: monthlyTrends as any,
      });

      this.updateState({
        viewModel: fullVm,
        isLoading: false,
        error: null,
      });
    } catch (e: any) {
      this.updateState({
        isLoading: false,
        error: e?.message || 'Failed to load reporting data.',
      });
    }
  }
}
