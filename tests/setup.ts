// Object.freeze is not monkey-patched anymore as production code was adjusted to handle immutability correctly.

// Mock react-native-url-polyfill to prevent parsing errors
vi.mock('react-native-url-polyfill/auto', () => ({}));

// Mock expo-secure-store
vi.mock('expo-secure-store', () => ({
  getItemAsync: vi.fn(),
  setItemAsync: vi.fn(),
  deleteItemAsync: vi.fn(),
}));

// Mock environment variables for config validation
process.env.EXPO_PUBLIC_SUPABASE_URL = 'https://mock.supabase.co';
process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY = 'mock-key';
process.env.NODE_ENV = 'test';
