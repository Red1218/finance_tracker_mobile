// Object.freeze is not monkey-patched anymore as production code was adjusted to handle immutability correctly.
import { vi } from 'vitest';

// Mock react-native-url-polyfill to prevent parsing errors
vi.mock('react-native-url-polyfill/auto', () => ({}));
vi.mock('react-native-get-random-values', () => ({}));

// Mock expo-secure-store
vi.mock('expo-secure-store', () => ({
  getItemAsync: vi.fn(),
  setItemAsync: vi.fn(),
  deleteItemAsync: vi.fn(),
}));

// Mock lucide-react-native
vi.mock('lucide-react-native', () => ({
  __esModule: true,
  default: new Proxy({}, { get: () => () => null }),
  Bell: () => null,
  Shield: () => null,
  Database: () => null,
  Cloud: () => null,
  RefreshCw: () => null,
  WifiOff: () => null,
  AlertCircle: () => null,
  AlertTriangle: () => null,
  HelpCircle: () => null,
  PlusCircle: () => null,
  Target: () => null,
}));

// Mock react-native-safe-area-context
vi.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({ children }: any) => children,
  SafeAreaProvider: ({ children }: any) => children,
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

// Mock react-native-gifted-charts
vi.mock('react-native-gifted-charts', () => ({
  BarChart: () => null,
  PieChart: () => null,
  LineChart: () => null,
}));

// Mock react-native-svg
vi.mock('react-native-svg', () => ({
  Svg: () => null,
  Path: () => null,
  G: () => null,
  Text: () => null,
  Rect: () => null,
  Circle: () => null,
  default: () => null,
}));

// Mock @react-native-community/netinfo
vi.mock('@react-native-community/netinfo', () => ({
  default: {
    fetch: vi.fn().mockResolvedValue({ isConnected: true, isInternetReachable: true }),
    addEventListener: vi.fn(() => vi.fn()),
  },
  useNetInfo: vi.fn().mockReturnValue({ isConnected: true, isInternetReachable: true }),
}));

// Mock expo-notifications
vi.mock('expo-notifications', () => ({
  requestPermissionsAsync: vi.fn().mockResolvedValue({ status: 'granted' }),
  getPermissionsAsync: vi.fn().mockResolvedValue({ status: 'granted' }),
  scheduleNotificationAsync: vi.fn().mockResolvedValue('mock-notification-id'),
  cancelScheduledNotificationAsync: vi.fn().mockResolvedValue(undefined),
  cancelAllScheduledNotificationsAsync: vi.fn().mockResolvedValue(undefined),
  setNotificationChannelAsync: vi.fn().mockResolvedValue(undefined),
  addNotificationResponseReceivedListener: vi.fn(() => ({ remove: vi.fn() })),
}));

// Mock expo-file-system
vi.mock('expo-file-system', () => ({
  documentDirectory: 'file:///mock-documents/',
  writeAsStringAsync: vi.fn().mockResolvedValue(undefined),
  readAsStringAsync: vi.fn().mockResolvedValue(''),
  deleteAsync: vi.fn().mockResolvedValue(undefined),
  getInfoAsync: vi.fn().mockResolvedValue({ exists: true }),
}));

// Mock expo-document-picker
vi.mock('expo-document-picker', () => ({
  getDocumentAsync: vi.fn().mockResolvedValue({ canceled: true, assets: null }),
}));

// Mock expo-sharing
vi.mock('expo-sharing', () => ({
  isAvailableAsync: vi.fn().mockResolvedValue(true),
  shareAsync: vi.fn().mockResolvedValue(undefined),
}));

// Mock useTheme from src/shared/theme
vi.mock('../src/shared/theme', () => ({
  useTheme: () => ({
    colors: {
      textPrimary: '#0A0F1D',
      textSecondary: '#4A5568',
      backgroundPrimary: '#F8FAFC',
      brandPrimary: '#2563EB',
      surfacePrimary: '#FFFFFF',
      surfaceElevated: '#FFFFFF',
      borderSubtle: '#E2E8F0',
      error: '#DC2626',
      warning: '#D97706',
      success: '#16A34A',
    },
    typography: {
      heading: { fontSize: 20 },
      title: { fontSize: 18 },
      body: { fontSize: 14 },
      caption: { fontSize: 12 },
    },
  }),
}));

// Mock environment variables for config validation
process.env.EXPO_PUBLIC_SUPABASE_URL = 'https://mock.supabase.co';
process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY = 'mock-key';
(process.env as any).NODE_ENV = 'test';
