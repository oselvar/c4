export class C4Model {
  private readonly objectByName = new Map<string, C4Object>();

  public objectName = (name: string) => name;

  /**
   * Get all objects in the model.
   */
  get objects(): readonly C4Object[] {
    return toC4Objects(this.objectByName);
  }

  get rootObjects(): readonly C4Object[] {
    return this.objects.filter((object) => object.parent === undefined);
  }

  /**
   * Add a group to the model.
   */
  group(name: string, params?: C4GroupParams): string {
    this.objectByName.set(
      name,
      new C4Object(this, "group", name, { ...params }),
    );
    return name;
  }

  /**
   * Add a software system to the model.
   */
  softwareSystem(name: string, params?: C4SoftwareSystemParams): string {
    this.objectByName.set(
      name,
      new C4Object(this, "softwareSystem", name, { ...params }),
    );
    return name;
  }

  /**
   * Add a container to the model.
   */
  container(name: string, params: C4ContainerParams): string {
    this.objectByName.set(
      name,
      new C4Object(this, "container", name, {
        ...params,
        group: params.softwareSystem || params.group,
      }),
    );
    return name;
  }

  component(name: string, params: C4ComponentParams): string {
    this.objectByName.set(
      name,
      new C4Object(this, "component", name, {
        ...params,
        group: params.container || params.group,
      }),
    );
    return name;
  }

  /**
   * Add a dependency between two objects.
   */
  depencency(callerName: string, calleeName: string, dependencyName: string) {
    const c4ObjectCaller = this.getObject(callerName);
    const c4ObjectCallee = this.getObject(calleeName);
    c4ObjectCaller.dependsOn(c4ObjectCallee, dependencyName);
  }

  /**
   * Get an object by name.
   */
  getObject(name: string): C4Object {
    const c4Object = this.objectByName.get(name);
    if (!c4Object) {
      const c4Objects = Array.from(this.objectByName.keys());
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
    return this.objectByName.has(name);
  }
}

export class C4Object {
  private readonly dependencyByUniqueName = new Map<string, C4Dependency>();

  constructor(
    private readonly model: C4Model,
    public readonly type: C4ObjectType,
    private readonly _name: string,
    private readonly params: C4ObjectParams,
  ) {}

  get name() {
    return this.model.objectName(this._name);
  }

  /**
   * Get the variable name of the object.
   */
  get variableName() {
    return `${this.type}${camelCase(this.name)}`;
  }

  get tags() {
    return this.params.tags || [];
  }

  /**
   * Get the parent object of the object.
   */
  get parent(): C4Object | undefined {
    return this.params?.group
      ? this.model.getObject(this.params.group)
      : undefined;
  }

  get children(): readonly C4Object[] {
    return this.model.objects.filter((object) => object.parent === this);
  }

  /**
   * Get the dependencies of the object.
   */
  get dependencies(): readonly C4Dependency[] {
    return [...this.dependencyByUniqueName.values()].toSorted((a, b) =>
      a.uniqueName.localeCompare(b.uniqueName),
    );
  }

  dependsOn(callee: C4Object, dependencyName: string) {
    const dependency = new C4Dependency(callee, dependencyName);
    this.dependencyByUniqueName.set(dependency.uniqueName, dependency);
  }
}

/**
 * A dependency between two objects.
 */
class C4Dependency {
  constructor(
    public readonly callee: C4Object,
    public readonly name: string,
  ) {}

  get uniqueName() {
    return `${this.callee.variableName}#${this.name}`;
  }
}

export type C4ObjectType =
  | "group"
  | "softwareSystem"
  | "container"
  | "component";

type C4ObjectParams = {
  group?: string;
  tags?: readonly string[];
};

export type C4SoftwareSystemParams = C4ObjectParams;

export type C4GroupParams = C4ObjectParams;

export type C4ContainerParams = C4ObjectParams & {
  softwareSystem: string;
};

export type C4ComponentParams = C4ObjectParams & {
  container: string;
};

function toC4Objects(map: Map<string, C4Object>): readonly C4Object[] {
  return Array.from(map.values()).sort((a, b) =>
    a.variableName.localeCompare(b.variableName),
  );
}
function camelCase(words: string) {
  return words.replace(/(?:^| )(\w)/g, (_, char) => char.toUpperCase());
}
