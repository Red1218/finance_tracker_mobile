import { describe, it, expect, vi } from 'vitest';
import { SupabaseCategoryRepository } from '../SupabaseCategoryRepository';
import { Category, CategoryId, CategoryName, CategoryKind } from '../../../../features/categories/domain';

const validCategoryId = '123e4567-e89b-12d3-a456-426614174000';

function createExpenseCategory(): Category {
  return new Category({
    id: new CategoryId(validCategoryId),
    name: new CategoryName('Groceries'),
    kind: CategoryKind.Expense,
    isSystem: false,
    archivedAt: null,
  });
}

function createIncomeCategory(): Category {
  return new Category({
    id: new CategoryId(validCategoryId),
    name: new CategoryName('Salary'),
    kind: CategoryKind.Income,
    isSystem: false,
    archivedAt: null,
  });
}

/**
 * Builds a chainable, thenable Supabase query-builder mock: every chain method
 * returns the same object, and `await`-ing it resolves via `then` — mirroring
 * how the real supabase-js PostgrestFilterBuilder behaves.
 */
function createQueryBuilder(resolvedValue: { data?: unknown; error?: unknown; count?: number }) {
  const builder: any = {
    select: vi.fn(),
    eq: vi.fn(),
    neq: vi.fn(),
    is: vi.fn(),
    ilike: vi.fn(),
    order: vi.fn(),
    upsert: vi.fn().mockResolvedValue({ error: resolvedValue.error ?? null }),
    single: vi.fn().mockResolvedValue({ data: resolvedValue.data ?? null, error: resolvedValue.error ?? null }),
    then: (resolve: (value: unknown) => unknown) => resolve(resolvedValue),
  };
  builder.select.mockReturnValue(builder);
  builder.eq.mockReturnValue(builder);
  builder.neq.mockReturnValue(builder);
  builder.is.mockReturnValue(builder);
  builder.ilike.mockReturnValue(builder);
  builder.order.mockReturnValue(builder);
  return builder;
}

function createMockClient(resolvedValue: { data?: unknown; error?: unknown; count?: number }) {
  const queryBuilder = createQueryBuilder(resolvedValue);
  const client: any = {
    from: vi.fn().mockReturnValue(queryBuilder),
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'usr-1' } } }),
    },
  };
  return { client, queryBuilder };
}

describe('SupabaseCategoryRepository — category_kind persistence contract', () => {
  describe('save (upsert payload)', () => {
    it('sends "EXPENSE" (not "expense") for CategoryKind.Expense', async () => {
      const { client, queryBuilder } = createMockClient({ error: null });
      const repository = new SupabaseCategoryRepository(client);

      const result = await repository.save(createExpenseCategory());

      expect(result.success).toBe(true);
      expect(client.from).toHaveBeenCalledWith('categories');
      expect(queryBuilder.upsert).toHaveBeenCalledWith(
        expect.objectContaining({ kind: 'EXPENSE' })
      );
    });

    it('sends "INCOME" (not "income") for CategoryKind.Income', async () => {
      const { client, queryBuilder } = createMockClient({ error: null });
      const repository = new SupabaseCategoryRepository(client);

      const result = await repository.save(createIncomeCategory());

      expect(result.success).toBe(true);
      expect(queryBuilder.upsert).toHaveBeenCalledWith(
        expect.objectContaining({ kind: 'INCOME' })
      );
    });
  });

  describe('getAll (kind filter)', () => {
    it('filters with "EXPENSE" for CategoryKind.Expense', async () => {
      const { client, queryBuilder } = createMockClient({ data: [] });
      const repository = new SupabaseCategoryRepository(client);

      await repository.getAll(CategoryKind.Expense);

      expect(queryBuilder.eq).toHaveBeenCalledWith('kind', 'EXPENSE');
    });

    it('filters with "INCOME" for CategoryKind.Income', async () => {
      const { client, queryBuilder } = createMockClient({ data: [] });
      const repository = new SupabaseCategoryRepository(client);

      await repository.getAll(CategoryKind.Income);

      expect(queryBuilder.eq).toHaveBeenCalledWith('kind', 'INCOME');
    });
  });

  describe('existsByNameAndKind (kind filter)', () => {
    it('filters with "EXPENSE" for CategoryKind.Expense', async () => {
      const { client, queryBuilder } = createMockClient({ count: 0 });
      const repository = new SupabaseCategoryRepository(client);

      await repository.existsByNameAndKind('Groceries', CategoryKind.Expense);

      expect(queryBuilder.eq).toHaveBeenCalledWith('kind', 'EXPENSE');
    });

    it('filters with "INCOME" for CategoryKind.Income', async () => {
      const { client, queryBuilder } = createMockClient({ count: 0 });
      const repository = new SupabaseCategoryRepository(client);

      await repository.existsByNameAndKind('Salary', CategoryKind.Income);

      expect(queryBuilder.eq).toHaveBeenCalledWith('kind', 'INCOME');
    });
  });

  describe('getById (row -> domain kind mapping)', () => {
    it('maps a database row with kind "INCOME" to CategoryKind.Income', async () => {
      const { client } = createMockClient({
        data: {
          id: validCategoryId,
          name: 'Salary',
          kind: 'INCOME',
          is_system: false,
          archived_at: null,
        },
      });
      const repository = new SupabaseCategoryRepository(client);

      const result = await repository.getById(new CategoryId(validCategoryId));

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data?.kind).toBe(CategoryKind.Income);
      }
    });

    it('maps a database row with kind "EXPENSE" to CategoryKind.Expense', async () => {
      const { client } = createMockClient({
        data: {
          id: validCategoryId,
          name: 'Groceries',
          kind: 'EXPENSE',
          is_system: false,
          archived_at: null,
        },
      });
      const repository = new SupabaseCategoryRepository(client);

      const result = await repository.getById(new CategoryId(validCategoryId));

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data?.kind).toBe(CategoryKind.Expense);
      }
    });
  });
});
