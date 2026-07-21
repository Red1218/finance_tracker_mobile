import { SupabaseClient } from '@supabase/supabase-js';
import { BaseRepository, RepositoryResult, Result, RepositoryError } from '../../persistence';
import { IExpenseRepository, ExpenseFilter } from '../../../features/expenses/application';
import { Expense, ExpenseId } from '../../../features/expenses/domain';
import { ExpenseMapper } from './ExpenseMapper';
import { ExpenseRow } from '../../../features/expenses/contracts';
import { supabase } from '../../../database';

export class SupabaseExpenseRepository extends BaseRepository implements IExpenseRepository {
  private static readonly TABLE = 'expenses';
  private static readonly COLUMNS = 'id,amount,currency_code,date,note,merchant,payment_method,category_id,created_at,updated_at,deleted_at';

  constructor(client: SupabaseClient = supabase) {
    super(client);
    Object.freeze(this);
  }

  public async getById(id: ExpenseId): Promise<RepositoryResult<Expense | null, RepositoryError>> {
    try {
      const { data, error } = await this.client
        .from(SupabaseExpenseRepository.TABLE)
        .select(SupabaseExpenseRepository.COLUMNS)
        .eq('id', id.value)
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

      return Result.success(ExpenseMapper.toDomain(data as ExpenseRow));
    } catch (e) {
      return this.handleError(e, { operation: 'getById', id: id.value });
    }
  }

  public async list(filter?: ExpenseFilter, limit: number = 50, offset: number = 0): Promise<RepositoryResult<Expense[], RepositoryError>> {
    try {
      let query = this.client
        .from(SupabaseExpenseRepository.TABLE)
        .select(SupabaseExpenseRepository.COLUMNS)
        .order('date', { ascending: false });

      const visibility = filter?.visibility || 'active';
      if (visibility === 'active') {
        query = query.is('deleted_at', null);
      } else if (visibility === 'deleted') {
        query = query.not('deleted_at', 'is', null);
      }

      if (filter) {
        if (filter.categoryId) {
          query = query.eq('category_id', filter.categoryId.value);
        }
        if (filter.paymentMethod) {
          query = query.eq('payment_method', filter.paymentMethod);
        }
        if (filter.startDate !== undefined) {
          query = query.gte('date', ExpenseMapper.toDbDate(filter.startDate));
        }
        if (filter.endDate !== undefined) {
          query = query.lte('date', ExpenseMapper.toDbDate(filter.endDate));
        }
      }

      query = query.range(offset, offset + limit - 1);

      const { data, error } = await query;

      if (error) {
        return this.handleError(error, { operation: 'list', filter, limit, offset });
      }

      const expenses = (data as ExpenseRow[]).map(ExpenseMapper.toDomain);
      return Result.success(expenses);
    } catch (e) {
      return this.handleError(e, { operation: 'list', filter, limit, offset });
    }
  }

  public async create(expense: Expense): Promise<RepositoryResult<void, RepositoryError>> {
    try {
      const row = ExpenseMapper.toPersistence(expense);
      const { error } = await this.client
        .from(SupabaseExpenseRepository.TABLE)
        .insert(row);

      if (error) {
        return this.handleError(error, { operation: 'create', id: expense.id.value });
      }

      return Result.success(undefined);
    } catch (e) {
      return this.handleError(e, { operation: 'create', id: expense.id.value });
    }
  }

  public async update(expense: Expense): Promise<RepositoryResult<void, RepositoryError>> {
    try {
      const row = ExpenseMapper.toPersistence(expense);
      
      const { error } = await this.client
        .from(SupabaseExpenseRepository.TABLE)
        .update(row)
        .eq('id', row.id)
        .is('deleted_at', null);

      if (error) {
        return this.handleError(error, { operation: 'update', id: expense.id.value });
      }

      return Result.success(undefined);
    } catch (e) {
      return this.handleError(e, { operation: 'update', id: expense.id.value });
    }
  }

  public async delete(id: ExpenseId): Promise<RepositoryResult<void, RepositoryError>> {
    try {
      const { error } = await this.client
        .from(SupabaseExpenseRepository.TABLE)
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

  public async restore(id: ExpenseId): Promise<RepositoryResult<void, RepositoryError>> {
    try {
      const { error } = await this.client
        .from(SupabaseExpenseRepository.TABLE)
        .update({ deleted_at: null })
        .eq('id', id.value)
        .not('deleted_at', 'is', null);

      if (error) {
        return this.handleError(error, { operation: 'restore', id: id.value });
      }

      return Result.success(undefined);
    } catch (e) {
      return this.handleError(e, { operation: 'restore', id: id.value });
    }
  }
}
