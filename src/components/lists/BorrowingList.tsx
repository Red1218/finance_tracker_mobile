import { Borrowing, borrowingTypeLabels } from '@/types/budget';
import { Button } from '@/components/ui/button';
import { Trash2, HandCoins } from 'lucide-react';

interface BorrowingListProps {
  borrowings: Borrowing[];
  onDelete: (id: string) => void;
}

export const BorrowingList = ({ borrowings, onDelete }: BorrowingListProps) => {
  if (borrowings.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 text-center">
        <HandCoins className="mx-auto h-10 w-10 text-muted-foreground" />
        <p className="mt-3 text-muted-foreground">No borrowed entries yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {borrowings.map((borrowing) => (
        <div
          key={borrowing.id}
          className="rounded-xl border border-border bg-card p-4 animate-fade-in"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-warning">
                  ₹{borrowing.amount.toLocaleString('en-IN')}
                </span>
                <span className="rounded-full bg-warning/10 px-2 py-0.5 text-xs font-medium text-warning">
                  {borrowingTypeLabels[borrowing.type]}
                </span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                From: {borrowing.from}
              </p>
              {borrowing.note && (
                <p className="mt-1 text-sm text-muted-foreground">{borrowing.note}</p>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(borrowing.id)}
              className="text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};
