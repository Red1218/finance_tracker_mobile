import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Target, Edit2, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BudgetProgressProps {
  budgetLimit: number;
  totalSpend: number;
  onSetLimit: (limit: number) => void;
}

export const BudgetProgress = ({ budgetLimit, totalSpend, onSetLimit }: BudgetProgressProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(budgetLimit.toString());

  const percentage = budgetLimit > 0 ? (totalSpend / budgetLimit) * 100 : 0;
  const remaining = budgetLimit - totalSpend;
  const isOverBudget = remaining < 0;

  const handleSave = () => {
    const value = parseFloat(inputValue) || 0;
    onSetLimit(value);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setInputValue(budgetLimit.toString());
    setIsEditing(false);
  };

  return (
    <div className="rounded-xl border border-border bg-card p-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target className="h-4 w-4 text-primary" />
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Monthly Budget
          </span>
        </div>
        {!isEditing && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-muted-foreground hover:text-foreground"
            onClick={() => setIsEditing(true)}
          >
            <Edit2 className="h-3 w-3" />
          </Button>
        )}
      </div>

      {isEditing ? (
        <div className="mt-3 flex items-center gap-2">
          <span className="text-muted-foreground">₹</span>
          <Input
            type="number"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="h-8"
            placeholder="Enter budget limit"
            autoFocus
          />
          <Button size="icon" className="h-8 w-8" onClick={handleSave}>
            <Check className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleCancel}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <>
          {budgetLimit > 0 ? (
            <>
              <div className="mt-3 flex items-baseline justify-between">
                <span className="text-2xl font-bold">
                  ₹{totalSpend.toLocaleString('en-IN')}
                </span>
                <span className="text-sm text-muted-foreground">
                  of ₹{budgetLimit.toLocaleString('en-IN')}
                </span>
              </div>
              <Progress
                value={Math.min(percentage, 100)}
                className={cn(
                  'mt-3 h-2',
                  isOverBudget && '[&>div]:bg-destructive'
                )}
              />
              <div className="mt-2 flex items-center justify-between text-xs">
                <span className={cn(
                  'font-medium',
                  isOverBudget ? 'text-destructive' : 'text-muted-foreground'
                )}>
                  {percentage.toFixed(1)}% used
                </span>
                <span className={cn(
                  'font-medium',
                  isOverBudget ? 'text-destructive' : 'text-primary'
                )}>
                  {isOverBudget ? 'Over by ' : ''}₹{Math.abs(remaining).toLocaleString('en-IN')}
                  {!isOverBudget && ' remaining'}
                </span>
              </div>
            </>
          ) : (
            <div className="mt-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => setIsEditing(true)}
              >
                Set Monthly Budget
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};
