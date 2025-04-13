import { describe, expect, it } from "vitest";

import { C4ModelBuilder } from "../C4ModelBuilder";
import { simpleBankModel } from "../simpleBankModel";
import { toDiagram } from "../toDiagram";
import { toPuml } from "./toPuml";

describe.skip("Internet Banking Container Diagram", () => {
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

    const diagram = toDiagram(builder.build(), "Container", "Internet Banking");
    const puml = toPuml(diagram);

    expect(puml).toBe(
      `System_Ext(softwareSystemEMailSystem, "E-Mail System")
System_Ext(softwareSystemMainframeBankingSystem, "Mainframe Banking System")
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

  it("should create a container diagram", () => {
    const diagram = toDiagram(simpleBankModel, "Container", "Bank");
    const puml = toPuml(diagram);
    expect(puml).toBe(`Container_Boundary(softwareSystemBank, "Bank") {
    Container(containerAPIApplication, "APIApplication")
    ContainerDb(containerDatabase, "Database")
    Container(containerSinglePageApplication, "SinglePageApplication")
}

Rel(containerAPIApplication, containerDatabase, "readCredentials")
`);
  });

  it("should create a component diagram", () => {
    const diagram = toDiagram(simpleBankModel, "Component", "APIApplication");
    const puml = toPuml(diagram);

    expect(puml)
      .toBe(`Container_Boundary(containerAPIApplication, "APIApplication") {
    Component(componentSecurityComponent, "SecurityComponent")
    Component(componentSignInController, "SignInController")
}
Container_Ext(containerDatabase, "Database")

Rel(componentSecurityComponent, containerDatabase, "readCredentials")
Rel(componentSignInController, componentSecurityComponent, "checkCredentials")
`);
  });
});
