import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RetryPolicy } from '../../policies/RetryPolicy';
import { Logger } from '../../../application/ports/Logger';

describe('RetryPolicy', () => {
  let logger: Logger;

  beforeEach(() => {
    logger = { info: vi.fn(), error: vi.fn(), warn: vi.fn(), debug: vi.fn() };
  });

  it('should succeed on first try', async () => {
    const policy = new RetryPolicy({ maxRetries: 3, baseDelayMs: 1 }, logger);
    const operation = vi.fn().mockResolvedValue('success');
    
    await expect(policy.execute(operation)).resolves.toBe('success');
    expect(operation).toHaveBeenCalledTimes(1);
  });

  it('should retry on failure and succeed', async () => {
    const policy = new RetryPolicy({ maxRetries: 3, baseDelayMs: 1 }, logger);
    const operation = vi.fn()
      .mockRejectedValueOnce(new Error('fail'))
      .mockResolvedValueOnce('success');
    
    await expect(policy.execute(operation)).resolves.toBe('success');
    expect(operation).toHaveBeenCalledTimes(2);
  });

  it('should throw after max retries exhausted', async () => {
    const policy = new RetryPolicy({ maxRetries: 2, baseDelayMs: 1 }, logger);
    const operation = vi.fn().mockRejectedValue(new Error('fail'));
    
    await expect(policy.execute(operation)).rejects.toThrow('fail');
    expect(operation).toHaveBeenCalledTimes(2);
  });
});
