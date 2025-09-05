import * as Sentry from "@sentry/react";

function initSentry() {
  if (
    import.meta.env.VITE_APP_ENV !== "production" ||
    process.env.NODE_ENV !== "production"
  ) {
    return;
  }

  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,

    // Adds request headers and IP for users, for more info visit:
    // https://docs.sentry.io/platforms/javascript/guides/react/configuration/options/#sendDefaultPii
    sendDefaultPii: true,

    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration(),
    ],
    tracesSampleRate: 1.0, // 100% of transactions are sent to Sentry
    sampleRate: 1.0, // 100% of events are sampled

    // Session Replay
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    // Filter out common non-critical errors
    beforeSend(event) {
      // Filter out browser extension errors
      if (event.exception) {
        const firstException = event.exception.values?.[0];
        if (firstException?.stacktrace?.frames) {
          const topFrame =
            firstException.stacktrace.frames[
              firstException.stacktrace.frames.length - 1
            ];
          if (topFrame?.filename?.includes("extension://")) {
            return null;
          }
        }
      }

      // Filter out ResizeObserver loop limit exceeded error (common browser bug)
      if (event.message?.includes("ResizeObserver loop limit exceeded")) {
        return null;
      }

      // Filter out network errors in development
      if (event.message?.includes("Network Error")) {
        return null;
      }

      return event;
    },
  });
}

initSentry();
