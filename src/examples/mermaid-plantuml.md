```mermaid
C4Context
  System(systemBank, "Bank", "")
  Rel(componentSecurityComponent, containerDatabase, "readCredentials")
  Rel(componentSignInController, componentSecurityComponent, "checkCredentials")

  System_Boundary(systemBank_boundary, "Bank") {
    Container(containerAPIApplication, "APIApplication")
    Container(containerDatabase, "Database")
    Container(containerSinglePageApplication, "SinglePageApplication")
  }
```