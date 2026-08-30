import { describe, it, expect, vi } from 'vitest';
import { SupabaseClient } from '@supabase/supabase-js';
import { SupabaseDashboardRepository } from '../../repositories/SupabaseDashboardRepository';

describe('SupabaseDashboardRepository Data Contract Tests', () => {
  it('queries transactions without restricting to EXPENSE type only', async () => {
    const mockSelect = vi.fn().mockReturnThis();
    const mockEqUser = vi.fn().mockReturnThis();
    const mockGte = vi.fn().mockReturnThis();
    const mockLte = vi.fn().mockResolvedValue({
      data: [
        { id: 'tx-1', amount: 30000, currency_code: 'INR', occurred_at: '2026-08-01', type: 'INCOME', description: 'Salary' },
        { id: 'tx-2', amount: 5000, currency_code: 'INR', occurred_at: '2026-08-02', type: 'EXPENSE', description: 'Rent' },
      ],
      error: null,
    });

    const mockSupabaseClient = {
      from: vi.fn((table: string) => {
        if (table === 'transactions') {
          return {
            select: mockSelect,
            eq: mockEqUser,
            gte: mockGte,
            lte: mockLte,
          };
        }
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          or: vi.fn().mockResolvedValue({ data: [], error: null }),
          is: vi.fn().mockResolvedValue({ data: [], error: null }),
        };
      }),
    } as unknown as SupabaseClient;

    const repository = new SupabaseDashboardRepository(mockSupabaseClient);
    const snapshot = await repository.getDashboardData('user-123', 'CurrentMonth');

    expect(snapshot.transactions).toHaveLength(2);
    expect(snapshot.transactions[0].direction).toBe('Income');
    expect(snapshot.transactions[1].direction).toBe('Expense');
  });

  it('queries categories including both user categories and system categories', async () => {
    const mockOr = vi.fn().mockResolvedValue({
      data: [
        { id: 'cat-user', name: 'Custom User Category' },
        { id: 'cat-sys', name: 'Transportation' },
      ],
      error: null,
    });

    const mockSupabaseClient = {
      from: vi.fn((table: string) => {
        if (table === 'categories') {
          return {
            select: vi.fn().mockReturnThis(),
            or: mockOr,
          };
        }
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          gte: vi.fn().mockReturnThis(),
          lte: vi.fn().mockResolvedValue({ data: [], error: null }),
          is: vi.fn().mockResolvedValue({ data: [], error: null }),
        };
      }),
    } as unknown as SupabaseClient;

    const repository = new SupabaseDashboardRepository(mockSupabaseClient);
    const snapshot = await repository.getDashboardData('user-123', 'CurrentMonth');

    expect(mockOr).toHaveBeenCalledWith('user_id.eq.user-123,is_system.eq.true');
    expect(snapshot.categories).toHaveLength(2);
    expect(snapshot.categories[0].name).toBe('Custom User Category');
    expect(snapshot.categories[1].name).toBe('Transportation');
  });
});
