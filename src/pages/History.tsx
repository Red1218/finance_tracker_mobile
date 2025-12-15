import { Layout } from '@/components/layout/Layout';
import { PageHeader } from '@/components/layout/PageHeader';
import { MonthSwitcher } from '@/components/dashboard/MonthSwitcher';
import { DailySpendingList } from '@/components/dashboard/DailySpendingList';
import { StatCard } from '@/components/dashboard/StatCard';
import { useBudgetContext } from '@/contexts/BudgetContext';
import { TrendingDown, Receipt } from 'lucide-react';

const History = () => {
  const {
    currentMonth,
    setCurrentMonth,
    data,
    totalSpend,
  } = useBudgetContext();

  return (
    <Layout>
      <PageHeader
        title="Spending History"
        subtitle="View your day-by-day expenses"
      />

      <div className="space-y-6">
        <MonthSwitcher
          currentMonth={currentMonth}
          onMonthChange={setCurrentMonth}
        />

        <div className="grid grid-cols-2 gap-3">
          <StatCard
            title="Total Spent"
            value={totalSpend}
            icon={<TrendingDown className="h-4 w-4" />}
            variant="primary"
          />
          <StatCard
            title="Total Entries"
            value={data.spends.length}
            icon={<Receipt className="h-4 w-4" />}
          />
        </div>

        <div>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Day by Day Breakdown
          </h2>
          <DailySpendingList spends={data.spends} categories={data.categories} />
        </div>
      </div>
    </Layout>
  );
};

export default History;
