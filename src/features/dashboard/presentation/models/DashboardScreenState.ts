import { DashboardViewModel } from '../../application/view-models/DashboardViewModel';

export interface DashboardScreenState {
  /**
   * The core view model from the Application Layer
   */
  viewModel: DashboardViewModel | null;

  /**
   * Indicates if a full pull-to-refresh is in progress
   */
  isRefreshing: boolean;

  /**
   * Indicates if the Reporting Period selector dropdown/modal is open
   */
  isPeriodSelectorOpen: boolean;

  /**
   * Timestamp of the last successful refresh
   */
  lastRefresh: number | null;

  /**
   * Currently focused or selected section (for keyboard navigation or highlighting)
   */
  selectedSection: string | null;

  /**
   * Tracks any active modal by ID (e.g., 'quick-add-transaction')
   */
  activeModal: string | null;
}

export const initialDashboardScreenState: DashboardScreenState = {
  viewModel: null,
  isRefreshing: false,
  isPeriodSelectorOpen: false,
  lastRefresh: null,
  selectedSection: null,
  activeModal: null
};
