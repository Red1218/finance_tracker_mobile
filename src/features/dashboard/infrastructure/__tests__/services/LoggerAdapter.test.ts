import { describe, it, expect, vi } from 'vitest';
import { LoggerAdapter } from '../../services/LoggerAdapter';

describe('LoggerAdapter', () => {
  it('should stringify and log context', () => {
    const spy = vi.spyOn(console, 'info').mockImplementation(() => {});
    const logger = new LoggerAdapter();
    
    logger.info('Test', { correlationId: '123' });
    
    expect(spy).toHaveBeenCalled();
    const loggedString = spy.mock.calls[0][0];
    const loggedObj = JSON.parse(loggedString);
    
    expect(loggedObj.message).toBe('Test');
    expect(loggedObj.correlationId).toBe('123');
    
    spy.mockRestore();
  });

  it('should mask sensitive properties', () => {
    const spy = vi.spyOn(console, 'info').mockImplementation(() => {});
    const logger = new LoggerAdapter();
    
    logger.info('Test', { balance: 1000, amount: 500, safe: 'yes' });
    
    const loggedObj = JSON.parse(spy.mock.calls[0][0]);
    expect(loggedObj.balance).toBe('***MASKED***');
    expect(loggedObj.amount).toBe('***MASKED***');
    expect(loggedObj.safe).toBe('yes');
    
    spy.mockRestore();
  });
});
