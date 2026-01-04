import { useState, useMemo } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { DailySpendingList } from '@/components/dashboard/DailySpendingList';
import { useBudgetContext } from '@/contexts/BudgetContext';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search, Download, X, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { PaymentMethod, paymentMethodLabels } from '@/types/budget';
import * as XLSX from 'xlsx';
import { format, parse, subMonths, addMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, getDay } from 'date-fns';
import { cn } from '@/lib/utils';

interface HistorySheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const HistorySheet = ({ open, onOpenChange }: HistorySheetProps) => {
  const { currentMonth, setCurrentMonth, data } = useBudgetContext();
  const [searchAmount, setSearchAmount] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterPaymentMethod, setFilterPaymentMethod] = useState<string>('all');
  const [filterDate, setFilterDate] = useState<string | null>(null);

  const currentDate = parse(currentMonth, 'yyyy-MM', new Date());

  // Calculate spending per day for the calendar
  const spendingByDay = useMemo(() => {
    const byDay: Record<string, number> = {};
    data.spends.forEach((spend) => {
      const dateKey = spend.dateISO.split('T')[0];
      byDay[dateKey] = (byDay[dateKey] || 0) + spend.amount;
    });
    return byDay;
  }, [data.spends]);

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    const days = eachDayOfInterval({ start, end });
    
    // Add padding for the first week
    const startDay = getDay(start);
    const paddingDays = Array(startDay).fill(null);
    
    return [...paddingDays, ...days];
  }, [currentDate]);

  const filteredSpends = useMemo(() => {
    return data.spends.filter((spend) => {
      // Filter by date
      if (filterDate) {
        const spendDate = spend.dateISO.split('T')[0];
        if (spendDate !== filterDate) {
          return false;
        }
      }

      // Filter by amount
      if (searchAmount) {
        const amount = parseFloat(searchAmount);
        if (!isNaN(amount) && spend.amount !== amount) {
          return false;
        }
      }

      // Filter by category
      if (filterCategory !== 'all' && spend.categoryId !== filterCategory) {
        return false;
      }

      // Filter by payment method
      if (filterPaymentMethod !== 'all' && spend.paymentMethod !== filterPaymentMethod) {
        return false;
      }

      return true;
    });
  }, [data.spends, searchAmount, filterCategory, filterPaymentMethod, filterDate]);

  const clearFilters = () => {
    setSearchAmount('');
    setFilterCategory('all');
    setFilterPaymentMethod('all');
    setFilterDate(null);
  };

  const hasActiveFilters = searchAmount || filterCategory !== 'all' || filterPaymentMethod !== 'all' || filterDate;

  const handlePrevMonth = () => {
    const prevMonth = subMonths(currentDate, 1);
    setCurrentMonth(format(prevMonth, 'yyyy-MM'));
    setFilterDate(null);
  };

  const handleNextMonth = () => {
    const nextMonth = addMonths(currentDate, 1);
    setCurrentMonth(format(nextMonth, 'yyyy-MM'));
    setFilterDate(null);
  };

  const handleDayClick = (day: Date) => {
    const dateStr = format(day, 'yyyy-MM-dd');
    if (filterDate === dateStr) {
      setFilterDate(null);
    } else {
      setFilterDate(dateStr);
    }
  };

  const exportToExcel = () => {
    const exportData = filteredSpends.map((spend) => {
      const category = data.categories.find((c) => c.id === spend.categoryId);
      const creditCard = data.creditCards.find((c) => c.id === spend.creditCardId);
      
      return {
        Date: format(new Date(spend.dateISO), 'dd/MM/yyyy'),
        Amount: spend.amount,
        Category: category?.name || 'Unknown',
        'Payment Method': paymentMethodLabels[spend.paymentMethod],
        'Credit Card': creditCard?.name || '-',
        Note: spend.note || '-',
      };
    });

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Spending History');
    
    // Auto-size columns
    const colWidths = [
      { wch: 12 }, // Date
      { wch: 12 }, // Amount
      { wch: 20 }, // Category
      { wch: 15 }, // Payment Method
      { wch: 20 }, // Credit Card
      { wch: 30 }, // Note
    ];
    ws['!cols'] = colWidths;

    XLSX.writeFile(wb, `spending-history-${format(currentDate, 'MMM-yyyy')}.xlsx`);
  };

  const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[90vh] overflow-y-auto">
        <SheetHeader className="mb-4">
          <SheetTitle>Spending History</SheetTitle>
        </SheetHeader>
        
        <div className="space-y-4">
          {/* Month Navigation */}
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="icon"
              onClick={handlePrevMonth}
              className="h-9 w-9 rounded-lg bg-secondary"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>

            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              <span className="text-base font-semibold text-foreground">
                {format(currentDate, 'MMMM yyyy')}
              </span>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={handleNextMonth}
              className="h-9 w-9 rounded-lg bg-secondary"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>

          {/* Mini Calendar */}
          <div className="rounded-xl border border-border bg-card p-3">
            {/* Week day headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {weekDays.map((day, i) => (
                <div key={i} className="text-center text-xs font-medium text-muted-foreground">
                  {day}
                </div>
              ))}
            </div>
            
            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, i) => {
                if (!day) {
                  return <div key={`empty-${i}`} className="h-10" />;
                }
                
                const dateStr = format(day, 'yyyy-MM-dd');
                const daySpend = spendingByDay[dateStr] || 0;
                const isSelected = filterDate === dateStr;
                const hasSpending = daySpend > 0;
                
                return (
                  <button
                    key={dateStr}
                    onClick={() => handleDayClick(day)}
                    className={cn(
                      "flex flex-col items-center justify-center h-10 rounded-lg text-xs transition-colors",
                      isSelected
                        ? "bg-primary text-primary-foreground"
                        : hasSpending
                        ? "bg-destructive/10 hover:bg-destructive/20"
                        : "hover:bg-accent"
                    )}
                  >
                    <span className={cn(
                      "font-medium",
                      !isSelected && hasSpending && "text-destructive"
                    )}>
                      {format(day, 'd')}
                    </span>
                    {hasSpending && !isSelected && (
                      <span className="text-[9px] text-destructive font-medium">
                        ₹{daySpend >= 1000 ? `${(daySpend / 1000).toFixed(1)}k` : daySpend}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Search and Filters */}
          <div className="space-y-3 rounded-lg border border-border bg-card p-3">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Filters</span>
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="ml-auto h-7 text-xs"
                >
                  <X className="mr-1 h-3 w-3" />
                  Clear
                </Button>
              )}
            </div>
            
            <div className="grid grid-cols-3 gap-2">
              <Input
                type="number"
                placeholder="Amount"
                value={searchAmount}
                onChange={(e) => setSearchAmount(e.target.value)}
                className="h-9"
              />
              
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {data.categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filterPaymentMethod} onValueChange={setFilterPaymentMethod}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Payment" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Methods</SelectItem>
                  {Object.entries(paymentMethodLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={exportToExcel}
              className="w-full"
              disabled={filteredSpends.length === 0}
            >
              <Download className="mr-2 h-4 w-4" />
              Export to Excel ({filteredSpends.length} records)
            </Button>
          </div>
          
          <DailySpendingList 
            spends={filteredSpends} 
            categories={data.categories} 
          />
        </div>
      </SheetContent>
    </Sheet>
  );
};