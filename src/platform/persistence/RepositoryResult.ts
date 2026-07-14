export type RepositoryResult<T, E = Error> = 
  | { success: true; data: T }
  | { success: false; error: E };

export const Result = {
  success: <T>(data: T): RepositoryResult<T, never> => ({ success: true, data }),
  failure: <E>(error: E): RepositoryResult<never, E> => ({ success: false, error }),
} as const;
