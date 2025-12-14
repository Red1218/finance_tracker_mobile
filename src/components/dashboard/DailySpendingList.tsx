import { Spend, Category, paymentMethodLabels } from '@/types/budget';
import { format, parseISO, isToday, isYesterday } from 'date-fns';
import { CalendarDays, Receipt } from 'lucide-react';

interface DailySpendingListProps {
  spends: Spend[];
  categories: Category[];
}

interface DayGroup {
  date: string;
  label: string;
  total: number;
  spends: Spend[];
}

export const DailySpendingList = ({ spends, categories }: DailySpendingListProps) => {
  const getCategoryName = (id: string) => {
    return categories.find((c) => c.id === id)?.name || 'Unknown';
  };

  const getDateLabel = (dateStr: string): string => {
    const date = parseISO(dateStr);
    if (isToday(date)) return 'Today';
    if (isYesterday(date)) return 'Yesterday';
    return format(date, 'EEEE, MMM d');
  };

  // Group spends by date
  const groupedByDate = spends.reduce<Record<string, Spend[]>>((acc, spend) => {
    const dateKey = spend.dateISO.split('T')[0];
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(spend);
    return acc;
  }, {});

  // Convert to array and sort by date descending
  const dayGroups: DayGroup[] = Object.entries(groupedByDate)
    .map(([date, daySpends]) => ({
      date,
      label: getDateLabel(date),
      total: daySpends.reduce((sum, s) => sum + s.amount, 0),
      spends: daySpends.sort((a, b) => 
        new Date(b.dateISO).getTime() - new Date(a.dateISO).getTime()
      ),
    }))
    .sort((a, b) => b.date.localeCompare(a.date));

  if (dayGroups.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-6 text-center">
        <CalendarDays className="mx-auto h-8 w-8 text-muted-foreground" />
        <p className="mt-2 text-sm text-muted-foreground">No spending this month</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {dayGroups.map((group) => (
        <div key={group.date} className="rounded-xl border border-border bg-card overflow-hidden">
          {/* Day Header */}
          <div className="flex items-center justify-between bg-secondary/50 px-4 py-2.5">
            <span className="text-sm font-semibold text-foreground">{group.label}</span>
            <span className="text-sm font-bold text-primary">
              ₹{group.total.toLocaleString('en-IN')}
            </span>
          </div>
          
          {/* Spends for this day */}
          <div className="divide-y divide-border">
            {group.spends.map((spend) => (
              <div key={spend.id} className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                    <Receipt className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {getCategoryName(spend.categoryId)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {paymentMethodLabels[spend.paymentMethod]}
                      {spend.note && ` • ${spend.note}`}
                    </p>
                  </div>
                </div>
                <span className="text-sm font-semibold text-foreground">
                  ₹{spend.amount.toLocaleString('en-IN')}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
