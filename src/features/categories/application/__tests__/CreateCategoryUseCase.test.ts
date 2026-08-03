import { describe, it, expect, beforeEach } from 'vitest';
import { CreateCategoryUseCase } from '../commands/CreateCategoryUseCase';
import { InMemoryCategoryRepository } from './InMemoryCategoryRepository';
import { DuplicateCategoryNameError } from '../errors/CategoryApplicationError';

describe('CreateCategoryUseCase', () => {
  let repository: InMemoryCategoryRepository;
  let useCase: CreateCategoryUseCase;

  beforeEach(() => {
    repository = new InMemoryCategoryRepository();
    useCase = new CreateCategoryUseCase(repository);
  });

  it('should successfully create custom expense category returning CategoryDTO', async () => {
    const dto = await useCase.execute({
      name: 'Coffee & Snacks',
      kind: 'EXPENSE',
      colorHex: '#FF5733',
      iconName: 'coffee',
    });

    expect(dto.name).toBe('Coffee & Snacks');
    expect(dto.kind).toBe('EXPENSE');
    expect(dto.isSystem).toBe(false);
    expect(dto.colorHex).toBe('#FF5733');
  });

  it('should throw DuplicateCategoryNameError on name collision per kind', async () => {
    await useCase.execute({ name: 'Freelance', kind: 'INCOME' });

    await expect(
      useCase.execute({ name: 'Freelance', kind: 'INCOME' })
    ).rejects.toThrow(DuplicateCategoryNameError);
  });
});
