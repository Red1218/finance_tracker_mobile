import React, { useMemo } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { TransactionsModule } from '../composition/TransactionsModule';
import { AccountsModule } from '../../accounts/composition/AccountsModule';
import { CategoriesModule } from '../../categories/composition/CategoriesModule';
import { TransactionsScreen } from '../presentation/screens/TransactionsScreen';
import { useTransactions } from '../presentation/hooks/useTransactions';
import { useAccounts } from '../../accounts/presentation/hooks/useAccounts';
import { useCategories } from '../../categories/presentation/hooks/useCategories';
import { TransactionFormValues, TransactionFormMode } from '../presentation/components';
import { generateUUID } from '../../../core/utils/uuid';

export interface TransactionsRouteContainerProps {
  transactionsModule?: TransactionsModule;
  accountsModule?: AccountsModule;
  categoriesModule?: CategoriesModule;
  autoOpenForm?: boolean;
}

export function TransactionsRouteContainer({
  transactionsModule: customTransactionsModule,
  accountsModule: customAccountsModule,
  categoriesModule: customCategoriesModule,
  autoOpenForm: customAutoOpenForm,
}: TransactionsRouteContainerProps = {}) {
  let searchParams: Record<string, string> = {};
  try {
    searchParams = useLocalSearchParams() as Record<string, string>;
  } catch {
    searchParams = {};
  }
  const autoOpenForm = customAutoOpenForm ?? (searchParams.openModal === 'true' || searchParams.openModal === '1');

  const transactionsModule = useMemo(
    () => customTransactionsModule ?? new TransactionsModule(),
    [customTransactionsModule]
  );
  const accountsModule = useMemo(
    () => customAccountsModule ?? new AccountsModule(),
    [customAccountsModule]
  );
  const categoriesModule = useMemo(
    () => customCategoriesModule ?? new CategoriesModule(),
    [customCategoriesModule]
  );

  const { viewModels: accountViewModels, isLoading: accountsLoading, refresh: refreshAccounts } = useAccounts(
    accountsModule.controller
  );

  const { categories: categoryDtos, isLoading: categoriesLoading, refresh: refreshCategories } = useCategories(
    categoriesModule.listCategoriesUseCase
  );

  // Default to first active account if available
  const activeAccountId = accountViewModels.find((a) => !a.isArchived)?.id || accountViewModels[0]?.id || '';

  const {
    transactions,
    loading: transactionsLoading,
    error: transactionsError,
    refresh: refreshTransactions,
  } = useTransactions(transactionsModule.controller, activeAccountId);

  // Map accountViewModels to Accounts format for TransactionsScreen
  const accounts = useMemo(() => {
    return accountViewModels.map((acc) => ({
      id: acc.id,
      name: acc.name,
      isArchived: acc.isArchived,
    }));
  }, [accountViewModels]);

  // Map categoryDtos to Categories format for TransactionsScreen
  const categories = useMemo(() => {
    return categoryDtos.map((cat) => ({
      id: cat.id,
      name: cat.name,
      kind: cat.kind as 'EXPENSE' | 'INCOME' | undefined,
    }));
  }, [categoryDtos]);

  const handleFormSubmit = async (
    values: TransactionFormValues,
    mode: TransactionFormMode,
    transactionId?: string
  ): Promise<void> => {
    if (mode === 'edit' && transactionId) {
      await transactionsModule.controller.updateTransaction({
        id: transactionId,
        amount: values.amount,
        description: values.description,
        categoryId: values.categoryId,
        transactionDate: values.transactionDate,
      });
    } else if (mode === 'expense') {
      await transactionsModule.controller.createExpense({
        accountId: values.accountId,
        amount: values.amount,
        currencyCode: values.currencyCode || 'INR',
        description: values.description,
        categoryId: values.categoryId,
        transactionDate: values.transactionDate,
      });
    } else if (mode === 'income') {
      await transactionsModule.controller.createIncome({
        accountId: values.accountId,
        amount: values.amount,
        currencyCode: values.currencyCode || 'INR',
        description: values.description,
        categoryId: values.categoryId,
        transactionDate: values.transactionDate,
      });
    } else if (mode === 'transfer') {
      if (!values.destAccountId) {
        throw new Error('Destination account is required for transfers.');
      }
      const sourceId = generateUUID();
      const destId = generateUUID();
      const groupId = generateUUID();

      await transactionsModule.controller.executeTransfer({
        sourceTransactionId: sourceId,
        destTransactionId: destId,
        sourceAccountId: values.accountId,
        destAccountId: values.destAccountId,
        amount: values.amount,
        currencyCode: values.currencyCode || 'INR',
        description: values.description,
        transferGroupId: groupId,
        transactionDate: values.transactionDate,
      });
    }

    // Refresh transactions and accounts balance after creation/update
    await Promise.all([refreshTransactions(), refreshAccounts()]);
  };

  const handleVoidTransaction = async (transactionId: string): Promise<void> => {
    await transactionsModule.controller.voidTransaction(transactionId);
    await Promise.all([refreshTransactions(), refreshAccounts()]);
  };

  const handleRefresh = async () => {
    await Promise.all([refreshTransactions(), refreshAccounts(), refreshCategories()]);
  };

  const isInitialLoading = transactionsLoading || accountsLoading || categoriesLoading;

  return (
    <TransactionsScreen
      transactions={transactions}
      accounts={accounts}
      categories={categories}
      isLoading={isInitialLoading}
      error={transactionsError?.message || null}
      onRefresh={handleRefresh}
      onFormSubmit={handleFormSubmit}
      onVoidTransaction={handleVoidTransaction}
      autoOpenForm={autoOpenForm}
    />

  );
}
