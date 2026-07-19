// ============================================================================
// Pagination Input Params
// ============================================================================
export interface OffsetPaginationParams {
  page: number;
  limit: number;
}

export interface CursorPaginationParams {
  cursor: string;
  limit: number;
}

/**
 * Extensible generic pagination parameters.
 * Currently defaults to Offset behavior, but architected to support Cursor via Union in the future:
 * export type PaginationParams = OffsetPaginationParams | CursorPaginationParams;
 */
export type PaginationParams = OffsetPaginationParams;

// ============================================================================
// Pagination Output Metadata
// ============================================================================
export interface PaginationMetadata {
  limit: number;
  hasMore: boolean;
  
  // Offset specific (optional for future cursor support)
  total?: number;
  page?: number;
  
  // Cursor specific (optional for future capability)
  nextCursor?: string;
}

export interface PaginatedData<T> {
  data: T[];
  metadata: PaginationMetadata;
}
