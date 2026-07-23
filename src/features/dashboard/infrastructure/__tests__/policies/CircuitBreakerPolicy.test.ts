import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CircuitBreakerPolicy } from '../../policies/CircuitBreakerPolicy';
import { Logger } from '../../../application/ports/Logger';

describe('CircuitBreakerPolicy', () => {
  let logger: Logger;

  beforeEach(() => {
    logger = { info: vi.fn(), error: vi.fn(), warn: vi.fn(), debug: vi.fn() };
  });

  it('should succeed when closed', async () => {
    const breaker = new CircuitBreakerPolicy({ failureThreshold: 2, resetTimeoutMs: 1000 }, logger);
    const operation = vi.fn().mockResolvedValue('success');
    const fallback = vi.fn();
    
    await expect(breaker.execute(operation, fallback)).resolves.toBe('success');
    expect(operation).toHaveBeenCalledTimes(1);
    expect(fallback).not.toHaveBeenCalled();
    expect(breaker.getState()).toBe('CLOSED');
  });

  it('should use fallback on error, and trip when threshold reached', async () => {
    const breaker = new CircuitBreakerPolicy({ failureThreshold: 2, resetTimeoutMs: 1000 }, logger);
    const operation = vi.fn().mockRejectedValue(new Error('fail'));
    const fallback = vi.fn().mockResolvedValue('fallback');
    
    await expect(breaker.execute(operation, fallback)).resolves.toBe('fallback');
    expect(breaker.getState()).toBe('CLOSED');
    
    await expect(breaker.execute(operation, fallback)).resolves.toBe('fallback');
    expect(breaker.getState()).toBe('OPEN'); // tripped on 2nd failure
  });

  it('should bypass operation and use fallback when OPEN', async () => {
    const breaker = new CircuitBreakerPolicy({ failureThreshold: 1, resetTimeoutMs: 10000 }, logger);
    const operation = vi.fn().mockRejectedValue(new Error('fail'));
    const fallback = vi.fn().mockResolvedValue('fallback');
    
    // Trip it
    await breaker.execute(operation, fallback);
    expect(breaker.getState()).toBe('OPEN');
    
    // Next call should go straight to fallback
    operation.mockClear();
    await expect(breaker.execute(operation, fallback)).resolves.toBe('fallback');
    expect(operation).not.toHaveBeenCalled();
  });
});
