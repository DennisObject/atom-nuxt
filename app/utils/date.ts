export function displayDate(
  value: string | null | undefined,
  time = false
): string {
  if (!value) return "";
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "short",
    ...(time ? { timeStyle: "short" as const } : {}),
    timeZone: "UTC",
  }).format(new Date(value));
}
