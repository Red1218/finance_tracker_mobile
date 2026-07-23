import { describe, it, expect } from 'vitest';
import { DashboardSection } from '../../entities/DashboardSection';

describe('DashboardSection', () => {
  it('should initialize in LOADING state with no data and no error', () => {
    const section = new DashboardSection<string>('test-section');
    expect(section.id).toBe('test-section');
    expect(section.state).toBe('LOADING');
    expect(section.data).toBeNull();
    expect(section.error).toBeNull();
  });

  it('should transition to LOADED state with data', () => {
    const section = new DashboardSection<string>('test-section');
    section.markLoaded('Test Data');
    expect(section.state).toBe('LOADED');
    expect(section.data).toBe('Test Data');
    expect(section.error).toBeNull();
  });

  it('should transition to EMPTY state', () => {
    const section = new DashboardSection<string>('test-section');
    section.markEmpty();
    expect(section.state).toBe('EMPTY');
    expect(section.data).toBeNull();
    expect(section.error).toBeNull();
  });

  it('should transition to ERROR state with an error', () => {
    const section = new DashboardSection<string>('test-section');
    const error = new Error('Something went wrong');
    section.markError(error);
    expect(section.state).toBe('ERROR');
    expect(section.data).toBeNull();
    expect(section.error).toBe(error);
  });

  it('should transition back to LOADING state', () => {
    const section = new DashboardSection<string>('test-section');
    section.markLoaded('Test Data');
    section.markLoading();
    expect(section.state).toBe('LOADING');
    expect(section.data).toBe('Test Data'); // Data is kept while reloading depending on implementation, but error should be null. Wait, the implementation keeps data during loading.
    expect(section.error).toBeNull();
  });
});
