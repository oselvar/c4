import { C4ModelBuilder } from "./C4ModelBuilder";

if (!globalThis.__C4_MODEL__) {
  globalThis.__C4_MODEL__ = new C4ModelBuilder({
    objects: [],
    dependencies: [],
  });
}
export const globalC4Model = globalThis.__C4_MODEL__;
