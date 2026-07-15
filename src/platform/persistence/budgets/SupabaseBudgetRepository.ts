import { SupabaseClient } from '@supabase/supabase-js';
import { BaseRepository, RepositoryResult, Result, RepositoryError } from '../../persistence';
import { IBudgetRepository, BudgetFilter } from '../../../features/budgets/application';
import { Budget, BudgetId } from '../../../features/budgets/domain';
import { BudgetMapper } from './BudgetMapper';
import { BudgetRow } from '../../../features/budgets/contracts';
import { supabase } from '../../../database';

export class SupabaseBudgetRepository extends BaseRepository implements IBudgetRepository {
  private static readonly TABLE = 'budgets';
  private static readonly COLUMNS = 'id,category_id,amount,currency_code,period,status,created_at,updated_at,deleted_at';

  constructor(client: SupabaseClient = supabase) {
    super(client);
    Object.freeze(this);
  }

  public async getById(id: BudgetId): Promise<RepositoryResult<Budget | null, RepositoryError>> {
    try {
      const { data, error } = await this.client
        .from(SupabaseBudgetRepository.TABLE)
        .select(SupabaseBudgetRepository.COLUMNS)
        .eq('id', id.value)
        .is('deleted_at', null)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return Result.success(null);
        }
        return this.handleError(error, { operation: 'getById', id: id.value });
      }

      if (!data) {
        return Result.success(null);
      }

      return Result.success(BudgetMapper.toDomain(data as BudgetRow));
    } catch (e) {
      return this.handleError(e, { operation: 'getById', id: id.value });
    }
  }

  public async list(filter?: BudgetFilter): Promise<RepositoryResult<Budget[], RepositoryError>> {
    try {
      let query = this.client
        .from(SupabaseBudgetRepository.TABLE)
        .select(SupabaseBudgetRepository.COLUMNS)
        .order('period', { ascending: false });

      if (filter) {
        if (!filter.includeDeleted) {
          query = query.is('deleted_at', null);
        }
        if (filter.categoryId !== undefined) {
          if (filter.categoryId === null) {
            query = query.is('category_id', null);
          } else {
            query = query.eq('category_id', filter.categoryId.value);
          }
        }
        if (filter.period) {
          query = query.eq('period', filter.period.value);
        }
        if (filter.status) {
          query = query.eq('status', filter.status.value);
        }
      } else {
        query = query.is('deleted_at', null);
      }

      const { data, error } = await query;

      if (error) {
        return this.handleError(error, { operation: 'list', filter });
      }

      const budgets = (data as BudgetRow[]).map(BudgetMapper.toDomain);
      return Result.success(budgets);
    } catch (e) {
      return this.handleError(e, { operation: 'list', filter });
    }
  }

  public async create(budget: Budget): Promise<RepositoryResult<void, RepositoryError>> {
    try {
      const row = BudgetMapper.toPersistence(budget);
      const { error } = await this.client
        .from(SupabaseBudgetRepository.TABLE)
        .insert(row);

      if (error) {
        return this.handleError(error, { operation: 'create', id: budget.id.value });
      }

      return Result.success(undefined);
    } catch (e) {
      return this.handleError(e, { operation: 'create', id: budget.id.value });
    }
  }

  public async update(budget: Budget): Promise<RepositoryResult<void, RepositoryError>> {
    try {
      const row = BudgetMapper.toPersistence(budget);
      
      const { error } = await this.client
        .from(SupabaseBudgetRepository.TABLE)
        .update(row)
        .eq('id', row.id)
        .is('deleted_at', null);

      if (error) {
        return this.handleError(error, { operation: 'update', id: budget.id.value });
      }

      return Result.success(undefined);
    } catch (e) {
      return this.handleError(e, { operation: 'update', id: budget.id.value });
    }
  }

  public async delete(id: BudgetId): Promise<RepositoryResult<void, RepositoryError>> {
    try {
      const { error } = await this.client
        .from(SupabaseBudgetRepository.TABLE)
        .update({ deleted_at: 'now()' })
        .eq('id', id.value)
        .is('deleted_at', null);

      if (error) {
        return this.handleError(error, { operation: 'delete', id: id.value });
      }

      return Result.success(undefined);
    } catch (e) {
      return this.handleError(e, { operation: 'delete', id: id.value });
    }
  }
}
