import { C4Component, C4Container, C4Operation, C4System } from "../decorators";

@C4System()
export class Bank {}

@C4Container({ system: "Bank" })
export class SinglePageApplication {}

@C4Container({ system: "Bank" })
export class APIApplication {}

@C4Component({ container: "APIApplication" })
export class SignInController {
  constructor(private readonly securityComponent: SecurityComponent) {}

  @C4Operation()
  signIn() {
    this.securityComponent.checkCredentials();
  }
}

@C4Component({ container: "APIApplication" })
export class SecurityComponent {
  constructor(private readonly database: Database) {}

  @C4Operation()
  checkCredentials() {
    this.database.readCredentials();
  }
}

@C4Container({ system: "Bank" })
export class Database {
  @C4Operation()
  readCredentials() {}
}
