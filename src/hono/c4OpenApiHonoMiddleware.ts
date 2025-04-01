import { createMiddleware } from "hono/factory";
import type { OpenAPIV3 } from "openapi-types";

import type { C4Model, HttpMethod } from "../c4Model";

export function c4OpenApiHonoMiddleware(
  c4Model: C4Model,
  openapi: OpenAPIV3.Document,
) {
  return createMiddleware(async (c, next) => {
    const caller = c.req.header("X-StructurizrGen-Caller");
    const method = c.req.method;
    const path = c.req.path;
    if (caller) {
      c4Model.openapiDependency(
        openapi,
        caller,
        method.toLowerCase() as HttpMethod,
        path,
      );
    }
    await next();
  });
}
