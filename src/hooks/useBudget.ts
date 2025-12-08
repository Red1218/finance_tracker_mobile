import { useState, useEffect, useCallback } from 'react';
import { BudgetData, defaultBudgetData, Category, Spend, Borrowing, CreditCard } from '@/types/budget';
import { format } from 'date-fns';

const getStorageKey = (month: string) => `budget-app:${month}`;

export const useBudget = () => {
  const [currentMonth, setCurrentMonth] = useState(() => format(new Date(), 'yyyy-MM'));
  const [data, setData] = useState<BudgetData>(defaultBudgetData);

  // Load data for current month
  useEffect(() => {
    const key = getStorageKey(currentMonth);
    const stored = localStorage.getItem(key);
    if (stored) {
      try {
        setData(JSON.parse(stored));
      } catch {
        setData(defaultBudgetData);
      }
    } else {
      // Load categories from previous month if exists
      const prevMonth = format(new Date(currentMonth + '-01'), 'yyyy-MM');
      const prevKey = getStorageKey(prevMonth);
      const prevStored = localStorage.getItem(prevKey);
      if (prevStored) {
        try {
          const prevData = JSON.parse(prevStored);
          setData({
            ...defaultBudgetData,
            categories: prevData.categories || defaultBudgetData.categories,
            creditCards: prevData.creditCards || [],
          });
        } catch {
          setData(defaultBudgetData);
        }
      } else {
        setData(defaultBudgetData);
      }
    }
  }, [currentMonth]);

  // Auto-save whenever data changes
  const saveData = useCallback((newData: BudgetData) => {
    setData(newData);
    const key = getStorageKey(currentMonth);
    localStorage.setItem(key, JSON.stringify(newData));
  }, [currentMonth]);

  // Categories
  const addCategory = useCallback((name: string) => {
    const newCategory: Category = {
      id: Date.now().toString(),
      name,
    };
    saveData({ ...data, categories: [...data.categories, newCategory] });
  }, [data, saveData]);

  const deleteCategory = useCallback((id: string) => {
    saveData({ ...data, categories: data.categories.filter(c => c.id !== id) });
  }, [data, saveData]);

  // Spends
  const addSpend = useCallback((spend: Omit<Spend, 'id'>) => {
    const newSpend: Spend = {
      ...spend,
      id: Date.now().toString(),
    };
    saveData({ ...data, spends: [newSpend, ...data.spends] });
  }, [data, saveData]);

  const deleteSpend = useCallback((id: string) => {
    saveData({ ...data, spends: data.spends.filter(s => s.id !== id) });
  }, [data, saveData]);

  // Borrowings
  const addBorrowing = useCallback((borrowing: Omit<Borrowing, 'id'>) => {
    const newBorrowing: Borrowing = {
      ...borrowing,
      id: Date.now().toString(),
    };
    saveData({ ...data, borrowings: [...data.borrowings, newBorrowing] });
  }, [data, saveData]);

  const deleteBorrowing = useCallback((id: string) => {
    saveData({ ...data, borrowings: data.borrowings.filter(b => b.id !== id) });
  }, [data, saveData]);

  // Credit Cards
  const addCreditCard = useCallback((card: Omit<CreditCard, 'id'>) => {
    const newCard: CreditCard = {
      ...card,
      id: Date.now().toString(),
    };
    saveData({ ...data, creditCards: [...data.creditCards, newCard] });
  }, [data, saveData]);

  const deleteCreditCard = useCallback((id: string) => {
    saveData({ ...data, creditCards: data.creditCards.filter(c => c.id !== id) });
  }, [data, saveData]);

  // Calculations
  const totalSpend = data.spends.reduce((sum, s) => sum + s.amount, 0);
  const totalBorrowed = data.borrowings.reduce((sum, b) => sum + b.amount, 0);

  const spendByCategory = data.categories.map(cat => ({
    category: cat,
    amount: data.spends
      .filter(s => s.categoryId === cat.id)
      .reduce((sum, s) => sum + s.amount, 0),
  })).filter(item => item.amount > 0);

  const spendByCreditCard = data.creditCards.map(card => ({
    card,
    amount: data.spends
      .filter(s => s.paymentMethod === 'credit' && s.creditCardId === card.id)
      .reduce((sum, s) => sum + s.amount, 0),
  }));

  return {
    currentMonth,
    setCurrentMonth,
    data,
    addCategory,
    deleteCategory,
    addSpend,
    deleteSpend,
    addBorrowing,
    deleteBorrowing,
    addCreditCard,
    deleteCreditCard,
    totalSpend,
    totalBorrowed,
    spendByCategory,
    spendByCreditCard,
  };
};
