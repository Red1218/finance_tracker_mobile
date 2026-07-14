import { useAuth } from '@/src/features/identity/hooks/useAuth';
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
      const [categoriesRes, creditCardsRes, spendsRes, borrowingsRes, budgetSettingsRes] = await Promise.all([
        supabase.from('categories').select('*').eq('user_id', user.id),
        supabase.from('credit_cards').select('*').eq('user_id', user.id),
        supabase
          .from('spends')
          .select('*')
          .eq('user_id', user.id)
          .gte('spend_date', format(monthStart, 'yyyy-MM-dd'))
          .lte('spend_date', format(monthEnd, 'yyyy-MM-dd'))
          .order('created_at', { ascending: false }),
        supabase.from('borrowings').select('*').eq('user_id', user.id),
        supabase.from('budget_settings').select('*').eq('user_id', user.id).eq('month', currentMonth).maybeSingle(),
      ]);

      if (categoriesRes.error) throw categoriesRes.error;
      if (creditCardsRes.error) throw creditCardsRes.error;
      if (spendsRes.error) throw spendsRes.error;
      if (borrowingsRes.error) throw borrowingsRes.error;
      if (budgetSettingsRes.error) throw budgetSettingsRes.error;

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

      const creditCards: CreditCard[] = (creditCardsRes.data || []).map(c => ({
        id: c.id,
        name: c.name,
        limit: Number((c as any).credit_limit) || 0,
        isDefault: (c as any).is_default || false,
      }));

      const spends: Spend[] = (spendsRes.data || []).map(s => ({
        id: s.id,
        dateISO: s.spend_date,
        amount: Number(s.amount),
        categoryId: s.category_id || '',
        note: s.note || undefined,
        paymentMethod: s.payment_method as PaymentMethod,
        creditCardId: s.credit_card_id || undefined,
      }));

      const borrowings: Borrowing[] = (borrowingsRes.data || []).map(b => ({
        id: b.id,
        type: b.type as Borrowing['type'],
        amount: Number(b.amount),
        from: b.source,
        note: b.note || undefined,
      }));

      const budgetLimit = budgetSettingsRes.data?.budget_limit ? Number(budgetSettingsRes.data.budget_limit) : 0;

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
      const { data: newSpend, error } = await supabase
        .from('spends')
        .insert({
          user_id: user.id,
          amount: spend.amount,
          category_id: spend.categoryId || null,
          note: spend.note || null,
          payment_method: spend.paymentMethod,
          credit_card_id: spend.creditCardId || null,
          spend_date: spend.dateISO,
        })
        .select()
        .single();

      if (error) throw error;

      const mappedSpend: Spend = {
        id: newSpend.id,
        dateISO: newSpend.spend_date,
        amount: Number(newSpend.amount),
        categoryId: newSpend.category_id || '',
        note: newSpend.note || undefined,
        paymentMethod: newSpend.payment_method as PaymentMethod,
        creditCardId: newSpend.credit_card_id || undefined,
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
      const { error } = await supabase.from('spends').delete().eq('id', id);
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
      const { data: updatedSpend, error } = await supabase
        .from('spends')
        .update({
          amount: spend.amount,
          category_id: spend.categoryId || null,
          note: spend.note || null,
          payment_method: spend.paymentMethod,
          credit_card_id: spend.creditCardId || null,
          spend_date: spend.dateISO,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const mappedSpend: Spend = {
        id: updatedSpend.id,
        dateISO: updatedSpend.spend_date,
        amount: Number(updatedSpend.amount),
        categoryId: updatedSpend.category_id || '',
        note: updatedSpend.note || undefined,
        paymentMethod: updatedSpend.payment_method as PaymentMethod,
        creditCardId: updatedSpend.credit_card_id || undefined,
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
    if (!user) return;

    try {
      const { data: newBorrowing, error } = await supabase
        .from('borrowings')
        .insert({
          user_id: user.id,
          type: borrowing.type,
          amount: borrowing.amount,
          source: borrowing.from,
          note: borrowing.note || null,
        })
        .select()
        .single();

      if (error) throw error;

      const mappedBorrowing: Borrowing = {
        id: newBorrowing.id,
        type: newBorrowing.type as Borrowing['type'],
        amount: Number(newBorrowing.amount),
        from: newBorrowing.source,
        note: newBorrowing.note || undefined,
      };

      setData(prev => ({
        ...prev,
        borrowings: [...prev.borrowings, mappedBorrowing],
      }));
    } catch (error) {
      console.error('Error adding borrowing:', error);
      toast({
        title: 'Error',
        description: 'Failed to add borrowing.',
        variant: 'destructive',
      });
    }
  }, [user]);

  const deleteBorrowing = useCallback(async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase.from('borrowings').delete().eq('id', id);
      if (error) throw error;

      setData(prev => ({
        ...prev,
        borrowings: prev.borrowings.filter(b => b.id !== id),
      }));
    } catch (error) {
      console.error('Error deleting borrowing:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete borrowing.',
        variant: 'destructive',
      });
    }
  }, [user]);

  const updateBorrowing = useCallback(async (id: string, updates: Omit<Borrowing, 'id'>) => {
    if (!user) return;

    try {
      const { data: updatedBorrowing, error } = await supabase
        .from('borrowings')
        .update({
          type: updates.type,
          amount: updates.amount,
          source: updates.from,
          note: updates.note || null,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const mappedBorrowing: Borrowing = {
        id: updatedBorrowing.id,
        type: updatedBorrowing.type as Borrowing['type'],
        amount: Number(updatedBorrowing.amount),
        from: updatedBorrowing.source,
        note: updatedBorrowing.note || undefined,
      };

      setData(prev => ({
        ...prev,
        borrowings: prev.borrowings.map(b => b.id === id ? mappedBorrowing : b),
      }));

      toast({
        title: 'Updated',
        description: 'Borrowing updated successfully.',
      });
    } catch (error) {
      console.error('Error updating borrowing:', error);
      toast({
        title: 'Error',
        description: 'Failed to update borrowing.',
        variant: 'destructive',
      });
    }
  }, [user]);

  // Credit Cards
  const addCreditCard = useCallback(async (card: Omit<CreditCard, 'id'>) => {
    if (!user) return;

    try {
      const { data: newCard, error } = await supabase
        .from('credit_cards')
        .insert({
          user_id: user.id,
          name: card.name,
          credit_limit: card.limit,
        })
        .select()
        .single();

      if (error) throw error;

      setData(prev => ({
        ...prev,
        creditCards: [...prev.creditCards, { id: newCard.id, name: newCard.name, limit: Number((newCard as any).credit_limit) || 0, isDefault: (newCard as any).is_default || false }],
      }));
    } catch (error) {
      console.error('Error adding credit card:', error);
      toast({
        title: 'Error',
        description: 'Failed to add credit card.',
        variant: 'destructive',
      });
    }
  }, [user]);

  const deleteCreditCard = useCallback(async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase.from('credit_cards').delete().eq('id', id);
      if (error) throw error;

      setData(prev => ({
        ...prev,
        creditCards: prev.creditCards.filter(c => c.id !== id),
      }));
    } catch (error) {
      console.error('Error deleting credit card:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete credit card.',
        variant: 'destructive',
      });
    }
  }, [user]);

  const updateCreditCard = useCallback(async (id: string, updates: { name: string; limit: number }) => {
    if (!user) return;

    try {
      const { data: updatedCard, error } = await supabase
        .from('credit_cards')
        .update({
          name: updates.name,
          credit_limit: updates.limit,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setData(prev => ({
        ...prev,
        creditCards: prev.creditCards.map(c =>
          c.id === id
            ? { id: updatedCard.id, name: updatedCard.name, limit: Number(updatedCard.credit_limit) || 0, isDefault: (updatedCard as any).is_default || false }
            : c
        ),
      }));

      toast({
        title: 'Updated',
        description: 'Credit card updated successfully.',
      });
    } catch (error) {
      console.error('Error updating credit card:', error);
      toast({
        title: 'Error',
        description: 'Failed to update credit card.',
        variant: 'destructive',
      });
    }
  }, [user]);

  const setDefaultCard = useCallback(async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('credit_cards')
        .update({ is_default: true })
        .eq('id', id);

      if (error) throw error;

      // The trigger will unset other default cards, so update local state
      setData(prev => ({
        ...prev,
        creditCards: prev.creditCards.map(c => ({
          ...c,
          isDefault: c.id === id,
        })),
      }));

      toast({
        title: 'Updated',
        description: 'Default card set successfully.',
      });
    } catch (error) {
      console.error('Error setting default card:', error);
      toast({
        title: 'Error',
        description: 'Failed to set default card.',
        variant: 'destructive',
      });
    }
  }, [user]);

  // Budget Limit
  const setBudgetLimit = useCallback(async (limit: number) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('budget_settings')
        .upsert({
          user_id: user.id,
          month: currentMonth,
          budget_limit: limit,
        }, {
          onConflict: 'user_id,month',
        });

      if (error) throw error;

      setData(prev => ({
        ...prev,
        budgetLimit: limit,
      }));
    } catch (error) {
      console.error('Error setting budget limit:', error);
      toast({
        title: 'Error',
        description: 'Failed to update budget limit.',
        variant: 'destructive',
      });
    }
  }, [user, currentMonth]);

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
