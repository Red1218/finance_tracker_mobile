import { describe, it, expect, beforeEach } from 'vitest';
import { InitializePreferencesUseCase } from '../commands/InitializePreferencesUseCase';
import { InMemoryPreferencesRepository } from './InMemoryPreferencesRepository';

describe('InitializePreferencesUseCase', () => {
  let repository: InMemoryPreferencesRepository;
  let useCase: InitializePreferencesUseCase;

  beforeEach(() => {
    repository = new InMemoryPreferencesRepository();
    useCase = new InitializePreferencesUseCase(repository);
  });

  it('should auto-create default preferences returning PreferencesDTO', async () => {
    const dto = await useCase.execute();

    expect(dto.theme).toBe('SYSTEM');
    expect(dto.currencyCode).toBe('INR');
    expect(dto.weekStart).toBe('MONDAY');
    expect(dto.decimalPrecision).toBe(2);
  });
});
