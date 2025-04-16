workspace {
  model {
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

    componentSignInController -> componentSecurityComponent "checkCredentials"
    componentSecurityComponent -> containerDatabase "readCredentials"

    views {
      dynamic * {
        title "keeps or money safe" {
          componentSignInController -> componentSecurityComponent "checkCredentials"
          componentSecurityComponent -> containerDatabase "readCredentials"
        }
      }
      styles {
        element "Database" {
          shape cylinder
        }
      }
    }
  }
}
