import { describe, it } from "vitest";

import { Database, SecurityComponent, SignInController } from "./Bank";

describe("Bank", () => {
  it("keeps or money safe", () => {
    const database = new Database();
    const securityComponent = new SecurityComponent(database);
    const signinController = new SignInController(securityComponent);

    signinController.signIn();
  });
});
