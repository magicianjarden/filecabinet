interface LogEntry {
  level: 'info' | 'warn' | 'error';
  message: string;
  timestamp: string;
  requestId?: string;
  error?: unknown;
  context?: Record<string, unknown>;
}

export class Logger {
  static log(entry: Omit<LogEntry, 'timestamp'>) {
    const logEntry: LogEntry = {
      ...entry,
      timestamp: new Date().toISOString()
    };

    // In development, log to console
    if (process.env.NODE_ENV === 'development') {
      const { level } = logEntry;
      console[level](JSON.stringify(logEntry, null, 2));
    } else {
      // In production, you might want to send logs to a service
      // Example: await sendToLogService(logEntry);
    }
  }

  static error(message: string, error?: unknown, context?: Record<string, unknown>) {
    this.log({
      level: 'error',
      message,
      error,
      context
    });
  }

  static info(message: string, context?: Record<string, unknown>) {
    this.log({
      level: 'info',
      message,
      context
    });
  }

  static warn(message: string, context?: Record<string, unknown>) {
    this.log({
      level: 'warn',
      message,
      context
    });
  }
} 