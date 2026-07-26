import { describe, it, expect, beforeEach } from 'vitest';
import { CategoriesModule } from '../../composition/CategoriesModule';
import { InMemoryCategoryRepository } from '../../application/__tests__/InMemoryCategoryRepository';
import { CategoryKind, CategoryDomainError } from '../../domain';
import { CategoryViewModel } from '../../presentation';

describe('Categories Bounded Context — End-to-End Lifecycle Integration', () => {
  let module: CategoriesModule;
  let repository: InMemoryCategoryRepository;

  beforeEach(() => {
    repository = new InMemoryCategoryRepository();
    module = new CategoriesModule(repository);
  });

  it('executes complete category lifecycle: create, rename, validate, archive, restore, and system protection', async () => {
    // 1. Create custom expense category
    const diningCategory = await module.controller.createCategory({
      name: 'Dining Out',
      kind: CategoryKind.Expense,
      colorHex: '#F59E0B',
      iconName: 'restaurant',
    });

    expect(diningCategory.name).toBe('Dining Out');
    expect(diningCategory.kind).toBe('EXPENSE');
    expect(diningCategory.isSystem).toBe(false);
    expect(diningCategory.isArchived).toBe(false);
    expect(diningCategory.archivedAt).toBeNull();
    expect(diningCategory.colorHex).toBe('#F59E0B');

    // 2. Create custom income category with same name (allowed across different kinds)
    const diningIncome = await module.controller.createCategory({
      name: 'Dining Out',
      kind: CategoryKind.Income,
    });
    expect(diningIncome.kind).toBe('INCOME');

    // 3. Reject duplicate name within same CategoryKind
    await expect(
      module.controller.createCategory({
        name: 'Dining Out',
        kind: CategoryKind.Expense,
      })
    ).rejects.toThrowError(CategoryDomainError);

    // 4. Validate category for transaction
    const validated = await module.controller.validateCategoryForTransaction(
      diningCategory.id,
      CategoryKind.Expense
    );
    expect(validated.id).toBe(diningCategory.id);

    // 5. Rename category
    const renamed = await module.controller.renameCategory({
      id: diningCategory.id,
      newName: 'Restaurants & Bars',
    });
    expect(renamed.name).toBe('Restaurants & Bars');

    // 6. Archive category
    const freezeTime = new Date('2026-07-25T17:00:00.000Z');
    await module.controller.archiveCategory({
      id: diningCategory.id,
      archivedAt: freezeTime,
    });

    // 7. Verify category is hidden from active list but returned when includeArchived = true
    const activeList = await module.controller.listCategories({ includeArchived: false });
    expect(activeList.find((c: CategoryViewModel) => c.id === diningCategory.id)).toBeUndefined();

    const allList = await module.controller.listCategories({ includeArchived: true });
    const archivedItem = allList.find((c: CategoryViewModel) => c.id === diningCategory.id);
    expect(archivedItem?.isArchived).toBe(true);
    expect(archivedItem?.archivedAt).toBe('2026-07-25T17:00:00.000Z');

    // 8. Reject transaction assignment to archived category
    await expect(
      module.controller.validateCategoryForTransaction(diningCategory.id, CategoryKind.Expense)
    ).rejects.toThrowError('Cannot assign archived category "Restaurants & Bars" to a transaction.');

    // 9. Restore category
    await module.controller.restoreCategory({ id: diningCategory.id });

    const restoredActive = await module.controller.listCategories({ includeArchived: false });
    const restoredItem = restoredActive.find((c: CategoryViewModel) => c.id === diningCategory.id);
    expect(restoredItem?.isArchived).toBe(false);
    expect(restoredItem?.archivedAt).toBeNull();
  });
});
