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
    systemBank -> componentSecurityComponent "checkCredentials"
    systemBank -> componentSignInController "signIn"
    systemBank -> containerDatabase "readCredentials"
  }
	views {
		styles {
			element "Database" {
        shape cylinder
			}
		}
	}
}
		