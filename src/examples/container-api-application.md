```mermaid
C4Container
  title Container diagram for X

  Container_Boundary(containerAPIApplication, "APIApplication") {
    Component(componentSecurityComponent, "SecurityComponent")
    Component(componentSignInController, "SignInController")
  }
```