import { SupabaseClient } from '@supabase/supabase-js';
import { BaseRepository, RepositoryResult, Result, RepositoryError } from '../../persistence';
import { ICategoryRepository } from '../../../features/categories/application';
import { Category, CategoryId, CategoryName } from '../../../features/categories/domain';
import { CategoryMapper } from './CategoryMapper';
import { CategoryRow } from '../../../features/categories/contracts';
import { supabase } from '../../../database';

export class SupabaseCategoryRepository extends BaseRepository implements ICategoryRepository {
  private static readonly TABLE = 'categories';

  constructor(client: SupabaseClient = supabase) {
    super(client);
    Object.freeze(this);
  }

  public async getById(id: CategoryId): Promise<RepositoryResult<Category | null, RepositoryError>> {
    try {
      const { data, error } = await this.client
        .from(SupabaseCategoryRepository.TABLE)
        .select('id,name,type,is_archived')
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

      return Result.success(CategoryMapper.toDomain(data as CategoryRow));
    } catch (e) {
      return this.handleError(e, { operation: 'getById', id: id.value });
    }
  }

  public async list(includeArchived?: boolean): Promise<RepositoryResult<Category[], RepositoryError>> {
    try {
      let query = this.client
        .from(SupabaseCategoryRepository.TABLE)
        .select(SupabaseCategoryRepository.COLUMNS)
        .order('name', { ascending: true });
        
      if (!includeArchived) {
        query = query.eq('is_archived', false);
      }
      
      const { data, error } = await query;

      if (error) {
        return this.handleError(error, { operation: 'list' });
      }

      const categories = (data as CategoryRow[]).map(CategoryMapper.toDomain);
      return Result.success(categories);
    } catch (e) {
      return this.handleError(e, { operation: 'list' });
    }
  }

  public async create(category: Category): Promise<RepositoryResult<void, RepositoryError>> {
    try {
      const row = CategoryMapper.toPersistence(category);
      const { error } = await this.client
        .from(SupabaseCategoryRepository.TABLE)
        .insert(row);

      if (error) {
        return this.handleError(error, { operation: 'create', id: category.id.value });
      }

      return Result.success(undefined);
    } catch (e) {
      return this.handleError(e, { operation: 'create', id: category.id.value });
    }
  }

  public async update(category: Category): Promise<RepositoryResult<void, RepositoryError>> {
    try {
      const row = CategoryMapper.toPersistence(category);
      const { error } = await this.client
        .from(SupabaseCategoryRepository.TABLE)
        .update(row)
        .eq('id', row.id);

      if (error) {
        return this.handleError(error, { operation: 'update', id: category.id.value });
      }

      return Result.success(undefined);
    } catch (e) {
      return this.handleError(e, { operation: 'update', id: category.id.value });
    }
  }

  public async archive(id: CategoryId): Promise<RepositoryResult<void, RepositoryError>> {
    try {
      const { error } = await this.client
        .from(SupabaseCategoryRepository.TABLE)
        .update({ is_archived: true })
        .eq('id', id.value);

      if (error) {
        return this.handleError(error, { operation: 'archive', id: id.value });
      }

      return Result.success(undefined);
    } catch (e) {
      return this.handleError(e, { operation: 'archive', id: id.value });
    }
  }

  public async restore(id: CategoryId): Promise<RepositoryResult<void, RepositoryError>> {
    try {
      const { error } = await this.client
        .from(SupabaseCategoryRepository.TABLE)
        .update({ is_archived: false })
        .eq('id', id.value);

      if (error) {
        return this.handleError(error, { operation: 'restore', id: id.value });
      }

      return Result.success(undefined);
    } catch (e) {
      return this.handleError(e, { operation: 'restore', id: id.value });
    }
  }

  public async existsByName(name: CategoryName): Promise<RepositoryResult<boolean, RepositoryError>> {
    try {
      const { error, count } = await this.client
        .from(SupabaseCategoryRepository.TABLE)
        .select('id', { count: 'exact', head: true })
        .eq('name', name.value)
        .eq('is_archived', false);

      if (error) {
        return this.handleError(error, { operation: 'existsByName', name: name.value });
      }

      return Result.success((count ?? 0) > 0);
    } catch (e) {
      return this.handleError(e, { operation: 'existsByName', name: name.value });
    }
  }
}
