export type SectionState = 'LOADING' | 'LOADED' | 'ERROR' | 'EMPTY';

export class DashboardSection<T> {
  private _state: SectionState = 'LOADING';
  private _data: T | null = null;
  private _error: Error | null = null;

  constructor(public readonly id: string) {}

  get state(): SectionState {
    return this._state;
  }

  get data(): T | null {
    return this._data;
  }

  get error(): Error | null {
    return this._error;
  }

  markLoaded(data: T): void {
    this._data = data;
    this._error = null;
    this._state = 'LOADED';
  }

  markEmpty(): void {
    this._data = null;
    this._error = null;
    this._state = 'EMPTY';
  }

  markError(error: Error): void {
    // INV-010: Error in one section does not prevent others from loading.
    // This is modeled by encapsulating the error state at the section level.
    this._error = error;
    this._data = null;
    this._state = 'ERROR';
  }

  markLoading(): void {
    this._state = 'LOADING';
    this._error = null;
  }
}
