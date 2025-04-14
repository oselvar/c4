import { DefaultC4ModelBuilder } from "./DefaultC4ModelBuilder";

if (!globalThis.__C4_MODEL_BUILDER__) {
  globalThis.__C4_MODEL_BUILDER__ = new DefaultC4ModelBuilder({
    objects: [],
    dependencies: [],
  });
}
export const globalC4ModelBuilder = globalThis.__C4_MODEL_BUILDER__;
