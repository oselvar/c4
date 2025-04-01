import type { C4Model } from "./c4Model";

declare global {
  // https://stackoverflow.com/questions/59459312/using-globalthis-in-typescript
  // eslint-disable-next-line no-var
  var __C4_MODEL__: C4Model;
}
