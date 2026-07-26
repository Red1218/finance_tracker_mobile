import { useState, useCallback } from 'react';

export interface ReportingFiltersState {
  selectedCategoryId: string | null;
  setSelectedCategoryId: (categoryId: string | null) => void;
  resetFilters: () => void;
}

export function useReportingFilters(initialCategory: string | null = null): ReportingFiltersState {
  const [selectedCategoryId, setSelectedCategoryIdState] = useState<string | null>(initialCategory);

  const setSelectedCategoryId = useCallback((categoryId: string | null) => {
    setSelectedCategoryIdState(categoryId);
  }, []);

  const resetFilters = useCallback(() => {
    setSelectedCategoryIdState(null);
  }, []);

  return {
    selectedCategoryId,
    setSelectedCategoryId,
    resetFilters,
  };
}
