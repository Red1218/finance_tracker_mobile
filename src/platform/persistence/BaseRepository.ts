import { SupabaseClient } from '@supabase/supabase-js';
import { supabase } from '../../database';
import { RepositoryError } from './RepositoryError';
import { RepositoryResult, Result } from './RepositoryResult';

export abstract class BaseRepository {
  protected readonly client: SupabaseClient;

  constructor(client: SupabaseClient = supabase) {
    this.client = client;
  }

  /**
   * Translates unknown errors into deterministic RepositoryErrors.
   */
  protected handleError(error: unknown, context?: Record<string, unknown>): RepositoryResult<never, RepositoryError> {
    if (error instanceof RepositoryError) {
      return Result.failure(error);
    }

    // A real implementation would map Supabase PostgREST errors to RepositoryErrorCode
    const repositoryError = new RepositoryError(
      'UNKNOWN_PERSISTENCE_ERROR',
      'An unexpected database error occurred.',
      context,
      error
    );

    return Result.failure(repositoryError);
  }
}
