import { CategoryBreakdownResponse } from '../../application';
import { chartTheme } from '../theme/reportingChartTheme';

export interface PieChartSlice {
  value: number;
  color: string;
  text?: string;
  focused?: boolean;
}

export interface CategoryChartViewModel {
  pieData: PieChartSlice[];
  totalSpend: number;
  accessibilitySummary: string;
}

export class CategoryChartMapper {
  public static mapToChartViewModel(data: CategoryBreakdownResponse): CategoryChartViewModel {
    const items = data.items;

    if (items.length === 0) {
      return {
        pieData: [],
        totalSpend: 0,
        accessibilitySummary: 'Category breakdown chart. No spending data available.',
      };
    }

    const totalSpend = items.reduce((sum, cat) => sum + cat.amount, 0);

    const pieData: PieChartSlice[] = items.map((item, index) => ({
      value: item.amount,
      color: chartTheme.categoryPalette[index % chartTheme.categoryPalette.length],
      text: item.percentage > 5 ? `${item.percentage.toFixed(0)}%` : undefined,
    }));

    const top3 = [...items].sort((a, b) => b.amount - a.amount).slice(0, 3);
    const topDescriptions = top3
      .map((c) => `${c.categoryName}: ₹${c.amount.toLocaleString()} (${c.percentage.toFixed(1)}%)`)
      .join(', ');

    const accessibilitySummary = `Category spending breakdown chart. Total spend ₹${totalSpend.toLocaleString()} across ${
      items.length
    } categories. Top categories: ${topDescriptions}.`;

    return {
      pieData,
      totalSpend,
      accessibilitySummary,
    };
  }
}
