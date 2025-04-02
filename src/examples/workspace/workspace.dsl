workspace {
  model {
    systemBank = softwareSystem "Bank" {
      containerAPIApplication = container "APIApplication" {
        componentSecurityComponent = component "SecurityComponent" {
        }
        componentSignInController = component "SignInController" {
        }
      }
      containerDatabase = container "Database" {
      }
      containerSinglePageApplication = container "SinglePageApplication" {
      }
    }
    componentSecurityComponent -> containerDatabase "readCredentials"
    componentSignInController -> componentSecurityComponent "checkCredentials"
  }
  views {
    styles {
      element "Database" {
        shape cylinder
      }
    }
  }
}
		