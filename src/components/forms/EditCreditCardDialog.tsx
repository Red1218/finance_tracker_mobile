import { useState, useEffect } from 'react';
import { CreditCard } from '@/types/budget';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Pencil } from 'lucide-react';

interface EditCreditCardDialogProps {
  card: CreditCard;
  onSave: (id: string, data: { name: string; limit: number }) => void;
}

export const EditCreditCardDialog = ({ card, onSave }: EditCreditCardDialogProps) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(card.name);
  const [limit, setLimit] = useState(card.limit.toString());

  useEffect(() => {
    if (open) {
      setName(card.name);
      setLimit(card.limit.toString());
    }
  }, [open, card]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !limit) return;
    
    onSave(card.id, {
      name: name.trim(),
      limit: parseFloat(limit) || 0,
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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Credit Card</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="card-name">Card Name</Label>
            <Input
              id="card-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., HDFC Credit Card"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="card-limit">Credit Limit (₹)</Label>
            <Input
              id="card-limit"
              type="number"
              value={limit}
              onChange={(e) => setLimit(e.target.value)}
              placeholder="e.g., 100000"
              min="0"
            />
          </div>
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!name.trim()}>
              Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
