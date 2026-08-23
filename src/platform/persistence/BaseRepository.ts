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

    // Map Supabase PostgREST Postgres error codes to RepositoryErrorCode
    if (error && typeof error === 'object' && 'code' in error && (error as { code?: string }).code === '23505') {
      const message = (error as { message?: string }).message ?? 'Unique constraint violation occurred.';
      return Result.failure(
        new RepositoryError('UNIQUE_VIOLATION', message, context, error)
      );
    }

    console.error('Raw database error:', error);
    const repositoryError = new RepositoryError(
      'UNKNOWN_PERSISTENCE_ERROR',
      'An unexpected database error occurred.',
      context,
      error
    );

    return Result.failure(repositoryError);

  }
}
