import { 
  IReportingRepository, 
  ReportingPeriod, 
  ReportingPeriodValue, 
  FinancialSummary, 
  ReportingDomainError 
} from '../../domain';

export interface GetFinancialSummaryCommand {
  periodKind: ReportingPeriod;
  startDate?: Date;
  endDate?: Date;
}

export interface FinancialSummaryDTO {
  totalIncome: number;
  totalExpense: number;
  netSavings: number;
  savingsRatePercentage: number;
}

export class GetFinancialSummaryUseCase {
  constructor(private readonly reportingRepo: IReportingRepository) {
    Object.freeze(this);
  }

  public async execute(command: GetFinancialSummaryCommand): Promise<FinancialSummaryDTO> {
    const start = command.startDate ?? new Date(Date.now() - 30 * 86400000);
    const end = command.endDate ?? new Date();

    const periodValue = new ReportingPeriodValue(command.periodKind, start, end);

    const result = await this.reportingRepo.getDashboardSummary(
      periodValue.kind,
      periodValue.startDate,
      periodValue.endDate
    );

    if (!result.success) {
      throw new ReportingDomainError('NO_TRANSACTION_DATA', result.error.message);
    }

    const summary = new FinancialSummary(result.data.totalIncome, result.data.totalExpenses);

    return {
      totalIncome: summary.totalIncome,
      totalExpense: summary.totalExpense,
      netSavings: summary.netSavings,
      savingsRatePercentage: summary.savingsRatePercentage,
    };
  }
}
