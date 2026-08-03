/**
 * Abstract Unit of Work application port for executing multi-repository operations atomically.
 * Prevents application layer coupling to specific persistence transaction APIs.
 */
export interface IUnitOfWork {
  runInTransaction<T>(work: () => Promise<T>): Promise<T>;
}
