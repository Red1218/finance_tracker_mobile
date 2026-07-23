export interface QuickActionGateway {
  executeAction(actionType: string, payload: unknown): Promise<void>;
}
