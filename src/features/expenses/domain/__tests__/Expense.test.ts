import { describe, it, expect } from 'vitest';
import { Expense } from '../entities/Expense';
import { ExpenseId } from '../value-objects/ExpenseId';
import { CategoryId } from '../../../categories/domain';
import { ExpenseAmount } from '../value-objects/ExpenseAmount';
import { CurrencyCode } from '../value-objects/CurrencyCode';
import { ExpenseDate } from '../value-objects/ExpenseDate';
import { PaymentMethod } from '../value-objects/PaymentMethod';
import { ExpenseNote } from '../value-objects/ExpenseNote';
import { MerchantName } from '../value-objects/MerchantName';
import { v4 as uuidv4 } from 'uuid';

describe('Expense Entity', () => {
  const defaultProps = {
    id: new ExpenseId(uuidv4()),
    categoryId: new CategoryId(uuidv4()),
    amount: new ExpenseAmount(1500),
    currency: new CurrencyCode('INR'),
    date: new ExpenseDate(Date.now()),
    paymentMethod: new PaymentMethod('UPI'),
  };

  it('should create an expense entity with required properties', () => {
    const expense = new Expense(defaultProps);
    expect(expense.amount.value).toBe(1500);
    expect(expense.currency.value).toBe('INR');
  });

  it('should create an expense entity with optional properties', () => {
    const expense = new Expense({
      ...defaultProps,
      note: new ExpenseNote('Lunch'),
      merchant: new MerchantName('Cafe'),
    });
    expect(expense.note?.value).toBe('Lunch');
    expect(expense.merchant?.value).toBe('Cafe');
  });

  it('should update properties correctly', () => {
    const expense = new Expense(defaultProps);
    const newAmount = new ExpenseAmount(2000);
    const newNote = new ExpenseNote('Updated Note');

    const updated = expense.update({
      amount: newAmount,
      note: newNote,
    });

    expect(updated.amount.value).toBe(2000);
    expect(updated.note?.value).toBe('Updated Note');
  });

  it('should unset optional properties explicitly', () => {
    const expense = new Expense({
      ...defaultProps,
      note: new ExpenseNote('Lunch'),
    });

    expect(expense.note).toBeDefined();

    const updated = expense.update({ note: undefined });

    expect(updated.note).toBeUndefined();
  });
});
