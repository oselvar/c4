import { createMiddleware } from "hono/factory";
import type { OpenAPIV3 } from "openapi-types";

import type { C4Model } from "../c4Model";
import { HttpMethod, openapiDependency } from "../openapi";

export function c4OpenApiHonoMiddleware(
  c4Model: C4Model,
  openapi: OpenAPIV3.Document,
) {
  return createMiddleware(async (c, next) => {
    const caller = c.req.header("X-StructurizrGen-Caller");
    const method = c.req.method;
    const path = c.req.path;
    if (caller) {
      openapiDependency(
        c4Model,
        openapi,
        caller,
        method.toLowerCase() as HttpMethod,
        path,
      );
    }
    await next();
  });
}
