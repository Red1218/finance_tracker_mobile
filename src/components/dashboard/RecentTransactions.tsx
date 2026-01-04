import { Spend, Category, paymentMethodLabels } from '@/types/budget';
import { format, parseISO, isToday, isYesterday } from 'date-fns';
import { Receipt, ShoppingBag, Utensils, Car, Zap, Gamepad2 } from 'lucide-react';

interface RecentTransactionsProps {
  spends: Spend[];
  categories: Category[];
  onSeeAll: () => void;
}

const categoryIcons: Record<string, React.ReactNode> = {
  'Food & Dining': <Utensils className="h-4 w-4" />,
  'Transportation': <Car className="h-4 w-4" />,
  'Entertainment': <Gamepad2 className="h-4 w-4" />,
  'Shopping': <ShoppingBag className="h-4 w-4" />,
  'Bills & Utilities': <Zap className="h-4 w-4" />,
};

export const RecentTransactions = ({ spends, categories, onSeeAll }: RecentTransactionsProps) => {
  const getCategoryName = (id: string) => {
    return categories.find((c) => c.id === id)?.name || 'Unknown';
  };

  const getCategoryIcon = (categoryName: string) => {
    return categoryIcons[categoryName] || <Receipt className="h-4 w-4" />;
  };

  const getDateLabel = (dateStr: string): string => {
    const date = parseISO(dateStr);
    if (isToday(date)) return `Today, ${format(date, 'h:mm a')}`;
    if (isYesterday(date)) return `Yesterday, ${format(date, 'h:mm a')}`;
    return format(date, 'MMM d, h:mm a');
  };

  // Sort by date descending and take only 4
  const recentSpends = [...spends]
    .sort((a, b) => new Date(b.dateISO).getTime() - new Date(a.dateISO).getTime())
    .slice(0, 4);

  if (recentSpends.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-6 text-center">
        <Receipt className="mx-auto h-8 w-8 text-muted-foreground" />
        <p className="mt-2 text-sm text-muted-foreground">No transactions yet</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden animate-fade-in">
      <div className="flex items-center justify-between px-4 py-3">
        <h3 className="text-base font-semibold text-foreground">Recent Transactions</h3>
        <button
          onClick={onSeeAll}
          className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
        >
          See All
        </button>
      </div>

      <div className="divide-y divide-border">
        {recentSpends.map((spend) => {
          const categoryName = getCategoryName(spend.categoryId);
          return (
            <div key={spend.id} className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-muted-foreground">
                  {getCategoryIcon(categoryName)}
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {spend.note || categoryName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {categoryName} • {getDateLabel(spend.dateISO)}
                  </p>
                </div>
              </div>
              <span className="text-sm font-semibold text-foreground">
                -₹{spend.amount.toLocaleString('en-IN')}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
