import { describe, it, expect } from 'vitest';
import { MonthlyTrendChartMapper } from '../mappers/MonthlyTrendChartMapper';
import { CategoryChartMapper } from '../mappers/CategoryChartMapper';
import { BudgetChartMapper } from '../mappers/BudgetChartMapper';
import { MonthlyTrendResponse, CategoryBreakdownResponse, BudgetPerformanceResponse } from '../../application';

describe('Presentation Chart Mappers & Accessibility Summaries', () => {
  describe('MonthlyTrendChartMapper', () => {
    it('✓ maps empty items to empty dataset and default accessibility summary', () => {
      const response: MonthlyTrendResponse = { items: [] };
      const vm = MonthlyTrendChartMapper.mapToChartViewModel(response);
      expect(vm.expenseData).toEqual([]);
      expect(vm.incomeData).toEqual([]);
      expect(vm.accessibilitySummary).toContain('No trend data available');
    });

    it('✓ maps items correctly and generates rich accessibility summary', () => {
      const response: MonthlyTrendResponse = {
        items: [
          { period: '2026-01', income: 5000, expenses: 2000, netCashFlow: 3000 },
          { period: '2026-02', income: 5000, expenses: 4000, netCashFlow: 1000 },
        ],
        comparison: {
          currentTotal: 6000,
          previousPeriodTotal: 5000,
          absoluteChange: 1000,
          percentageChange: 20,
        },
      };

      const vm = MonthlyTrendChartMapper.mapToChartViewModel(response);
      expect(vm.expenseData).toHaveLength(2);
      expect(vm.incomeData).toHaveLength(2);
      expect(vm.accessibilitySummary).toContain('Highest spend: ₹4,000 in 2026-02');
      expect(vm.accessibilitySummary).toContain('Compared to previous period spend of ₹5,000');
    });

    it('✓ large dataset performance regression test (365 daily points)', () => {
      const largeItems = Array.from({ length: 365 }, (_, i) => ({
        period: `Day-${i + 1}`,
        income: 100 + i,
        expenses: 50 + (i % 50),
        netCashFlow: 50,
      }));

      const start = performance.now();
      const vm = MonthlyTrendChartMapper.mapToChartViewModel({ items: largeItems });
      const duration = performance.now() - start;

      expect(vm.expenseData).toHaveLength(365);
      expect(vm.incomeData).toHaveLength(365);
      expect(duration).toBeLessThan(50); // Must execute under 50ms
    });
  });

  describe('CategoryChartMapper', () => {
    it('✓ maps items to pie slices and computes top 3 category summary', () => {
      const response: CategoryBreakdownResponse = {
        items: [
          { categoryId: 'c1', categoryName: 'Rent', amount: 15000, percentage: 50, transactionCount: 1 },
          { categoryId: 'c2', categoryName: 'Food', amount: 9000, percentage: 30, transactionCount: 2 },
          { categoryId: 'c3', categoryName: 'Travel', amount: 6000, percentage: 20, transactionCount: 3 },
        ],
      };

      const vm = CategoryChartMapper.mapToChartViewModel(response);
      expect(vm.pieData).toHaveLength(3);
      expect(vm.totalSpend).toBe(30000);
      expect(vm.accessibilitySummary).toContain('Rent: ₹15,000 (50.0%)');
    });

    it('✓ large dataset performance regression test (100 categories)', () => {
      const largeCategories = Array.from({ length: 100 }, (_, i) => ({
        categoryId: `cat-${i}`,
        categoryName: `Category ${i}`,
        amount: 100 + i,
        percentage: 1,
        transactionCount: 1,
      }));

      const start = performance.now();
      const vm = CategoryChartMapper.mapToChartViewModel({ items: largeCategories });
      const duration = performance.now() - start;

      expect(vm.pieData).toHaveLength(100);
      expect(duration).toBeLessThan(50);
    });
  });

  describe('BudgetChartMapper', () => {
    it('✓ maps budget items to bar chart data pairs', () => {
      const response: BudgetPerformanceResponse = {
        items: [
          {
            budgetId: 'b1',
            categoryId: 'c1',
            categoryName: 'Food',
            budgetAmount: 10000,
            actualSpent: 8000,
            remaining: 2000,
            utilization: 80,
            status: 'Safe',
          },
        ],
      };

      const vm = BudgetChartMapper.mapToChartViewModel(response);
      expect(vm.barData).toHaveLength(2); // Pair: Budget bar & Spent bar
      expect(vm.accessibilitySummary).toContain('Budget performance chart tracking 1 budgets');
    });
  });
});
