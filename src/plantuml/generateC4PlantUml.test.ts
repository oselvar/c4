import { describe, expect, it } from "vitest";

import { C4Model } from "../c4Model";
import { generateC4PlantUmlModel } from "./generateC4PlantUmlModel";
import { renderC4PlantUml } from "./renderC4PlantUml";

describe("Internet Banking Container Diagram", () => {
  it("should match expected output", () => {
    const model = new C4Model();

    model.person("Customer");
    model.softwareSystem("Internet Banking");

    model.container("Single-Page App", {
      softwareSystem: "Internet Banking",
      tags: [],
    });

    model.container("Mobile App", {
      softwareSystem: "Internet Banking",
      tags: ["external"],
    });

    model.container("Web Application", {
      softwareSystem: "Internet Banking",
    });

    model.container("Database", {
      softwareSystem: "Internet Banking",
      tags: ["database"],
    });

    model.container("API Application", {
      softwareSystem: "Internet Banking",
      tags: ["external", "database"],
    });

    model.softwareSystem("E-Mail System", {
      tags: ["external"],
    });

    model.softwareSystem("Mainframe Banking System", {
      tags: ["external"],
    });

    // relationships
    model.depencency("Customer", "Web Application", "Uses");
    model.depencency("Customer", "Single-Page App", "Uses");
    model.depencency("Customer", "Mobile App", "Uses");

    model.depencency("Web Application", "Single-Page App", "Delivers");
    model.depencency("Single-Page App", "API Application", "Uses");
    model.depencency("Mobile App", "API Application", "Uses");
    model.depencency("Database", "API Application", "Reads from and writes to");

    model.depencency("E-Mail System", "Customer", "Sends e-mails to");
    model.depencency("API Application", "E-Mail System", "Sends e-mails using");
    model.depencency("API Application", "Mainframe Banking System", "Uses");

    const pumlModel = generateC4PlantUmlModel(
      model,
      "Container",
      "Internet Banking",
    );
    const output = renderC4PlantUml(pumlModel);

    expect(output).toBe(
      `System_Ext(softwareSystemEMailSystem, "E-Mail System", "E-Mail System")
System_Ext(softwareSystemMainframeBankingSystem, "Mainframe Banking System", "Mainframe Banking System")
Container_Boundary(softwareSystemInternetBanking, "Internet Banking") {
    ContainerDb_Ext(containerAPIApplication, "API Application")
    ContainerDb(containerDatabase, "Database")
    Container_Ext(containerMobileApp, "Mobile App")
    Container(containerSinglePageApp, "Single-Page App")
    Container(containerWebApplication, "Web Application")
}

Rel(containerAPIApplication, softwareSystemEMailSystem, "Sends e-mails using")
Rel(containerAPIApplication, softwareSystemMainframeBankingSystem, "Uses")
Rel(containerDatabase, containerAPIApplication, "Reads from and writes to")
Rel(containerMobileApp, containerAPIApplication, "Uses")
Rel(containerSinglePageApp, containerAPIApplication, "Uses")
Rel(containerWebApplication, containerSinglePageApp, "Delivers")
`,
    );
  });
});
