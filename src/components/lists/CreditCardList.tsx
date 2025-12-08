import { CreditCard } from '@/types/budget';
import { Button } from '@/components/ui/button';
import { Trash2, CreditCard as CardIcon } from 'lucide-react';

interface CreditCardListProps {
  cards: CreditCard[];
  spendByCard: Array<{ card: CreditCard; amount: number }>;
  onDelete: (id: string) => void;
}

export const CreditCardList = ({ cards, spendByCard, onDelete }: CreditCardListProps) => {
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
                  <h3 className="font-semibold">{card.name}</h3>
                  <p className="text-xs text-muted-foreground">
                    Limit: ₹{card.limit.toLocaleString('en-IN')}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(card.id)}
                className="text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
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
