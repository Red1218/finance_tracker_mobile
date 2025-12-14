import { Spend, Category, CreditCard, paymentMethodLabels } from '@/types/budget';
import { Receipt } from 'lucide-react';
import { format } from 'date-fns';
import { DeleteConfirmDialog } from '@/components/ui/DeleteConfirmDialog';
import { EditSpendDialog } from '@/components/forms/EditSpendDialog';

interface SpendListProps {
  spends: Spend[];
  categories: Category[];
  creditCards: CreditCard[];
  onDelete: (id: string) => void;
  onUpdate: (id: string, spend: Omit<Spend, 'id'>) => void;
}

export const SpendList = ({ spends, categories, creditCards, onDelete, onUpdate }: SpendListProps) => {
  const getCategoryName = (id: string) => {
    return categories.find((c) => c.id === id)?.name || 'Unknown';
  };

  const getCreditCardName = (id: string | undefined) => {
    if (!id) return '';
    return creditCards.find((c) => c.id === id)?.name || '';
  };

  if (spends.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 text-center">
        <Receipt className="mx-auto h-10 w-10 text-muted-foreground" />
        <p className="mt-3 text-muted-foreground">No spending records yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {spends.map((spend) => (
        <div
          key={spend.id}
          className="rounded-xl border border-border bg-card p-4 animate-slide-up"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-primary">
                  ₹{spend.amount.toLocaleString('en-IN')}
                </span>
                <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-medium">
                  {getCategoryName(spend.categoryId)}
                </span>
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span>{paymentMethodLabels[spend.paymentMethod]}</span>
                {spend.paymentMethod === 'credit' && spend.creditCardId && (
                  <span>• {getCreditCardName(spend.creditCardId)}</span>
                )}
                <span>• {format(new Date(spend.dateISO), 'MMM d, h:mm a')}</span>
              </div>
              {spend.note && (
                <p className="mt-2 text-sm text-muted-foreground">{spend.note}</p>
              )}
            </div>
            <div className="flex items-center gap-1">
              <EditSpendDialog
                spend={spend}
                categories={categories}
                creditCards={creditCards}
                onUpdate={onUpdate}
              />
              <DeleteConfirmDialog
                onConfirm={() => onDelete(spend.id)}
                title="Delete Spend"
                description={`Are you sure you want to delete this ₹${spend.amount.toLocaleString('en-IN')} expense? This action cannot be undone.`}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
