import { describe, it, expect } from 'vitest';
import { validateTransactionFormFields } from '../validation/validateTransactionForm';

describe('validateTransactionFormFields', () => {
  const validFields = { accountId: 'acc-1', amountStr: '480', description: 'Coffee' };

  it('passes with no errors for a valid expense', () => {
    expect(validateTransactionFormFields(validFields, 'expense')).toEqual({});
  });

  it('requires an account', () => {
    const errors = validateTransactionFormFields({ ...validFields, accountId: '' }, 'expense');
    expect(errors.accountId).toBeTruthy();
  });

  it('requires a positive amount', () => {
    expect(validateTransactionFormFields({ ...validFields, amountStr: '' }, 'expense').amount).toBeTruthy();
    expect(validateTransactionFormFields({ ...validFields, amountStr: '0' }, 'expense').amount).toBeTruthy();
    expect(validateTransactionFormFields({ ...validFields, amountStr: '-5' }, 'expense').amount).toBeTruthy();
    expect(validateTransactionFormFields({ ...validFields, amountStr: 'abc' }, 'expense').amount).toBeTruthy();
  });

  it('requires a non-empty description under 256 characters', () => {
    expect(validateTransactionFormFields({ ...validFields, description: '  ' }, 'expense').description).toBeTruthy();
    expect(
      validateTransactionFormFields({ ...validFields, description: 'x'.repeat(256) }, 'expense').description
    ).toBeTruthy();
  });

  it('requires a destination account for transfers, distinct from the source', () => {
    expect(validateTransactionFormFields(validFields, 'transfer').destAccountId).toBeTruthy();

    expect(
      validateTransactionFormFields({ ...validFields, destAccountId: 'acc-1' }, 'transfer').destAccountId
    ).toBeTruthy();

    expect(
      validateTransactionFormFields({ ...validFields, destAccountId: 'acc-2' }, 'transfer')
    ).toEqual({});
  });

  it('does not require a destination account outside transfer mode', () => {
    expect(validateTransactionFormFields(validFields, 'expense').destAccountId).toBeUndefined();
    expect(validateTransactionFormFields(validFields, 'income').destAccountId).toBeUndefined();
  });
});
