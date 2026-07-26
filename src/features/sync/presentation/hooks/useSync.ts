import { useState, useEffect, useCallback } from 'react';
import { SyncController, SyncState } from '../controllers/SyncController';

export function useSync(controller: SyncController) {
  const [state, setState] = useState<SyncState>(controller.getState());

  useEffect(() => {
    const unsubscribe = controller.subscribe(setState);
    controller.refreshState();
    return () => unsubscribe();
  }, [controller]);

  const triggerSync = useCallback(async () => {
    return controller.triggerSync();
  }, [controller]);

  const resolveConflict = useCallback(
    async (itemId: string) => {
      return controller.resolveConflict(itemId);
    },
    [controller]
  );

  return {
    viewModel: state.viewModel,
    isSyncing: state.isSyncing,
    error: state.error,
    triggerSync,
    resolveConflict,
  };
}
