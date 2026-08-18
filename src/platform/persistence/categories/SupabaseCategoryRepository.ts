import { SupabaseClient } from '@supabase/supabase-js';
import { BaseRepository } from '../BaseRepository';
import { RepositoryResult, Result } from '../RepositoryResult';
import { RepositoryError } from '../RepositoryError';
import { ICategoryRepository } from '../../../features/categories/application/repositories/ICategoryRepository';
import { Category, CategoryId, CategoryName, CategoryKind } from '../../../features/categories/domain';
import { CategoryMapper } from './CategoryMapper';
import { CategoryRow } from '../../../features/categories/contracts';
import { supabase } from '../../../database';

export class SupabaseCategoryRepository extends BaseRepository implements ICategoryRepository {
  private static readonly TABLE = 'categories';
  private static readonly COLUMNS = 'id,name,kind,is_system,archived_at,color_hex,icon_name';

  constructor(client: SupabaseClient = supabase) {
    super(client);
    Object.freeze(this);
  }

  public async getById(id: CategoryId): Promise<RepositoryResult<Category | null, RepositoryError>> {
    try {
      const { data, error } = await this.client
        .from(SupabaseCategoryRepository.TABLE)
        .select(SupabaseCategoryRepository.COLUMNS)
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

      return Result.success(CategoryMapper.toDomain(data as unknown as CategoryRow));
    } catch (e) {
      return this.handleError(e, { operation: 'getById', id: id.value });
    }
  }

  public async list(includeArchived?: boolean, kind?: CategoryKind): Promise<RepositoryResult<Category[], RepositoryError>> {
    return this.getAll(kind, includeArchived);
  }

  public async getAll(kind?: CategoryKind, includeArchived?: boolean): Promise<RepositoryResult<Category[], RepositoryError>> {
    try {
      let query = this.client
        .from(SupabaseCategoryRepository.TABLE)
        .select(SupabaseCategoryRepository.COLUMNS)
        .order('name', { ascending: true });
        
      if (!includeArchived) {
        query = query.is('archived_at', null);
      }

      if (kind) {
        query = query.eq('kind', kind === CategoryKind.Income ? 'income' : 'expense');
      }
      
      const { data, error } = await query;

      if (error) {
        return this.handleError(error, { operation: 'getAll' });
      }

      const categories = (data as unknown as CategoryRow[]).map(CategoryMapper.toDomain);
      return Result.success(categories);
    } catch (e) {
      return this.handleError(e, { operation: 'getAll' });
    }
  }

  public async save(category: Category): Promise<RepositoryResult<void, RepositoryError>> {
    try {
      const { data: { user } } = await this.client.auth.getUser();
      const row = {
        ...CategoryMapper.toPersistence(category),
        ...(user?.id ? { user_id: user.id } : {}),
      };
      const { error } = await this.client
        .from(SupabaseCategoryRepository.TABLE)
        .upsert(row);

      if (error) {
        return this.handleError(error, { operation: 'save', id: category.id.value });
      }

      return Result.success(undefined);
    } catch (e) {
      return this.handleError(e, { operation: 'save', id: category.id.value });
    }
  }

  public async create(category: Category): Promise<RepositoryResult<void, RepositoryError>> {
    return this.save(category);
  }

  public async update(category: Category): Promise<RepositoryResult<void, RepositoryError>> {
    return this.save(category);
  }

  public async archive(id: CategoryId, archivedAt: Date = new Date()): Promise<RepositoryResult<void, RepositoryError>> {
    try {
      const { error } = await this.client
        .from(SupabaseCategoryRepository.TABLE)
        .update({ archived_at: archivedAt.toISOString() })
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
        .update({ archived_at: null })
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
        .is('archived_at', null);

      if (error) {
        return this.handleError(error, { operation: 'existsByName', name: name.value });
      }

      return Result.success((count ?? 0) > 0);
    } catch (e) {
      return this.handleError(e, { operation: 'existsByName', name: name.value });
    }
  }

  public async existsByNameAndKind(
    name: string,
    kind: CategoryKind,
    excludeCategoryId?: string
  ): Promise<RepositoryResult<boolean, RepositoryError>> {
    try {
      let query = this.client
        .from(SupabaseCategoryRepository.TABLE)
        .select('id', { count: 'exact', head: true })
        .ilike('name', name.trim())
        .eq('kind', kind === CategoryKind.Income ? 'income' : 'expense')
        .is('archived_at', null);

      if (excludeCategoryId) {
        query = query.neq('id', excludeCategoryId);
      }

      const { error, count } = await query;

      if (error) {
        return this.handleError(error, { operation: 'existsByNameAndKind', name });
      }

      return Result.success((count ?? 0) > 0);
    } catch (e) {
      return this.handleError(e, { operation: 'existsByNameAndKind', name });
    }
  }
}
