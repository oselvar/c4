import { createMiddleware } from "hono/factory";
import type { OpenAPIV3 } from "openapi-types";

import { C4ModelBuilder } from "../C4ModelBuilder";
import { HttpMethod, openapiDependency } from "../openapi";

export function c4OpenApiHonoMiddleware(
  builder: C4ModelBuilder,
  openapi: OpenAPIV3.Document,
) {
  return createMiddleware(async (c, next) => {
    const callerName = c.req.header("X-C4-Caller");
    const httpMethod = c.req.method;
    const path = c.req.path;
    if (callerName) {
      openapiDependency(
        builder,
        openapi,
        callerName,
        httpMethod.toLowerCase() as HttpMethod,
        path,
      );
    }
    await next();
  });
}
