import { describe, expect, it } from "vitest";

import { C4ModelBuilder } from "../C4ModelBuilder";
import { generateC4PlantUmlModel } from "./generateC4PlantUmlModel";
import { renderC4PlantUml } from "./renderC4PlantUml";

describe("Internet Banking Container Diagram", () => {
  it("should match expected output", () => {
    const builder = new C4ModelBuilder();

    builder.person("Customer");
    builder.softwareSystem("Internet Banking");

    builder.container("Single-Page App", {
      softwareSystem: "Internet Banking",
      tags: [],
    });

    builder.container("Mobile App", {
      softwareSystem: "Internet Banking",
      tags: ["external"],
    });

    builder.container("Web Application", {
      softwareSystem: "Internet Banking",
    });

    builder.container("Database", {
      softwareSystem: "Internet Banking",
      tags: ["database"],
    });

    builder.container("API Application", {
      softwareSystem: "Internet Banking",
      tags: ["external", "database"],
    });

    builder.softwareSystem("E-Mail System", {
      tags: ["external"],
    });

    builder.softwareSystem("Mainframe Banking System", {
      tags: ["external"],
    });

    // relationships
    builder.depencency("Customer", "Web Application", "Uses");
    builder.depencency("Customer", "Single-Page App", "Uses");
    builder.depencency("Customer", "Mobile App", "Uses");

    builder.depencency("Web Application", "Single-Page App", "Delivers");
    builder.depencency("Single-Page App", "API Application", "Uses");
    builder.depencency("Mobile App", "API Application", "Uses");
    builder.depencency(
      "Database",
      "API Application",
      "Reads from and writes to",
    );

    builder.depencency("E-Mail System", "Customer", "Sends e-mails to");
    builder.depencency(
      "API Application",
      "E-Mail System",
      "Sends e-mails using",
    );
    builder.depencency("API Application", "Mainframe Banking System", "Uses");

    const pumlModel = generateC4PlantUmlModel(
      builder.build(),
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
