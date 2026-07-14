import { appConfig } from '../config';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogMessage {
  message: string;
  context?: Record<string, unknown>;
  error?: Error | unknown;
}

export class Logger {
  private buildPayload(level: LogLevel, data: LogMessage) {
    return {
      timestamp: new Date().toISOString(),
      level,
      message: data.message,
      context: data.context,
      error: data.error instanceof Error ? data.error.message : data.error,
    };
  }

  private write(level: LogLevel, message: string, context?: Record<string, unknown>, error?: Error | unknown) {
    if (level === 'debug' && appConfig.env.isProd) {
      return;
    }

    const payload = this.buildPayload(level, { message, context, error });

    const dispatchMap: Record<LogLevel, (message?: any, ...optionalParams: any[]) => void> = {
      debug: console.debug,
      info: console.info,
      warn: console.warn,
      error: console.error,
    };

    dispatchMap[level](payload);
  }

  debug(message: string, context?: Record<string, unknown>) {
    this.write('debug', message, context);
  }

  info(message: string, context?: Record<string, unknown>) {
    this.write('info', message, context);
  }

  warn(message: string, context?: Record<string, unknown>, error?: Error | unknown) {
    this.write('warn', message, context, error);
  }

  error(message: string, context?: Record<string, unknown>, error?: Error | unknown) {
    this.write('error', message, context, error);
  }
}

export const logger = new Logger();
