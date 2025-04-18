import { describe, it } from "vitest";

import { Database, SecurityComponent, SignInController } from "./Bank";

describe("Bank", () => {
  it("keeps or money safe", async () => {
    const database = new Database();
    const securityComponent = new SecurityComponent(database);
    const signinController = new SignInController(securityComponent);

    signinController.signIn();
  });

  it("keeps or money safe again", async () => {
    const database = new Database();
    const securityComponent = new SecurityComponent(database);
    const signinController = new SignInController(securityComponent);

    signinController.signIn();
  });
});
