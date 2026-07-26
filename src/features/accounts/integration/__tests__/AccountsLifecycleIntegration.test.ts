import { describe, it, expect, beforeEach } from 'vitest';
import { AccountsModule } from '../../composition/AccountsModule';
import { InMemoryAccountRepository } from '../../application/__tests__/InMemoryAccountRepository';
import { AccountTypeKind, AccountDomainError } from '../../domain';

describe('Accounts Lifecycle Integration Test Suite', () => {
  let repository: InMemoryAccountRepository;
  let module: AccountsModule;

  beforeEach(() => {
    repository = new InMemoryAccountRepository();
    // Inject mock repository for end-to-end integration testing
    module = new AccountsModule(repository);
  });

  it('should execute complete accounts lifecycle seamlessly across app restarts', async () => {
    // 1. Fresh Install & Auto-Initialize Default Account
    const initialVms = await module.controller.loadAccountsViewModel(false);
    expect(initialVms.length).toBe(1);
    expect(initialVms[0].name).toBe('Cash Wallet');
    expect(initialVms[0].isDefault).toBe(true);

    const cashId = initialVms[0].id;

    // 2. Create Secondary Account
    const hdfcBank = await module.controller.createAccount({
      name: 'HDFC Savings',
      type: AccountTypeKind.Bank,
      currencyCode: 'INR',
      openingBalance: 50000,
    });
    expect(hdfcBank.name).toBe('HDFC Savings');
    expect(hdfcBank.isDefault).toBe(false);

    // 3. Rename Account
    const renamedHdfc = await module.controller.renameAccount(hdfcBank.id, 'HDFC Salary Account');
    expect(renamedHdfc.name).toBe('HDFC Salary Account');

    // 4. Set Default Account
    await module.controller.setDefaultAccount(hdfcBank.id);
    const updatedVms1 = await module.controller.loadAccountsViewModel(false);

    const checkCash1 = updatedVms1.find((v) => v.id === cashId)!;
    const checkBank1 = updatedVms1.find((v) => v.id === hdfcBank.id)!;

    expect(checkCash1.isDefault).toBe(false);
    expect(checkBank1.isDefault).toBe(true);

    // 5. Archive Default Account (with Automatic Default Promotion)
    await module.controller.archiveAccount(hdfcBank.id);

    const activeVms = await module.controller.loadAccountsViewModel(false);
    expect(activeVms.length).toBe(1);
    expect(activeVms[0].id).toBe(cashId);
    expect(activeVms[0].isDefault).toBe(true); // Cash auto-promoted to default!

    // 6. Restore Account
    await module.controller.restoreAccount(hdfcBank.id);
    const restoredVms = await module.controller.loadAccountsViewModel(false);
    expect(restoredVms.length).toBe(2);

    // 7. App Restart Simulation (Fresh AccountsModule instance backed by persistent store)
    const restartedModule = new AccountsModule(repository);
    const persistedVms = await restartedModule.controller.loadAccountsViewModel(true);
    expect(persistedVms.length).toBe(2);

    const restartedCash = persistedVms.find((v) => v.id === cashId)!;
    const restartedBank = persistedVms.find((v) => v.id === hdfcBank.id)!;

    expect(restartedCash.name).toBe('Cash Wallet');
    expect(restartedBank.name).toBe('HDFC Salary Account');
    expect(restartedCash.isDefault).toBe(true);
    expect(restartedBank.isDefault).toBe(false);

    // 8. Reject Archiving Last Active Account
    await restartedModule.controller.archiveAccount(hdfcBank.id); // now 1 active account left (Cash)
    await expect(restartedModule.controller.archiveAccount(cashId)).rejects.toThrow(AccountDomainError);
  });
});
