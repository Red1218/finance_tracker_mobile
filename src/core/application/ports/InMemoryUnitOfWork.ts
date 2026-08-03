import { IUnitOfWork } from './IUnitOfWork';

export class InMemoryUnitOfWork implements IUnitOfWork {
  public async runInTransaction<T>(work: () => Promise<T>): Promise<T> {
    return await work();
  }
}
