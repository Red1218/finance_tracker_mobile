import { IReportingRepository, ExportReportRequest, ReportingPeriod } from '../../domain';
import { IPdfReportGenerator } from '../ports/IPdfReportGenerator';
import { ICsvReportGenerator } from '../ports/ICsvReportGenerator';
import { IShareProvider } from '../ports/IShareProvider';
import { ReportingUseCaseResult, executeReportingUseCase } from './UseCaseHelpers';
import { Result } from '../../../../platform/persistence';

export interface ExportReportResponse {
  fileUri: string;
  format: 'pdf' | 'csv';
  success: boolean;
}

export class ExportReportUseCase {
  constructor(
    private readonly repository: IReportingRepository,
    private readonly pdfGenerator: IPdfReportGenerator,
    private readonly csvGenerator: ICsvReportGenerator,
    private readonly shareProvider: IShareProvider
  ) {
    Object.freeze(this);
  }

  public async execute(request: ExportReportRequest): Promise<ReportingUseCaseResult<ExportReportResponse>> {
    return executeReportingUseCase(async () => {
      let fileUri: string;

      if (request.format === 'pdf') {
        const period = ReportingPeriod.MONTH;
        const summaryRes = await this.repository.getDashboardSummary(period, request.startDate, request.endDate, request.categoryId);
        const categoryRes = await this.repository.getCategoryBreakdown(period, request.startDate, request.endDate, request.categoryId);
        const budgetRes = await this.repository.getBudgetPerformance(period, request.startDate, request.endDate, request.categoryId);
        const trendRes = await this.repository.getMonthlyTrend(period, request.startDate, request.endDate, request.categoryId);

        if (!summaryRes.success || !categoryRes.success || !budgetRes.success || !trendRes.success) {
          return Result.failure(new Error('Failed to retrieve analytical report data for PDF export.'));
        }

        fileUri = await this.pdfGenerator.generatePdf({
          title: 'Financial Analytics & Performance Report',
          periodLabel: `${request.startDate.toLocaleDateString()} - ${request.endDate.toLocaleDateString()}`,
          summary: summaryRes.data,
          categoryBreakdown: categoryRes.data,
          budgetPerformance: budgetRes.data,
          monthlyTrends: trendRes.data.points,
        });
      } else {
        const ledgerRes = await this.repository.getFilteredLedgerRows(request.startDate, request.endDate, request.categoryId);
        if (!ledgerRes.success) {
          return ledgerRes;
        }

        const rows = ledgerRes.data;
        if (rows.length > 10000) {
          return Result.failure(new Error('Export transaction row count exceeds 10,000 row safety limit.'));
        }

        fileUri = await this.csvGenerator.generateCsv(rows);
      }

      const mimeType = request.format === 'pdf' ? 'application/pdf' : 'text/csv';
      const shared = await this.shareProvider.shareFile(fileUri, mimeType, 'Finance Tracker Export');

      if (!shared) {
        await this.shareProvider.deleteFile(fileUri);
      }

      return Result.success({
        fileUri,
        format: request.format,
        success: shared,
      });
    });
  }
}
