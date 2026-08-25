import { describe, it, expect, vi } from 'vitest';
import { ExportReportUseCase } from '../use-cases/ExportReportUseCase';
import { ExportReportRequest, IReportingRepository } from '../../domain';
import { IPdfReportGenerator } from '../ports/IPdfReportGenerator';
import { ICsvReportGenerator } from '../ports/ICsvReportGenerator';
import { IShareProvider } from '../ports/IShareProvider';
import { Result } from '../../../../platform/persistence';

describe('ExportReportUseCase', () => {
  it('generates and shares CSV export successfully', async () => {
    const mockRepo: Partial<IReportingRepository> = {
      getFilteredLedgerRows: vi.fn().mockResolvedValue(
        Result.success([
          {
            transactionDate: '2026-01-15',
            type: 'EXPENSE',
            categoryName: 'Food',
            amount: 50,
            accountName: 'Checking',
            description: 'Lunch',
            status: 'COMPLETED',
          },
        ])
      ),
    };

    const mockPdf: Partial<IPdfReportGenerator> = {
      generatePdf: vi.fn(),
    };

    const mockCsv: Partial<ICsvReportGenerator> = {
      generateCsv: vi.fn().mockResolvedValue('file:///cache/report.csv'),
    };

    const mockShare: Partial<IShareProvider> = {
      shareFile: vi.fn().mockResolvedValue(true),
      deleteFile: vi.fn(),
    };

    const useCase = new ExportReportUseCase(
      mockRepo as IReportingRepository,
      mockPdf as IPdfReportGenerator,
      mockCsv as ICsvReportGenerator,
      mockShare as IShareProvider
    );

    const req = new ExportReportRequest({
      format: 'csv',
      startDate: new Date('2026-01-01'),
      endDate: new Date('2026-01-31'),
    });

    const res = await useCase.execute(req);

    expect(res.success).toBe(true);
    if (res.success) {
      expect(res.data.format).toBe('csv');
    }
    expect(mockCsv.generateCsv).toHaveBeenCalledTimes(1);
    expect(mockShare.shareFile).toHaveBeenCalledWith('file:///cache/report.csv', 'text/csv', 'Finance Tracker Export');
  });
});
