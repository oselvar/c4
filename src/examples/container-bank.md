```mermaid
C4Container

Container_Boundary(softwareSystemBank, "Bank") {
    Container(containerAPIApplication, "APIApplication")
    ContainerDb(containerDatabase, "Database")
    Container(containerSinglePageApplication, "SinglePageApplication")
}

Rel(containerAPIApplication, containerDatabase, "readCredentials")
```
