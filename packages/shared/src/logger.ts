export type LogSink = Pick<Console, "debug" | "info" | "warn" | "error">;

export type Logger = {
  debug(...values: unknown[]): void;
  info(...values: unknown[]): void;
  warn(...values: unknown[]): void;
  error(...values: unknown[]): void;
};

export function createLogger(options: { enabled?: boolean; sink?: LogSink } = {}): Logger {
  const enabled = options.enabled ?? false;
  const sink = options.sink ?? console;
  return {
    debug: (...values) => {
      if (enabled) sink.debug("[Extension]", ...values);
    },
    info: (...values) => {
      if (enabled) sink.info("[Extension]", ...values);
    },
    warn: (...values) => {
      if (enabled) sink.warn("[Extension]", ...values);
    },
    error: (...values) => {
      if (enabled) sink.error("[Extension]", ...values);
    },
  };
}
