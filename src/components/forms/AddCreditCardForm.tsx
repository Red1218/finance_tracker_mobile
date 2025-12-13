import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CreditCard } from '@/types/budget';
import { Plus } from 'lucide-react';
import { z } from 'zod';
import { toast } from 'sonner';

const creditCardSchema = z.object({
  name: z.string().trim().min(1, 'Card name is required').max(100, 'Card name must be less than 100 characters'),
  limit: z.number().positive('Credit limit must be a positive number').max(100000000, 'Credit limit is too high'),
});

interface AddCreditCardFormProps {
  onAdd: (card: Omit<CreditCard, 'id'>) => void;
}

export const AddCreditCardForm = ({ onAdd }: AddCreditCardFormProps) => {
  const [name, setName] = useState('');
  const [limit, setLimit] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = creditCardSchema.safeParse({
      name,
      limit: limit ? parseFloat(limit) : undefined,
    });
    if (!result.success) {
      toast.error(result.error.errors[0].message);
      return;
    }
    onAdd({
      name: result.data.name,
      limit: result.data.limit,
    });
    setName('');
    setLimit('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-border bg-card p-4">
      <Input
        placeholder="Card name (e.g., HDFC Regalia)"
        value={name}
        onChange={(e) => setName(e.target.value)}
        maxLength={100}
      />
      <Input
        type="number"
        placeholder="Credit limit"
        value={limit}
        onChange={(e) => setLimit(e.target.value)}
        min="0"
        step="1"
      />
      <Button type="submit" className="w-full" disabled={!name || !limit}>
        <Plus className="h-4 w-4" />
        Add Credit Card
      </Button>
    </form>
  );
};
