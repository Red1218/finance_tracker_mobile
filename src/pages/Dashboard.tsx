import { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { PageHeader } from '@/components/layout/PageHeader';
import { MonthSelector } from '@/components/dashboard/MonthSelector';
import { TotalSpentCard } from '@/components/dashboard/TotalSpentCard';
import { QuickStatCard } from '@/components/dashboard/QuickStatCard';
import { RecentTransactions } from '@/components/dashboard/RecentTransactions';
import { BudgetProgress } from '@/components/dashboard/BudgetProgress';
import { HistorySheet } from '@/components/sheets/HistorySheet';
import { useBudgetContext } from '@/contexts/BudgetContext';
import { useAuth } from '@/contexts/AuthContext';
import { Wallet, CreditCard, HandCoins } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const [historyOpen, setHistoryOpen] = useState(false);
  const {
    currentMonth,
    setCurrentMonth,
    totalSpend,
    totalBorrowed,
    spendByCreditCard,
    budgetLimit,
    setBudgetLimit,
    data,
  } = useBudgetContext();

  const totalCreditSpend = spendByCreditCard.reduce((sum, s) => sum + s.amount, 0);
  const budgetRemaining = budgetLimit - totalSpend;
  const budgetProgress = budgetLimit > 0 ? ((budgetLimit - totalSpend) / budgetLimit) * 100 : 0;
  
  // Calculate total credit limit
  const totalCreditLimit = data.creditCards.reduce((sum, card) => sum + card.limit, 0);
  const creditUsageProgress = totalCreditLimit > 0 ? (totalCreditSpend / totalCreditLimit) * 100 : 0;

  // Get display name
  const displayName = user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'User';

  return (
    <Layout>
      {/* Welcome Header */}
      <div className="mb-4">
        <p className="text-xs text-muted-foreground">Welcome back,</p>
        <h1 className="text-lg font-bold text-foreground">{displayName}</h1>
      </div>

      {/* Month Selector */}
      <MonthSelector
        currentMonth={currentMonth} 
        onMonthChange={setCurrentMonth} 
      />

      <div className="mt-6 space-y-4">
        {/* Total Spent Card */}
        <TotalSpentCard totalSpend={totalSpend} />

        {/* Budget and Credit Cards Row */}
        <div className="grid grid-cols-2 gap-3">
          <QuickStatCard
            title="Budget Left"
            value={Math.max(budgetRemaining, 0)}
            icon={<Wallet className="h-4 w-4 text-success" />}
            progress={Math.max(budgetProgress, 0)}
            progressColor="success"
          />
          <QuickStatCard
            title="Credit Card"
            value={totalCreditSpend}
            icon={<CreditCard className="h-4 w-4 text-destructive" />}
            progress={creditUsageProgress}
            progressColor="destructive"
            subtitle={totalCreditLimit > 0 ? `${Math.round(creditUsageProgress)}%` : undefined}
          />
        </div>

        {/* Borrowed Card */}
        {totalBorrowed > 0 && (
          <QuickStatCard
            title="Borrowed"
            value={totalBorrowed}
            icon={<HandCoins className="h-4 w-4 text-warning" />}
            subtitle="Due 5 days"
          />
        )}

        {/* Budget Setup (if no limit set) */}
        {budgetLimit === 0 && (
          <BudgetProgress
            budgetLimit={budgetLimit}
            totalSpend={totalSpend}
            onSetLimit={setBudgetLimit}
          />
        )}

        {/* Recent Transactions */}
        <RecentTransactions 
          spends={data.spends}
          categories={data.categories}
          onSeeAll={() => setHistoryOpen(true)}
        />
      </div>

      {/* History Sheet */}
      <HistorySheet open={historyOpen} onOpenChange={setHistoryOpen} />
    </Layout>
  );
};

export default Dashboard;
