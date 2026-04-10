import { Alert } from 'react-native';

export const toast = ({ title, description, variant }: { title: string, description?: string, variant?: 'default' | 'destructive' }) => {
  Alert.alert(title, description || '');
};

export const useToast = () => {
  return { toast };
};
