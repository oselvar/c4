import { closest } from "fastest-levenshtein";

import { C4Dependency, C4Model, C4Object } from "./C4Model";

export type C4ObjectParams = {
  parentId?: string;
  tags?: readonly string[];
};

export type C4SoftwareSystemParams = C4ObjectParams;
export type C4GroupParams = C4ObjectParams;
export type C4PersonParams = C4ObjectParams;

export type C4ContainerParams = C4ObjectParams & {
  softwareSystem?: string;
};

export type C4ComponentParams = C4ObjectParams & {
  container?: string;
};

// Builder classes for constructing the C4 model
export class C4ModelBuilder {
  private readonly objectById = new Map<string, C4Object>();
  private readonly dependencyByKey = new Map<string, C4Dependency>();

  constructor(c4Model: C4Model = { objects: [], dependencies: [] }) {
    this.objectById = new Map(
      c4Model.objects.map((object) => [object.id, object]),
    );
    for (const dependency of c4Model.dependencies) {
      this.getObject(dependency.callerId);
      this.getObject(dependency.calleeId);
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
    this.objectById.set(name, {
      type,
      name: this.objectName(name),
      id: makeVariableName(type, name),
      tags: params?.tags || [],
      parentId: params?.parentId || null,
    });
    return name;
  }

  /**
   * Add a group to the model.
   */
  addGroup(name: string, params?: C4GroupParams): string {
    const type = "group";
    this.objectById.set(name, {
      type,
      name: this.objectName(name),
      id: makeVariableName(type, name),
      tags: params?.tags || [],
      parentId: params?.parentId || null,
    });
    return name;
  }

  /**
   * Add a software system to the model.
   */
  addSoftwareSystem(name: string, params?: C4SoftwareSystemParams): string {
    const type = "softwareSystem";
    this.objectById.set(name, {
      type,
      name: this.objectName(name),
      id: makeVariableName(type, name),
      tags: params?.tags || [],
      parentId: params?.parentId || null,
    });
    return name;
  }

  /**
   * Add a container to the model.
   */
  addContainer(name: string, params: C4ContainerParams): string {
    const type = "container";
    let parentId = params.parentId;
    if (!parentId && params.softwareSystem) {
      parentId = objectId("softwareSystem", params.softwareSystem);
    }
    if (!parentId) {
      throw new Error(
        `C4Container: parentId or softwareSystem must be provided`,
      );
    }
    this.objectById.set(name, {
      type,
      name: this.objectName(name),
      id: makeVariableName(type, name),
      tags: params?.tags || [],
      parentId,
    });
    return name;
  }

  addComponent(name: string, params: C4ComponentParams): string {
    const type = "component";
    let parentId = params.parentId;
    if (!parentId && params.container) {
      parentId = objectId("container", params.container);
    }
    if (!parentId) {
      throw new Error(`C4Component: parentId or container must be provided`);
    }
    this.objectById.set(name, {
      type,
      name: this.objectName(name),
      id: makeVariableName(type, name),
      tags: params?.tags || [],
      parentId,
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
      callerId: caller.id,
      calleeId: callee.id,
      name: dependencyName,
    };
    this.dependencyByKey.set(dependencyKey(dependency), dependency);
  }

  hasObject(name: string): boolean {
    return this.objectById.has(name);
  }

  /**
   * Get an object by name.
   */
  getObject(id: string): C4Object {
    const c4Object = this.objectById.get(id);
    if (!c4Object) {
      const c4Objects = Array.from(this.objectById.keys());
      const maybe = closest(id, c4Objects);
      const didYouMean = maybe ? `\nDid you mean "${maybe}"?` : "";
      throw new Error(
        `C4 object "${id}" not found.${didYouMean}\nMake sure this object is registered in the C4Model. Registered objects:\n${JSON.stringify(
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
      (dependency) => dependency.callerId === c4Object.id,
    );
  }

  /**
   * Returns all dependencies by the object and its children
   */
  nestedDependencies(c4Object: C4Object): readonly C4Dependency[] {
    const dependencies = this.dependencies(c4Object);
    const childDependencies = this.nestedChildren(c4Object).flatMap((child) =>
      this.dependencies(child),
    );
    return [...dependencies, ...childDependencies];
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
      (dependency) => !nestedChildNames.has(dependency.calleeId),
    );
    return result;
  }

  children(c4Object: C4Object): readonly C4Object[] {
    return Array.from(this.objectById.values()).filter(
      (object) => object.parentId === c4Object.name,
    );
  }

  isChildOf(c4Object: C4Object, parentId: string): boolean {
    if (c4Object.parentId === parentId) return true;
    if (c4Object.parentId === null) return false;
    return this.isChildOf(this.getObject(c4Object.parentId), parentId);
  }

  rootObjects(): readonly C4Object[] {
    return Array.from(this.objectById.values()).filter(
      (object) => object.parentId === null,
    );
  }

  /**
   * Build the final C4 model
   */
  build(): C4Model {
    return {
      objects: Array.from(this.objectById.values()).sort((a, b) =>
        objectToId(a).localeCompare(objectToId(b)),
      ),
      dependencies: Array.from(this.dependencyByKey.values()).sort((a, b) =>
        dependencyKey(a).localeCompare(dependencyKey(b)),
      ),
    };
  }
}

function dependencyKey(dependency: C4Dependency) {
  return `${dependency.callerId}-${dependency.calleeId}-${dependency.name}`;
}

function objectToId(object: C4Object) {
  return objectId(object.type, object.name);
}

function objectId(type: string, name: string) {
  return `${type}${camelCase(name)}`;
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
