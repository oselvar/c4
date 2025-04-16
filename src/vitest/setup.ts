import { afterEach, beforeEach } from "vitest";

import type { C4Model } from "../core/C4Model";
import { globalC4ModelBuilder } from "../core/globals";

type Meta = {
  c4Model: C4Model;
};

beforeEach((test) => {
  globalC4ModelBuilder.startCallchain(test.task.name);
});

afterEach((test) => {
  const meta = test.task.meta as Meta;
  meta.c4Model = globalC4ModelBuilder.build();
});
