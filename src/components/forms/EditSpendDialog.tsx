import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Category, CreditCard, PaymentMethod, paymentMethodLabels, Spend } from '@/types/budget';
import { Pencil } from 'lucide-react';
import { z } from 'zod';
import { toast } from 'sonner';

const spendSchema = z.object({
  amount: z.number().positive('Amount must be a positive number').max(100000000, 'Amount is too high'),
  categoryId: z.string().uuid('Invalid category'),
  note: z.string().trim().max(500, 'Note must be less than 500 characters').optional(),
  paymentMethod: z.enum(['cash', 'upi', 'credit', 'debit'] as const),
  creditCardId: z.string().uuid('Invalid credit card').optional(),
});

interface EditSpendDialogProps {
  spend: Spend;
  categories: Category[];
  creditCards: CreditCard[];
  onUpdate: (id: string, spend: Omit<Spend, 'id'>) => void;
}

export const EditSpendDialog = ({ spend, categories, creditCards, onUpdate }: EditSpendDialogProps) => {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState(spend.amount.toString());
  const [categoryId, setCategoryId] = useState(spend.categoryId);
  const [note, setNote] = useState(spend.note || '');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(spend.paymentMethod);
  const [creditCardId, setCreditCardId] = useState(spend.creditCardId || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = spendSchema.safeParse({
      amount: amount ? parseFloat(amount) : undefined,
      categoryId,
      note: note || undefined,
      paymentMethod,
      creditCardId: paymentMethod === 'credit' ? creditCardId : undefined,
    });
    if (!result.success) {
      toast.error(result.error.errors[0].message);
      return;
    }
    onUpdate(spend.id, {
      dateISO: spend.dateISO,
      amount: result.data.amount,
      categoryId: result.data.categoryId,
      note: result.data.note,
      paymentMethod: result.data.paymentMethod,
      creditCardId: result.data.creditCardId,
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Spend</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
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
            maxLength={500}
          />

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={!amount || !categoryId || (paymentMethod === 'credit' && !creditCardId)}
            >
              Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
