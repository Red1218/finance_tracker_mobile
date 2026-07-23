import { CacheProvider } from '../../application/ports/CacheProvider';

interface CacheEntry<T> {
  value: T;
  expiresAt: number | null;
}

export class InMemoryCacheProvider implements CacheProvider {
  private store = new Map<string, CacheEntry<any>>();

  async get<T>(key: string): Promise<T | null> {
    const entry = this.store.get(key);
    if (!entry) return null;

    if (entry.expiresAt !== null && Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }

    return entry.value as T;
  }

  async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    const expiresAt = ttlSeconds ? Date.now() + ttlSeconds * 1000 : null;
    this.store.set(key, { value, expiresAt });
  }

  async invalidate(key: string): Promise<void> {
    this.store.delete(key);
  }

  async invalidateAll(): Promise<void> {
    this.store.clear();
  }

  async refresh(key: string): Promise<void> {
    // Refreshing an in-memory cache individually is a no-op 
    // unless it coordinates with a source, which is done at a higher level.
    // We just implement the port.
  }
}
