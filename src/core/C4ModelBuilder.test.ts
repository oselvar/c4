import { describe, expect, it } from "vitest";

import { simpleBankModel } from "../test/simpleBankModel";
import { C4ModelBuilder } from "./C4ModelBuilder";

describe("C4ModelBuilder", () => {
  it("should create a C4Model from an existing model", () => {
    const builder = new C4ModelBuilder(simpleBankModel, Promise.resolve());
    const model = builder.build();
    expect(
      Object.values(model.objects).toSorted((a, b) =>
        a.name.localeCompare(b.name),
      ),
    ).toEqual(
      Object.values(simpleBankModel.objects).toSorted((a, b) =>
        a.name.localeCompare(b.name),
      ),
    );
  });
});
