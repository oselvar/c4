import { describe, expect, it } from "vitest";

import { camelCase } from "./strings";

describe("strings", () => {
  it("should convert a string to camel case", () => {
    expect(camelCase("hello world's foo bar")).toBe("helloWorldsFooBar");
  });
});
