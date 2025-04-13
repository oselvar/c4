import { C4Model } from "./C4Model";

export const simpleBankModel: C4Model = {
  objects: [
    {
      type: "component",
      name: "SecurityComponent",
      id: "componentSecurityComponent",
      tags: [],
      parentId: "containerAPIApplication",
    },
    {
      type: "component",
      name: "SignInController",
      id: "componentSignInController",
      tags: [],
      parentId: "containerAPIApplication",
    },
    {
      type: "container",
      name: "APIApplication",
      id: "containerAPIApplication",
      tags: [],
      parentId: "softwareSystemBank",
    },
    {
      type: "container",
      name: "Database",
      id: "containerDatabase",
      tags: ["database"],
      parentId: "softwareSystemBank",
    },
    {
      type: "container",
      name: "SinglePageApplication",
      id: "containerSinglePageApplication",
      tags: [],
      parentId: "softwareSystemBank",
    },
    {
      type: "softwareSystem",
      name: "Bank",
      id: "softwareSystemBank",
      tags: [],
      parentId: null,
    },
  ],
  dependencies: [
    {
      callerId: "componentSecurityComponent",
      calleeId: "containerDatabase",
      name: "readCredentials",
    },
    {
      callerId: "componentSignInController",
      calleeId: "componentSecurityComponent",
      name: "checkCredentials",
    },
  ],
};
