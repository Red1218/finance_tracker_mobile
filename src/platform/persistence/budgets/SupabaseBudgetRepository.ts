import { SupabaseClient } from '@supabase/supabase-js';
import { BaseRepository } from '../BaseRepository';
import { RepositoryResult, Result } from '../RepositoryResult';
import { RepositoryError } from '../RepositoryError';
import { IBudgetRepository } from '../../../features/budgets/application/repositories/IBudgetRepository';
import { Budget, BudgetId, BudgetPeriod } from '../../../features/budgets/domain';
import { CategoryId } from '../../../features/categories/domain';
import { BudgetMapper } from './BudgetMapper';
import { BudgetRow } from '../../../features/budgets/contracts/BudgetRow';
import { supabase } from '../../../database';

export class SupabaseBudgetRepository extends BaseRepository implements IBudgetRepository {
  private static readonly TABLE = 'budgets';
  private static readonly COLUMNS =
    'id,user_id,category_id,amount,currency_code,period_kind,start_date,end_date,created_at,updated_at,archived_at';


  constructor(client: SupabaseClient = supabase) {
    super(client);
    Object.freeze(this);
  }

  public async getById(id: BudgetId): Promise<RepositoryResult<Budget | null, RepositoryError>> {
    return this.findById(id);
  }

  public async findById(id: BudgetId): Promise<RepositoryResult<Budget | null, RepositoryError>> {
    try {
      const { data, error } = await this.client
        .from(SupabaseBudgetRepository.TABLE)
        .select(SupabaseBudgetRepository.COLUMNS)
        .eq('id', id.value)
        .maybeSingle();

      if (error) {
        return this.handleError(error, { operation: 'findById', id: id.value });
      }

      if (!data) {
        return Result.success(null);
      }

      return Result.success(BudgetMapper.toDomain(data as BudgetRow));
    } catch (e) {
      return this.handleError(e, { operation: 'findById', id: id.value });
    }
  }

  public async list(
    includeArchived: boolean = false,
    categoryId?: string | null
  ): Promise<RepositoryResult<Budget[], RepositoryError>> {
    try {
      let query = this.client
        .from(SupabaseBudgetRepository.TABLE)
        .select(SupabaseBudgetRepository.COLUMNS);

      if (!includeArchived) {
        query = query.is('archived_at', null);
      }

      if (categoryId !== undefined) {
        if (categoryId === null) {
          query = query.is('category_id', null);
        } else {
          query = query.eq('category_id', categoryId);
        }
      }

      query = query.order('start_date', { ascending: false });

      const { data, error } = await query;

      if (error) {
        return this.handleError(error, { operation: 'list' });
      }

      const domainBudgets = (data as BudgetRow[]).map(BudgetMapper.toDomain);
      return Result.success(domainBudgets);
    } catch (e) {
      return this.handleError(e, { operation: 'list' });
    }
  }

  public async save(budget: Budget): Promise<RepositoryResult<void, RepositoryError>> {
    try {
      const userRes = await this.client.auth.getUser();
      const userId = userRes.data.user?.id ?? 'system';
      const row = BudgetMapper.toPersistence(budget, userId);

      const { error } = await this.client
        .from(SupabaseBudgetRepository.TABLE)
        .upsert(row, { onConflict: 'id' });

      if (error) {
        return this.handleError(error, { operation: 'save', id: budget.id.value });
      }

      return Result.success(undefined);
    } catch (e) {
      return this.handleError(e, { operation: 'save', id: budget.id.value });
    }
  }

  public async create(budget: Budget): Promise<RepositoryResult<void, RepositoryError>> {
    return this.save(budget);
  }

  public async update(budget: Budget): Promise<RepositoryResult<void, RepositoryError>> {
    return this.save(budget);
  }

  public async delete(id: BudgetId): Promise<RepositoryResult<void, RepositoryError>> {
    return this.archive(id);
  }

  public async archive(id: BudgetId, archivedAt: Date = new Date()): Promise<RepositoryResult<void, RepositoryError>> {
    try {
      const { error } = await this.client
        .from(SupabaseBudgetRepository.TABLE)
        .update({ archived_at: archivedAt.toISOString(), updated_at: new Date().toISOString() })
        .eq('id', id.value);

      if (error) {
        return this.handleError(error, { operation: 'archive', id: id.value });
      }

      return Result.success(undefined);
    } catch (e) {
      return this.handleError(e, { operation: 'archive', id: id.value });
    }
  }

  public async restore(id: BudgetId): Promise<RepositoryResult<void, RepositoryError>> {
    try {
      const { error } = await this.client
        .from(SupabaseBudgetRepository.TABLE)
        .update({ archived_at: null, updated_at: new Date().toISOString() })
        .eq('id', id.value);

      if (error) {
        return this.handleError(error, { operation: 'restore', id: id.value });
      }

      return Result.success(undefined);
    } catch (e) {
      return this.handleError(e, { operation: 'restore', id: id.value });
    }
  }

  public async findOverlappingBudget(
    categoryId: CategoryId | null,
    period: BudgetPeriod,
    excludeBudgetId?: string
  ): Promise<RepositoryResult<Budget | null, RepositoryError>> {
    try {
      let query = this.client
        .from(SupabaseBudgetRepository.TABLE)
        .select(SupabaseBudgetRepository.COLUMNS)
        .is('archived_at', null);

      if (categoryId === null) {
        query = query.is('category_id', null);
      } else {
        query = query.eq('category_id', categoryId.value);
      }

      if (excludeBudgetId) {
        query = query.neq('id', excludeBudgetId);
      }

      const { data, error } = await query;

      if (error) {
        return this.handleError(error, { operation: 'findOverlappingBudget' });
      }

      const activeBudgets = (data as BudgetRow[]).map(BudgetMapper.toDomain);
      const overlapping = activeBudgets.find((b) => b.period.intersects(period));

      return Result.success(overlapping ?? null);
    } catch (e) {
      return this.handleError(e, { operation: 'findOverlappingBudget' });
    }
  }
}
