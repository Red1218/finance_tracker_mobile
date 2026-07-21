import { CategoryId } from '../value-objects/CategoryId';
import { CategoryName } from '../value-objects/CategoryName';
import { CategoryType } from '../value-objects/CategoryType';
import { CategoryDomainError } from '../errors/CategoryDomainError';

export interface CategoryProps {
  id: CategoryId;
  name: CategoryName;
  type: CategoryType;
  isArchived: boolean;
}

export class Category {
  public readonly id: CategoryId;
  public readonly name: CategoryName;
  public readonly type: CategoryType;
  public readonly isArchived: boolean;

  constructor(props: CategoryProps) {
    this.id = props.id;
    this.name = props.name;
    this.type = props.type;
    this.isArchived = props.isArchived;

    Object.freeze(this);
  }

  public rename(newName: CategoryName): Category {
    if (this.type === CategoryType.Protected) {
      throw new CategoryDomainError(
        'PROTECTED_CATEGORY_MODIFICATION',
        'Protected categories cannot be renamed.'
      );
    }

    return new Category({
      id: this.id,
      name: newName,
      type: this.type,
      isArchived: this.isArchived,
    });
  }

  public archive(): Category {
    if (this.type === CategoryType.Protected) {
      throw new CategoryDomainError(
        'PROTECTED_CATEGORY_MODIFICATION',
        'Protected categories cannot be archived.'
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
      type: this.type,
      isArchived: true,
    });
  }

  public restore(): Category {
    if (!this.isArchived) {
      throw new CategoryDomainError(
        'CATEGORY_NOT_ARCHIVED',
        'Category is not archived.'
      );
    }

    return new Category({
      id: this.id,
      name: this.name,
      type: this.type,
      isArchived: false,
    });
  }
}
