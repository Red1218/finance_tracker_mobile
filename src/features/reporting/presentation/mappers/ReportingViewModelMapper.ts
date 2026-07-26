import { FinancialSummaryDTO } from '../../application';
import { 
  ReportingViewModel, 
  FinancialSummaryCardViewModel, 
  CategoryBreakdownItemViewModel, 
  MonthlyTrendItemViewModel 
} from '../models/ReportingViewModel';
import { CategoryBreakdown, MonthlyTrendPoint } from '../../domain';

export class ReportingViewModelMapper {
  public static toFinancialSummaryViewModel(dto: FinancialSummaryDTO): FinancialSummaryCardViewModel {
    return {
      formattedIncome: `₹${dto.totalIncome.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
      formattedExpense: `₹${dto.totalExpense.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
      formattedNetSavings: `₹${dto.netSavings.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
      savingsRatePercentage: dto.savingsRatePercentage,
      isPositiveSavings: dto.netSavings >= 0,
    };
  }

  public static toCategoryBreakdownViewModel(items: CategoryBreakdown[]): CategoryBreakdownItemViewModel[] {
    return items.map((item) => ({
      categoryId: item.categoryId,
      categoryName: item.categoryName,
      formattedAmount: `₹${item.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
      percentage: Math.round(item.percentage * 10) / 10,
    }));
  }

  public static toMonthlyTrendViewModel(points: MonthlyTrendPoint[]): MonthlyTrendItemViewModel[] {
    return points.map((p) => ({
      periodLabel: p.period,
      formattedIncome: `₹${p.income.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
      formattedExpense: `₹${p.expenses.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
      formattedNet: `₹${p.netCashFlow.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
    }));
  }

  public static toFullViewModel(params: {
    selectedPeriod: string;
    summary: FinancialSummaryDTO | null;
    categoryBreakdown: CategoryBreakdown[];
    monthlyTrend: MonthlyTrendPoint[];
  }): ReportingViewModel {
    return {
      selectedPeriod: params.selectedPeriod,
      financialSummary: params.summary ? this.toFinancialSummaryViewModel(params.summary) : null,
      categoryBreakdown: this.toCategoryBreakdownViewModel(params.categoryBreakdown),
      monthlyTrend: this.toMonthlyTrendViewModel(params.monthlyTrend),
    };
  }
}
