import * as Linking from 'expo-linking';
import { Platform } from 'react-native';

export class AuthRedirectService {
  /**
   * Generates the correct redirect URL for Supabase authentication
   * based on the current platform (Web vs Native).
   */
  public static getRedirectUrl(): string {
    // We append the auth path where the deep link or web route should land
    return Linking.createURL('/auth');
  }
}
