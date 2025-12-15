import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { MonthSwitcher } from '@/components/dashboard/MonthSwitcher';
import { DailySpendingList } from '@/components/dashboard/DailySpendingList';
import { useBudgetContext } from '@/contexts/BudgetContext';

interface HistorySheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const HistorySheet = ({ open, onOpenChange }: HistorySheetProps) => {
  const { currentMonth, setCurrentMonth, data } = useBudgetContext();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[85vh] overflow-y-auto">
        <SheetHeader className="mb-4">
          <SheetTitle>Spending History</SheetTitle>
        </SheetHeader>
        
        <div className="space-y-4">
          <MonthSwitcher 
            currentMonth={currentMonth} 
            onMonthChange={setCurrentMonth} 
          />
          
          <DailySpendingList 
            spends={data.spends} 
            categories={data.categories} 
          />
        </div>
      </SheetContent>
    </Sheet>
  );
};
