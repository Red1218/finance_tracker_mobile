import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    alias: {
      'react-native': 'react-native-web',
      '@': path.resolve(__dirname, '.'),
    },
    env: {
      EXPO_PUBLIC_SUPABASE_URL: 'https://mock.supabase.co',
      EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY: 'mock-key',
    },
    server: {
      deps: {
        inline: ['react-native-gifted-charts', 'react-native-svg', 'lucide-react-native'],
      },
    },
  },
});
