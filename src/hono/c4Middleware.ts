import { createMiddleware } from "hono/factory";
import type { OpenAPIV3 } from "openapi-types";

import { C4Name } from "../core/C4Model";
import { C4ModelBuilder } from "../core/C4ModelBuilder";
import { addOpenapiCall, addOpenApiComponents, HttpMethod } from "../openapi";

/**
 * This middleware adds OpenAPI components and dependencies to the C4 model.
 * @param builder - The C4 model builder.
 * @param openapi - The OpenAPI document.
 * @param container - The container name.
 * @returns The middleware.
 */
export function c4Middleware(
  builder: C4ModelBuilder,
  openapi: OpenAPIV3.Document,
  container: string,
) {
  addOpenApiComponents(builder, openapi, container as C4Name);
  return createMiddleware(async (c, next) => {
    const callerName = c.req.header("X-C4-Caller");
    const httpMethod = c.req.method;
    const path = c.req.path;
    if (callerName) {
      addOpenapiCall(
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
