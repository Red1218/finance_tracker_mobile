import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ExecuteQuickActionUseCase } from '../../use-cases/ExecuteQuickActionUseCase';
import { QuickActionGateway } from '../../ports/QuickActionGateway';
import { Logger } from '../../ports/Logger';

describe('ExecuteQuickActionUseCase', () => {
  let useCase: ExecuteQuickActionUseCase;
  let gateway: QuickActionGateway;
  let logger: Logger;

  beforeEach(() => {
    gateway = { executeAction: vi.fn() };
    logger = { info: vi.fn(), error: vi.fn(), warn: vi.fn(), debug: vi.fn() };
    useCase = new ExecuteQuickActionUseCase(gateway, logger);
  });

  it('should successfully execute quick action', async () => {
    (gateway.executeAction as any).mockResolvedValue(undefined);

    await expect(useCase.execute({
      correlationId: '123',
      userId: 'user1',
      actionType: 'AddTransaction',
      payload: { amount: 10 }
    })).resolves.not.toThrow();

    expect(gateway.executeAction).toHaveBeenCalledWith('AddTransaction', { amount: 10 });
  });

  it('should throw if gateway fails', async () => {
    (gateway.executeAction as any).mockRejectedValue(new Error('Gateway error'));

    await expect(useCase.execute({
      correlationId: '123',
      userId: 'user1',
      actionType: 'AddTransaction',
      payload: { amount: 10 }
    })).rejects.toThrow('Failed to execute quick action: Gateway error');
  });
});
