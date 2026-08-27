import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    alias: {
      'react-native': 'react-native-web',
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
