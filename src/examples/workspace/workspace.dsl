workspace {
  model {
    groupBigBankPlc = group "Big Bank plc" {
      softwareSystemBank = softwareSystem "Bank" {
        containerAPIApplication = container "APIApplication" {
          componentSecurityComponent = component "SecurityComponent" {
          }
          componentSignInController = component "SignInController" {
          }
        }
        containerDatabase = container "Database" {
          tags "database"
        }
        containerSinglePageApplication = container "SinglePageApplication" {
        }
      }
    }

    componentSecurityComponent -> containerDatabase "readCredentials"
    componentSignInController -> componentSecurityComponent "checkCredentials"

    views {
      styles {
        element "Database" {
          shape cylinder
        }
      }
    }
  }
}
