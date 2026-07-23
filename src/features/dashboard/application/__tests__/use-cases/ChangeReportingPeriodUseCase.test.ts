import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ChangeReportingPeriodUseCase } from '../../use-cases/ChangeReportingPeriodUseCase';
import { LoadDashboardUseCase } from '../../use-cases/LoadDashboardUseCase';
import { EventDispatcher } from '../../ports/EventDispatcher';
import { Logger } from '../../ports/Logger';

describe('ChangeReportingPeriodUseCase', () => {
  let useCase: ChangeReportingPeriodUseCase;
  let loadDashboardUseCase: LoadDashboardUseCase;
  let dispatcher: EventDispatcher;
  let logger: Logger;

  beforeEach(() => {
    loadDashboardUseCase = { execute: vi.fn() } as any;
    dispatcher = { dispatch: vi.fn() };
    logger = { info: vi.fn(), error: vi.fn(), warn: vi.fn(), debug: vi.fn() };

    useCase = new ChangeReportingPeriodUseCase(loadDashboardUseCase, dispatcher, logger);
  });

  it('should dispatch event and reload dashboard', async () => {
    (loadDashboardUseCase.execute as any).mockResolvedValue({ overallStatus: 'Loaded' });

    const result = await useCase.execute({
      correlationId: '123',
      userId: 'user1',
      periodType: 'CURRENT_MONTH'
    });

    expect(dispatcher.dispatch).toHaveBeenCalled();
    expect(loadDashboardUseCase.execute).toHaveBeenCalledWith({
      correlationId: '123',
      userId: 'user1',
      reportingPeriodId: 'CURRENT_MONTH'
    });
    expect(result.overallStatus).toBe('Loaded');
  });
});
