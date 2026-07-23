import { useAuth } from '@/src/platform/authentication/useAuth';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Borrowing, BudgetData, Category, CreditCard, DEFAULT_CATEGORIES, defaultBudgetData, PaymentMethod, Spend } from '@/types/budget';
import { endOfMonth, format, startOfMonth } from 'date-fns';
import { useCallback, useEffect, useState } from 'react';

export const useBudget = () => {
  const { user } = useAuth();
  const [currentMonth, setCurrentMonth] = useState(() => format(new Date(), 'yyyy-MM'));
  const [data, setData] = useState<BudgetData>(defaultBudgetData);
  const [loading, setLoading] = useState(true);

  // Fetch all data for current month
  const fetchData = useCallback(async () => {
    if (!user) {
      setData(defaultBudgetData);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const monthStart = startOfMonth(new Date(currentMonth + '-01'));
      const monthEnd = endOfMonth(monthStart);

      // Fetch all data in parallel
      const [categoriesRes, expensesRes] = await Promise.all([
        supabase.from('categories').select('*').eq('user_id', user.id),
        supabase
          .from('expenses')
          .select('*')
          .eq('user_id', user.id)
          .gte('expense_date', format(monthStart, 'yyyy-MM-dd'))
          .lte('expense_date', format(monthEnd, 'yyyy-MM-dd'))
          .order('created_at', { ascending: false }),
      ]);

      if (categoriesRes.error) {
        console.warn('Categories fetch notice:', categoriesRes.error.message || categoriesRes.error);
      }
      if (expensesRes.error) {
        console.warn('Expenses fetch notice:', expensesRes.error.message || expensesRes.error);
      }

      // Seed default categories if user has none
      let categories: Category[] = (categoriesRes.data || []).map(c => ({
        id: c.id,
        name: c.name,
      }));

      if (categories.length === 0) {
        // Insert default categories
        const defaultCats = DEFAULT_CATEGORIES.map(name => ({
          name,
          user_id: user.id,
        }));

        const { data: newCats, error: seedError } = await supabase
          .from('categories')
          .insert(defaultCats)
          .select();

        if (!seedError && newCats) {
          categories = newCats.map(c => ({ id: c.id, name: c.name }));
        }
      }

      const creditCards: CreditCard[] = [];

      const spends: Spend[] = ((expensesRes as any).data || []).map((s: any) => ({
        id: s.id,
        dateISO: s.expense_date || s.created_at,
        amount: Number(s.amount),
        categoryId: s.category_id || '',
        note: s.note || undefined,
        paymentMethod: s.payment_method as PaymentMethod,
        creditCardId: undefined,
      }));

      const borrowings: Borrowing[] = [];
      const budgetLimit = 0;

      setData({
        categories,
        spends,
        borrowings,
        creditCards,
        budgetLimit,
      });
    } catch (error) {
      console.error('Error fetching budget data:', error);
      toast({
        title: 'Error loading data',
        description: 'Failed to load your budget data. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [user, currentMonth]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Categories
  const addCategory = useCallback(async (name: string) => {
    if (!user) return;

    try {
      const { data: newCategory, error } = await supabase
        .from('categories')
        .insert({ name, user_id: user.id })
        .select()
        .single();

      if (error) throw error;

      setData(prev => ({
        ...prev,
        categories: [...prev.categories, { id: newCategory.id, name: newCategory.name }],
      }));
    } catch (error) {
      console.error('Error adding category:', error);
      toast({
        title: 'Error',
        description: 'Failed to add category.',
        variant: 'destructive',
      });
    }
  }, [user]);

  const deleteCategory = useCallback(async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase.from('categories').delete().eq('id', id);
      if (error) throw error;

      setData(prev => ({
        ...prev,
        categories: prev.categories.filter(c => c.id !== id),
      }));
    } catch (error) {
      console.error('Error deleting category:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete category.',
        variant: 'destructive',
      });
    }
  }, [user]);

  // Spends
  const addSpend = useCallback(async (spend: Omit<Spend, 'id'>) => {
    if (!user) return;

    try {
      const { data: newSpend, error } = await (supabase
        .from('expenses') as any)
        .insert({
          user_id: user.id,
          amount: spend.amount,
          category_id: spend.categoryId || null,
          note: spend.note || null,
          payment_method: spend.paymentMethod,
          expense_date: spend.dateISO,
          currency: 'INR',
        })
        .select()
        .single();

      if (error) throw error;

      const mappedSpend: Spend = {
        id: newSpend.id,
        dateISO: newSpend.expense_date || newSpend.created_at,
        amount: Number(newSpend.amount),
        categoryId: newSpend.category_id || '',
        note: newSpend.note || undefined,
        paymentMethod: newSpend.payment_method as PaymentMethod,
        creditCardId: undefined,
      };

      setData(prev => ({
        ...prev,
        spends: [mappedSpend, ...prev.spends],
      }));
    } catch (error) {
      console.error('Error adding spend:', error);
      toast({
        title: 'Error',
        description: 'Failed to add spend.',
        variant: 'destructive',
      });
    }
  }, [user]);

  const deleteSpend = useCallback(async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase.from('expenses').delete().eq('id', id);
      if (error) throw error;

      setData(prev => ({
        ...prev,
        spends: prev.spends.filter(s => s.id !== id),
      }));
    } catch (error) {
      console.error('Error deleting spend:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete spend.',
        variant: 'destructive',
      });
    }
  }, [user]);

  const updateSpend = useCallback(async (id: string, spend: Omit<Spend, 'id'>) => {
    if (!user) return;

    try {
      const { data: updatedSpend, error } = await (supabase
        .from('expenses') as any)
        .update({
          amount: spend.amount,
          category_id: spend.categoryId || null,
          note: spend.note || null,
          payment_method: spend.paymentMethod,
          expense_date: spend.dateISO,
          currency: 'INR',
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const mappedSpend: Spend = {
        id: updatedSpend.id,
        dateISO: updatedSpend.expense_date || updatedSpend.created_at,
        amount: Number(updatedSpend.amount),
        categoryId: updatedSpend.category_id || '',
        note: updatedSpend.note || undefined,
        paymentMethod: updatedSpend.payment_method as PaymentMethod,
        creditCardId: undefined,
      };

      setData(prev => ({
        ...prev,
        spends: prev.spends.map(s => s.id === id ? mappedSpend : s),
      }));

      toast({
        title: 'Updated',
        description: 'Spend updated successfully.',
      });
    } catch (error) {
      console.error('Error updating spend:', error);
      toast({
        title: 'Error',
        description: 'Failed to update spend.',
        variant: 'destructive',
      });
    }
  }, [user]);

  // Borrowings
  const addBorrowing = useCallback(async (borrowing: Omit<Borrowing, 'id'>) => {
    const id = 'borrowing-' + Date.now();
    const mapped: Borrowing = { id, ...borrowing };
    setData(prev => ({
      ...prev,
      borrowings: [...prev.borrowings, mapped],
    }));
  }, []);

  const deleteBorrowing = useCallback(async (id: string) => {
    setData(prev => ({
      ...prev,
      borrowings: prev.borrowings.filter(b => b.id !== id),
    }));
  }, []);

  const updateBorrowing = useCallback(async (id: string, updates: Omit<Borrowing, 'id'>) => {
    setData(prev => ({
      ...prev,
      borrowings: prev.borrowings.map(b => b.id === id ? { id, ...updates } : b),
    }));
  }, []);

  // Credit Cards
  const addCreditCard = useCallback(async (card: Omit<CreditCard, 'id'>) => {
    const id = 'card-' + Date.now();
    setData(prev => ({
      ...prev,
      creditCards: [...prev.creditCards, { id, name: card.name, limit: card.limit, isDefault: card.isDefault ?? false }],
    }));
  }, []);

  const deleteCreditCard = useCallback(async (id: string) => {
    setData(prev => ({
      ...prev,
      creditCards: prev.creditCards.filter(c => c.id !== id),
    }));
  }, []);

  const updateCreditCard = useCallback(async (id: string, updates: { name: string; limit: number }) => {
    setData(prev => ({
      ...prev,
      creditCards: prev.creditCards.map(c =>
        c.id === id ? { ...c, name: updates.name, limit: updates.limit } : c
      ),
    }));
  }, []);

  const setDefaultCard = useCallback(async (id: string) => {
    setData(prev => ({
      ...prev,
      creditCards: prev.creditCards.map(c => ({
        ...c,
        isDefault: c.id === id,
      })),
    }));
  }, []);

  // Budget Limit
  const setBudgetLimit = useCallback(async (limit: number) => {
    setData(prev => ({
      ...prev,
      budgetLimit: limit,
    }));
  }, []);

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

  const defaultCard = data.creditCards.find(c => c.isDefault);

  return {
    currentMonth,
    setCurrentMonth,
    data,
    loading,
    addCategory,
    deleteCategory,
    addSpend,
    deleteSpend,
    updateSpend,
    addBorrowing,
    deleteBorrowing,
    updateBorrowing,
    addCreditCard,
    deleteCreditCard,
    updateCreditCard,
    setDefaultCard,
    defaultCard,
    setBudgetLimit,
    budgetLimit: data.budgetLimit,
    totalSpend,
    totalBorrowed,
    spendByCategory,
    spendByCreditCard,
  };
};
