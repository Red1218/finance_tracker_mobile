import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BorrowingType, borrowingTypeLabels, Borrowing } from '@/types/budget';
import { Plus } from 'lucide-react';

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
    if (amount && from) {
      onAdd({
        type,
        amount: parseFloat(amount),
        from,
        note: note || undefined,
      });
      setAmount('');
      setFrom('');
      setNote('');
      setType('personal');
    }
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
        />
      </div>

      <Input
        placeholder="Note (optional)"
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />

      <Button type="submit" className="w-full" disabled={!amount || !from}>
        <Plus className="h-4 w-4" />
        Add Borrowed Entry
      </Button>
    </form>
  );
};
