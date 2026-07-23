import { describe, it, expect } from 'vitest';
import { DependencyRegistry } from '../DependencyRegistry';

describe('DependencyRegistry', () => {
  it('should build the complete dependency graph and return a Facade', () => {
    const registry = new DependencyRegistry();
    const facade = registry.bootstrap({ apiBaseUrl: 'http://localhost' });

    expect(facade).toBeDefined();
    
    // Facade should have the core use case methods
    expect(typeof facade.loadDashboard).toBe('function');
    expect(typeof facade.changeReportingPeriod).toBe('function');
    expect(typeof facade.refreshSection).toBe('function');
    expect(typeof facade.executeQuickAction).toBe('function');
  });

  it('should throw if getting facade before bootstrap', () => {
    const registry = new DependencyRegistry();
    expect(() => registry.getFacade()).toThrowError(/not been bootstrapped/);
  });
});
