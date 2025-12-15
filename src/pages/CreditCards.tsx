import { Layout } from '@/components/layout/Layout';
import { PageHeader } from '@/components/layout/PageHeader';
import { AddCreditCardForm } from '@/components/forms/AddCreditCardForm';
import { CreditCardList } from '@/components/lists/CreditCardList';
import { useBudgetContext } from '@/contexts/BudgetContext';

const CreditCards = () => {
  const { data, addCreditCard, deleteCreditCard, spendByCreditCard } = useBudgetContext();

  return (
    <Layout>
      <PageHeader 
        title="Credit Cards" 
        subtitle="Manage your credit cards"
      />

      <div className="space-y-6">
        <AddCreditCardForm onAdd={addCreditCard} />
        <CreditCardList 
          cards={data.creditCards} 
          spendByCard={spendByCreditCard}
          onDelete={deleteCreditCard} 
        />
      </div>
    </Layout>
  );
};

export default CreditCards;
