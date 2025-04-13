import { describe, expect, it } from "vitest";

import { C4View } from "./C4View";
import { simpleBankModel } from "./simpleBankModel";
import {
  toComponentView,
  toContainerView,
  toSystemContextView,
} from "./toView";

describe("toSystemContextView", () => {
  it("should create a system context diagram", () => {
    const diagram = toSystemContextView(simpleBankModel, "softwareSystemBank");

    const expected: C4View = {
      type: "System Context",
      objects: [
        {
          id: "softwareSystemBank",
          type: "softwareSystem",
          name: "Bank",
          description: "",
          tags: [],
          children: [],
          relationships: [],
        },
      ],
    };
    expect(diagram).toEqual(expected);
  });
});

describe("toContainerView", () => {
  it("should create a container diagram", () => {
    const diagram = toContainerView(simpleBankModel, "softwareSystemBank");

    const expected: C4View = {
      type: "Container",
      objects: [
        {
          id: "softwareSystemBank",
          type: "softwareSystem",
          name: "Bank",
          description: "",
          tags: [],
          children: [
            {
              id: "containerAPIApplication",
              type: "container",
              name: "APIApplication",
              description: "",
              tags: [],
              children: [],
              relationships: [
                {
                  name: "calls",
                  targetId: "containerDatabase",
                },
              ],
            },
            {
              id: "containerDatabase",
              type: "container",
              name: "Database",
              description: "",
              tags: ["database"],
              children: [],
              relationships: [],
            },
            {
              id: "containerSinglePageApplication",
              type: "container",
              name: "SinglePageApplication",
              description: "",
              tags: [],
              children: [],
              relationships: [],
            },
          ],
          relationships: [],
        },
      ],
    };
    expect(diagram).toEqual(expected);
  });
});

describe("toComponentView", () => {
  it("should create a component diagram", () => {
    const diagram = toComponentView(simpleBankModel, "containerAPIApplication");

    const expected: C4View = {
      type: "Component",
      objects: [
        {
          id: "containerAPIApplication",
          type: "container",
          name: "APIApplication",
          description: "",
          tags: [],
          children: [
            {
              id: "componentSecurityComponent",
              type: "component",
              name: "SecurityComponent",
              description: "",
              tags: [],
              children: [],
              relationships: [],
            },
            {
              id: "componentSignInController",
              type: "component",
              name: "SignInController",
              description: "",
              tags: [],
              children: [],
              relationships: [],
            },
          ],
          relationships: [],
        },
      ],
    };
    expect(diagram).toEqual(expected);
  });
});
