const ONE_HOUR_MS = 60 * 60 * 1000;
const FIFTEEN_MIN_MS = 15 * 60 * 1000;
const THIRTY_MIN_MS = 30 * 60 * 1000;

export function computeTaskReminderAt(dueAt: Date, now = new Date()): Date | null {
  const msUntilDue = dueAt.getTime() - now.getTime();
  if (msUntilDue <= 0) return null;

  let reminderAt: Date;
  if (msUntilDue <= ONE_HOUR_MS) {
    reminderAt = new Date(dueAt.getTime() - FIFTEEN_MIN_MS);
  } else {
    reminderAt = new Date(dueAt.getTime() - ONE_HOUR_MS);
  }

  if (reminderAt.getTime() <= now.getTime()) {
    reminderAt = new Date(now.getTime() + 60_000);
  }

  return reminderAt;
}

export function computeEventReminderAt(startsAt: Date, now = new Date()): Date | null {
  const reminderAt = new Date(startsAt.getTime() - THIRTY_MIN_MS);
  if (reminderAt.getTime() <= now.getTime()) return null;
  return reminderAt;
}

function getHourInTimezone(date: Date, timezone: string): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    hour: 'numeric',
    hour12: false,
  }).formatToParts(date);
  return parseInt(parts.find((p) => p.type === 'hour')?.value ?? '12', 10);
}

function nextMorningAt7(from: Date, timezone: string): Date {
  const candidate = new Date(from);
  for (let i = 0; i < 48; i++) {
    candidate.setMinutes(candidate.getMinutes() + 30);
    const hour = getHourInTimezone(candidate, timezone);
    if (hour === 7) {
      const minute = parseInt(
        new Intl.DateTimeFormat('en-US', {
          timeZone: timezone,
          minute: 'numeric',
        }).format(candidate),
        10,
      );
      if (minute < 15) return candidate;
    }
  }
  const fallback = new Date(from);
  fallback.setDate(fallback.getDate() + 1);
  fallback.setHours(7, 0, 0, 0);
  return fallback;
}

export function applyDndShift(
  scheduledAt: Date,
  timezone = 'America/Sao_Paulo',
): Date {
  const hour = getHourInTimezone(scheduledAt, timezone);
  if (hour >= 22 || hour < 7) {
    return nextMorningAt7(scheduledAt, timezone);
  }
  return scheduledAt;
}

export function formatReminderMinuteKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}-${date.getHours()}-${date.getMinutes()}`;
}
