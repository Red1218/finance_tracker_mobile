import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BorrowingType, borrowingTypeLabels, Borrowing } from '@/types/budget';
import { Plus } from 'lucide-react';
import { z } from 'zod';
import { toast } from 'sonner';

const borrowingSchema = z.object({
  type: z.enum(['personal', 'loan_app', 'friend', 'credit_provider', 'other'] as const),
  amount: z.number().positive('Amount must be a positive number').max(100000000, 'Amount is too high'),
  from: z.string().trim().min(1, 'Source is required').max(100, 'Source must be less than 100 characters'),
  note: z.string().trim().max(500, 'Note must be less than 500 characters').optional(),
});

interface AddBorrowingFormProps {
  onAdd: (borrowing: Omit<Borrowing, 'id'>) => void;
}

export const AddBorrowingForm = ({ onAdd }: AddBorrowingFormProps) => {
  const [type, setType] = useState<BorrowingType>('personal');
  const [amount, setAmount] = useState('');
  const [from, setFrom] = useState('');
  const [note, setNote] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = borrowingSchema.safeParse({
      type,
      amount: amount ? parseFloat(amount) : undefined,
      from,
      note: note || undefined,
    });
    if (!result.success) {
      toast.error(result.error.errors[0].message);
      return;
    }
    onAdd({
      type: result.data.type,
      amount: result.data.amount,
      from: result.data.from,
      note: result.data.note,
    });
    setAmount('');
    setFrom('');
    setNote('');
    setType('personal');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-border bg-card p-4">
      <Select value={type} onValueChange={(v) => setType(v as BorrowingType)}>
        <SelectTrigger>
          <SelectValue placeholder="Type" />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(borrowingTypeLabels).map(([key, label]) => (
            <SelectItem key={key} value={key}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="grid grid-cols-2 gap-3">
        <Input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          min="0"
          step="0.01"
        />
        <Input
          placeholder="From whom"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          maxLength={100}
        />
      </div>

      <Input
        placeholder="Note (optional)"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        maxLength={500}
      />

      <Button type="submit" className="w-full" disabled={!amount || !from}>
        <Plus className="h-4 w-4" />
        Add Borrowed Entry
      </Button>
    </form>
  );
};
