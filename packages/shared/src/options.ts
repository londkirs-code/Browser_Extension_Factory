export type OptionDefinition<T extends Record<string, unknown>> = {
  [K in keyof T]-?: {
    key: K;
    defaultValue: T[K];
    parse?: (value: unknown) => T[K];
    validate?: (value: T[K]) => boolean;
  };
}[keyof T];

export function createOptionsModel<T extends Record<string, unknown>>(
  definitions: Array<OptionDefinition<T>>,
) {
  const defaults = Object.fromEntries(
    definitions.map((definition) => [definition.key, definition.defaultValue]),
  ) as T;

  function parse(values: unknown): T {
    const source = values && typeof values === "object" ? values as Record<string, unknown> : {};
    const result = { ...defaults };
    for (const definition of definitions) {
      if (!(definition.key as string in source)) continue;
      try {
        const value = definition.parse ? definition.parse(source[definition.key as string]) : source[definition.key as string] as T[keyof T];
        if (!definition.validate || definition.validate(value as never)) {
          (result as Record<string, unknown>)[definition.key as string] = value;
        }
      } catch {
        // Invalid persisted values fall back to the schema default.
      }
    }
    return result;
  }

  return { defaults, parse };
}
