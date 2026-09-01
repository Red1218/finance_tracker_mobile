import { MonthlyTrendResponse } from '../../application';
import { chartTheme } from '../theme/reportingChartTheme';

export interface LineChartPoint {
  value: number;
  label?: string;
  dataPointText?: string;
  labelTextStyle?: { color: string; fontSize: number };
}

export interface MonthlyTrendChartViewModel {
  expenseData: LineChartPoint[];
  incomeData: LineChartPoint[];
  accessibilitySummary: string;
}

export interface TrendBarPoint {
  value: number;
  label?: string;
  spacing?: number;
  labelTextStyle?: { color: string; fontSize: number };
}

export interface MonthlyTrendBarChartViewModel {
  barData: TrendBarPoint[];
  accessibilitySummary: string;
}

export class MonthlyTrendChartMapper {
  public static mapToChartViewModel(data: MonthlyTrendResponse): MonthlyTrendChartViewModel {
    const items = data.items;

    if (items.length === 0) {
      return {
        expenseData: [],
        incomeData: [],
        accessibilitySummary: 'Spending trend chart. No trend data available for this period.',
      };
    }

    const expenseData: LineChartPoint[] = [];
    const incomeData: LineChartPoint[] = [];

    let highestExpense = -Infinity;
    let highestExpensePeriod = '';
    let lowestExpense = Infinity;
    let lowestExpensePeriod = '';
    let totalExpense = 0;

    items.forEach((item, index) => {
      // Limit label density if points > 10 for clean display
      const showLabel = items.length <= 12 || index % Math.ceil(items.length / 8) === 0;

      expenseData.push({
        value: item.expenses,
        label: showLabel ? item.period : undefined,
        labelTextStyle: { color: chartTheme.colors.textSecondary, fontSize: 10 },
      });

      incomeData.push({
        value: item.income,
        label: showLabel ? item.period : undefined,
        labelTextStyle: { color: chartTheme.colors.textSecondary, fontSize: 10 },
      });

      totalExpense += item.expenses;

      if (item.expenses > highestExpense) {
        highestExpense = item.expenses;
        highestExpensePeriod = item.period;
      }
      if (item.expenses < lowestExpense) {
        lowestExpense = item.expenses;
        lowestExpensePeriod = item.period;
      }
    });

    const summaryParts: string[] = ['Spending trend chart.'];
    summaryParts.push(`Total period spend: ₹${totalExpense.toLocaleString()}.`);
    if (highestExpense > -Infinity) {
      summaryParts.push(`Highest spend: ₹${highestExpense.toLocaleString()} in ${highestExpensePeriod}.`);
    }
    if (lowestExpense < Infinity && items.length > 1) {
      summaryParts.push(`Lowest spend: ₹${lowestExpense.toLocaleString()} in ${lowestExpensePeriod}.`);
    }

    if (data.comparison) {
      const comp = data.comparison;
      summaryParts.push(
        `Compared to previous period spend of ₹${comp.previousPeriodTotal.toLocaleString()}, change is ${
          comp.absoluteChange >= 0 ? '+' : ''
        }₹${comp.absoluteChange.toLocaleString()} (${comp.percentageChange >= 0 ? '+' : ''}${comp.percentageChange.toFixed(
          1
        )}%).`
      );
    }

    return {
      expenseData,
      incomeData,
      accessibilitySummary: summaryParts.join(' '),
    };
  }

  /**
   * Paired income/expense bars per period - two consecutive BarChart entries
   * per point (tight spacing within the pair, wider spacing before the next),
   * the same grouping technique BudgetChartMapper already uses for budget-vs-spent.
   */
  public static mapToBarChartViewModel(data: MonthlyTrendResponse): MonthlyTrendBarChartViewModel {
    const items = data.items;

    if (items.length === 0) {
      return {
        barData: [],
        accessibilitySummary: 'Income and expenses trend chart. No trend data available for this period.',
      };
    }

    const barData: TrendBarPoint[] = [];
    const summaryParts: string[] = [`Income and expenses trend chart across ${items.length} periods.`];

    items.forEach((item) => {
      barData.push(
        {
          value: item.income,
          label: item.period,
          spacing: 2,
          labelTextStyle: { color: chartTheme.colors.textSecondary, fontSize: 10 },
        },
        {
          value: item.expenses,
          spacing: 16,
        }
      );

      summaryParts.push(
        `${item.period}: income ₹${item.income.toLocaleString()}, expenses ₹${item.expenses.toLocaleString()}.`
      );
    });

    return {
      barData,
      accessibilitySummary: summaryParts.join(' '),
    };
  }
}
