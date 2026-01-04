import { format, subMonths, addMonths, parse } from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface MonthSelectorProps {
  currentMonth: string; // format: 'yyyy-MM'
  onMonthChange: (month: string) => void;
}

export const MonthSelector = ({ currentMonth, onMonthChange }: MonthSelectorProps) => {
  // Parse current month string to Date
  const currentDate = parse(currentMonth, 'yyyy-MM', new Date());

  const handlePrevMonth = () => {
    const prevMonth = subMonths(currentDate, 1);
    onMonthChange(format(prevMonth, 'yyyy-MM'));
  };

  const handleNextMonth = () => {
    const nextMonth = addMonths(currentDate, 1);
    onMonthChange(format(nextMonth, 'yyyy-MM'));
  };

  return (
    <div className="flex items-center justify-between rounded-xl bg-secondary/50 p-2">
      <Button
        variant="ghost"
        size="icon"
        onClick={handlePrevMonth}
        className="h-10 w-10 rounded-lg bg-secondary hover:bg-accent"
      >
        <ChevronLeft className="h-5 w-5" />
      </Button>

      <div className="flex items-center gap-2">
        <Calendar className="h-4 w-4 text-primary" />
        <span className="text-base font-semibold text-foreground">
          {format(currentDate, 'MMM yyyy')}
        </span>
      </div>

      <Button
        variant="ghost"
        size="icon"
        onClick={handleNextMonth}
        className="h-10 w-10 rounded-lg bg-secondary hover:bg-accent"
      >
        <ChevronRight className="h-5 w-5" />
      </Button>
    </div>
  );
};