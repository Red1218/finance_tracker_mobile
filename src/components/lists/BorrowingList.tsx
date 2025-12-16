import { Borrowing, borrowingTypeLabels } from '@/types/budget';
import { HandCoins } from 'lucide-react';
import { DeleteConfirmDialog } from '@/components/ui/DeleteConfirmDialog';
import { EditBorrowingDialog } from '@/components/forms/EditBorrowingDialog';

interface BorrowingListProps {
  borrowings: Borrowing[];
  onDelete: (id: string) => void;
  onUpdate: (id: string, updates: Omit<Borrowing, 'id'>) => void;
}

export const BorrowingList = ({ borrowings, onDelete, onUpdate }: BorrowingListProps) => {
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
            <div className="flex items-center gap-1">
              <EditBorrowingDialog borrowing={borrowing} onUpdate={onUpdate} />
              <DeleteConfirmDialog
                onConfirm={() => onDelete(borrowing.id)}
                title="Delete Borrowing"
                description={`Are you sure you want to delete this ₹${borrowing.amount.toLocaleString('en-IN')} borrowing entry? This action cannot be undone.`}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
