import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format, addMonths, subMonths, parse } from 'date-fns';

interface MonthSwitcherProps {
  currentMonth: string;
  onMonthChange: (month: string) => void;
}

export const MonthSwitcher = ({ currentMonth, onMonthChange }: MonthSwitcherProps) => {
  const date = parse(currentMonth, 'yyyy-MM', new Date());
  
  const goToPrevMonth = () => {
    const prev = subMonths(date, 1);
    onMonthChange(format(prev, 'yyyy-MM'));
  };
  
  const goToNextMonth = () => {
    const next = addMonths(date, 1);
    onMonthChange(format(next, 'yyyy-MM'));
  };

  return (
    <div className="flex items-center justify-between rounded-xl bg-card border border-border p-3">
      <Button 
        variant="icon" 
        size="icon" 
        onClick={goToPrevMonth}
        aria-label="Previous month"
      >
        <ChevronLeft className="h-5 w-5" />
      </Button>
      
      <div className="flex items-center gap-2">
        <Calendar className="h-4 w-4 text-primary" />
        <span className="text-base font-semibold">
          {format(date, 'MMMM yyyy')}
        </span>
      </div>
      
      <Button 
        variant="icon" 
        size="icon" 
        onClick={goToNextMonth}
        aria-label="Next month"
      >
        <ChevronRight className="h-5 w-5" />
      </Button>
    </div>
  );
};
