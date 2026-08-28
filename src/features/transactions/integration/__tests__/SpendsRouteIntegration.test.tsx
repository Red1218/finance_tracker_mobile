import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { TransactionsModule } from '../../composition/TransactionsModule';
import { AccountsModule } from '../../../accounts/composition/AccountsModule';
import { CategoriesModule } from '../../../categories/composition/CategoriesModule';
import { InMemoryTransactionRepository } from '../../application/__tests__/InMemoryTransactionRepository';
import { InMemoryAccountRepository } from '../../../accounts/application/__tests__/InMemoryAccountRepository';
import { InMemoryCategoryRepository } from '../../../categories/application/__tests__/InMemoryCategoryRepository';
import { Account, AccountId, AccountName, AccountType, AccountTypeKind, CurrencyCode, OpeningBalance } from '../../../accounts/domain';
import { Category, CategoryId, CategoryName, CategoryKind as CategoryKindDomain } from '../../../categories/domain';
import { TransactionsRouteContainer } from '../TransactionsRouteContainer';

import { generateUUID } from '../../../../core/utils/uuid';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

describe('SpendsRouteIntegration', () => {
  let transactionRepo: InMemoryTransactionRepository;
  let accountRepo: InMemoryAccountRepository;
  let categoryRepo: InMemoryCategoryRepository;
  let transactionsModule: TransactionsModule;
  let accountsModule: AccountsModule;
  let categoriesModule: CategoriesModule;

  beforeEach(() => {
    transactionRepo = new InMemoryTransactionRepository();
    accountRepo = new InMemoryAccountRepository();
    categoryRepo = new InMemoryCategoryRepository();

    // Seed checking and savings accounts
    const accChecking = new Account({
      id: new AccountId('22222222-2222-4222-a222-222222222222'),
      name: new AccountName('Checking Account'),
      type: new AccountType(AccountTypeKind.Bank),
      currencyCode: new CurrencyCode('INR'),
      openingBalance: new OpeningBalance(10000),
      isDefault: true,
    });
    const accSavings = new Account({
      id: new AccountId('33333333-3333-4333-a333-333333333333'),
      name: new AccountName('Savings Account'),
      type: new AccountType(AccountTypeKind.Bank),
      currencyCode: new CurrencyCode('INR'),
      openingBalance: new OpeningBalance(5000),
      isDefault: false,
    });
    accountRepo.seed(accChecking);
    accountRepo.seed(accSavings);

    // Seed Food and Salary categories
    const catFood = new Category({
      id: new CategoryId('44444444-4444-4444-a444-444444444444'),
      name: new CategoryName('Food & Dining'),
      kind: CategoryKindDomain.Expense,
      isSystem: false,
    });
    const catSalary = new Category({
      id: new CategoryId('55555555-5555-4555-a555-555555555555'),
      name: new CategoryName('Salary'),
      kind: CategoryKindDomain.Income,
      isSystem: false,
    });
    categoryRepo.seed(catFood);
    categoryRepo.seed(catSalary);

    transactionsModule = new TransactionsModule(transactionRepo, accountRepo);
    accountsModule = new AccountsModule(accountRepo);
    categoriesModule = new CategoriesModule(categoryRepo);
  });

  it('connects transactions route container to modules and creates expense transaction with use case generated UUID', async () => {
    const controller = transactionsModule.controller;

    // Omitting id so Application Use Case generates UUID via generateUUID()

    const expense = await controller.createExpense({
      accountId: '22222222-2222-4222-a222-222222222222',
      amount: 46546,
      currencyCode: 'INR',
      description: 'gjghjhg',
      categoryId: '44444444-4444-4444-a444-444444444444',
    });

    expect(expense.id).toBeDefined();
    expect(expense.id).toMatch(UUID_REGEX);
    expect(expense.amount).toBe(46546);
    expect(expense.description).toBe('gjghjhg');

    const loaded = await controller.loadTransactionsViewModel({ accountId: '22222222-2222-4222-a222-222222222222' });
    expect(loaded).toHaveLength(1);
    expect(loaded[0].id).toMatch(UUID_REGEX);
  });

  it('supports income creation with use case generated UUID', async () => {
    const controller = transactionsModule.controller;

    // Omitting id so Application Use Case generates UUID via generateUUID()

    const income = await controller.createIncome({
      accountId: '22222222-2222-4222-a222-222222222222',
      amount: 15000,
      currencyCode: 'INR',
      description: 'Monthly Bonus',
      categoryId: '55555555-5555-4555-a555-555555555555',
    });

    expect(income.id).toBeDefined();
    expect(income.id).toMatch(UUID_REGEX);
    expect(income.type).toBe('INCOME');

    const loaded = await controller.loadTransactionsViewModel({ accountId: '22222222-2222-4222-a222-222222222222' });
    expect(loaded).toHaveLength(1);
    expect(loaded[0].type).toBe('INCOME');
  });

  it('supports atomic transfer with valid UUIDs for source, dest, and group', async () => {
    const controller = transactionsModule.controller;
    const sourceId = generateUUID();
    const destId = generateUUID();
    const groupId = generateUUID();

    expect(sourceId).toMatch(UUID_REGEX);
    expect(destId).toMatch(UUID_REGEX);
    expect(groupId).toMatch(UUID_REGEX);

    const { sourceEntry, destEntry } = await controller.executeTransfer({
      sourceTransactionId: sourceId,
      destTransactionId: destId,
      sourceAccountId: '22222222-2222-4222-a222-222222222222',
      destAccountId: '33333333-3333-4333-a333-333333333333',
      amount: 2000,
      currencyCode: 'INR',
      description: 'Transfer to Savings',
      transferGroupId: groupId,
    });

    expect(sourceEntry.id).toMatch(UUID_REGEX);
    expect(destEntry.id).toMatch(UUID_REGEX);
    expect(sourceEntry.transferGroupId).toMatch(UUID_REGEX);
    expect(destEntry.transferGroupId).toMatch(UUID_REGEX);
    expect(sourceEntry.type).toBe('TRANSFER_OUT');
    expect(destEntry.type).toBe('TRANSFER_IN');

    const loadedChk = await controller.loadTransactionsViewModel({ accountId: '22222222-2222-4222-a222-222222222222' });
    const loadedSvg = await controller.loadTransactionsViewModel({ accountId: '33333333-3333-4333-a333-333333333333' });

    expect(loadedChk).toHaveLength(1);
    expect(loadedSvg).toHaveLength(1);
  });
});
