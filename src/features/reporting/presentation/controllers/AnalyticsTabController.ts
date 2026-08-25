import { ReportingPeriod, ExportReportRequest, MonthOverMonthComparison } from '../../domain';
import { AnalyticsSegment } from '../components/AnalyticsSegmentedControl';
import { Insight, CashFlowForecast } from '../../../insights/domain';
import { GetMonthOverMonthComparisonUseCase } from '../../application/use-cases/GetMonthOverMonthComparisonUseCase';
import { GetSpendingForecastUseCase } from '../../application/use-cases/GetSpendingForecastUseCase';
import { ExportReportUseCase } from '../../application/use-cases/ExportReportUseCase';
import { IAIInsightsProvider } from '../../../insights/application';

export interface AnalyticsTabState {
  activeSegment: AnalyticsSegment;
  selectedPeriod: ReportingPeriod;
  selectedCategoryId: string | null;
  isLoading: boolean;
  error: string | null;
  momComparison: MonthOverMonthComparison | null;
  forecast: CashFlowForecast | null;
  insights: Insight[];
  dismissedInsightIds: string[];
  undoSnackbarInsight: Insight | null;
  exportModalVisible: boolean;
  isExporting: boolean;
  exportError: string | null;
}

export class AnalyticsTabController {
  private state: AnalyticsTabState = {
    activeSegment: 'reports',
    selectedPeriod: ReportingPeriod.MONTH,
    selectedCategoryId: null,
    isLoading: false,
    error: null,
    momComparison: null,
    forecast: null,
    insights: [],
    dismissedInsightIds: [],
    undoSnackbarInsight: null,
    exportModalVisible: false,
    isExporting: false,
    exportError: null,
  };

  private listeners: Array<(state: AnalyticsTabState) => void> = [];
  private undoTimer: NodeJS.Timeout | null = null;

  constructor(
    private readonly momUseCase: GetMonthOverMonthComparisonUseCase,
    private readonly forecastUseCase: GetSpendingForecastUseCase,
    private readonly exportUseCase: ExportReportUseCase,
    private readonly insightsProvider: IAIInsightsProvider
  ) {}

  public getState(): AnalyticsTabState {
    return { ...this.state };
  }

  public subscribe(listener: (state: AnalyticsTabState) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach((listener) => listener({ ...this.state }));
  }

  public setActiveSegment(segment: AnalyticsSegment) {
    this.state.activeSegment = segment;
    this.notify();
    if (segment === 'insights' && !this.state.forecast) {
      this.loadInsightsData();
    }
  }

  public setSelectedCategory(categoryId: string | null) {
    this.state.selectedCategoryId = categoryId;
    this.notify();
    this.loadMoMData();
  }

  public async loadMoMData() {
    this.state.isLoading = true;
    this.notify();

    const res = await this.momUseCase.execute({
      reportingPeriod: this.state.selectedPeriod,
      categoryId: this.state.selectedCategoryId,
    });

    this.state.isLoading = false;
    if (res.success) {
      this.state.momComparison = res.data;
    } else {
      this.state.error = res.error.message;
    }
    this.notify();
  }

  public async loadInsightsData() {
    const forecastRes = await this.forecastUseCase.execute({
      reportingPeriod: this.state.selectedPeriod,
    });

    if (forecastRes.success) {
      this.state.forecast = forecastRes.data;
    }

    this.notify();
  }

  public dismissInsight(insightId: string) {
    const target = this.state.insights.find((i) => i.id === insightId);
    if (!target) return;

    this.state.dismissedInsightIds.push(insightId);
    this.state.undoSnackbarInsight = target;
    this.notify();

    if (this.undoTimer) clearTimeout(this.undoTimer);
    this.undoTimer = setTimeout(() => {
      this.state.undoSnackbarInsight = null;
      this.notify();
    }, 4000);
  }

  public undoDismiss() {
    if (!this.state.undoSnackbarInsight) return;
    const restoredId = this.state.undoSnackbarInsight.id;
    this.state.dismissedInsightIds = this.state.dismissedInsightIds.filter((id) => id !== restoredId);
    this.state.undoSnackbarInsight = null;
    if (this.undoTimer) clearTimeout(this.undoTimer);
    this.notify();
  }

  public openExportModal() {
    this.state.exportModalVisible = true;
    this.state.exportError = null;
    this.notify();
  }

  public closeExportModal() {
    if (this.state.isExporting) return;
    this.state.exportModalVisible = false;
    this.notify();
  }

  public async executeExport(request: ExportReportRequest) {
    this.state.isExporting = true;
    this.state.exportError = null;
    this.notify();

    const res = await this.exportUseCase.execute(request);
    this.state.isExporting = false;

    if (res.success) {
      this.state.exportModalVisible = false;
    } else {
      this.state.exportError = res.error.message;
    }
    this.notify();
  }
}
