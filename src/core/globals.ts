import { C4ModelBuilder } from "./C4ModelBuilder";

if (!globalThis.__C4_MODEL_BUILDER__) {
  globalThis.__C4_MODEL_BUILDER__ = new C4ModelBuilder({
    objects: {},
    callchains: [],
  });
}

export const globalC4ModelBuilder = globalThis.__C4_MODEL_BUILDER__;
