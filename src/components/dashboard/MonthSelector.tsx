import { format, subMonths, addMonths, parse } from 'date-fns';
import { cn } from '@/lib/utils';
import { useRef, useEffect } from 'react';

interface MonthSelectorProps {
  currentMonth: string; // format: 'yyyy-MM'
  onMonthChange: (month: string) => void;
}

export const MonthSelector = ({ currentMonth, onMonthChange }: MonthSelectorProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const currentDate = parse(currentMonth, 'yyyy-MM', new Date());
  
  // Generate 6 months: current month and 5 previous months
  const months = Array.from({ length: 6 }, (_, i) => {
    const date = subMonths(new Date(), i);
    return {
      value: format(date, 'yyyy-MM'),
      label: format(date, 'MMM yyyy'),
    };
  });

  // Scroll to selected month on mount
  useEffect(() => {
    const selectedIndex = months.findIndex(m => m.value === currentMonth);
    if (scrollRef.current && selectedIndex >= 0) {
      const buttons = scrollRef.current.querySelectorAll('button');
      if (buttons[selectedIndex]) {
        buttons[selectedIndex].scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    }
  }, [currentMonth]);

  return (
    <div 
      ref={scrollRef}
      className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1"
      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
    >
      {months.map((month) => {
        const isSelected = month.value === currentMonth;
        return (
          <button
            key={month.value}
            onClick={() => onMonthChange(month.value)}
            className={cn(
              "flex-shrink-0 px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-200",
              isSelected
                ? "bg-primary text-primary-foreground shadow-md"
                : "bg-secondary/80 text-muted-foreground hover:bg-secondary hover:text-foreground"
            )}
          >
            {month.label}
          </button>
        );
      })}
    </div>
  );
};
