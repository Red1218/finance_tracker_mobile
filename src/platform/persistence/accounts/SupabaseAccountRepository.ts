import { SupabaseClient } from '@supabase/supabase-js';
import { BaseRepository } from '../BaseRepository';
import { RepositoryResult, Result } from '../RepositoryResult';
import { RepositoryError } from '../RepositoryError';
import { IAccountRepository } from '../../../features/accounts/application/repositories/IAccountRepository';
import { Account, AccountId } from '../../../features/accounts/domain';
import { AccountMapper } from './AccountMapper';
import { AccountRow } from '../../../features/accounts/contracts';
import { supabase } from '../../../database';

export class SupabaseAccountRepository extends BaseRepository implements IAccountRepository {
  private static readonly TABLE = 'accounts';
  private static readonly COLUMNS =
    'id,user_id,name,type,currency_code,opening_balance,is_default,archived_at,created_at,updated_at';

  constructor(client: SupabaseClient = supabase) {
    super(client);
    Object.freeze(this);
  }

  public async getById(id: AccountId): Promise<RepositoryResult<Account | null, RepositoryError>> {
    try {
      const { data, error } = await this.client
        .from(SupabaseAccountRepository.TABLE)
        .select(SupabaseAccountRepository.COLUMNS)
        .eq('id', id.value)
        .maybeSingle();

      if (error) {
        return this.handleError(error, { operation: 'getById', id: id.value });
      }

      if (!data) {
        return Result.success(null);
      }

      return Result.success(AccountMapper.toDomain(data as AccountRow));
    } catch (e) {
      return this.handleError(e, { operation: 'getById', id: id.value });
    }
  }

  public async getAll(includeArchived = false): Promise<RepositoryResult<Account[], RepositoryError>> {
    try {
      let query = this.client
        .from(SupabaseAccountRepository.TABLE)
        .select(SupabaseAccountRepository.COLUMNS)
        .order('created_at', { ascending: true })
        .order('id', { ascending: true });

      if (!includeArchived) {
        query = query.is('archived_at', null);
      }

      const { data, error } = await query;

      if (error) {
        return this.handleError(error, { operation: 'getAll', includeArchived });
      }

      const domainAccounts = (data as AccountRow[]).map(AccountMapper.toDomain);
      return Result.success(domainAccounts);
    } catch (e) {
      return this.handleError(e, { operation: 'getAll', includeArchived });
    }
  }

  public async getDefault(): Promise<RepositoryResult<Account | null, RepositoryError>> {
    try {
      const { data, error } = await this.client
        .from(SupabaseAccountRepository.TABLE)
        .select(SupabaseAccountRepository.COLUMNS)
        .eq('is_default', true)
        .is('archived_at', null)
        .maybeSingle();

      if (error) {
        return this.handleError(error, { operation: 'getDefault' });
      }

      if (!data) {
        return Result.success(null);
      }

      return Result.success(AccountMapper.toDomain(data as AccountRow));
    } catch (e) {
      return this.handleError(e, { operation: 'getDefault' });
    }
  }

  public async save(account: Account): Promise<RepositoryResult<void, RepositoryError>> {
    try {
      const row = AccountMapper.toPersistence(account);
      const { error } = await this.client
        .from(SupabaseAccountRepository.TABLE)
        .upsert(row, { onConflict: 'id' });

      if (error) {
        return this.handleError(error, { operation: 'save', id: account.id.value });
      }

      return Result.success(undefined);
    } catch (e) {
      return this.handleError(e, { operation: 'save', id: account.id.value });
    }
  }

  public async setDefaultAccount(accountId: AccountId): Promise<RepositoryResult<void, RepositoryError>> {
    try {
      // Atomic update 1: Unset current default
      await this.client
        .from(SupabaseAccountRepository.TABLE)
        .update({ is_default: false })
        .eq('is_default', true);

      // Atomic update 2: Set target account default
      const { error } = await this.client
        .from(SupabaseAccountRepository.TABLE)
        .update({ is_default: true, updated_at: new Date().toISOString() })
        .eq('id', accountId.value);

      if (error) {
        return this.handleError(error, { operation: 'setDefaultAccount', id: accountId.value });
      }

      return Result.success(undefined);
    } catch (e) {
      return this.handleError(e, { operation: 'setDefaultAccount', id: accountId.value });
    }
  }

  public async archiveAccount(accountId: AccountId, nextDefaultAccountId?: AccountId): Promise<RepositoryResult<void, RepositoryError>> {
    try {
      const nowStr = new Date().toISOString();
      const { error } = await this.client
        .from(SupabaseAccountRepository.TABLE)
        .update({ archived_at: nowStr, is_default: false, updated_at: nowStr })
        .eq('id', accountId.value);

      if (error) {
        return this.handleError(error, { operation: 'archiveAccount', id: accountId.value });
      }

      if (nextDefaultAccountId) {
        await this.client
          .from(SupabaseAccountRepository.TABLE)
          .update({ is_default: true, updated_at: nowStr })
          .eq('id', nextDefaultAccountId.value);
      }

      return Result.success(undefined);
    } catch (e) {
      return this.handleError(e, { operation: 'archiveAccount', id: accountId.value });
    }
  }

  public async restoreAccount(accountId: AccountId): Promise<RepositoryResult<void, RepositoryError>> {
    try {
      const { error } = await this.client
        .from(SupabaseAccountRepository.TABLE)
        .update({ archived_at: null, updated_at: new Date().toISOString() })
        .eq('id', accountId.value);

      if (error) {
        return this.handleError(error, { operation: 'restoreAccount', id: accountId.value });
      }

      return Result.success(undefined);
    } catch (e) {
      return this.handleError(e, { operation: 'restoreAccount', id: accountId.value });
    }
  }

  public async existsByName(name: string, excludeAccountId?: string): Promise<RepositoryResult<boolean, RepositoryError>> {
    try {
      let query = this.client
        .from(SupabaseAccountRepository.TABLE)
        .select('id')
        .ilike('name', name.trim())
        .is('archived_at', null);

      if (excludeAccountId) {
        query = query.neq('id', excludeAccountId);
      }

      const { data, error } = await query;

      if (error) {
        return this.handleError(error, { operation: 'existsByName', name });
      }

      return Result.success((data?.length ?? 0) > 0);
    } catch (e) {
      return this.handleError(e, { operation: 'existsByName', name });
    }
  }

  public async getActiveCount(): Promise<RepositoryResult<number, RepositoryError>> {
    try {
      const { count, error } = await this.client
        .from(SupabaseAccountRepository.TABLE)
        .select('id', { count: 'exact', head: true })
        .is('archived_at', null);

      if (error) {
        return this.handleError(error, { operation: 'getActiveCount' });
      }

      return Result.success(count ?? 0);
    } catch (e) {
      return this.handleError(e, { operation: 'getActiveCount' });
    }
  }
}
