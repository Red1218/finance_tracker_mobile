import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GetFinancialSummaryUseCase } from '../use-cases/GetFinancialSummaryUseCase';
import { ReportingPeriod, ReportingDomainError } from '../../domain';
import { Result } from '../../../../platform/persistence';

describe('GetFinancialSummaryUseCase', () => {
  let mockReportingRepo: any;
  let useCase: GetFinancialSummaryUseCase;

  beforeEach(() => {
    mockReportingRepo = {
      getDashboardSummary: vi.fn(),
    };
    useCase = new GetFinancialSummaryUseCase(mockReportingRepo);
  });

  it('executes successfully returning calculated netSavings and savingsRatePercentage', async () => {
    mockReportingRepo.getDashboardSummary.mockResolvedValue(
      Result.success({
        totalIncome: 100000,
        totalExpenses: 60000,
      })
    );

    const dto = await useCase.execute({
      periodKind: ReportingPeriod.MONTH,
      startDate: new Date('2026-06-01'),
      endDate: new Date('2026-06-30'),
    });

    expect(dto.totalIncome).toBe(100000);
    expect(dto.totalExpense).toBe(60000);
    expect(dto.netSavings).toBe(40000);
    expect(dto.savingsRatePercentage).toBe(40);
  });

  it('handles zero-income safely returning 0% savings rate', async () => {
    mockReportingRepo.getDashboardSummary.mockResolvedValue(
      Result.success({
        totalIncome: 0,
        totalExpenses: 15000,
      })
    );

    const dto = await useCase.execute({
      periodKind: ReportingPeriod.MONTH,
      startDate: new Date('2026-06-01'),
      endDate: new Date('2026-06-30'),
    });

    expect(dto.totalIncome).toBe(0);
    expect(dto.totalExpense).toBe(15000);
    expect(dto.netSavings).toBe(-15000);
    expect(dto.savingsRatePercentage).toBe(0);
  });

  it('throws ReportingDomainError when repository fails', async () => {
    mockReportingRepo.getDashboardSummary.mockResolvedValue(
      Result.failure({ message: 'Database query failed' })
    );

    await expect(
      useCase.execute({
        periodKind: ReportingPeriod.MONTH,
        startDate: new Date('2026-06-01'),
        endDate: new Date('2026-06-30'),
      })
    ).rejects.toThrow(ReportingDomainError);
  });
});
