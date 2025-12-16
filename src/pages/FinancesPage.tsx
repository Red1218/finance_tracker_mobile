import { Layout } from '@/components/layout/Layout';
import { PageHeader } from '@/components/layout/PageHeader';
import { AddCreditCardForm } from '@/components/forms/AddCreditCardForm';
import { CreditCardList } from '@/components/lists/CreditCardList';
import { AddBorrowingForm } from '@/components/forms/AddBorrowingForm';
import { BorrowingList } from '@/components/lists/BorrowingList';
import { StatCard } from '@/components/dashboard/StatCard';
import { useBudgetContext } from '@/contexts/BudgetContext';
import { HandCoins, CreditCard } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const FinancesPage = () => {
  const { 
    data, 
    addCreditCard, 
    deleteCreditCard,
    updateCreditCard,
    setDefaultCard,
    spendByCreditCard,
    addBorrowing, 
    deleteBorrowing,
    updateBorrowing,
    totalBorrowed 
  } = useBudgetContext();

  const totalCreditSpend = spendByCreditCard.reduce((sum, s) => sum + s.amount, 0);

  return (
    <Layout>
      <PageHeader 
        title="Finances" 
        subtitle="Manage cards & borrowed money"
      />

      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-3">
          {totalCreditSpend > 0 && (
            <StatCard
              title="Credit Spend"
              value={totalCreditSpend}
              icon={<CreditCard className="h-4 w-4" />}
              variant="primary"
            />
          )}
          {totalBorrowed > 0 && (
            <StatCard
              title="Total Borrowed"
              value={totalBorrowed}
              icon={<HandCoins className="h-4 w-4" />}
              variant="warning"
            />
          )}
        </div>

        <Tabs defaultValue="cards" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="cards" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Cards
            </TabsTrigger>
            <TabsTrigger value="borrowed" className="flex items-center gap-2">
              <HandCoins className="h-4 w-4" />
              Borrowed
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="cards" className="mt-4 space-y-4">
            <AddCreditCardForm onAdd={addCreditCard} />
            <CreditCardList 
              cards={data.creditCards} 
              spendByCard={spendByCreditCard}
              onDelete={deleteCreditCard}
              onEdit={updateCreditCard}
              onSetDefault={setDefaultCard}
            />
          </TabsContent>
          
          <TabsContent value="borrowed" className="mt-4 space-y-4">
            <AddBorrowingForm onAdd={addBorrowing} />
            <BorrowingList 
              borrowings={data.borrowings} 
              onDelete={deleteBorrowing}
              onUpdate={updateBorrowing}
            />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default FinancesPage;
