import pino from "pino";
import { AsyncLocalStorage } from "node:async_hooks";
import { newrelic } from "../../../observability/newrelic";

type LogContext = { correlationId?: string };

export const logContext = new AsyncLocalStorage<LogContext>();

const baseLogger = pino({
  level: process.env.LOG_LEVEL || (process.env.NODE_ENV === "test" ? "silent" : "info"),
  base: {
    service: process.env.NEW_RELIC_APP_NAME || "fiap-web",
    env: process.env.NODE_ENV || "development",
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  formatters: {
    level: (label) => ({ level: label }),
  },
});

function currentContext(): LogContext {
  return logContext.getStore() || {};
}

class Logger {
  static log(message: string, extra: Record<string, unknown> = {}): void {
    baseLogger.info({ ...currentContext(), ...extra }, message);
  }

  static info(message: string, extra: Record<string, unknown> = {}): void {
    baseLogger.info({ ...currentContext(), ...extra }, message);
  }

  static warn(message: string, extra: Record<string, unknown> = {}): void {
    baseLogger.warn({ ...currentContext(), ...extra }, message);
  }

  static error(message: string, extra: Record<string, unknown> = {}): void {
    const ctx = currentContext();
    baseLogger.error({ ...ctx, ...extra }, message);
    const err = extra.err instanceof Error ? extra.err : new Error(message);
    newrelic.noticeError(err, { ...ctx, ...extra, message });
  }

  static debug(message: string, extra: Record<string, unknown> = {}): void {
    baseLogger.debug({ ...currentContext(), ...extra }, message);
  }
}

export default Logger;
