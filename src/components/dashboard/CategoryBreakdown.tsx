import { Category } from '@/types/budget';
import { cn } from '@/lib/utils';

interface CategoryBreakdownProps {
  items: Array<{ category: Category; amount: number }>;
  totalSpend: number;
}

export const CategoryBreakdown = ({ items, totalSpend }: CategoryBreakdownProps) => {
  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-4">
        <p className="text-center text-sm text-muted-foreground">
          No spending data for this month
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map(({ category, amount }) => {
        const percentage = totalSpend > 0 ? (amount / totalSpend) * 100 : 0;
        
        return (
          <div
            key={category.id}
            className="rounded-xl border border-border bg-card p-4 animate-slide-up"
          >
            <div className="flex items-center justify-between">
              <span className="font-medium">{category.name}</span>
              <span className="text-sm font-semibold text-primary">
                ₹{amount.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-secondary">
              <div
                className={cn(
                  'h-full rounded-full gradient-primary transition-all duration-500'
                )}
                style={{ width: `${percentage}%` }}
              />
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {percentage.toFixed(1)}% of total
            </p>
          </div>
        );
      })}
    </div>
  );
};
