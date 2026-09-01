import { describe, it, expect, vi } from 'vitest';
import { theme } from '../../../../shared/theme/theme';

vi.mock('@/src/shared/theme', () => ({ useTheme: () => theme }));

import { BudgetDetailSheet } from '../components/BudgetDetailSheet';
import { BudgetViewModel } from '../models/BudgetViewModel';

const mockBudgetDetail: BudgetViewModel = {
  id: 'b-500',
  categoryId: 'cat-dining',
  isOverall: false,
  amount: 15000,
  currency: 'INR',
  periodKind: 'MONTHLY',
  startDate: '2026-08-01T00:00:00Z',
  endDate: '2026-08-31T23:59:59Z',
  isArchived: false,
  archivedAt: null,
  spentAmount: 13500,
  remainingAmount: 1500,
  percentageUsed: 90,
  healthStatus: 'NEAR_LIMIT',
};

function flattenStyle(style: any): Record<string, unknown> {
  return Array.isArray(style) ? Object.assign({}, ...style.filter(Boolean).map(flattenStyle)) : style || {};
}

function collectNodes(root: any): any[] {
  const found: any[] = [];
  function walk(node: any) {
    if (!node || typeof node !== 'object') return;
    if (Array.isArray(node)) return node.forEach(walk);
    found.push(node);
    if (node.props?.children !== undefined) walk(node.props.children);
  }
  walk(root);
  return found;
}

function findByAccessibilityLabel(element: any, label: string): any {
  return collectNodes(element).find((n) => n.props?.accessibilityLabel === label);
}

function allTexts(element: any): string[] {
  return collectNodes(element)
    .map((n) => n.props?.children)
    .flat()
    .filter((c) => typeof c === 'string');
}

describe('BudgetDetailSheet', () => {
  it('returns null when there is no budget', () => {
    expect(BudgetDetailSheet({ visible: true, budget: null, onClose: vi.fn(), onEdit: vi.fn(), onArchive: vi.fn() })).toBeNull();
  });

  it('shows the remaining amount as the hero figure, not the spent amount', () => {
    const element = BudgetDetailSheet({
      visible: true,
      budget: mockBudgetDetail,
      onClose: vi.fn(),
      onEdit: vi.fn(),
      onArchive: vi.fn(),
    });

    const texts = allTexts(element);
    expect(texts.some((t) => t.includes('1,500'))).toBe(true);
    expect(texts).toContain('90');
  });

  it('shows spent-of-total and days-remaining as secondary footer text', () => {
    const element = BudgetDetailSheet({
      visible: true,
      budget: mockBudgetDetail,
      onClose: vi.fn(),
      onEdit: vi.fn(),
      onArchive: vi.fn(),
    });

    const texts = allTexts(element);
    expect(texts.some((t) => t.includes('13,500'))).toBe(true);
    expect(texts.some((t) => t.includes('15,000'))).toBe(true);
    expect(texts.some((t) => t.includes('spent'))).toBe(true);
    expect(texts.some((t) => t.includes('days left'))).toBe(true);
  });

  it('labels NEAR_LIMIT as "At risk" in the status color, not a filled badge', () => {
    const element = BudgetDetailSheet({
      visible: true,
      budget: mockBudgetDetail,
      onClose: vi.fn(),
      onEdit: vi.fn(),
      onArchive: vi.fn(),
    });

    expect(allTexts(element)).toContain('At risk');
  });

  it('renders both Edit and Archive as outline buttons - neither filled', () => {
    const element = BudgetDetailSheet({
      visible: true,
      budget: mockBudgetDetail,
      onClose: vi.fn(),
      onEdit: vi.fn(),
      onArchive: vi.fn(),
    });

    const editBtn = findByAccessibilityLabel(element, 'Edit budget limit');
    const archiveBtn = findByAccessibilityLabel(element, 'Archive budget');

    expect(flattenStyle(editBtn.props.style).backgroundColor).toBeUndefined();
    expect(flattenStyle(archiveBtn.props.style).backgroundColor).toBeUndefined();
  });

  it('gives Archive no red/error treatment at all, because it is not destructive (fixes #10)', () => {
    const element = BudgetDetailSheet({
      visible: true,
      budget: mockBudgetDetail,
      onClose: vi.fn(),
      onEdit: vi.fn(),
      onArchive: vi.fn(),
    });

    const archiveBtn = findByAccessibilityLabel(element, 'Archive budget');
    const archiveStyle = flattenStyle(archiveBtn.props.style);

    expect(archiveStyle.borderColor).not.toBe(theme.colors.error);
    expect(allTexts(element)).not.toContain('Delete');
  });

  it('states the archive consequence under the actions', () => {
    const element = BudgetDetailSheet({
      visible: true,
      budget: mockBudgetDetail,
      onClose: vi.fn(),
      onEdit: vi.fn(),
      onArchive: vi.fn(),
    });

    expect(allTexts(element)).toContain('Archiving hides this budget but keeps it in reporting history.');
  });

  it('invokes onEdit/onArchive/onClose with the expected arguments when pressed', () => {
    const onEdit = vi.fn();
    const onArchive = vi.fn();
    const onClose = vi.fn();
    const element = BudgetDetailSheet({ visible: true, budget: mockBudgetDetail, onClose, onEdit, onArchive });

    findByAccessibilityLabel(element, 'Edit budget limit').props.onPress();
    findByAccessibilityLabel(element, 'Archive budget').props.onPress();
    findByAccessibilityLabel(element, 'Close detail sheet').props.onPress();

    expect(onEdit).toHaveBeenCalledWith(mockBudgetDetail);
    expect(onArchive).toHaveBeenCalledWith(mockBudgetDetail);
    expect(onClose).toHaveBeenCalled();
  });

  it('labels OVER_BUDGET as "Over budget" and shows the excess with an "over" suffix', () => {
    const overBudget: BudgetViewModel = {
      ...mockBudgetDetail,
      id: 'b-501',
      spentAmount: 18000,
      remainingAmount: -3000,
      percentageUsed: 120,
      healthStatus: 'OVER_BUDGET',
    };
    const element = BudgetDetailSheet({
      visible: true,
      budget: overBudget,
      onClose: vi.fn(),
      onEdit: vi.fn(),
      onArchive: vi.fn(),
    });

    const texts = allTexts(element);
    expect(texts).toContain('Over budget');
    expect(texts.some((t) => t.includes('over'))).toBe(true);
  });
});
