import { describe, it, expect } from 'vitest';
import { ExpenseMapper } from '../ExpenseMapper';
import { ExpenseRow } from '../../../../features/expenses/contracts';
import { Expense } from '../../../../features/expenses/domain/entities/Expense';
import { CategoryId } from '../../../../features/categories/domain';
import { ExpenseId, ExpenseAmount, CurrencyCode, ExpenseDate, PaymentMethod, PaymentMethodType } from '../../../../features/expenses/domain';
import { v4 as uuidv4 } from 'uuid';

describe('ExpenseMapper', () => {
  it('should map from persistence to domain', () => {
    const row: ExpenseRow = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      category_id: '550e8400-e29b-41d4-a716-446655440000',
      amount: 1500,
      currency_code: 'INR',
      date: new Date(1672531200000).toISOString(),
      payment_method: PaymentMethodType.UPI,
      note: 'Test note',
      merchant: 'Test merchant',
      created_at: '2023-01-01T00:00:00.000Z',
      updated_at: '2023-01-01T00:00:00.000Z',
      deleted_at: null,
    };

    const domain = ExpenseMapper.toDomain(row);

    expect(domain).toBeInstanceOf(Expense);
    expect(domain.id.value).toBe('550e8400-e29b-41d4-a716-446655440000');
    expect(domain.categoryId.value).toBe('550e8400-e29b-41d4-a716-446655440000');
    expect(domain.amount.value).toBe(1500);
    expect(domain.currency.value).toBe('INR');
    expect(domain.date.value).toBe(1672531200000);
    expect(domain.paymentMethod.value).toBe(PaymentMethodType.UPI);
    expect(domain.note?.value).toBe('Test note');
    expect(domain.merchant?.value).toBe('Test merchant');
  });

  it('should map from domain to persistence', () => {
    const entity = new Expense({
      id: new ExpenseId('550e8400-e29b-41d4-a716-446655440000'),
      categoryId: new CategoryId('550e8400-e29b-41d4-a716-446655440000'),
      amount: new ExpenseAmount(2500),
      currency: new CurrencyCode('INR'),
      date: new ExpenseDate(1672531200000),
      paymentMethod: new PaymentMethod(PaymentMethodType.UPI),
    });

    const persistence = ExpenseMapper.toPersistence(entity);

    expect(persistence.id).toBe('550e8400-e29b-41d4-a716-446655440000');
    expect(persistence.category_id).toBe('550e8400-e29b-41d4-a716-446655440000');
    expect(persistence.amount).toBe(2500);
    expect(persistence.currency_code).toBe('INR');
    expect(persistence.date).toBe('2023-01-01T00:00:00.000Z');
    expect(persistence.payment_method).toBe(PaymentMethodType.UPI);
    expect(persistence.note).toBeNull();
    expect(persistence.merchant).toBeNull();
  });

  it('should format db date correctly', () => {
    const timestamp = 1672531200000;
    const dbDate = ExpenseMapper.toDbDate(timestamp);
    expect(dbDate).toBe('2023-01-01T00:00:00.000Z');
  });
});
