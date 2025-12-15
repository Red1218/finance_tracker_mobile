import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useBudgetContext } from '@/contexts/BudgetContext';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

interface SettingsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SettingsSheet = ({ open, onOpenChange }: SettingsSheetProps) => {
  const { budgetLimit, setBudgetLimit } = useBudgetContext();
  const [limitValue, setLimitValue] = useState(budgetLimit.toString());

  useEffect(() => {
    setLimitValue(budgetLimit.toString());
  }, [budgetLimit]);

  const handleSave = () => {
    const newLimit = parseFloat(limitValue) || 0;
    setBudgetLimit(newLimit);
    toast.success('Settings saved');
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[50vh]">
        <SheetHeader className="mb-6">
          <SheetTitle>Settings</SheetTitle>
        </SheetHeader>
        
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="budget-limit">Monthly Budget Limit (₹)</Label>
            <Input
              id="budget-limit"
              type="number"
              placeholder="Enter budget limit"
              value={limitValue}
              onChange={(e) => setLimitValue(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Set a monthly budget limit to track your spending
            </p>
          </div>

          <Button onClick={handleSave} className="w-full">
            Save Settings
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};
