import { C4Dependency, C4Model, C4Object } from "./C4Model";

export type C4ObjectParams = {
  group?: string;
  tags?: readonly string[];
};

export type C4SoftwareSystemParams = C4ObjectParams;
export type C4GroupParams = C4ObjectParams;
export type C4PersonParams = C4ObjectParams;

export type C4ContainerParams = C4ObjectParams & {
  softwareSystem: string;
};

export type C4ComponentParams = C4ObjectParams & {
  container: string;
};

// Builder classes for constructing the C4 model
export class C4ModelBuilder {
  private readonly objectByName = new Map<string, C4Object>();
  private readonly dependencyByKey = new Map<string, C4Dependency>();

  constructor(c4Model: C4Model = { objects: [], dependencies: [] }) {
    this.objectByName = new Map(
      c4Model.objects.map((object) => [object.name, object]),
    );
    for (const dependency of c4Model.dependencies) {
      this.getObject(dependency.callerName);
      this.getObject(dependency.calleeName);
    }
    this.dependencyByKey = new Map(
      c4Model.dependencies.map((dependency) => [
        dependencyKey(dependency),
        dependency,
      ]),
    );
  }

  public objectName = (name: string) => name;

  /**
   * Add a person to the model.
   */
  addPerson(name: string, params?: C4PersonParams): string {
    const type = "person";
    this.objectByName.set(name, {
      type,
      name: this.objectName(name),
      variableName: makeVariableName(type, name),
      tags: params?.tags || [],
      parentName: params?.group || null,
    });
    return name;
  }

  /**
   * Add a group to the model.
   */
  addGroup(name: string, params?: C4GroupParams): string {
    const type = "group";
    this.objectByName.set(name, {
      type,
      name: this.objectName(name),
      variableName: makeVariableName(type, name),
      tags: params?.tags || [],
      parentName: params?.group || null,
    });
    return name;
  }

  /**
   * Add a software system to the model.
   */
  addSoftwareSystem(name: string, params?: C4SoftwareSystemParams): string {
    const type = "softwareSystem";
    this.objectByName.set(name, {
      type,
      name: this.objectName(name),
      variableName: makeVariableName(type, name),
      tags: params?.tags || [],
      parentName: params?.group || null,
    });
    return name;
  }

  /**
   * Add a container to the model.
   */
  addContainer(name: string, params: C4ContainerParams): string {
    const type = "container";
    this.objectByName.set(name, {
      type,
      name: this.objectName(name),
      variableName: makeVariableName(type, name),
      tags: params?.tags || [],
      parentName: params.softwareSystem || params.group || null,
    });
    return name;
  }

  addComponent(name: string, params: C4ComponentParams): string {
    const type = "component";
    this.objectByName.set(name, {
      type,
      name: this.objectName(name),
      variableName: makeVariableName(type, name),
      tags: params?.tags || [],
      parentName: params.container || params.group || null,
    });
    return name;
  }

  /**
   * Add a dependency between two objects.
   */
  addDependency(
    callerName: string,
    calleeName: string,
    dependencyName: string,
  ) {
    const caller = this.getObject(callerName);
    const callee = this.getObject(calleeName);

    const dependency: C4Dependency = {
      callerName: caller.name,
      calleeName: callee.name,
      name: dependencyName,
    };
    this.dependencyByKey.set(dependencyKey(dependency), dependency);
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

  dependencies(c4Object: C4Object): readonly C4Dependency[] {
    return Array.from(this.dependencyByKey.values()).filter(
      (dependency) => dependency.callerName === c4Object.name,
    );
  }

  /**
   * Returns all dependencies by the object and its children
   */
  nestedDependencies(c4Object: C4Object): readonly C4Dependency[] {
    return this.nestedChildren(c4Object).flatMap((child) =>
      this.dependencies(child),
    );
  }

  nestedChildren(c4Object: C4Object): readonly C4Object[] {
    const directChildren = this.children(c4Object);
    return [
      ...directChildren,
      ...directChildren.flatMap((child) => this.nestedChildren(child)),
    ];
  }

  /**
   * Returns all nested dependencies that are not inside the object
   */
  nestedOutsideDependencies(c4Object: C4Object): readonly C4Dependency[] {
    const nestedChildNames = new Set(
      this.nestedChildren(c4Object).map((c) => c.name),
    );
    const nestedDependencies = this.nestedDependencies(c4Object);
    const result = nestedDependencies.filter(
      (dependency) => !nestedChildNames.has(dependency.calleeName),
    );
    return result;
  }

  children(c4Object: C4Object): readonly C4Object[] {
    return Array.from(this.objectByName.values()).filter(
      (object) => object.parentName === c4Object.name,
    );
  }

  rootObjects(): readonly C4Object[] {
    return Array.from(this.objectByName.values()).filter(
      (object) => object.parentName === null,
    );
  }

  /**
   * Build the final C4 model
   */
  build(): C4Model {
    return {
      objects: Array.from(this.objectByName.values()).sort((a, b) =>
        objectKey(a).localeCompare(objectKey(b)),
      ),
      dependencies: Array.from(this.dependencyByKey.values()).sort((a, b) =>
        dependencyKey(a).localeCompare(dependencyKey(b)),
      ),
    };
  }
}

function dependencyKey(dependency: C4Dependency) {
  return `${dependency.callerName}-${dependency.calleeName}-${dependency.name}`;
}

function objectKey(object: C4Object) {
  return `${object.type}${camelCase(object.name)}`;
}

function makeVariableName(type: string, words: string) {
  return camelCase(`${type} ${words}`);
}

function camelCase(words: string) {
  const upperCamelCase = words.replace(/(?:^|[\s-_])(\w)/g, (_, char) =>
    char.toUpperCase(),
  );
  // Lowercase the first letter
  return upperCamelCase.replace(/^[A-Z]/, (char) => char.toLowerCase());
}
