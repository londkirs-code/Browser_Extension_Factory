export type SerializedOcrError = {
  name: string;
  message: string;
};

export function serializeError(error: unknown): SerializedOcrError {
  if (error && typeof error === "object") {
    const candidate = error as { name?: unknown; message?: unknown };
    return {
      name: typeof candidate.name === "string" ? candidate.name : "Error",
      message: typeof candidate.message === "string" ? candidate.message : String(error),
    };
  }
  return { name: "Error", message: String(error) };
}
