import { BudgetPerformanceResponse } from '../../application';
import { chartTheme } from '../theme/reportingChartTheme';

export interface BarChartStackItem {
  value: number;
  label?: string;
  frontColor: string;
  spacing?: number;
  labelTextStyle?: { color: string; fontSize: number };
}

export interface BudgetChartViewModel {
  barData: BarChartStackItem[];
  accessibilitySummary: string;
}

export class BudgetChartMapper {
  public static mapToChartViewModel(data: BudgetPerformanceResponse): BudgetChartViewModel {
    const items = data.items;

    if (items.length === 0) {
      return {
        barData: [],
        accessibilitySummary: 'Budget performance bar chart. No budget data available.',
      };
    }

    const barData: BarChartStackItem[] = [];

    let overBudgetCount = 0;
    let nearLimitCount = 0;

    items.forEach((item) => {
      const name = item.categoryName ?? 'Overall';
      const label = name.length > 8 ? `${name.slice(0, 7)}…` : name;

      let spentColor = chartTheme.colors.budgetSpent;
      if (item.status === 'Over Budget') {
        spentColor = chartTheme.colors.overBudget;
        overBudgetCount += 1;
      } else if (item.status === 'Near Limit') {
        spentColor = chartTheme.colors.nearLimit;
        nearLimitCount += 1;
      }

      // Pair of bars: Budget Amount (grey), Actual Spent (color coded)
      barData.push(
        {
          value: item.budgetAmount,
          label,
          frontColor: chartTheme.colors.budgetAmount,
          spacing: 2,
          labelTextStyle: { color: chartTheme.colors.textSecondary, fontSize: 10 },
        },
        {
          value: item.actualSpent,
          frontColor: spentColor,
          spacing: 16,
        }
      );
    });

    const accessibilitySummary = `Budget performance chart tracking ${items.length} budgets. ${overBudgetCount} over budget, ${nearLimitCount} near limit.`;

    return {
      barData,
      accessibilitySummary,
    };
  }
}
