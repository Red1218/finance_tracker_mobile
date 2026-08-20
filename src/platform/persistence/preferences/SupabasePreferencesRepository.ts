import { SupabaseClient } from '@supabase/supabase-js';
import { BaseRepository } from '../BaseRepository';
import { RepositoryResult, Result } from '../RepositoryResult';
import { RepositoryError } from '../RepositoryError';
import { IPreferencesRepository } from '../../../features/preferences/application/repositories/IPreferencesRepository';
import { Preferences } from '../../../features/preferences/domain';
import { PreferencesMapper } from './PreferencesMapper';
import { PreferencesRow } from '../../../features/preferences/contracts';
import { supabase } from '../../../database';

export class SupabasePreferencesRepository extends BaseRepository implements IPreferencesRepository {
  private static readonly TABLE = 'preferences';
  private static readonly COLUMNS =
    'id,user_id,theme,currency_code,week_start,decimal_precision,default_expense_category_id,default_income_category_id,budget_alerts_enabled,daily_reminder_enabled,reminder_time';

  constructor(client: SupabaseClient = supabase) {
    super(client);
    Object.freeze(this);
  }

  public async get(userId?: string): Promise<RepositoryResult<Preferences | null, RepositoryError>> {
    try {
      let query = this.client
        .from(SupabasePreferencesRepository.TABLE)
        .select(SupabasePreferencesRepository.COLUMNS);

      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data, error } = await query.limit(1).maybeSingle();

      if (error) {
        return this.handleError(error, { operation: 'get', userId });
      }

      if (!data) {
        return Result.success(null);
      }

      return Result.success(PreferencesMapper.toDomain(data as PreferencesRow));
    } catch (e) {
      return this.handleError(e, { operation: 'get', userId });
    }
  }

  public async save(preferences: Preferences): Promise<RepositoryResult<void, RepositoryError>> {
    try {
      const row = PreferencesMapper.toPersistence(preferences);
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(row.id);
      const payload: Partial<PreferencesRow> = isUuid ? row : { ...row };
      if (!isUuid) {
        delete payload.id;
      }

      const { error } = await this.client
        .from(SupabasePreferencesRepository.TABLE)
        .upsert(payload as any, { onConflict: isUuid ? 'id' : 'user_id' });

      if (error) {
        return this.handleError(error, { operation: 'save', id: preferences.id.value });
      }

      return Result.success(undefined);
    } catch (e) {
      return this.handleError(e, { operation: 'save', id: preferences.id.value });
    }
  }

}
