// Performance-optimized logging utility
// Only logs in development to reduce production overhead

type LogLevel = "log" | "warn" | "error" | "info";

class Logger {
  private isDev = import.meta.env.DEV;

  private logWithLevel(level: LogLevel, message: string, ...args: any[]) {
    if (!this.isDev && level !== "error") return;
    console[level](message, ...args);
  }

  log(message: string, ...args: any[]) {
    this.logWithLevel("log", message, ...args);
  }

  warn(message: string, ...args: any[]) {
    this.logWithLevel("warn", message, ...args);
  }

  error(message: string, ...args: any[]) {
    // Always log errors, even in production
    console.error(message, ...args);
  }

  info(message: string, ...args: any[]) {
    this.logWithLevel("info", message, ...args);
  }

  // Performance-focused methods
  auth(message: string, ...args: any[]) {
    if (this.isDev) {
      console.log(`🔐 ${message}`, ...args);
    }
  }

  database(message: string, ...args: any[]) {
    if (this.isDev) {
      console.log(`📊 ${message}`, ...args);
    }
  }

  performance(message: string, ...args: any[]) {
    if (this.isDev) {
      console.log(`⚡ ${message}`, ...args);
    }
  }
}

export const logger = new Logger();
