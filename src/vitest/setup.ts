import { afterEach } from "vitest";

import { globalC4ModelBuilder } from "../globalC4ModelBuilder";

afterEach((test) => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  test.task.meta.c4Model = globalC4ModelBuilder.build();
});
