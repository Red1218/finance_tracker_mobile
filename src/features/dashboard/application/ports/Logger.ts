export interface LogContext extends Record<string, unknown> {
  correlationId?: string;
  userId?: string;
  timestamp?: string;
  severity?: 'Debug' | 'Info' | 'Warn' | 'Error';
}

export interface Logger {
  info(message: string, context?: LogContext): void;
  error(message: string, error?: Error, context?: LogContext): void;
  warn(message: string, context?: LogContext): void;
  debug(message: string, context?: LogContext): void;
}
