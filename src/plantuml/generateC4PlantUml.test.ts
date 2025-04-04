import { describe, expect, it } from "vitest";

import { C4Model } from "../C4Model";
import { C4ModelBuilder } from "../C4ModelBuilder";
import { generateC4PlantUmlModel } from "./generateC4PlantUmlModel";
import { renderC4PlantUml } from "./renderC4PlantUml";

describe("Internet Banking Container Diagram", () => {
  it("should match expected output", () => {
    const builder = new C4ModelBuilder();

    builder.addPerson("Customer");
    builder.addSoftwareSystem("Internet Banking");

    builder.addContainer("Single-Page App", {
      softwareSystem: "Internet Banking",
      tags: [],
    });

    builder.addContainer("Mobile App", {
      softwareSystem: "Internet Banking",
      tags: ["external"],
    });

    builder.addContainer("Web Application", {
      softwareSystem: "Internet Banking",
    });

    builder.addContainer("Database", {
      softwareSystem: "Internet Banking",
      tags: ["database"],
    });

    builder.addContainer("API Application", {
      softwareSystem: "Internet Banking",
      tags: ["external", "database"],
    });

    builder.addSoftwareSystem("E-Mail System", {
      tags: ["external"],
    });

    builder.addSoftwareSystem("Mainframe Banking System", {
      tags: ["external"],
    });

    // relationships
    builder.addDependency("Customer", "Web Application", "Uses");
    builder.addDependency("Customer", "Single-Page App", "Uses");
    builder.addDependency("Customer", "Mobile App", "Uses");

    builder.addDependency("Web Application", "Single-Page App", "Delivers");
    builder.addDependency("Single-Page App", "API Application", "Uses");
    builder.addDependency("Mobile App", "API Application", "Uses");
    builder.addDependency(
      "Database",
      "API Application",
      "Reads from and writes to",
    );

    builder.addDependency("E-Mail System", "Customer", "Sends e-mails to");
    builder.addDependency(
      "API Application",
      "E-Mail System",
      "Sends e-mails using",
    );
    builder.addDependency(
      "API Application",
      "Mainframe Banking System",
      "Uses",
    );

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

  it("should add relationships", () => {
    const model: C4Model = {
      objects: [
        {
          type: "component",
          name: "SecurityComponent",
          variableName: "componentSecurityComponent",
          tags: [],
          parentName: "APIApplication",
        },
        {
          type: "component",
          name: "SignInController",
          variableName: "componentSignInController",
          tags: [],
          parentName: "APIApplication",
        },
        {
          type: "container",
          name: "APIApplication",
          variableName: "containerAPIApplication",
          tags: [],
          parentName: "Bank",
        },
        {
          type: "container",
          name: "Database",
          variableName: "containerDatabase",
          tags: ["database"],
          parentName: "Bank",
        },
        {
          type: "container",
          name: "SinglePageApplication",
          variableName: "containerSinglePageApplication",
          tags: [],
          parentName: "Bank",
        },
        {
          type: "softwareSystem",
          name: "Bank",
          variableName: "softwareSystemBank",
          tags: [],
          parentName: null,
        },
      ],
      dependencies: [
        {
          callerName: "SecurityComponent",
          calleeName: "Database",
          name: "readCredentials",
        },
        {
          callerName: "SignInController",
          calleeName: "SecurityComponent",
          name: "checkCredentials",
        },
      ],
    };

    const pumlModel = generateC4PlantUmlModel(model, "Container", "Bank");
    const output = renderC4PlantUml(pumlModel);
    expect(output).toBe(`Container_Boundary(softwareSystemBank, "Bank") {
    Container(containerAPIApplication, "APIApplication")
    ContainerDb(containerDatabase, "Database")
    Container(containerSinglePageApplication, "SinglePageApplication")
}

Rel(containerAPIApplication, containerDatabase, "readCredentials")
`);
  });
});
