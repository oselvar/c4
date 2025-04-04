import type { C4ModelBuilder } from "./C4ModelBuilder";

declare global {
  // https://stackoverflow.com/questions/59459312/using-globalthis-in-typescript
  // eslint-disable-next-line no-var
  var __C4_MODEL_BUILDER__: C4ModelBuilder;
}
