import { Logger, LogContext } from '../../application/ports/Logger';

export class LoggerAdapter implements Logger {
  info(message: string, context?: LogContext): void {
    this.log('INFO', message, context);
  }

  error(message: string, error?: Error, context?: LogContext): void {
    this.log('ERROR', message, { ...context, error: error?.message, stack: error?.stack });
  }

  warn(message: string, context?: LogContext): void {
    this.log('WARN', message, context);
  }

  debug(message: string, context?: LogContext): void {
    // In a real app, you might check an environment variable before logging debug
    this.log('DEBUG', message, context);
  }

  private log(severity: string, message: string, context?: Record<string, unknown>): void {
    const logEntry = {
      timestamp: new Date().toISOString(),
      severity,
      message,
      ...context
    };

    // Sanitize output (e.g. mask PII, balances) before outputting
    const sanitizedEntry = this.sanitize(logEntry);

    if (severity === 'ERROR') {
      console.error(JSON.stringify(sanitizedEntry));
    } else if (severity === 'WARN') {
      console.warn(JSON.stringify(sanitizedEntry));
    } else if (severity === 'DEBUG') {
      console.debug(JSON.stringify(sanitizedEntry));
    } else {
      console.info(JSON.stringify(sanitizedEntry));
    }
  }

  private sanitize(data: any): any {
    if (!data) return data;
    const stringified = JSON.stringify(data, (key, value) => {
      if (key.toLowerCase().includes('balance') || key.toLowerCase().includes('amount')) {
        return '***MASKED***';
      }
      return value;
    });
    return JSON.parse(stringified);
  }
}
