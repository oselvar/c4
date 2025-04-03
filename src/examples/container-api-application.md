````mermaid
@startuml
!include https://raw.githubusercontent.com/RicardoNiepel/C4-PlantUML/master/C4.puml

System(softwareSystemBank, "Bank", "Bank")
Container(containerAPIApplication, "APIApplication", "APIApplication")
Container(containerDatabase, "Database", "Database")
Container(containerSinglePageApplication, "SinglePageApplication", "SinglePageApplication")


@enduml```
````
