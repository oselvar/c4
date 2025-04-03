import type { OpenAPIV3 } from "openapi-types";
import { match } from "path-to-regexp";

export class C4Model {
  private readonly systemByName = new Map<string, C4Object>();
  private readonly containerByName = new Map<string, C4Object>();
  private readonly componentByName = new Map<string, C4Object>();

  public objectName = (name: string) => name;

  get systems(): readonly C4Object[] {
    return Array.from(this.systemByName.values()).sort((a, b) =>
      a.variableName.localeCompare(b.variableName),
    );
  }

  get containers(): readonly C4Object[] {
    return Array.from(this.containerByName.values()).sort((a, b) =>
      a.variableName.localeCompare(b.variableName),
    );
  }

  get components(): readonly C4Object[] {
    return Array.from(this.componentByName.values()).sort((a, b) =>
      a.variableName.localeCompare(b.variableName),
    );
  }

  get objects(): readonly C4Object[] {
    return [...this.systems, ...this.containers, ...this.components];
  }

  registerOpenApiComponents(
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
        this.component(operation.operationId, { container });
      }
    }
  }

  openapiDependency(
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
        this.depencency(callerName, calleeName, dependencyName);
      }
    }
  }

  system(name: string, { tags }: C4SystemParams) {
    this.systemByName.set(
      name,
      new C4Object(this, "system", name, { parent: null, tags }),
    );
  }

  container(name: string, { system, tags }: C4ContainerParams) {
    this.containerByName.set(
      name,
      new C4Object(this, "container", name, { parent: system, tags }),
    );
  }

  component(name: string, { container }: C4ComponentParams) {
    this.componentByName.set(
      name,
      new C4Object(this, "component", name, { parent: container }),
    );
  }

  depencency(callerName: string, calleeName: string, dependencyName: string) {
    const c4ObjectCaller = this.getObject(callerName);
    const c4ObjectCallee = this.getObject(calleeName);
    c4ObjectCaller.dependsOn(c4ObjectCallee, dependencyName);
  }

  getObject(name: string): C4Object {
    const c4Object =
      this.systemByName.get(name) ??
      this.containerByName.get(name) ??
      this.componentByName.get(name);
    if (!c4Object) {
      const c4Objects = {
        systems: Array.from(this.systemByName.keys()),
        containers: Array.from(this.containerByName.keys()),
        components: Array.from(this.componentByName.keys()),
      };
      throw new Error(
        `C4 object "${name}" not found. Make sure this object is registered in the C4Model. Registered objects:\n${JSON.stringify(
          c4Objects,
          null,
          2,
        )}`,
      );
    }

    return c4Object;
  }

  hasObject(name: string) {
    return (
      this.systemByName.has(name) ||
      this.containerByName.has(name) ||
      this.componentByName.has(name)
    );
  }
}

export type HttpMethod =
  | "get"
  | "put"
  | "post"
  | "delete"
  | "options"
  | "head"
  | "patch"
  | "trace";

class C4Object {
  private readonly dependencyByUniqueName = new Map<string, C4Dependency>();

  constructor(
    private readonly model: C4Model,
    private readonly type: string,
    private readonly _name: string,
    private readonly params: C4ObjectParams,
  ) {}

  get name() {
    return this.model.objectName(this._name);
  }

  get variableName() {
    return `${this.type}${this.name}`;
  }

  get tags() {
    return this.params.tags || [];
  }

  get parent(): C4Object | undefined {
    return this.params?.parent
      ? c4Model.getObject(this.params.parent)
      : undefined;
  }

  dependsOn(callee: C4Object, dependencyName: string) {
    const dependency = new C4Dependency(callee, dependencyName);
    this.dependencyByUniqueName.set(dependency.uniqueName, dependency);
  }

  getDependencies() {
    return [...this.dependencyByUniqueName.values()].toSorted((a, b) =>
      a.uniqueName.localeCompare(b.uniqueName),
    );
  }
}

class C4Dependency {
  constructor(
    public readonly callee: C4Object,
    public readonly name: string,
  ) {}

  get uniqueName() {
    return `${this.callee.variableName}#${this.name}`;
  }
}

type C4ObjectParams = {
  parent: string | null;
  tags?: readonly string[];
};

export type C4SystemParams = {
  tags?: readonly string[];
};

export type C4ContainerParams = {
  system: string;
  tags?: readonly string[];
};

export type C4ComponentParams = {
  container: string;
  tags?: readonly string[];
};

if (!globalThis.__C4_MODEL__) {
  globalThis.__C4_MODEL__ = new C4Model();
}
export const c4Model = globalThis.__C4_MODEL__;
