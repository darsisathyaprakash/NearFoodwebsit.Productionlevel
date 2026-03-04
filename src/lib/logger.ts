// Centralized logger utility for NearFood
// In production, only errors and warnings are logged.
// In development, all levels are logged.

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
    [key: string]: unknown;
}

const isProduction = process.env.NODE_ENV === 'production';

function formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` | ${JSON.stringify(context)}` : '';
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}`;
}

export const logger = {
    debug(message: string, context?: LogContext): void {
        if (!isProduction) {
            console.log(formatMessage('debug', message, context));
        }
    },

    info(message: string, context?: LogContext): void {
        if (!isProduction) {
            console.info(formatMessage('info', message, context));
        }
    },

    warn(message: string, context?: LogContext): void {
        console.warn(formatMessage('warn', message, context));
    },

    error(message: string, error?: unknown, context?: LogContext): void {
        const errorContext: LogContext = { ...context };
        if (error instanceof Error) {
            errorContext.errorMessage = error.message;
            errorContext.stack = isProduction ? undefined : error.stack;
        } else if (error !== undefined) {
            errorContext.error = String(error);
        }
        console.error(formatMessage('error', message, errorContext));
    },
};
