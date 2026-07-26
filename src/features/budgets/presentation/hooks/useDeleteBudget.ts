import { useState } from 'react';
import { ArchiveBudgetUseCase } from '../../application/use-cases/ArchiveBudgetUseCase';

export function useDeleteBudget(archiveUseCase: ArchiveBudgetUseCase) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteBudget = async (id: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      await archiveUseCase.execute({ id });
      return true;
    } catch (e: any) {
      setError(e.message || 'Failed to archive budget');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    deleteBudget,
    isLoading,
    error,
  };
}
