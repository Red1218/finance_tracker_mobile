import { format, subMonths, isSameMonth, parse } from 'date-fns';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface MonthSelectorProps {
  currentMonth: string; // format: 'yyyy-MM'
  onMonthChange: (month: string) => void;
}

export const MonthSelector = ({ currentMonth, onMonthChange }: MonthSelectorProps) => {
  const [open, setOpen] = useState(false);
  
  // Parse current month string to Date
  const currentDate = parse(currentMonth, 'yyyy-MM', new Date());
  
  // Generate last 4 months for quick selection
  const months = Array.from({ length: 4 }, (_, i) => subMonths(new Date(), i));

  const handleSelect = (date: Date) => {
    onMonthChange(format(date, 'yyyy-MM'));
    setOpen(false);
  };

  const isSelected = (date: Date) => {
    return format(date, 'yyyy-MM') === currentMonth;
  };

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="default"
            className="shrink-0 rounded-full px-4 py-2 text-sm font-medium"
          >
            {format(currentDate, 'MMMM')}
            <ChevronDown className="ml-1 h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-48 p-2" align="start">
          <div className="space-y-1">
            {Array.from({ length: 12 }, (_, i) => {
              const date = new Date(currentDate.getFullYear(), i, 1);
              return (
                <button
                  key={i}
                  onClick={() => handleSelect(date)}
                  className={cn(
                    "w-full rounded-lg px-3 py-2 text-left text-sm transition-colors",
                    isSelected(date)
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-accent"
                  )}
                >
                  {format(date, 'MMMM')}
                </button>
              );
            })}
          </div>
        </PopoverContent>
      </Popover>

      {months.slice(1).map((date) => (
        <button
          key={date.toISOString()}
          onClick={() => handleSelect(date)}
          className={cn(
            "shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors",
            isSelected(date)
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-muted-foreground hover:bg-accent hover:text-foreground"
          )}
        >
          {format(date, 'MMMM')}
        </button>
      ))}
    </div>
  );
};
