import { Saving } from '@/types/budget';
import { PiggyBank, Calendar } from 'lucide-react';
import { DeleteConfirmDialog } from '@/components/ui/DeleteConfirmDialog';
import { EditSavingDialog } from '@/components/forms/EditSavingDialog';
import { format, parseISO } from 'date-fns';

interface SavingsListProps {
  savings: Saving[];
  onDelete: (id: string) => void;
  onUpdate: (id: string, saving: Omit<Saving, 'id'>) => void;
}

export const SavingsList = ({ savings, onDelete, onUpdate }: SavingsListProps) => {
  if (savings.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 text-center">
        <PiggyBank className="mx-auto h-10 w-10 text-muted-foreground" />
        <p className="mt-3 text-muted-foreground">No savings this month</p>
        <p className="text-sm text-muted-foreground/70">Start saving to see your progress</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {savings.map((saving) => (
        <div
          key={saving.id}
          className="flex items-center justify-between rounded-xl border border-border bg-card p-4 animate-fade-in"
        >
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 shrink-0">
              <PiggyBank className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-primary">
                ₹{saving.amount.toLocaleString('en-IN')}
              </p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-3 w-3" />
                <span>{format(parseISO(saving.dateISO), 'MMM d, yyyy')}</span>
              </div>
              {saving.note && (
                <p className="text-sm text-muted-foreground truncate mt-1">
                  {saving.note}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <EditSavingDialog saving={saving} onUpdate={onUpdate} />
            <DeleteConfirmDialog
              onConfirm={() => onDelete(saving.id)}
              title="Delete Saving"
              description={`Are you sure you want to delete this ₹${saving.amount.toLocaleString('en-IN')} saving entry?`}
            />
          </div>
        </div>
      ))}
    </div>
  );
};
