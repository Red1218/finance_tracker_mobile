import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Pencil, Calendar } from 'lucide-react';
import { z } from 'zod';
import { toast } from 'sonner';
import { Saving } from '@/types/budget';
import { format, parseISO } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';

const savingSchema = z.object({
  amount: z.number().positive('Amount must be greater than 0'),
  note: z.string().max(200, 'Note must be less than 200 characters').optional(),
  dateISO: z.string(),
});

interface EditSavingDialogProps {
  saving: Saving;
  onUpdate: (id: string, saving: Omit<Saving, 'id'>) => void;
}

export const EditSavingDialog = ({ saving, onUpdate }: EditSavingDialogProps) => {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState(saving.amount.toString());
  const [note, setNote] = useState(saving.note || '');
  const [date, setDate] = useState<Date>(parseISO(saving.dateISO));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const parsedAmount = parseFloat(amount);
    const dateISO = format(date, 'yyyy-MM-dd');
    const noteValue = note.trim() || undefined;

    const result = savingSchema.safeParse({
      amount: parsedAmount,
      note: noteValue,
      dateISO,
    });

    if (!result.success) {
      toast.error(result.error.errors[0].message);
      return;
    }

    onUpdate(saving.id, {
      amount: parsedAmount,
      note: noteValue,
      dateISO,
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Saving</DialogTitle>
          <DialogDescription>
            Update your saving entry details.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                type="number"
                placeholder="Amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="0"
                step="0.01"
              />
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  type="button"
                  className={cn(
                    "w-[140px] justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {date ? format(date, "MMM d") : "Date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={date}
                  onSelect={(d) => d && setDate(d)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <Textarea
            placeholder="Note (optional)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={200}
            className="min-h-[60px]"
          />

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!amount || parseFloat(amount) <= 0}>
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
