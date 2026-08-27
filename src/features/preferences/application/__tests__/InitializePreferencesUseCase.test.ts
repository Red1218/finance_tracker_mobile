import { describe, it, expect, beforeEach, vi } from 'vitest';
import { InitializePreferencesUseCase } from '../commands/InitializePreferencesUseCase';
import { InMemoryPreferencesRepository } from './InMemoryPreferencesRepository';
import { Preferences } from '../../domain';

describe('InitializePreferencesUseCase', () => {
  let repository: InMemoryPreferencesRepository;
  let useCase: InitializePreferencesUseCase;

  beforeEach(() => {
    repository = new InMemoryPreferencesRepository();
    useCase = new InitializePreferencesUseCase(repository);
  });

  it('should auto-create default preferences with authenticated userId', async () => {
    const dto = await useCase.execute('usr-123');

    expect(dto.userId).toBe('usr-123');
    expect(dto.theme).toBe('SYSTEM');
    expect(dto.currencyCode).toBe('INR');
  });

  it('should throw an unauthenticated error if userId is unauthenticated or missing', async () => {
    await expect(useCase.execute()).rejects.toThrow('Unauthenticated user context');
    await expect(useCase.execute('')).rejects.toThrow('Unauthenticated user context');
  });

  it('should pass userId into repository.get and save a Preferences entity with userId', async () => {
    const getSpy = vi.spyOn(repository, 'get');
    const saveSpy = vi.spyOn(repository, 'save');

    const dto = await useCase.execute('user-abc-456');

    expect(getSpy).toHaveBeenCalledWith('user-abc-456');
    expect(saveSpy).toHaveBeenCalledTimes(1);
    const savedEntity = saveSpy.mock.calls[0][0] as Preferences;
    expect(savedEntity.userId).toBe('user-abc-456');
    expect(dto.userId).toBe('user-abc-456');
  });
});
