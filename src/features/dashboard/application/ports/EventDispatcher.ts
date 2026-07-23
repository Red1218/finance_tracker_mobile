export interface EventDispatcher {
  dispatch(event: any): Promise<void>;
}
