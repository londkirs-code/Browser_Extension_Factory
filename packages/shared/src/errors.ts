export function toError(value: unknown): Error {
  if (value instanceof Error) return value;
  if (typeof value === "string") return new Error(value);
  try {
    return new Error(JSON.stringify(value));
  } catch {
    return new Error("An unknown error occurred.");
  }
}

export function errorMessage(value: unknown, fallback = "An unexpected error occurred."): string {
  const error = toError(value);
  return error.message.trim() || fallback;
}

export async function runSafely<T>(
  operation: () => T | Promise<T>,
  fallback: T,
  onError?: (error: Error) => void,
): Promise<T> {
  try {
    return await operation();
  } catch (value) {
    const error = toError(value);
    onError?.(error);
    return fallback;
  }
}
