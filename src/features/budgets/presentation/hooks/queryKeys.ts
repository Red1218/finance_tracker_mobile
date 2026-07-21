export const budgetKeys = {
  all: ['budgets'] as const,
  lists: () => [...budgetKeys.all, 'list'] as const,
  summaries: () => [...budgetKeys.all, 'summary'] as const,
  summary: (budgetId: string) => [...budgetKeys.summaries(), budgetId] as const,
};
