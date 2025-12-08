import { Layout } from '@/components/layout/Layout';
import { PageHeader } from '@/components/layout/PageHeader';
import { AddBorrowingForm } from '@/components/forms/AddBorrowingForm';
import { BorrowingList } from '@/components/lists/BorrowingList';
import { StatCard } from '@/components/dashboard/StatCard';
import { useBudgetContext } from '@/contexts/BudgetContext';
import { HandCoins } from 'lucide-react';

const Borrowed = () => {
  const { data, addBorrowing, deleteBorrowing, totalBorrowed } = useBudgetContext();

  return (
    <Layout>
      <PageHeader 
        title="Borrowed Money" 
        subtitle="Track money you owe"
      />

      <div className="space-y-6">
        {totalBorrowed > 0 && (
          <StatCard
            title="Total Borrowed"
            value={totalBorrowed}
            icon={<HandCoins className="h-4 w-4" />}
            variant="warning"
          />
        )}
        <AddBorrowingForm onAdd={addBorrowing} />
        <BorrowingList 
          borrowings={data.borrowings} 
          onDelete={deleteBorrowing} 
        />
      </div>
    </Layout>
  );
};

export default Borrowed;
