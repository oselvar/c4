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
      `System_Ext(email_system, "E-Mail System", "The internal Microsoft Exchange system", $tags="v1.0")

Container_Boundary(internetBanking, "Internet Banking") {
    Container(singlePageApp, "Single-Page App", "Provides all the Internet banking functionality to customers via their web browser", "JavaScript, Angular")
    Container_Ext(mobileApp, "Mobile App", "Provides a limited subset of the Internet banking functionality to customers via their mobile device", "C#, Xamarin")
    Container(webApplication, "Web Application", "Delivers the static content and the Internet banking SPA", "Java, Spring MVC")
    ContainerDb(database, "Database", "Stores user registration information, hashed auth credentials, access logs, etc.", "SQL Database")
    ContainerDb_Ext(apiApplication, "API Application", "Provides Internet banking functionality via API", "Java, Docker Container")
}

System_Ext(mainframeBankingSystem, "Mainframe Banking System", "Stores all of the core banking information about customers, accounts, transactions, etc.")

Rel(customer, webApplication, "Uses", "HTTPS")
Rel(customer, singlePageApp, "Uses", "HTTPS")
Rel(customer, mobileApp, "Uses")
Rel(webApplication, singlePageApp, "Delivers")
Rel(singlePageApp, apiApplication, "Uses", "async, JSON/HTTPS")
Rel(mobileApp, apiApplication, "Uses", "async, JSON/HTTPS")
Rel(database, apiApplication, "Reads from and writes to", "sync, JDBC")
Rel(email_system, customer, "Sends e-mails to")
Rel(apiApplication, email_system, "Sends e-mails using", "sync, SMTP")
Rel(apiApplication, mainframeBankingSystem, "Uses", "sync/async, XML/HTTPS")`,
    );
  });
});
