import React from 'react';
import { View, Text, Modal, TouchableOpacity } from 'react-native';

interface DeleteBudgetDialogProps {
  visible: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting?: boolean;
}

export const DeleteBudgetDialog: React.FC<DeleteBudgetDialogProps> = ({ visible, onConfirm, onCancel, isDeleting }) => {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View className="flex-1 justify-center items-center bg-black/50 px-4">
        <View className="bg-white rounded-xl p-6 w-full max-w-sm">
          <Text className="text-lg font-bold text-gray-900 mb-2">Delete Budget</Text>
          <Text className="text-sm text-gray-600 mb-6">
            Are you sure you want to delete this budget? Your tracked expenses will remain safe.
          </Text>
          
          <View className="flex-row justify-end space-x-3">
            <TouchableOpacity 
              onPress={onCancel}
              disabled={isDeleting}
              className="px-4 py-2"
            >
              <Text className="text-gray-600 font-semibold">Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={onConfirm}
              disabled={isDeleting}
              className="px-4 py-2 bg-red-600 rounded-md"
            >
              <Text className="text-white font-semibold">{isDeleting ? 'Deleting...' : 'Delete'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};
