import { C4Id, C4Model, C4Name } from "./C4Model";

const calls = [
  {
    callerName: "componentSecurityComponent" as C4Name,
    calleeName: "containerDatabase" as C4Name,
    operationName: "readCredentials",
  },
  {
    callerName: "componentSignInController" as C4Name,
    calleeName: "componentSecurityComponent" as C4Name,
    operationName: "checkCredentials",
  },
];
export const simpleBankModel: C4Model = {
  objects: [
    {
      type: "softwareSystem",
      name: "Bank" as C4Name,
      id: "softwareSystemBank" as C4Id,
      tags: [],
      parentName: null,
    },
    {
      type: "container",
      name: "Database" as C4Name,
      id: "containerDatabase" as C4Id,
      tags: ["database"],
      parentName: "softwareSystemBank" as C4Name,
    },
    {
      type: "container",
      name: "SinglePageApplication" as C4Name,
      id: "containerSinglePageApplication" as C4Id,
      tags: [],
      parentName: "softwareSystemBank" as C4Name,
    },
    {
      type: "container",
      name: "APIApplication" as C4Name,
      id: "containerAPIApplication" as C4Id,
      tags: [],
      parentName: "softwareSystemBank" as C4Name,
    },
    {
      type: "component",
      name: "SecurityComponent" as C4Name,
      id: "componentSecurityComponent" as C4Id,
      tags: [],
      parentName: "containerAPIApplication" as C4Name,
    },
    {
      type: "component",
      name: "SignInController" as C4Name,
      id: "componentSignInController" as C4Id,
      tags: [],
      parentName: "containerAPIApplication" as C4Name,
    },
  ],
  calls: calls,
  callchains: [
    {
      name: "SignIn",
      calls: calls,
    },
  ],
};
