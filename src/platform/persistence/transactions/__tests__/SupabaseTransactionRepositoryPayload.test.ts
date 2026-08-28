import { describe, it, expect, vi } from 'vitest';
import { SupabaseTransactionRepository } from '../SupabaseTransactionRepository';
import { Transaction, TransactionId, Money, TransactionDescription } from '../../../../features/transactions/domain';
import { AccountId, CurrencyCode } from '../../../../features/accounts/domain';

describe('SupabaseTransactionRepository Payload Verification', () => {
  it('passes upsert payload containing only valid database columns and no invalid properties', async () => {
    let capturedPayload: any = null;

    const mockSupabaseClient: any = {
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'usr-test-999' } } }),
      },
      from: vi.fn().mockImplementation((table: string) => {
        if (table === 'transactions') {
          return {
            upsert: vi.fn().mockImplementation((payload: any) => {
              capturedPayload = payload;
              return Promise.resolve({ error: null });
            }),
          };
        }
        return {};
      }),
    };

    const repository = new SupabaseTransactionRepository(mockSupabaseClient);

    const expense = Transaction.createExpense({
      id: new TransactionId('11111111-1111-4111-a111-111111111111'),
      accountId: new AccountId('22222222-2222-4222-a222-222222222222'),
      amount: new Money(100),
      currencyCode: new CurrencyCode('INR'),
      description: new TransactionDescription('Dinner'),
    });

    const result = await repository.save(expense);

    expect(result.success).toBe(true);
    expect(capturedPayload).not.toBeNull();

    // Verify valid canonical DB columns exist in payload
    expect(capturedPayload).toHaveProperty('id', '11111111-1111-4111-a111-111111111111');
    expect(capturedPayload).toHaveProperty('user_id', 'usr-test-999');
    expect(capturedPayload).toHaveProperty('account_id', '22222222-2222-4222-a222-222222222222');
    expect(capturedPayload).toHaveProperty('type', 'EXPENSE');
    expect(capturedPayload).toHaveProperty('amount', 100);
    expect(capturedPayload).toHaveProperty('currency_code', 'INR');
    expect(capturedPayload).toHaveProperty('description', 'Dinner');
    expect(capturedPayload).toHaveProperty('occurred_at');
    expect(capturedPayload).toHaveProperty('created_at');
    expect(capturedPayload).toHaveProperty('updated_at');

    // Verify invalid properties that cause PGRST204 errors are strictly absent
    expect(capturedPayload).not.toHaveProperty('transaction_date');
    expect(capturedPayload).not.toHaveProperty('voided_at');
  });
});
