import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Category, CreditCard, PaymentMethod, paymentMethodLabels, Spend } from '@/types/budget';
import { Plus } from 'lucide-react';

interface AddSpendFormProps {
  categories: Category[];
  creditCards: CreditCard[];
  onAdd: (spend: Omit<Spend, 'id'>) => void;
}

export const AddSpendForm = ({ categories, creditCards, onAdd }: AddSpendFormProps) => {
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [note, setNote] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [creditCardId, setCreditCardId] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount && categoryId) {
      onAdd({
        dateISO: new Date().toISOString(),
        amount: parseFloat(amount),
        categoryId,
        note: note || undefined,
        paymentMethod,
        creditCardId: paymentMethod === 'credit' ? creditCardId : undefined,
      });
      setAmount('');
      setCategoryId('');
      setNote('');
      setPaymentMethod('cash');
      setCreditCardId('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-border bg-card p-4">
      <div className="grid grid-cols-2 gap-3">
        <Input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          min="0"
          step="0.01"
        />
        <Select value={categoryId} onValueChange={setCategoryId}>
          <SelectTrigger>
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Select value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as PaymentMethod)}>
        <SelectTrigger>
          <SelectValue placeholder="Payment Method" />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(paymentMethodLabels).map(([key, label]) => (
            <SelectItem key={key} value={key}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {paymentMethod === 'credit' && (
        <Select value={creditCardId} onValueChange={setCreditCardId}>
          <SelectTrigger>
            <SelectValue placeholder="Select Card" />
          </SelectTrigger>
          <SelectContent>
            {creditCards.map((card) => (
              <SelectItem key={card.id} value={card.id}>
                {card.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      <Input
        placeholder="Note (optional)"
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />

      <Button 
        type="submit" 
        className="w-full" 
        disabled={!amount || !categoryId || (paymentMethod === 'credit' && !creditCardId)}
      >
        <Plus className="h-4 w-4" />
        Add Spend
      </Button>
    </form>
  );
};
