import { describe, expect, it } from "vitest";

import type { TracesData } from "../opentelemetry/proto/trace/v1/trace";
import { buildC4ModelFromOtel, toC4Name } from "./buildC4ModelFromOtel";
import spans from "./spans.json";

describe("buildC4ModelFromOtel", () => {
  it("should build a C4 model from OpenTelemetry traces", () => {
    const traces: TracesData[] = spans as unknown as TracesData[];
    const model = buildC4ModelFromOtel(traces);
    console.log("model", model);

    // Verify software system
    const bank = model.objects[toC4Name("Bank")];
    expect(bank).toBeDefined();
    expect(bank.type).toBe("softwareSystem");
    expect(bank.tags).toEqual([]);

    // Verify containers
    const spa = model.objects[toC4Name("SinglePageApplication")];
    expect(spa).toBeDefined();
    expect(spa.type).toBe("container");
    expect(spa.parentName).toBe(toC4Name("Bank"));
    expect(spa.tags).toEqual([]);

    const api = model.objects[toC4Name("APIApplication")];
    expect(api).toBeDefined();
    expect(api.type).toBe("container");
    expect(api.parentName).toBe(toC4Name("Bank"));
    expect(api.tags).toEqual([]);

    const db = model.objects[toC4Name("Database")];
    expect(db).toBeDefined();
    expect(db.type).toBe("container");
    expect(db.parentName).toBe(toC4Name("Bank"));
    expect(db.tags).toEqual(["database"]);

    // Verify components
    const signIn = model.objects[toC4Name("SignInController")];
    expect(signIn).toBeDefined();
    expect(signIn.type).toBe("component");
    expect(signIn.parentName).toBe(toC4Name("APIApplication"));
    expect(signIn.tags).toEqual([]);

    const security = model.objects[toC4Name("SecurityComponent")];
    expect(security).toBeDefined();
    expect(security.type).toBe("component");
    expect(security.parentName).toBe(toC4Name("APIApplication"));
    expect(security.tags).toEqual([]);

    // Verify calls
    const calls = model.callchains.flatMap((chain) => chain.calls);
    expect(calls).toContainEqual({
      callerName: toC4Name("SignInController"),
      calleeName: toC4Name("SecurityComponent"),
      operation: "checkCredentials",
    });
    expect(calls).toContainEqual({
      callerName: toC4Name("SecurityComponent"),
      calleeName: toC4Name("Database"),
      operation: "readCredentials",
    });
  });
});
