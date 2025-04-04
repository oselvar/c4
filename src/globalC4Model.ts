import { C4Model } from "./c4Model";

if (!globalThis.__C4_MODEL__) {
  globalThis.__C4_MODEL__ = new C4Model();
}
export const globalC4Model = globalThis.__C4_MODEL__;
