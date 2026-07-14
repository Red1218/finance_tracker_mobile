import { CategoryId } from '../value-objects/CategoryId';
import { CategoryName } from '../value-objects/CategoryName';
import { CategoryType } from '../value-objects/CategoryType';
import { CategoryDomainError } from '../errors/CategoryDomainError';

export interface CategoryProps {
  id: CategoryId;
  name: CategoryName;
  type: CategoryType;
}

export class Category {
  public readonly id: CategoryId;
  public readonly name: CategoryName;
  public readonly type: CategoryType;

  constructor(props: CategoryProps) {
    this.id = props.id;
    this.name = props.name;
    this.type = props.type;
    
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
    });
  }

  public validateDeletion(): void {
    if (this.type === CategoryType.Protected) {
      throw new CategoryDomainError(
        'PROTECTED_CATEGORY_MODIFICATION',
        'Protected categories cannot be deleted.'
      );
    }
  }
}
