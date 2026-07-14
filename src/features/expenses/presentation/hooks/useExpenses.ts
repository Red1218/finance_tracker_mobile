import { useState, useCallback, useEffect } from 'react';
import { expensesModule } from './module';
import { ExpenseItemModel, GroupedExpenses } from '../models';
import { ListExpensesRequest } from '../../application/use-cases';

export function useExpenses(filter?: ListExpensesRequest) {
  const [groupedExpenses, setGroupedExpenses] = useState<GroupedExpenses[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filterHash = JSON.stringify(filter);

  const fetchExpenses = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const currentFilter = filterHash ? JSON.parse(filterHash) : {};
      const result = await expensesModule.listExpensesUseCase.execute(currentFilter);
      
      if (result.success) {
        const viewModels: ExpenseItemModel[] = result.data.map(e => ({
          id: e.id.value,
          categoryId: e.categoryId.value,
          amount: e.amount.value,
          currency: e.currency.value,
          formattedAmount: `${e.currency.value} ${(e.amount.value / 100).toFixed(2)}`,
          date: e.date.value,
          formattedDate: new Date(e.date.value).toLocaleDateString(),
          paymentMethod: e.paymentMethod.value,
          note: e.note?.value,
          merchant: e.merchant?.value,
        }));

        const groupsMap = new Map<string, ExpenseItemModel[]>();
        for (const vm of viewModels) {
          const groupList = groupsMap.get(vm.formattedDate) || [];
          groupList.push(vm);
          groupsMap.set(vm.formattedDate, groupList);
        }

        const groups: GroupedExpenses[] = Array.from(groupsMap.entries()).map(([dateHeader, data]) => ({
          dateHeader,
          data
        }));

        setGroupedExpenses(groups);
      } else {
        setError(result.error.message);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to fetch expenses');
    } finally {
      setIsLoading(false);
    }
  }, [filterHash]);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  return {
    groupedExpenses,
    isLoading,
    error,
    refresh: fetchExpenses,
  };
}
