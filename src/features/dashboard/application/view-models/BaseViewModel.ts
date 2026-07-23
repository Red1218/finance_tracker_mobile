export type LoadStatus = 'Loading' | 'Loaded' | 'Empty' | 'Error';

export interface BaseViewModel {
  readonly status: LoadStatus;
  readonly isLoading: boolean;
  readonly isEmpty: boolean;
  readonly error: string | null;
  readonly retryToken: string | null;
  readonly lastUpdated: Date;
}
