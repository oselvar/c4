import { closest } from "fastest-levenshtein";

import {
  C4Dependency,
  C4Id,
  C4Model,
  C4Name,
  C4Object,
  C4ObjectType,
} from "./C4Model";

export type C4ObjectParams = {
  tags?: readonly string[];
};

export type C4SoftwareSystemParams = C4ObjectParams & {
  parentName?: string;
};
export type C4GroupParams = C4ObjectParams & {
  parentName?: string;
};
export type C4PersonParams = C4ObjectParams & {
  parentName?: string;
};
export type C4ContainerParams = C4ObjectParams & {
  softwareSystem: string;
};
export type C4ComponentParams = C4ObjectParams & {
  container: string;
};

export class C4ModelBuilder implements C4ModelBuilder {
  private readonly objectByName = new Map<C4Name, C4Object>();
  private readonly dependencyByKey = new Map<string, C4Dependency>();

  constructor(c4Model: C4Model = { objects: [], dependencies: [] }) {
    this.objectByName = new Map(
      c4Model.objects.map((object) => [object.name, object]),
    );
    // Ensure parentId is valid
    for (const object of c4Model.objects) {
      if (object.parentName) {
        this.getObject(object.parentName);
      }
    }

    // Ensure dependencies are valid
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

  /**
   * Add a person to the model.
   */
  addPerson(name: C4Name, params?: C4PersonParams): string {
    const type = "person";
    this.objectByName.set(name, {
      type,
      name,
      id: objectId(type, name),
      tags: params?.tags || [],
      parentName: params?.parentName as C4Name | null,
    });
    return name;
  }

  /**
   * Add a group to the model.
   */
  addGroup(name: C4Name, params?: C4GroupParams): string {
    const type = "group";
    this.objectByName.set(name, {
      type,
      name,
      id: objectId(type, name),
      tags: params?.tags || [],
      parentName: (params?.parentName as C4Name) || null,
    });
    return name;
  }

  /**
   * Add a software system to the model.
   */
  addSoftwareSystem(name: C4Name, params?: C4SoftwareSystemParams): string {
    const type = "softwareSystem";
    this.objectByName.set(name, {
      type,
      name,
      id: objectId(type, name),
      tags: params?.tags || [],
      parentName: (params?.parentName as C4Name) || null,
    });
    return name;
  }

  /**
   * Add a container to the model.
   */
  addContainer(name: C4Name, params: C4ContainerParams): string {
    const type = "container";
    this.objectByName.set(name, {
      type,
      name,
      id: objectId(type, name),
      tags: params?.tags || [],
      parentName: params.softwareSystem as C4Name,
    });
    return name;
  }

  addComponent(name: C4Name, params: C4ComponentParams): string {
    const type = "component";
    this.objectByName.set(name, {
      type,
      name,
      id: objectId(type, name),
      tags: params?.tags || [],
      parentName: params.container as C4Name,
    });
    return name;
  }

  /**
   * Add a dependency between two objects.
   */
  addDependency(
    callerName: C4Name,
    calleeName: C4Name,
    dependencyName: string,
  ) {
    const caller = this.getObject(callerName);
    const callee = this.getObject(calleeName);

    const dependency: C4Dependency = {
      callerName: caller.name,
      calleeName: callee.name,
      label: dependencyName,
    };
    this.dependencyByKey.set(dependencyKey(dependency), dependency);
  }

  hasObject(name: C4Name): boolean {
    return this.objectByName.has(name);
  }

  /**
   * Get an object by id.
   */
  getObject(name: C4Name, type?: C4ObjectType): C4Object {
    const c4Object = this.objectByName.get(name);
    if (!c4Object) {
      const c4Objects = Array.from(this.objectByName.keys());
      const maybe = closest(name, c4Objects);
      const didYouMean = maybe ? `\nDid you mean "${maybe}"?` : "";
      throw new Error(
        `C4 object "${name}" not found.${didYouMean}\nMake sure this object is registered in the C4Model. Registered objects:\n${JSON.stringify(
          c4Objects,
          null,
          2,
        )}`,
      );
    }
    if (type && c4Object.type !== type) {
      throw new Error(
        `C4 object "${name}" is a ${c4Object.type}, not a ${type}`,
      );
    }
    return c4Object;
  }

  dependencies(c4Object: C4Object): readonly C4Dependency[] {
    return Array.from(this.dependencyByKey.values())
      .filter((dependency) => dependency.callerName === c4Object.name)
      .toSorted((a, b) => dependencyKey(a).localeCompare(dependencyKey(b)));
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

  /**
   * Returns all nested dependencies that are not inside the object
   */
  nestedOutsideDependencies(c4Object: C4Object): readonly C4Dependency[] {
    const nestedChildNames = new Set(
      this.nestedChildren(c4Object).map((c) => c.name),
    );
    const nestedDependencies = this.nestedDependencies(c4Object);
    return nestedDependencies
      .filter((dependency) => !nestedChildNames.has(dependency.calleeName))
      .toSorted((a, b) => dependencyKey(a).localeCompare(dependencyKey(b)));
  }

  children(c4Object: C4Object): readonly C4Object[] {
    return Array.from(this.objectByName.values())
      .filter((object) => object.parentName === c4Object.name)
      .toSorted((a, b) => a.id.localeCompare(b.id));
  }

  nestedChildren(c4Object: C4Object): readonly C4Object[] {
    const directChildren = this.children(c4Object);
    return [
      ...directChildren,
      ...directChildren.flatMap((child) => this.nestedChildren(child)),
    ];
  }

  isChildOf(c4Object: C4Object, parentId: string): boolean {
    if (c4Object.parentName === parentId) return true;
    if (c4Object.parentName === null) return false;
    return this.isChildOf(this.getObject(c4Object.parentName), parentId);
  }

  rootObjects(): readonly C4Object[] {
    return Array.from(this.objectByName.values())
      .filter((object) => object.parentName === null)
      .toSorted((a, b) => a.id.localeCompare(b.id));
  }

  /**
   * Build the final C4 model
   */
  build(): C4Model {
    return {
      objects: Array.from(this.objectByName.values()).sort((a, b) =>
        objectToId(a).localeCompare(objectToId(b)),
      ),
      dependencies: Array.from(this.dependencyByKey.values()).sort((a, b) =>
        dependencyKey(a).localeCompare(dependencyKey(b)),
      ),
    };
  }
}

function dependencyKey(dependency: C4Dependency) {
  return `${dependency.callerName}-${dependency.calleeName}-${dependency.label}`;
}

function objectToId(object: C4Object) {
  return objectId(object.type, object.name);
}

function objectId(type: string, name: string): C4Id {
  return camelCase(`${type} ${name}`) as C4Id;
  // return `${type}${camelCase(name)}` as C4Id;
}

// function makeId(type: string, words: string): C4Id {
//   return camelCase(`${type} ${words}`) as C4Id;
// }

function camelCase(words: string) {
  const upperCamelCase = words.replace(/(?:^|[\s-_])(\w)/g, (_, char) =>
    char.toUpperCase(),
  );
  // Lowercase the first letter
  return upperCamelCase.replace(/^[A-Z]/, (char) => char.toLowerCase());
}
