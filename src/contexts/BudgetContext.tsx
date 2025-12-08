import { createContext, useContext, ReactNode } from 'react';
import { useBudget } from '@/hooks/useBudget';

type BudgetContextType = ReturnType<typeof useBudget>;

const BudgetContext = createContext<BudgetContextType | null>(null);

export const BudgetProvider = ({ children }: { children: ReactNode }) => {
  const budget = useBudget();

  return (
    <BudgetContext.Provider value={budget}>
      {children}
    </BudgetContext.Provider>
  );
};

export const useBudgetContext = () => {
  const context = useContext(BudgetContext);
  if (!context) {
    throw new Error('useBudgetContext must be used within a BudgetProvider');
  }
  return context;
};
