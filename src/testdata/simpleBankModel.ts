import { C4Call, C4Model, C4Name, C4ObjectKey } from "../core/C4Model";
import { makeObjectKey } from "../core/strings";

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
    [makeObjectKey("softwareSystem", "Bank")]: {
      type: "softwareSystem",
      name: "Bank" as C4Name,
      id: "softwareSystemBank" as C4ObjectKey,
      tags: [],
      parentName: null,
    },
    [makeObjectKey("container", "Database")]: {
      type: "container",
      name: "Database" as C4Name,
      id: "containerDatabase" as C4ObjectKey,
      tags: ["database"],
      parentName: "Bank" as C4Name,
    },
    [makeObjectKey("container", "SinglePageApplication")]: {
      type: "container",
      name: "SinglePageApplication" as C4Name,
      id: "containerSinglePageApplication" as C4ObjectKey,
      tags: [],
      parentName: "Bank" as C4Name,
    },
    [makeObjectKey("container", "APIApplication")]: {
      type: "container",
      name: "APIApplication" as C4Name,
      id: "containerAPIApplication" as C4ObjectKey,
      tags: [],
      parentName: "Bank" as C4Name,
    },
    [makeObjectKey("component", "SecurityComponent")]: {
      type: "component",
      name: "SecurityComponent" as C4Name,
      id: "componentSecurityComponent" as C4ObjectKey,
      tags: [],
      parentName: "APIApplication" as C4Name,
    },
    [makeObjectKey("component", "SignInController")]: {
      type: "component",
      name: "SignInController" as C4Name,
      id: "componentSignInController" as C4ObjectKey,
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
