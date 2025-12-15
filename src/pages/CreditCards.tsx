import { Layout } from '@/components/layout/Layout';
import { PageHeader } from '@/components/layout/PageHeader';
import { AddCreditCardForm } from '@/components/forms/AddCreditCardForm';
import { CreditCardList } from '@/components/lists/CreditCardList';
import { AddBorrowingForm } from '@/components/forms/AddBorrowingForm';
import { BorrowingList } from '@/components/lists/BorrowingList';
import { StatCard } from '@/components/dashboard/StatCard';
import { useBudgetContext } from '@/contexts/BudgetContext';
import { HandCoins } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const CreditCards = () => {
  const {
    data,
    addCreditCard,
    deleteCreditCard,
    spendByCreditCard,
    addBorrowing,
    deleteBorrowing,
    totalBorrowed
  } = useBudgetContext();

  return (
    <Layout>
      <PageHeader
        title="Cards & Borrowing"
        subtitle="Manage your credit cards and borrowed money"
      />

      <div className="space-y-6">
        <Tabs defaultValue="cards" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="cards">Credit Cards</TabsTrigger>
            <TabsTrigger value="borrowing">Borrowing</TabsTrigger>
          </TabsList>

          <TabsContent value="cards" className="space-y-6">
            <AddCreditCardForm onAdd={addCreditCard} />
            <CreditCardList
              cards={data.creditCards}
              spendByCard={spendByCreditCard}
              onDelete={deleteCreditCard}
            />
          </TabsContent>

          <TabsContent value="borrowing" className="space-y-6">
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
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default CreditCards;
