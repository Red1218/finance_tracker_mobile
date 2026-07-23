export interface ExecuteQuickActionCommand {
  readonly correlationId: string;
  readonly userId: string;
  readonly actionType: 'AddTransaction' | 'AdjustBudget';
  readonly payload: unknown; // Structure validated per action
}
