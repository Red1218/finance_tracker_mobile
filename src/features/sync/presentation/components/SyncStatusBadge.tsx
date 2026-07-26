import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useSync } from '../hooks/useSync';
import { SyncController } from '../controllers/SyncController';

export interface SyncStatusBadgeProps {
  controller: SyncController;
}

export const SyncStatusBadge: React.FC<SyncStatusBadgeProps> = ({ controller }) => {
  const { viewModel, isSyncing, triggerSync } = useSync(controller);

  return (
    <TouchableOpacity
      onPress={triggerSync}
      disabled={isSyncing || !viewModel.isOnline}
      className="flex-row items-center bg-gray-900 border border-gray-800 px-3 py-1.5 rounded-full space-x-2"
      accessibilityLabel={`Sync Status: ${viewModel.statusLabel}`}
    >
      <View
        className={`w-2.5 h-2.5 rounded-full ${
          viewModel.statusColor === 'emerald'
            ? 'bg-emerald-500'
            : viewModel.statusColor === 'amber'
            ? 'bg-amber-500'
            : viewModel.statusColor === 'red'
            ? 'bg-red-500'
            : 'bg-gray-500'
        }`}
      />
      {isSyncing ? (
        <ActivityIndicator size="small" color="#EF4444" />
      ) : (
        <Text className="text-xs font-medium text-gray-300">
          {viewModel.statusLabel}
        </Text>
      )}
    </TouchableOpacity>
  );
};
