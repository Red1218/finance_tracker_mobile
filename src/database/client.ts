import 'react-native-url-polyfill/auto';
import { createClient, SupportedStorage } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { appConfig } from '../core/config';
import { Database } from './types';

const memoryStorage = new Map<string, string>();

const isNativeSecureStore = Platform.OS !== 'web';

const secureSessionStorage: SupportedStorage = {
  getItem: async (key: string): Promise<string | null> => {
    if (isNativeSecureStore) {
      try {
        const value = await SecureStore.getItemAsync(key);
        if (value !== null) return value;
      } catch {
        // SecureStore unavailable or failed, fallback below
      }
    }
    try {
      return await AsyncStorage.getItem(key);
    } catch {
      return memoryStorage.get(key) ?? null;
    }
  },
  setItem: async (key: string, value: string): Promise<void> => {
    if (isNativeSecureStore) {
      try {
        await SecureStore.setItemAsync(key, value);
        return;
      } catch {
        // SecureStore unavailable or failed, fallback below
      }
    }
    try {
      await AsyncStorage.setItem(key, value);
    } catch {
      memoryStorage.set(key, value);
    }
  },
  removeItem: async (key: string): Promise<void> => {
    if (isNativeSecureStore) {
      try {
        await SecureStore.deleteItemAsync(key);
        return;
      } catch {
        // SecureStore unavailable or failed, fallback below
      }
    }
    try {
      await AsyncStorage.removeItem(key);
    } catch {
      memoryStorage.delete(key);
    }
  },
};

export const supabase = createClient<Database>(
  appConfig.supabase.url,
  appConfig.supabase.anonKey,
  {
    auth: {
      autoRefreshToken: true,
      detectSessionInUrl: false,
      persistSession: true,
      storage: secureSessionStorage,
    },
  },
);
