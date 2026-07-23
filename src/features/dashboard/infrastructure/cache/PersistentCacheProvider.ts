import { CacheProvider } from '../../application/ports/CacheProvider';

/**
 * Abstraction for a persistent, L2 cache (e.g. AsyncStorage, SQLite, FileSystem).
 * Technology-agnostic interface to keep infrastructure portable.
 */
export interface PersistentCacheProvider extends CacheProvider {
  // Can be extended with persistent-specific methods if needed
}

interface CacheEntry<T> {
  value: T;
  expiresAt: number | null;
}

/**
 * In-memory fake for unit testing and local development,
 * fulfilling the PersistentCacheProvider contract without tying to
 * a specific storage technology like Node fs or AsyncStorage.
 */
export class FakePersistentCacheProvider implements PersistentCacheProvider {
  private store = new Map<string, CacheEntry<any>>();

  async get<T>(key: string): Promise<T | null> {
    const entry = this.store.get(key);
    if (!entry) return null;

    if (entry.expiresAt !== null && Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }

    // Clone to simulate serialization/deserialization boundary
    return JSON.parse(JSON.stringify(entry.value)) as T;
  }

  async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    const expiresAt = ttlSeconds ? Date.now() + ttlSeconds * 1000 : null;
    // Store as JSON to ensure it is serializable
    this.store.set(key, { value: JSON.parse(JSON.stringify(value)), expiresAt });
  }

  async invalidate(key: string): Promise<void> {
    this.store.delete(key);
  }

  async invalidateAll(): Promise<void> {
    this.store.clear();
  }

  async refresh(key: string): Promise<void> {
    // No-op for persistent store fake
  }
}
