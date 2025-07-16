/** Safely convert a value to string, JSON encoding objects. */
export function toSafeString(value: unknown): string {
  if (value == null) return '';
  return typeof value === 'object' ? JSON.stringify(value) : String(value);
}
