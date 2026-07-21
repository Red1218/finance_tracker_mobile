import { SupabaseClient } from '@supabase/supabase-js';
import { IBudgetRepository } from '../../application/repositories/IBudgetRepository';
import { Budget, BudgetId, BudgetPeriod } from '../../domain';
import { CategoryId } from '../../../categories/domain';
import { BudgetSummaryData } from '../../application/projections/BudgetSummaryData';
import { RepositoryResult, Result, RepositoryError } from '../../../../platform/persistence';
import { BudgetMapper } from '../mappers/BudgetMapper';
import { BudgetSummaryMapper } from '../mappers/BudgetSummaryMapper';
import { BUDGETS_TABLE, EXPENSES_TABLE } from '../database/budgetQueries';

export class SupabaseBudgetRepository implements IBudgetRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  public async create(budget: Budget): Promise<RepositoryResult<void, RepositoryError>> {
    try {
      const record = BudgetMapper.toPersistence(budget);
      const { error } = await this.supabase
        .from(BUDGETS_TABLE)
        .insert(record);

      if (error) {
        return Result.failure(new RepositoryError('UNKNOWN_PERSISTENCE_ERROR', 'Failed to create budget', undefined, error));
      }

      return Result.success(undefined as void);
    } catch (err) {
      return Result.failure(new RepositoryError('UNKNOWN_PERSISTENCE_ERROR', 'Unexpected error creating budget', undefined, err as Error));
    }
  }

  public async update(budget: Budget): Promise<RepositoryResult<void, RepositoryError>> {
    try {
      const record = BudgetMapper.toPersistence(budget);
      const { error } = await this.supabase
        .from(BUDGETS_TABLE)
        .update({
          amount: record.amount,
        })
        .eq('id', record.id);

      if (error) {
        return Result.failure(new RepositoryError('UNKNOWN_PERSISTENCE_ERROR', 'Failed to update budget', undefined, error));
      }

      return Result.success(undefined as void);
    } catch (err) {
      return Result.failure(new RepositoryError('UNKNOWN_PERSISTENCE_ERROR', 'Unexpected error updating budget', undefined, err as Error));
    }
  }

  public async delete(id: BudgetId): Promise<RepositoryResult<void, RepositoryError>> {
    try {
      const { error } = await this.supabase
        .from(BUDGETS_TABLE)
        .delete()
        .eq('id', id.value);

      if (error) {
        return Result.failure(new RepositoryError('UNKNOWN_PERSISTENCE_ERROR', 'Failed to delete budget', undefined, error));
      }

      return Result.success(undefined as void);
    } catch (err) {
      return Result.failure(new RepositoryError('UNKNOWN_PERSISTENCE_ERROR', 'Unexpected error deleting budget', undefined, err as Error));
    }
  }

  public async findById(id: BudgetId): Promise<RepositoryResult<Budget | null, RepositoryError>> {
    try {
      const { data, error } = await this.supabase
        .from(BUDGETS_TABLE)
        .select('*')
        .eq('id', id.value)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return Result.success(null);
        }
        return Result.failure(new RepositoryError('UNKNOWN_PERSISTENCE_ERROR', 'Failed to find budget', undefined, error));
      }

      if (!data) return Result.success(null);

      return Result.success(BudgetMapper.toDomain(data));
    } catch (err) {
      return Result.failure(new RepositoryError('UNKNOWN_PERSISTENCE_ERROR', 'Unexpected error finding budget', undefined, err as Error));
    }
  }

  public async list(): Promise<RepositoryResult<Budget[], RepositoryError>> {
    try {
      const { data, error } = await this.supabase
        .from(BUDGETS_TABLE)
        .select('*')
        .order('start_date', { ascending: false });

      if (error) {
        return Result.failure(new RepositoryError('UNKNOWN_PERSISTENCE_ERROR', 'Failed to list budgets', undefined, error));
      }

      const budgets = data ? data.map(BudgetMapper.toDomain) : [];
      return Result.success(budgets);
    } catch (err) {
      return Result.failure(new RepositoryError('UNKNOWN_PERSISTENCE_ERROR', 'Unexpected error listing budgets', undefined, err as Error));
    }
  }

  public async findOverlappingBudget(
    categoryId: CategoryId | null,
    period: BudgetPeriod,
    startDate: Date,
    endDate: Date
  ): Promise<RepositoryResult<Budget | null, RepositoryError>> {
    try {
      let query = this.supabase
        .from(BUDGETS_TABLE)
        .select('*')
        .eq('period', period)
        .lte('start_date', endDate.toISOString())
        .gte('end_date', startDate.toISOString());

      if (categoryId) {
        query = query.eq('category_id', categoryId.value);
      } else {
        query = query.is('category_id', null);
      }

      const { data, error } = await query.maybeSingle();

      if (error) {
        return Result.failure(new RepositoryError('UNKNOWN_PERSISTENCE_ERROR', 'Failed to check overlapping budget', undefined, error));
      }

      if (!data) return Result.success(null);

      return Result.success(BudgetMapper.toDomain(data));
    } catch (err) {
      return Result.failure(new RepositoryError('UNKNOWN_PERSISTENCE_ERROR', 'Unexpected error checking overlapping budget', undefined, err as Error));
    }
  }

  public async getBudgetSummary(id: BudgetId): Promise<RepositoryResult<BudgetSummaryData | null, RepositoryError>> {
    try {
      const { data: budgetData, error: budgetError } = await this.supabase
        .from(BUDGETS_TABLE)
        .select('*')
        .eq('id', id.value)
        .single();

      if (budgetError) {
        if (budgetError.code === 'PGRST116') {
          return Result.success(null);
        }
        return Result.failure(new RepositoryError('Failed to fetch budget for summary', budgetError));
      }

      if (!budgetData) return Result.success(null);

      let expenseQuery = this.supabase
        .from(EXPENSES_TABLE)
        .select('amount.sum()', { count: 'exact' })
        .gte('date', budgetData.start_date)
        .lte('date', budgetData.end_date);
        
      if (budgetData.category_id) {
        expenseQuery = expenseQuery.eq('category_id', budgetData.category_id);
      }
      
      const { data: expenseData, error: expenseError } = await expenseQuery.single();
      
      if (expenseError && expenseError.code !== 'PGRST116') {
         return Result.failure(new RepositoryError('Failed to aggregate expenses for summary', expenseError));
      }

      let spent = 0;
      if (expenseData && typeof expenseData === 'object' && 'sum' in expenseData && expenseData.sum !== null) {
          spent = Number(expenseData.sum);
      }
      
      const summaryRecord = {
        budget: budgetData,
        spent_amount: spent
      };

      return Result.success(BudgetSummaryMapper.toProjection(summaryRecord));
    } catch (err) {
      return Result.failure(new RepositoryError('UNKNOWN_PERSISTENCE_ERROR', 'Unexpected error generating budget summary', undefined, err as Error));
    }
  }
}
