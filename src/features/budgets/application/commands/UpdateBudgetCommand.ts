export interface UpdateBudgetCommand {
  budgetId?: string;
  id?: string;
  newAmount: number;
  currentDate?: Date;
}
