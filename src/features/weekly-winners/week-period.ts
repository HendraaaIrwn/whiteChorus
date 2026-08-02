import { TZDate } from "@date-fns/tz";

export type WeekPeriod = { key: string; start: Date; end: Date };

export function getWeekPeriod(
  now: Date,
  timezone = "Asia/Jakarta",
): WeekPeriod {
  const zoned = new TZDate(now, timezone);
  const daysSinceMonday = (zoned.getDay() + 6) % 7;
  const start = new TZDate(
    zoned.getFullYear(),
    zoned.getMonth(),
    zoned.getDate() - daysSinceMonday,
    timezone,
  );
  start.setHours(0, 0, 0, 0);
  const end = new TZDate(start, timezone);
  end.setDate(end.getDate() + 7);
  const key = `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, "0")}-${String(start.getDate()).padStart(2, "0")}`;
  return { key, start: new Date(start), end: new Date(end) };
}

export function getCompletedWeekPeriod(
  now: Date,
  timezone = "Asia/Jakarta",
): WeekPeriod {
  const current = getWeekPeriod(now, timezone);
  return getWeekPeriod(new Date(current.start.getTime() - 1), timezone);
}
