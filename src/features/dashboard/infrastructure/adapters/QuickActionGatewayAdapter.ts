import { QuickActionGateway } from '../../application/ports/QuickActionGateway';
import { Logger } from '../../application/ports/Logger';
import { TelemetryProvider } from '../../application/ports/TelemetryProvider';

export class QuickActionGatewayAdapter implements QuickActionGateway {
  constructor(
    private readonly baseUrl: string,
    private readonly logger: Logger,
    private readonly telemetry: TelemetryProvider
  ) {}

  async executeAction(actionType: string, payload: unknown): Promise<void> {
    const endTimer = this.telemetry.startTimer(`QuickActionGateway.${actionType}`);
    this.logger.info(`Executing Quick Action: ${actionType}`, { actionType });

    try {
      // Simulate mapping an actionType to a specific external bounded context endpoint
      let endpoint = '';
      if (actionType === 'AddTransaction') {
        endpoint = '/api/transactions';
      } else if (actionType === 'UpdateBudget' || actionType === 'AdjustBudget') {
        endpoint = '/api/budgets';
      } else {
        throw new Error(`Unsupported action type: ${actionType}`);
      }

      const targetUrl = `${this.baseUrl}${endpoint}`;
      
      let response: Response;
      if (targetUrl.startsWith('mock://')) {
        // Safe mock response when running locally without a remote backend server
        response = new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      } else {
        response = await fetch(targetUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });
      }

      if (!response.ok) {
        throw new Error(`Quick action failed with status ${response.status}`);
      }

      this.telemetry.trackDependency(`QuickActionAPI.${actionType}`, endTimer(), true);
    } catch (error: any) {
      this.telemetry.trackDependency(`QuickActionAPI.${actionType}`, endTimer(), false);
      this.logger.error(`Quick Action execution failed: ${actionType}`, error);
      throw error;
    }
  }
}
