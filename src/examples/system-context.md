```mermaid
C4Context
  title SystemContext diagram for X

  Enterprise_Boundary(groupBigBankPlc, "Big Bank plc") {
    System(softwareSystemBank, "Bank") {
      Container(containerAPIApplication, "APIApplication") {
        Component(componentSecurityComponent, "SecurityComponent")
        Component(componentSignInController, "SignInController")
      }
      Container(containerDatabase, "Database")
      Container(containerSinglePageApplication, "SinglePageApplication")
    }
  }
```