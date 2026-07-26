import { useState } from 'react';
import { AccountController } from '../controllers/AccountController';
import { AccountTypeKind } from '../../domain';

export function useUpdateAccount(
  controller: AccountController,
  onSuccess?: () => void
) {
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

  const executeUpdate = async (action: () => Promise<void>) => {
    setIsUpdating(true);
    setUpdateError(null);
    try {
      await action();
      onSuccess?.();
    } catch (e) {
      setUpdateError(e instanceof Error ? e.message : 'Operation failed.');
    } finally {
      setIsUpdating(false);
    }
  };

  const createAccount = (data: {
    name: string;
    type: AccountTypeKind;
    currencyCode?: string;
    openingBalance?: number;
    isDefault?: boolean;
  }) => executeUpdate(async () => { await controller.createAccount(data); });

  const renameAccount = (accountId: string, newName: string) =>
    executeUpdate(() => controller.renameAccount(accountId, newName).then(() => {}));

  const archiveAccount = (accountId: string) =>
    executeUpdate(() => controller.archiveAccount(accountId));

  const restoreAccount = (accountId: string) =>
    executeUpdate(() => controller.restoreAccount(accountId));

  const setDefaultAccount = (accountId: string) =>
    executeUpdate(() => controller.setDefaultAccount(accountId));

  return {
    isUpdating,
    updateError,
    createAccount,
    renameAccount,
    archiveAccount,
    restoreAccount,
    setDefaultAccount,
  };
}
