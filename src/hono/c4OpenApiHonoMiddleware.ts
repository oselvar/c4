import { createMiddleware } from "hono/factory";
import type { OpenAPIV3 } from "openapi-types";

import type { C4Model } from "../c4Model";
import { HttpMethod, openapiDependency } from "../openapi";

export function c4OpenApiHonoMiddleware(
  c4Model: C4Model,
  openapi: OpenAPIV3.Document,
) {
  return createMiddleware(async (c, next) => {
    const callerName = c.req.header("X-C4-Caller");
    const httpMethod = c.req.method;
    const path = c.req.path;
    if (callerName) {
      openapiDependency(
        c4Model,
        openapi,
        callerName,
        httpMethod.toLowerCase() as HttpMethod,
        path,
      );
    }
    await next();
  });
}
