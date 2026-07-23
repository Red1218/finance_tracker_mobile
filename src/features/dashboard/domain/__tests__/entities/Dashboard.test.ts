import { describe, it, expect } from 'vitest';
import { Dashboard } from '../../entities/Dashboard';
import { ReportingPeriod } from '../../value-objects/ReportingPeriod';

describe('Dashboard', () => {
  it('should initialize with sections and an active period', () => {
    const period = new ReportingPeriod('CurrentMonth', new Date('2026-07-01'), new Date('2026-07-31'));
    const dashboard = new Dashboard('dash-1', period);

    expect(dashboard.id).toBe('dash-1');
    expect(dashboard.activePeriod).toBe(period);
    
    // Check sections exist
    expect(dashboard.summarySection).toBeDefined();
    expect(dashboard.budgetHealthSection).toBeDefined();
    expect(dashboard.categoryBreakdownSection).toBeDefined();
    expect(dashboard.recentActivitySection).toBeDefined();

    // They should initially be loading
    expect(dashboard.summarySection.state).toBe('LOADING');
    expect(dashboard.budgetHealthSection.state).toBe('LOADING');
    expect(dashboard.categoryBreakdownSection.state).toBe('LOADING');
    expect(dashboard.recentActivitySection.state).toBe('LOADING');
  });

  it('should change reporting period and trigger reloading for all sections', () => {
    const initialPeriod = new ReportingPeriod('CurrentMonth', new Date('2026-07-01'), new Date('2026-07-31'));
    const newPeriod = new ReportingPeriod('LastMonth', new Date('2026-06-01'), new Date('2026-06-30'));
    
    const dashboard = new Dashboard('dash-1', initialPeriod);
    
    // Mark a section as loaded to test transition back to loading
    dashboard.summarySection.markLoaded(null as any);
    expect(dashboard.summarySection.state).toBe('LOADED');

    dashboard.changeReportingPeriod(newPeriod);

    expect(dashboard.activePeriod).toBe(newPeriod);
    
    // Sections should transition back to LOADING
    expect(dashboard.summarySection.state).toBe('LOADING');
    expect(dashboard.budgetHealthSection.state).toBe('LOADING');
    expect(dashboard.categoryBreakdownSection.state).toBe('LOADING');
    expect(dashboard.recentActivitySection.state).toBe('LOADING');

    // It should push an event
    expect(dashboard.events.length).toBe(1);
    expect(dashboard.events[0].constructor.name).toBe('ReportingPeriodChangedEvent');
    expect(dashboard.events[0].newPeriod).toBe(newPeriod);
  });

  it('should do nothing if changing to the exact same period', () => {
    const initialPeriod = new ReportingPeriod('CurrentMonth', new Date('2026-07-01'), new Date('2026-07-31'));
    const samePeriod = new ReportingPeriod('CurrentMonth', new Date('2026-07-01'), new Date('2026-07-31'));
    
    const dashboard = new Dashboard('dash-1', initialPeriod);
    dashboard.changeReportingPeriod(samePeriod);

    expect(dashboard.events.length).toBe(0);
  });
});
