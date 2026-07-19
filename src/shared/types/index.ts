// ============================================================================
// Explicit Barrel Exports
// Ensures a curated, intentional public surface for the Shared Types Layer
// ============================================================================

// Database Generated Types
export type { Database, Json } from './generated/database';

// Common Utilities
export type {
  Brand,
  UUID,
  ISODateString,
  Nullable,
  Optional,
  DeepPartial,
  NonEmptyArray,
  BaseEntity,
  SortDirection
} from './common.types';

// Category Domain
export type {
  CategoryRow,
  CategoryInsert,
  CategoryUpdate,
  CategoryType,
  Category,
  CreateCategoryDTO,
  UpdateCategoryDTO,
  CategoryFilter
} from './category.types';

// Pagination
export type {
  OffsetPaginationParams,
  CursorPaginationParams,
  PaginationParams,
  PaginationMetadata,
  PaginatedData
} from './pagination.types';

// API Responses
export type {
  ApiSuccessResponse,
  ApiErrorResponse,
  ApiResponse,
  ApiPaginatedResponse
} from './api.types';
