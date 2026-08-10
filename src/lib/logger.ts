export const logger = {
  info: (message: string, context?: Record<string, any>) => {
    console.log(JSON.stringify({
      timestamp: new Date().toISOString(),
      level: "info",
      message,
      ...context
    }));
  },
  error: (message: string, error?: any, context?: Record<string, any>) => {
    const errorDetails = error instanceof Error ? { message: error.message, stack: error.stack } : error;
    console.error(JSON.stringify({
      timestamp: new Date().toISOString(),
      level: "error",
      message,
      error: errorDetails,
      ...context
    }));
  },
  warn: (message: string, context?: Record<string, any>) => {
    console.warn(JSON.stringify({
      timestamp: new Date().toISOString(),
      level: "warn",
      message,
      ...context
    }));
  }
};
