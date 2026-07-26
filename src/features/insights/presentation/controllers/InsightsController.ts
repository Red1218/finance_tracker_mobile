import { 
  GetSpendingInsightsUseCase, 
  GetCashFlowForecastUseCase, 
  DismissInsightUseCase, 
  InsightDTO, 
  CashFlowForecastDTO 
} from '../../application';
import { InsightsViewModel } from '../models/InsightsViewModel';
import { InsightsViewModelMapper } from '../mappers/InsightsViewModelMapper';

export interface InsightsState {
  viewModel: InsightsViewModel;
  isLoading: boolean;
  error: string | null;
}

export class InsightsController {
  private state: InsightsState = {
    viewModel: {
      insights: [],
      forecast: null,
    },
    isLoading: false,
    error: null,
  };

  private listeners: Set<(state: InsightsState) => void> = new Set();

  constructor(
    private readonly getSpendingInsightsUseCase: GetSpendingInsightsUseCase,
    private readonly getCashFlowForecastUseCase: GetCashFlowForecastUseCase,
    private readonly dismissInsightUseCase: DismissInsightUseCase
  ) {}

  public getState(): InsightsState {
    return this.state;
  }

  public subscribe(listener: (state: InsightsState) => void): () => void {
    this.listeners.add(listener);
    listener(this.state);
    return () => this.listeners.delete(listener);
  }

  private updateState(partialState: Partial<InsightsState>): void {
    this.state = { ...this.state, ...partialState };
    this.listeners.forEach((listener) => listener(this.state));
  }

  public async loadAll(): Promise<void> {
    this.updateState({ isLoading: true, error: null });
    try {
      const insightDTOs = await this.getSpendingInsightsUseCase.execute();
      let forecastDTO: CashFlowForecastDTO | null = null;
      try {
        forecastDTO = await this.getCashFlowForecastUseCase.execute();
      } catch {
        forecastDTO = null;
      }

      const vm = InsightsViewModelMapper.toFullViewModel({
        insightDTOs,
        forecastDTO,
      });

      this.updateState({
        viewModel: vm,
        isLoading: false,
        error: null,
      });
    } catch (err: any) {
      this.updateState({
        isLoading: false,
        error: err?.message || 'Failed to load AI insights.',
      });
    }
  }

  public async dismissInsight(insightId: string): Promise<boolean> {
    try {
      const success = await this.dismissInsightUseCase.execute(insightId);
      if (success) {
        await this.loadAll();
      }
      return success;
    } catch (err: any) {
      this.updateState({ error: err?.message || 'Failed to dismiss insight.' });
      return false;
    }
  }
}
