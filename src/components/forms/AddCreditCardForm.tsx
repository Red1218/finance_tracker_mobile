import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CreditCard } from '@/types/budget';
import { Plus } from 'lucide-react';

interface AddCreditCardFormProps {
  onAdd: (card: Omit<CreditCard, 'id'>) => void;
}

export const AddCreditCardForm = ({ onAdd }: AddCreditCardFormProps) => {
  const [name, setName] = useState('');
  const [limit, setLimit] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && limit) {
      onAdd({
        name,
        limit: parseFloat(limit),
      });
      setName('');
      setLimit('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-border bg-card p-4">
      <Input
        placeholder="Card name (e.g., HDFC Regalia)"
        value={name}
        onChange={(e) => setName(e.target.value)}
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
