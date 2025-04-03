import { describe, expect, it } from "vitest";

import { Bank } from "../examples/Bank";
import { c4Model } from "../globalModel";
import { generateC4PlantUmlModel } from "./generateC4PlantUmlModel";
import { renderC4PlantUml } from "./renderC4PlantUml";

describe("generateC4PlantUml", () => {
  it("should generate a System Context diagram", () => {
    new Bank();
    const model = generateC4PlantUmlModel(c4Model, "SystemContext", "Bank");
    const puml = renderC4PlantUml(model);
    expect(puml).toEqual(`System(softwareSystemBank, "Bank", "Bank")\n\n`);
  });

  it("should generate a Container diagram", () => {
    new Bank();
    const model = generateC4PlantUmlModel(c4Model, "Container", "Bank");
    // console.log(model);
    const puml = renderC4PlantUml(model);
    expect(puml).toEqual(
      `Container(containerAPIApplication, "APIApplication", "APIApplication")\n\n`,
    );
  });
});
