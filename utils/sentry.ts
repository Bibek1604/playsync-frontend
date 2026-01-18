// utils/sentry.ts
import * as Sentry from "@sentry/nextjs";

export const reportError = (error: Error, context?: Record<string, any>) => {
  Sentry.captureException(error, {
    tags: {
      component: "frontend",
    },
    extra: context,
  });
};

export const reportMessage = (message: string, level: Sentry.SeverityLevel = "info") => {
  Sentry.captureMessage(message, level);
};

export const setUser = (user: { id: string; email?: string; username?: string }) => {
  Sentry.setUser(user);
};

export const setTag = (key: string, value: string) => {
  Sentry.setTag(key, value);
};