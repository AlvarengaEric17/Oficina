type LogLevel = 'info' | 'warn' | 'error' | 'debug';

const isDev = process.env.NODE_ENV !== 'production';

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  gray: '\x1b[90m',
  magenta: '\x1b[35m',
};

const colorize = (level: LogLevel): string => {
  switch (level) {
    case 'info':
      return colors.blue;
    case 'warn':
      return colors.yellow;
    case 'error':
      return colors.red;
    case 'debug':
      return colors.gray;
  }
};

const formatMeta = (meta?: Record<string, any>): string => {
  if (!meta || Object.keys(meta).length === 0) return '';
  if (isDev) {
    return `\n${JSON.stringify(meta, null, 2)}`;
  }
  return ` ${JSON.stringify(meta)}`;
};

const log = (level: LogLevel, message: string, meta?: Record<string, any>) => {
  const timestamp = new Date().toISOString();
  const color = colorize(level);
  const upperLevel = level.toUpperCase().padEnd(5);

  const output = `${colors.gray}${timestamp}${colors.reset} ${color}${upperLevel}${colors.reset} ${message}${formatMeta(meta)}`;

  if (level === 'error') {
    console.error(output);
  } else if (level === 'warn') {
    console.warn(output);
  } else {
    console.log(output);
  }
};

export const logger = {
  info: (message: string, meta?: Record<string, any>) => log('info', message, meta),
  warn: (message: string, meta?: Record<string, any>) => log('warn', message, meta),
  error: (message: string, meta?: Record<string, any>) => log('error', message, meta),
  debug: (message: string, meta?: Record<string, any>) => {
    if (isDev) log('debug', message, meta);
  },
};
