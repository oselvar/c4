import { afterEach, beforeEach } from "vitest";

import { globalC4ModelBuilder } from "../core/globals";
import type { C4Meta } from "./C4Meta";

beforeEach((test) => {
  const callchainName = test.task.name || "Unnamed Test";
  globalC4ModelBuilder.startCallchain(callchainName);
});

afterEach(async (test) => {
  const meta = test.task.meta as C4Meta;
  meta.c4Model = globalC4ModelBuilder.build();
});
