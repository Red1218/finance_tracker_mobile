export type { ReportingApplicationError, ReportingUseCaseResult } from './use-cases/UseCaseHelpers';
export type { ReportingRequest } from './requests/ReportingRequest';
export type { DashboardSummaryResponse } from './responses/DashboardSummaryResponse';
export type { CategoryBreakdownResponse, CategoryBreakdownItem } from './responses/CategoryBreakdownResponse';
export type { MonthlyTrendResponse, MonthlyTrendPointItem } from './responses/MonthlyTrendResponse';
export type { BudgetPerformanceResponse, BudgetPerformanceItem } from './responses/BudgetPerformanceResponse';
export type { LargestTransactionsResponse, LargestTransactionItem } from './responses/LargestTransactionsResponse';
export { GetDashboardSummaryUseCase } from './use-cases/GetDashboardSummaryUseCase';
export { GetCategoryBreakdownUseCase } from './use-cases/GetCategoryBreakdownUseCase';
export { GetMonthlyTrendUseCase } from './use-cases/GetMonthlyTrendUseCase';
export { GetBudgetPerformanceUseCase } from './use-cases/GetBudgetPerformanceUseCase';
export { GetLargestTransactionsUseCase } from './use-cases/GetLargestTransactionsUseCase';
export { GetFinancialSummaryUseCase } from './use-cases/GetFinancialSummaryUseCase';
export type { GetFinancialSummaryCommand, FinancialSummaryDTO } from './use-cases/GetFinancialSummaryUseCase';

export { GetMonthOverMonthComparisonUseCase } from './use-cases/GetMonthOverMonthComparisonUseCase';
export { GetSpendingForecastUseCase } from './use-cases/GetSpendingForecastUseCase';
export { ExportReportUseCase } from './use-cases/ExportReportUseCase';
export type { ExportReportResponse } from './use-cases/ExportReportUseCase';

export type { IPdfReportGenerator, PdfReportData } from './ports/IPdfReportGenerator';
export type { ICsvReportGenerator } from './ports/ICsvReportGenerator';
export type { IShareProvider } from './ports/IShareProvider';
