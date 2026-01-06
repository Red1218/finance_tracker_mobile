import { Layout } from '@/components/layout/Layout';
import { PageHeader } from '@/components/layout/PageHeader';
import { AddSavingForm } from '@/components/forms/AddSavingForm';
import { SavingsList } from '@/components/lists/SavingsList';
import { useBudgetContext } from '@/contexts/BudgetContext';
import { Card } from '@/components/ui/card';
import { PiggyBank, TrendingUp } from 'lucide-react';

const Savings = () => {
  const { data, addSaving, deleteSaving, updateSaving, totalSaved } = useBudgetContext();

  return (
    <Layout>
      <PageHeader 
        title="Savings" 
        subtitle="Track your monthly savings"
      />

      <div className="space-y-6">
        {/* Total Saved Card */}
        <Card className="p-6 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20">
              <PiggyBank className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Saved This Month</p>
              <p className="text-2xl font-bold text-primary">
                ₹{totalSaved.toLocaleString('en-IN')}
              </p>
            </div>
            <TrendingUp className="ml-auto h-5 w-5 text-primary/60" />
          </div>
        </Card>

        <AddSavingForm onAdd={addSaving} />
        <SavingsList 
          savings={data.savings} 
          onDelete={deleteSaving}
          onUpdate={updateSaving}
        />
      </div>
    </Layout>
  );
};

export default Savings;
