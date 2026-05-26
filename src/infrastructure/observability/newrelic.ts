type NewRelicApi = {
  noticeError: (error: Error, customAttributes?: Record<string, unknown>) => void;
  recordMetric: (name: string, value: number) => void;
  recordCustomEvent: (eventType: string, attributes: Record<string, unknown>) => void;
  addCustomAttribute: (key: string, value: string | number | boolean) => void;
  getTransaction: () => { traceId?: string } | undefined;
};

let agent: NewRelicApi | null = null;

if (process.env.NEW_RELIC_ENABLED === "true") {
  try {
    agent = require("newrelic") as NewRelicApi;
  } catch {
    agent = null;
  }
}

export const newrelic = {
  noticeError(error: Error, attrs: Record<string, unknown> = {}): void {
    agent?.noticeError(error, attrs);
  },
  recordMetric(name: string, value: number): void {
    agent?.recordMetric(name, value);
  },
  recordCustomEvent(eventType: string, attrs: Record<string, unknown>): void {
    agent?.recordCustomEvent(eventType, attrs);
  },
  addCustomAttribute(key: string, value: string | number | boolean): void {
    agent?.addCustomAttribute(key, value);
  },
  enabled(): boolean {
    return agent !== null;
  },
};
