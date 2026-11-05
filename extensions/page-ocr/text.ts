const BIDI_CONTROL_CHARACTERS = /[\u061c\u200e\u200f\u202a-\u202e\u2066-\u2069\ufeff]/g;

export function cleanRecognizedText(value: string): string {
  return value
    .replace(BIDI_CONTROL_CHARACTERS, "")
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .map((line) => line.trim())
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
