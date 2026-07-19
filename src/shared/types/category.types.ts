import { Database } from './generated/database';
import { BaseEntity, UUID, Nullable, Optional } from './common.types';

// ============================================================================
// Database Row Types (Supabase Layer)
// ============================================================================
export type CategoryRow = Database['public']['Tables']['categories']['Row'];
export type CategoryInsert = Database['public']['Tables']['categories']['Insert'];
export type CategoryUpdate = Database['public']['Tables']['categories']['Update'];
export type CategoryType = Database['public']['Enums']['category_type'];

// ============================================================================
// Domain Entity Models (Service Layer & Repository Output)
// ============================================================================
/**
 * The canonical domain representation of a Category.
 * Repositories map Database rows (snake_case) to this interface (camelCase).
 */
export interface Category extends BaseEntity {
  userId: Nullable<UUID>;
  name: string;
  slug: string;
  icon: string;
  color: string;
  type: CategoryType;
  displayOrder: number;
  isSystem: boolean;
  isArchived: boolean;
}

// ============================================================================
// Data Transfer Objects (DTOs)
// ============================================================================
/**
 * DTO for creating a new Category.
 * System fields (isSystem, isArchived, slug) are omitted as they are handled by the Service/DB.
 */
export interface CreateCategoryDTO {
  name: string;
  icon: string;
  color: string;
  type: CategoryType;
  displayOrder?: number;
}

/**
 * DTO for updating an existing Category.
 * Ownership and system-status mutations are intentionally omitted to align with RLS policies.
 */
export interface UpdateCategoryDTO {
  name?: string;
  icon?: string;
  color?: string;
  displayOrder?: number;
  isArchived?: boolean;
}

// ============================================================================
// Query & Filter Models
// ============================================================================
/**
 * Standard filters for querying categories in the repository or via API.
 */
export interface CategoryFilter {
  type?: CategoryType;
  isSystem?: boolean;
  isArchived?: boolean;
  search?: string;
}
