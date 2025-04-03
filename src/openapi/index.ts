import type { OpenAPIV3 } from "openapi-types";
import { match } from "path-to-regexp";

import { C4ComponentParams, C4Model } from "../c4Model";

export type HttpMethod =
  | "get"
  | "put"
  | "post"
  | "delete"
  | "options"
  | "head"
  | "patch"
  | "trace";

export function registerOpenApiComponents(
  model: C4Model,
  openapi: OpenAPIV3.Document,
  { container }: C4ComponentParams,
) {
  for (const path in openapi.paths) {
    const method = openapi.paths[path];
    for (const httpMethod in method) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      const operation = method[httpMethod] as OpenAPIV3.OperationObject;
      if (!operation.operationId) {
        continue;
      }
      model.component(operation.operationId, { container });
    }
  }
}

export function openapiDependency(
  model: C4Model,
  openapi: OpenAPIV3.Document,
  callerName: string,
  httpMethod: HttpMethod,
  path: string,
) {
  let basePath = "";
  const server = openapi.servers?.[0]?.url;
  if (server) {
    try {
      const url = new URL(path, server);
      basePath = url.pathname;
    } catch {
      basePath = server;
    }
  }

  for (const [pattern, pathObject] of Object.entries(openapi.paths)) {
    if (!pathObject) {
      continue;
    }
    const pathItemObject = pathObject[httpMethod];
    if (!pathItemObject?.operationId) {
      continue;
    }
    const colonPattern = basePath + pattern.replace(/{([^}]+)}/g, ":$1");
    const matcher = match(colonPattern, { decode: decodeURIComponent });
    const matched = matcher(path);
    if (matched) {
      const calleeName = pathItemObject.operationId;
      const dependencyName = `${httpMethod.toUpperCase()} ${pattern}`;
      model.depencency(callerName, calleeName, dependencyName);
    }
  }
}
