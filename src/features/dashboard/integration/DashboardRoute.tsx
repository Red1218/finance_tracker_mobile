import { DashboardModule } from './DashboardModule';

/**
 * Defines the parameters expected by the Dashboard route.
 */
export type DashboardRouteParams = {
  userId: string;
};

/**
 * Route Configuration for React Navigation (or similar router).
 * Ties the route name to the entry-point component.
 */
export const DashboardRouteConfig = {
  name: 'Dashboard',
  component: DashboardModule,
  options: {
    // Hide standard headers if the feature provides its own (e.g., DashboardHeader)
    headerShown: false,
    title: 'Dashboard'
  }
};

/**
 * Deep Link Configuration for the Dashboard feature.
 * Maps URIs like `financeapp://dashboard?userId=123` to this route.
 */
export const DashboardDeepLinkConfig = {
  screens: {
    Dashboard: {
      path: 'dashboard',
      parse: {
        userId: (userId: string) => userId,
      }
    }
  }
};

/**
 * Example Route Guard (Authentication)
 * In a real app, this might be a higher-order component or a hook
 * applied at the navigation level to ensure `userId` is present.
 */
export function canActivateDashboard(params?: Partial<DashboardRouteParams>): boolean {
  return !!params?.userId;
}
