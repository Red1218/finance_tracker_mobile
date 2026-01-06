import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus, PiggyBank, Calendar } from 'lucide-react';
import { z } from 'zod';
import { toast } from 'sonner';
import { Saving } from '@/types/budget';
import { format } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';

const savingSchema = z.object({
  amount: z.number().positive('Amount must be greater than 0'),
  note: z.string().max(200, 'Note must be less than 200 characters').optional(),
  dateISO: z.string(),
});

interface AddSavingFormProps {
  onAdd: (saving: Omit<Saving, 'id'>) => void;
}

export const AddSavingForm = ({ onAdd }: AddSavingFormProps) => {
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState<Date>(new Date());

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

    onAdd({
      amount: parsedAmount,
      note: noteValue,
      dateISO,
    });
    setAmount('');
    setNote('');
    setDate(new Date());
    toast.success('Saving added!');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-border bg-card p-4">
      <div className="flex items-center gap-2 text-primary">
        <PiggyBank className="h-5 w-5" />
        <span className="font-medium">Add Saving</span>
      </div>

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

      <Button type="submit" className="w-full" disabled={!amount || parseFloat(amount) <= 0}>
        <Plus className="h-4 w-4 mr-2" />
        Add Saving
      </Button>
    </form>
  );
};
