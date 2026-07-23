import { describe, it, expect, vi } from 'vitest';
import { DashboardPresenter } from '../../presenters/DashboardPresenter';
import { DashboardFacade } from '../../../application/facade/DashboardFacade';
import { initialDashboardScreenState } from '../../models/DashboardScreenState';

describe('DashboardPresenter', () => {
  it('should load dashboard and update state correctly', async () => {
    const mockFacade = {
      loadDashboard: vi.fn().mockResolvedValue({ activeReportingPeriodId: 'CurrentMonth' }),
      changeReportingPeriod: vi.fn(),
      refreshSection: vi.fn(),
      executeQuickAction: vi.fn()
    } as unknown as DashboardFacade;

    const onStateChange = vi.fn();
    const presenter = new DashboardPresenter(mockFacade, onStateChange);

    await presenter.loadDashboard('user1');

    // Should call onStateChange with isRefreshing: true
    expect(onStateChange).toHaveBeenCalledWith(expect.objectContaining({ isRefreshing: true }));

    // Should call facade
    expect(mockFacade.loadDashboard).toHaveBeenCalledWith(expect.objectContaining({ userId: 'user1', reportingPeriodId: 'CurrentMonth' }));

    // Should call onStateChange with updated view model and isRefreshing: false
    const lastCall = onStateChange.mock.calls[onStateChange.mock.calls.length - 1][0];
    expect(lastCall.isRefreshing).toBe(false);
    expect(lastCall.viewModel).toBeDefined();
    expect(lastCall.lastRefresh).not.toBeNull();
  });

  it('should toggle period selector', () => {
    const mockFacade = {} as DashboardFacade;
    const onStateChange = vi.fn();
    const presenter = new DashboardPresenter(mockFacade, onStateChange);

    presenter.togglePeriodSelector();
    expect(onStateChange).toHaveBeenCalledWith(expect.objectContaining({ isPeriodSelectorOpen: true }));

    presenter.togglePeriodSelector();
    expect(onStateChange).toHaveBeenCalledWith(expect.objectContaining({ isPeriodSelectorOpen: false }));
  });
});
