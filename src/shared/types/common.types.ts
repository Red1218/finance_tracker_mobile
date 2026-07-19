// ============================================================================
// Branded Types (Strong Compile-Time Guarantees)
// ============================================================================
declare const __brand: unique symbol;
export type Brand<T, B> = T & { readonly [__brand]: B };

export type UUID = Brand<string, 'UUID'>;
export type ISODateString = Brand<string, 'ISODateString'>;

// ============================================================================
// Common Utilities
// ============================================================================
export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type DeepPartial<T> = T extends object ? { [P in keyof T]?: DeepPartial<T[P]> } : T;
export type NonEmptyArray<T> = [T, ...T[]];

// ============================================================================
// Base Entity Definitions
// ============================================================================
/**
 * Base entity containing fields managed exclusively by the database.
 * Domain models should extend this to inherit standard auditing fields.
 */
export interface BaseEntity {
  id: UUID;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

export type SortDirection = 'asc' | 'desc';
