// https://stackoverflow.com/questions/59459312/using-globalthis-in-typescript
/* eslint-disable no-var */
import type { C4CallchainBuilder } from "./C4CallchainBuilder";
import type { C4ModelBuilder } from "./C4ModelBuilder";

declare global {
  var __C4_MODEL_BUILDER__: C4ModelBuilder;
  var __C4_CALLCHAIN_BUILDER__: C4CallchainBuilder;
  var __C4_READY_RESOLVE__: () => void;
}
