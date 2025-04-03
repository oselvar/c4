import { describe, it } from "vitest";

import { c4Model } from "../globalModel";
import { Database, SecurityComponent, SignInController } from "./Bank";

// TODO: Invertedt DSL
c4Model.softwareSystem("Bank", {
  group: c4Model.group("Big Bank plc"),
});

describe("Bank", () => {
  it("keeps or money safe", () => {
    const database = new Database();
    const securityComponent = new SecurityComponent(database);
    const signinController = new SignInController(securityComponent);

    signinController.signIn();
  });
});
