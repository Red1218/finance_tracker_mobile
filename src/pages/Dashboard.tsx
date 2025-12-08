import { Layout } from '@/components/layout/Layout';
import { PageHeader } from '@/components/layout/PageHeader';
import { MonthSwitcher } from '@/components/dashboard/MonthSwitcher';
import { StatCard } from '@/components/dashboard/StatCard';
import { CategoryBreakdown } from '@/components/dashboard/CategoryBreakdown';
import { useBudgetContext } from '@/contexts/BudgetContext';
import { TrendingDown, HandCoins, CreditCard } from 'lucide-react';

const Dashboard = () => {
  const {
    currentMonth,
    setCurrentMonth,
    totalSpend,
    totalBorrowed,
    spendByCategory,
    spendByCreditCard,
  } = useBudgetContext();

  const totalCreditSpend = spendByCreditCard.reduce((sum, s) => sum + s.amount, 0);

  return (
    <Layout>
      <PageHeader 
        title="Budget Tracker" 
        subtitle="Track your monthly spending"
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
            title="Borrowed"
            value={totalBorrowed}
            icon={<HandCoins className="h-4 w-4" />}
            variant="warning"
          />
        </div>

        {totalCreditSpend > 0 && (
          <StatCard
            title="Credit Card Spend"
            value={totalCreditSpend}
            icon={<CreditCard className="h-4 w-4" />}
          />
        )}

        <div>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Spending by Category
          </h2>
          <CategoryBreakdown items={spendByCategory} totalSpend={totalSpend} />
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
