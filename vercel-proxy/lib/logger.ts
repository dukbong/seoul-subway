type LogLevel = 'info' | 'warn' | 'error';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  endpoint: string;
  method: string;
  duration?: number;
  status?: number;
  error?: string;
  [key: string]: unknown;
}

export function log(entry: Omit<LogEntry, 'timestamp'>): void {
  const logEntry = {
    timestamp: new Date().toISOString(),
    ...entry,
  } as LogEntry;

  const output = JSON.stringify(logEntry);

  if (entry.level === 'error') {
    console.error(output);
  } else {
    console.log(output);
  }
}
