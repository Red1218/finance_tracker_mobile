export function setupDashboardMock() {
  const originalFetch = global.fetch;

  global.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
    
    if (url.includes('mock://api/dashboard')) {
      // Simulate network latency
      await new Promise(resolve => setTimeout(resolve, 800));

      const now = new Date();
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      const mockResponse = {
        activeReportingPeriodId: 'CurrentMonth',
        startDate: firstDay.toISOString(),
        endDate: lastDay.toISOString(),
        budgets: [
          {
            id: 'budget-1',
            name: 'Food & Dining',
            amount: 500,
            categoryId: 'cat-food',
            periodId: 'CurrentMonth'
          },
          {
            id: 'budget-2',
            name: 'Transportation',
            amount: 200,
            categoryId: 'cat-transport',
            periodId: 'CurrentMonth'
          }
        ],
        categories: [
          { id: 'cat-food', name: 'Food & Dining', color: '#ff3d3d', icon: 'pizza' },
          { id: 'cat-transport', name: 'Transportation', color: '#3b82f6', icon: 'car' },
          { id: 'cat-shopping', name: 'Shopping', color: '#ec4899', icon: 'bag' }
        ],
        transactions: [
          {
            id: 'tx-1',
            amount: 45.5,
            currency: 'USD',
            date: new Date(now.getTime() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
            categoryId: 'cat-food',
            description: 'Lunch at Cafe',
            type: 'EXPENSE'
          },
          {
            id: 'tx-2',
            amount: 15.0,
            currency: 'USD',
            date: new Date(now.getTime() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
            categoryId: 'cat-transport',
            description: 'Uber Ride',
            type: 'EXPENSE'
          },
          {
            id: 'tx-3',
            amount: 120.0,
            currency: 'USD',
            date: new Date(now.getTime() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
            categoryId: 'cat-shopping',
            description: 'Sneakers',
            type: 'EXPENSE'
          },
          {
            id: 'tx-4',
            amount: 3200.0,
            currency: 'USD',
            date: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 5).toISOString(), // 5 days ago
            categoryId: null,
            description: 'Salary',
            type: 'INCOME'
          }
        ]
      };

      return new Response(JSON.stringify(mockResponse), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Fallback to original fetch for other URLs
    return originalFetch(input, init);
  };
}
