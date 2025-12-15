import { Layout } from '@/components/layout/Layout';
import { PageHeader } from '@/components/layout/PageHeader';
import { MonthSwitcher } from '@/components/dashboard/MonthSwitcher';
import { StatCard } from '@/components/dashboard/StatCard';
import { CategoryBreakdown } from '@/components/dashboard/CategoryBreakdown';
import { BudgetProgress } from '@/components/dashboard/BudgetProgress';
import { SpendingPieChart } from '@/components/dashboard/SpendingPieChart';
import { DailySpendingList } from '@/components/dashboard/DailySpendingList';
import { useBudgetContext } from '@/contexts/BudgetContext';
import { TrendingDown, HandCoins, CreditCard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();
  const {
    currentMonth,
    setCurrentMonth,
    totalSpend,
    totalBorrowed,
    spendByCategory,
    spendByCreditCard,
    budgetLimit,
    setBudgetLimit,
    data,
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

        <BudgetProgress
          budgetLimit={budgetLimit}
          totalSpend={totalSpend}
          onSetLimit={setBudgetLimit}
        />

        <div className="grid grid-cols-2 gap-3">
          <div
            onClick={() => navigate('/history')}
            className="cursor-pointer hover:opacity-80 transition-opacity"
          >
            <StatCard
              title="Total Spent"
              value={totalSpend}
              icon={<TrendingDown className="h-4 w-4" />}
              variant="primary"
            />
          </div>
          <div
            onClick={() => navigate('/cards')}
            className="cursor-pointer hover:opacity-80 transition-opacity"
          >
            <StatCard
              title="Borrowed"
              value={totalBorrowed}
              icon={<HandCoins className="h-4 w-4" />}
              variant="warning"
            />
          </div>
        </div>

        {totalCreditSpend > 0 && (
          <div
            onClick={() => navigate('/cards')}
            className="cursor-pointer hover:opacity-80 transition-opacity"
          >
            <StatCard
              title="Credit Card Spend"
              value={totalCreditSpend}
              icon={<CreditCard className="h-4 w-4" />}
            />
          </div>
        )}

        {spendByCategory.length > 0 && (
          <SpendingPieChart items={spendByCategory} />
        )}

        <div>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Spending by Category
          </h2>
          <CategoryBreakdown items={spendByCategory} totalSpend={totalSpend} />
        </div>

        <div>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Day by Day
          </h2>
          <DailySpendingList spends={data.spends} categories={data.categories} />
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
