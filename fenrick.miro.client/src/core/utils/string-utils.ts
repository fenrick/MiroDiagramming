/** Safely convert a value to string, JSON encoding objects. */
export function toSafeString(value: unknown): string {
  if (value == null) {
    return "";
  }

  const primitive =
    typeof value === "string" ||
      typeof value === "number" ||
      typeof value === "boolean" ||
      typeof value === "bigint";

  if (primitive) {
    return String(value);
  }

  try {
    return JSON.stringify(value);
  } catch {
    return Object.prototype.toString.call(value);
}
}
