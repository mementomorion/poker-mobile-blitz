
// Logging system for WebSocket operations
import { toast } from "sonner";

// Log levels
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

// Current log level - can be changed at runtime
let currentLogLevel = LogLevel.INFO;

// Log message with timestamp and category
export const log = (
  level: LogLevel,
  category: string,
  message: string,
  data?: any
) => {
  // Skip if below current log level
  if (level < currentLogLevel) return;

  const timestamp = new Date().toISOString();
  const levelString = LogLevel[level];

  // Format the message
  const formattedMessage = `[${timestamp}] [${levelString}] [${category}] ${message}`;

  // Log to console with appropriate level
  switch (level) {
    case LogLevel.DEBUG:
      console.debug(formattedMessage, data || "");
      break;
    case LogLevel.INFO:
      console.log(formattedMessage, data || "");
      break;
    case LogLevel.WARN:
      console.warn(formattedMessage, data || "");
      break;
    case LogLevel.ERROR:
      console.error(formattedMessage, data || "");
      break;
  }
};

// Helper methods for different log levels
export const logDebug = (category: string, message: string, data?: any) =>
  log(LogLevel.DEBUG, category, message, data);

export const logInfo = (category: string, message: string, data?: any) =>
  log(LogLevel.INFO, category, message, data);

export const logWarn = (category: string, message: string, data?: any) =>
  log(LogLevel.WARN, category, message, data);

export const logError = (category: string, message: string, data?: any) =>
  log(LogLevel.ERROR, category, message, data);

// Set the current log level
export const setLogLevel = (level: LogLevel) => {
  currentLogLevel = level;
  logInfo("Logging", `Log level set to ${LogLevel[level]}`);
};

// Log and show a toast notification for important errors
export const logErrorWithToast = (
  category: string,
  title: string,
  description: string,
  data?: any
) => {
  logError(category, description, data);
  toast.error(title, { description });
};

// Log and show a toast notification for important successes
export const logSuccessWithToast = (
  category: string,
  title: string,
  description: string,
  data?: any
) => {
  logInfo(category, description, data);
  toast.success(title, { description });
};
