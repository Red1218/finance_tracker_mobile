import { DashboardSummary, CategoryBreakdown, BudgetPerformance, MonthlyTrendPoint } from '../../domain';

export interface PdfReportData {
  title: string;
  periodLabel: string;
  summary: DashboardSummary;
  categoryBreakdown: CategoryBreakdown[];
  budgetPerformance: BudgetPerformance[];
  monthlyTrends: MonthlyTrendPoint[];
}

export interface IPdfReportGenerator {
  generatePdf(data: PdfReportData): Promise<string>; // Returns local file URI
}
