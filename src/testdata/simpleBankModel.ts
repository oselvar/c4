import { C4Name } from "../core/C4Model";
import { makeC4Model } from "../core/makeC4Model";

export const simpleBankModel = makeC4Model(
  [
    {
      type: "softwareSystem",
      name: "Bank" as C4Name,
      tags: [],
      parentName: null,
    },
    {
      type: "container",
      name: "Database" as C4Name,
      tags: ["database"],
      parentName: "Bank" as C4Name,
    },
    {
      type: "container",
      name: "SinglePageApplication" as C4Name,
      tags: [],
      parentName: "Bank" as C4Name,
    },
    {
      type: "container",
      name: "APIApplication" as C4Name,
      tags: [],
      parentName: "Bank" as C4Name,
    },
    {
      type: "component",
      name: "SecurityComponent" as C4Name,
      tags: [],
      parentName: "APIApplication" as C4Name,
    },
    {
      type: "component",
      name: "SignInController" as C4Name,
      tags: [],
      parentName: "APIApplication" as C4Name,
    },
  ],
  [
    {
      name: "SignIn",
      calls: [
        {
          callerName: "SecurityComponent" as C4Name,
          calleeName: "Database" as C4Name,
          operationName: "readCredentials",
        },
        {
          callerName: "SignInController" as C4Name,
          calleeName: "SecurityComponent" as C4Name,
          operationName: "checkCredentials",
        },
      ],
    },
  ],
);
