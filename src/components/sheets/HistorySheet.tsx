import { useState, useMemo } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { MonthSwitcher } from '@/components/dashboard/MonthSwitcher';
import { DailySpendingList } from '@/components/dashboard/DailySpendingList';
import { useBudgetContext } from '@/contexts/BudgetContext';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search, Download, X } from 'lucide-react';
import { PaymentMethod, paymentMethodLabels } from '@/types/budget';
import * as XLSX from 'xlsx';
import { format } from 'date-fns';

interface HistorySheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const HistorySheet = ({ open, onOpenChange }: HistorySheetProps) => {
  const { currentMonth, setCurrentMonth, data } = useBudgetContext();
  const [searchAmount, setSearchAmount] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterPaymentMethod, setFilterPaymentMethod] = useState<string>('all');

  const filteredSpends = useMemo(() => {
    return data.spends.filter((spend) => {
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
  }, [data.spends, searchAmount, filterCategory, filterPaymentMethod]);

  const clearFilters = () => {
    setSearchAmount('');
    setFilterCategory('all');
    setFilterPaymentMethod('all');
  };

  const hasActiveFilters = searchAmount || filterCategory !== 'all' || filterPaymentMethod !== 'all';

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

    XLSX.writeFile(wb, `spending-history-${format(currentMonth, 'MMM-yyyy')}.xlsx`);
  };

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
