import { C4Call, C4Id, C4Model, C4Name } from "../core/C4Model";

const calls: Record<string, C4Call> = {
  "SecurityComponent->Database": {
    callerName: "SecurityComponent" as C4Name,
    calleeName: "Database" as C4Name,
    operationName: "readCredentials",
  },
  "SignInController->SecurityComponent": {
    callerName: "SignInController" as C4Name,
    calleeName: "SecurityComponent" as C4Name,
    operationName: "checkCredentials",
  },
};

export const simpleBankModel: C4Model = {
  objects: {
    softwareSystemBank: {
      type: "softwareSystem",
      name: "Bank" as C4Name,
      id: "softwareSystemBank" as C4Id,
      tags: [],
      parentName: null,
    },
    containerDatabase: {
      type: "container",
      name: "Database" as C4Name,
      id: "containerDatabase" as C4Id,
      tags: ["database"],
      parentName: "Bank" as C4Name,
    },
    containerSinglePageApplication: {
      type: "container",
      name: "SinglePageApplication" as C4Name,
      id: "containerSinglePageApplication" as C4Id,
      tags: [],
      parentName: "Bank" as C4Name,
    },
    containerAPIApplication: {
      type: "container",
      name: "APIApplication" as C4Name,
      id: "containerAPIApplication" as C4Id,
      tags: [],
      parentName: "Bank" as C4Name,
    },
    componentSecurityComponent: {
      type: "component",
      name: "SecurityComponent" as C4Name,
      id: "componentSecurityComponent" as C4Id,
      tags: [],
      parentName: "APIApplication" as C4Name,
    },
    componentSignInController: {
      type: "component",
      name: "SignInController" as C4Name,
      id: "componentSignInController" as C4Id,
      tags: [],
      parentName: "APIApplication" as C4Name,
    },
  },
  calls,
  callchains: [
    {
      name: "SignIn",
      calls: Object.values(calls),
    },
  ],
};
