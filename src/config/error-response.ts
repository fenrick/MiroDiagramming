/**
 * Standardized error response payload used across all HTTP routes.
 *
 * @param message Human readable error description.
 * @param code Optional machine readable error code.
 */
export function errorResponse(message: string, code?: string) {
  return {
    error: {
      message,
      ...(code ? { code } : {}),
    },
  }
}
