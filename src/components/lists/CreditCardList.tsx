import { CreditCard } from '@/types/budget';
import { CreditCard as CardIcon, Star } from 'lucide-react';
import { DeleteConfirmDialog } from '@/components/ui/DeleteConfirmDialog';
import { EditCreditCardDialog } from '@/components/forms/EditCreditCardDialog';
import { Button } from '@/components/ui/button';

interface CreditCardListProps {
  cards: CreditCard[];
  spendByCard: Array<{ card: CreditCard; amount: number }>;
  onDelete: (id: string) => void;
  onEdit: (id: string, data: { name: string; limit: number }) => void;
  onSetDefault: (id: string) => void;
}

export const CreditCardList = ({ cards, spendByCard, onDelete, onEdit, onSetDefault }: CreditCardListProps) => {
  const getSpendAmount = (cardId: string) => {
    return spendByCard.find((s) => s.card.id === cardId)?.amount || 0;
  };

  if (cards.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 text-center">
        <CardIcon className="mx-auto h-10 w-10 text-muted-foreground" />
        <p className="mt-3 text-muted-foreground">No credit cards added</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {cards.map((card) => {
        const spent = getSpendAmount(card.id);
        const percentage = card.limit > 0 ? (spent / card.limit) * 100 : 0;
        const remaining = card.limit - spent;

        return (
          <div
            key={card.id}
            className="rounded-xl border border-border bg-card p-4 animate-fade-in"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg gradient-primary">
                  <CardIcon className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{card.name}</h3>
                    {card.isDefault && (
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                        Default
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Limit: ₹{card.limit.toLocaleString('en-IN')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className={`h-8 w-8 ${card.isDefault ? 'text-yellow-500' : 'text-muted-foreground hover:text-yellow-500'}`}
                  onClick={() => !card.isDefault && onSetDefault(card.id)}
                  title={card.isDefault ? "Default card" : "Set as default"}
                  disabled={card.isDefault}
                >
                  <Star className={`h-4 w-4 ${card.isDefault ? 'fill-yellow-500' : ''}`} />
                </Button>
                <EditCreditCardDialog card={card} onSave={onEdit} />
                <DeleteConfirmDialog
                  onConfirm={() => onDelete(card.id)}
                  title="Delete Credit Card"
                  description={`Are you sure you want to delete "${card.name}"? This action cannot be undone.`}
                />
              </div>
            </div>

            <div className="mt-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Used this month</span>
                <span className="font-semibold text-primary">
                  ₹{spent.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full rounded-full gradient-primary transition-all duration-500"
                  style={{ width: `${Math.min(percentage, 100)}%` }}
                />
              </div>
              <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                <span>{percentage.toFixed(1)}% used</span>
                <span>₹{remaining.toLocaleString('en-IN')} remaining</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
