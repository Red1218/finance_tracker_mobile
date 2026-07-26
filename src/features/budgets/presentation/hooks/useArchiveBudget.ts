import { useState } from 'react';
import { ArchiveBudgetUseCase, ArchiveBudgetCommand } from '../../application';

export function useArchiveBudget(archiveBudgetUseCase: ArchiveBudgetUseCase) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const archiveBudget = async (command: ArchiveBudgetCommand): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      await archiveBudgetUseCase.execute(command);
      return true;
    } catch (e: any) {
      setError(e.message || 'Failed to archive budget.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    archiveBudget,
    isLoading,
    error,
  };
}
