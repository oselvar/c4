import { describe, expect, it } from "vitest";

import { simpleBankModel } from "./simpleBankModel";
import { toDiagram } from "./toDiagram";

describe("toDiagram", () => {
  it("should create a system context diagram", () => {
    const diagram = toDiagram(
      simpleBankModel,
      "System Context",
      "softwareSystemBank",
    );

    expect(diagram.nodes).toHaveLength(1);
    expect(diagram.nodes[0]).toEqual({
      id: "Bank",
      type: "System",
      name: "Bank",
      description: "",
      tags: [],
      parentId: null,
      relationships: [],
    });
  });

  it("should create a container diagram", () => {
    const diagram = toDiagram(simpleBankModel, "Container", "Bank");

    expect(diagram.nodes).toHaveLength(3);
    expect(diagram.nodes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "APIApplication",
          type: "Container",
          name: "APIApplication",
          parentId: "Bank",
          relationships: expect.arrayContaining([
            expect.objectContaining({
              targetId: "Database",
              description: "readCredentials",
              technology: "",
              tags: [],
            }),
          ]),
        }),
        expect.objectContaining({
          id: "Database",
          type: "Container",
          name: "Database",
          parentId: "Bank",
          relationships: [],
        }),
        expect.objectContaining({
          id: "SinglePageApplication",
          type: "Container",
          name: "SinglePageApplication",
          parentId: "Bank",
          relationships: [],
        }),
      ]),
    );
  });

  it("should create a component diagram", () => {
    const diagram = toDiagram(simpleBankModel, "Component", "APIApplication");

    expect(diagram.nodes).toHaveLength(3);
    expect(diagram.nodes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "SecurityComponent",
          type: "Component",
          name: "SecurityComponent",
          parentId: "APIApplication",
          relationships: expect.arrayContaining([
            expect.objectContaining({
              targetId: "Database",
              description: "readCredentials",
              technology: "",
              tags: [],
            }),
          ]),
        }),
        expect.objectContaining({
          id: "SignInController",
          type: "Component",
          name: "SignInController",
          parentId: "APIApplication",
          relationships: expect.arrayContaining([
            expect.objectContaining({
              targetId: "SecurityComponent",
              description: "checkCredentials",
              technology: "",
              tags: [],
            }),
          ]),
        }),
        expect.objectContaining({
          id: "Database",
          type: "Container",
          name: "Database",
          parentId: "Bank",
          relationships: [],
        }),
      ]),
    );
  });
});
