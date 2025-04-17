workspace {
  model {
    softwaresystemBank = softwareSystem "Bank" {
      containerApiapplication = container "APIApplication" {
        componentSecuritycomponent = component "SecurityComponent" {
        }
        componentSignincontroller = component "SignInController" {
        }
      }
      containerDatabase = container "Database" {
        tags "database"
      }
      containerSinglepageapplication = container "SinglePageApplication" {
      }
    }

    componentSignincontroller -> componentSecuritycomponent "checkCredentials"
    componentSecuritycomponent -> containerDatabase "readCredentials"

    views {
      dynamic * {
        title "keeps or money safe" {
          componentSignincontroller -> componentSecuritycomponent "checkCredentials"
          componentSecuritycomponent -> containerDatabase "readCredentials"
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
