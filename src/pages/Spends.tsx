import { Layout } from '@/components/layout/Layout';
import { PageHeader } from '@/components/layout/PageHeader';
import { AddSpendForm } from '@/components/forms/AddSpendForm';
import { SpendList } from '@/components/lists/SpendList';
import { useBudgetContext } from '@/contexts/BudgetContext';

const Spends = () => {
  const { data, addSpend, deleteSpend, updateSpend, defaultCard } = useBudgetContext();

  return (
    <Layout>
      <PageHeader 
        title="Spends" 
        subtitle="Track your daily expenses"
      />

      <div className="space-y-6">
        <AddSpendForm 
          categories={data.categories}
          creditCards={data.creditCards}
          defaultCard={defaultCard}
          onAdd={addSpend} 
        />
        <SpendList 
          spends={data.spends} 
          categories={data.categories}
          creditCards={data.creditCards}
          onDelete={deleteSpend}
          onUpdate={updateSpend}
        />
      </div>
    </Layout>
  );
};

export default Spends;
