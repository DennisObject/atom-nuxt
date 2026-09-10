export function displayDate(
  value: string | null | undefined,
  time = false,
): string {
  if (!value) {
    return "";
  }
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "short",
    ...(time ? { timeStyle: "short" as const } : {}),
    timeZone: "UTC",
  }).format(new Date(value));
}

export function relativeDate(
  value: string | null | undefined,
  locale = "en",
  now = Date.now(),
): string {
  if (!value) {
    return "";
  }

  const seconds = (new Date(value).getTime() - now) / 1000;
  if (!Number.isFinite(seconds)) {
    return "";
  }

  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ["year", 31536000],
    ["month", 2592000],
    ["week", 604800],
    ["day", 86400],
    ["hour", 3600],
    ["minute", 60],
    ["second", 1],
  ];
  const [unit, divisor] =
    units.find(([, size]) => Math.abs(seconds) >= size) ||
    units[units.length - 1]!;
  return new Intl.RelativeTimeFormat(locale.replace("_", "-"), {
    numeric: "always",
  }).format(Math.trunc(seconds / divisor), unit);
}
