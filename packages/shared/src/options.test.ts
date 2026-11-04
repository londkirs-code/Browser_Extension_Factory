import { describe, expect, it } from "vitest";
import { createOptionsModel } from "./options.js";

describe("options schema helper", () => {
  it("provides defaults and validates persisted values", () => {
    const model = createOptionsModel<{ enabled: boolean; count: number }>([
      { key: "enabled", defaultValue: true, parse: (value) => value === true },
      {
        key: "count",
        defaultValue: 3,
        parse: (value) => Number(value),
        validate: (value) => Number.isInteger(value) && value >= 0,
      },
    ]);
    expect(model.defaults).toEqual({ enabled: true, count: 3 });
    expect(model.parse({ enabled: false, count: -1 })).toEqual({ enabled: false, count: 3 });
  });
});
