import { PaginatedData } from './pagination.types';

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
}

export interface ApiErrorResponse<TDetails = unknown> {
  success: false;
  error: {
    code: string;
    message: string;
    details?: TDetails;
  };
}

export type ApiResponse<T, TDetails = unknown> = ApiSuccessResponse<T> | ApiErrorResponse<TDetails>;

export type ApiPaginatedResponse<T, TDetails = unknown> = ApiSuccessResponse<PaginatedData<T>> | ApiErrorResponse<TDetails>;
