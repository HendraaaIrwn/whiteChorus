import { TZDate } from "@date-fns/tz";

export type DayPeriod = { key: string; start: Date; end: Date };

export function getDayPeriod(now: Date, timezone = "Asia/Jakarta"): DayPeriod {
  const zoned = new TZDate(now, timezone);
  const start = new TZDate(
    zoned.getFullYear(),
    zoned.getMonth(),
    zoned.getDate(),
    timezone,
  );
  start.setHours(0, 0, 0, 0);
  const end = new TZDate(start, timezone);
  end.setDate(end.getDate() + 1);
  const key = `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, "0")}-${String(start.getDate()).padStart(2, "0")}`;
  return { key, start: new Date(start), end: new Date(end) };
}

export function getCompletedDayPeriod(
  now: Date,
  timezone = "Asia/Jakarta",
): DayPeriod {
  const current = getDayPeriod(now, timezone);
  return getDayPeriod(new Date(current.start.getTime() - 1), timezone);
}
