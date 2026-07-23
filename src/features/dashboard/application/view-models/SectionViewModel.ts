import { BaseViewModel } from './BaseViewModel';

export interface SectionViewModel<T> extends BaseViewModel {
  readonly sectionType: string;
  readonly content: T | null;
}
