import { CategoryId } from '../value-objects/CategoryId';
import { CategoryName } from '../value-objects/CategoryName';
import { CategoryKind } from '../value-objects/CategoryKind';
import { CategoryDomainError } from '../errors/CategoryDomainError';

export interface CategoryProps {
  id: CategoryId;
  name: CategoryName;
  kind: CategoryKind;
  isSystem: boolean;
  archivedAt?: Date | null;
  colorHex?: string | null;
  iconName?: string | null;
}

export class Category {
  public readonly id: CategoryId;
  public readonly name: CategoryName;
  public readonly kind: CategoryKind;
  public readonly isSystem: boolean;
  public readonly archivedAt: Date | null;
  public readonly colorHex: string | null;
  public readonly iconName: string | null;

  constructor(props: CategoryProps) {
    this.id = props.id;
    this.name = props.name;
    this.kind = props.kind;
    this.isSystem = props.isSystem;
    this.archivedAt = props.archivedAt ?? null;
    this.colorHex = props.colorHex ?? null;
    this.iconName = props.iconName ?? null;

    Object.freeze(this);
  }

  public get isArchived(): boolean {
    return this.archivedAt !== null;
  }

  public rename(newName: CategoryName): Category {
    if (this.isSystem) {
      throw new CategoryDomainError(
        'SYSTEM_CATEGORY_MODIFICATION',
        'System categories cannot be renamed.'
      );
    }

    return new Category({
      id: this.id,
      name: newName,
      kind: this.kind,
      isSystem: this.isSystem,
      archivedAt: this.archivedAt,
      colorHex: this.colorHex,
      iconName: this.iconName,
    });
  }

  public archive(archivedAt: Date = new Date()): Category {
    if (this.isSystem) {
      throw new CategoryDomainError(
        'SYSTEM_CATEGORY_MODIFICATION',
        'System categories cannot be archived.'
      );
    }

    if (this.isArchived) {
      throw new CategoryDomainError(
        'CATEGORY_ALREADY_ARCHIVED',
        'Category is already archived.'
      );
    }

    return new Category({
      id: this.id,
      name: this.name,
      kind: this.kind,
      isSystem: this.isSystem,
      archivedAt,
      colorHex: this.colorHex,
      iconName: this.iconName,
    });
  }

  public restore(): Category {
    if (this.isSystem) {
      throw new CategoryDomainError(
        'SYSTEM_CATEGORY_MODIFICATION',
        'System categories cannot be mutated.'
      );
    }

    if (!this.isArchived) {
      throw new CategoryDomainError(
        'CATEGORY_NOT_ARCHIVED',
        'Category is not archived.'
      );
    }

    return new Category({
      id: this.id,
      name: this.name,
      kind: this.kind,
      isSystem: this.isSystem,
      archivedAt: null,
      colorHex: this.colorHex,
      iconName: this.iconName,
    });
  }
}
