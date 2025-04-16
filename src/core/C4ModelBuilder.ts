import { closest } from "fastest-levenshtein";

import {
  C4Call,
  C4Callchain,
  C4Id,
  C4Model,
  C4Name,
  C4Object,
  C4ObjectType,
} from "./C4Model";
import { camelCase } from "./camelCase";

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
  private readonly callByKey = new Map<string, C4Call>();
  private readonly callchains: C4Callchain[];
  private callchain: C4Callchain | null = null;

  constructor(c4Model: C4Model = { objects: {}, calls: {}, callchains: [] }) {
    this.objectByName = new Map(
      Object.entries(c4Model.objects).map(([, object]) => [
        object.name,
        object,
      ]),
    );
    // Ensure parentId is valid
    for (const object of Object.values(c4Model.objects)) {
      if (object.parentName) {
        this.getObject(object.parentName);
      }
    }

    // Ensure dependencies are valid
    for (const call of Object.values(c4Model.calls)) {
      this.getObject(call.callerName);
      this.getObject(call.calleeName);
    }
    this.callByKey = new Map(
      Object.entries(c4Model.calls).map(([key, call]) => [key, call]),
    );
    this.callchains = [...c4Model.callchains];
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

  startCallchain(name: string) {
    const callchain: C4Callchain = {
      name,
      calls: [],
    };
    this.callchains.push(callchain);
    this.callchain = callchain;
  }

  /**
   * Add a dependency between two objects.
   */
  addCall(callerName: C4Name, calleeName: C4Name, operationName: string) {
    const caller = this.getObject(callerName);
    const callee = this.getObject(calleeName);

    const call: C4Call = {
      callerName: caller.name,
      calleeName: callee.name,
      operationName,
    };
    this.callByKey.set(dependencyKey(call), call);
    if (!this.callchain) {
      throw new Error("Callchain not started");
    }
    this.callchain.calls.push(call);
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

  calls(c4Object: C4Object): readonly C4Call[] {
    return Array.from(this.callByKey.values())
      .filter((dependency) => dependency.callerName === c4Object.name)
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
    const objects: Record<string, C4Object> = {};
    const calls: Record<string, C4Call> = {};

    Array.from(this.objectByName.values())
      .sort((a, b) => objectToId(a).localeCompare(objectToId(b)))
      .forEach((object) => {
        objects[object.id] = object;
      });

    Array.from(this.callByKey.values())
      .sort((a, b) => dependencyKey(a).localeCompare(dependencyKey(b)))
      .forEach((call) => {
        calls[dependencyKey(call)] = call;
      });

    return {
      objects,
      calls,
      callchains: this.callchains.filter(
        (callchain) => callchain.calls.length > 0,
      ),
    };
  }
}

function dependencyKey(dependency: C4Call) {
  return `${dependency.callerName}-${dependency.calleeName}-${dependency.operationName}`;
}

function objectToId(object: C4Object) {
  return objectId(object.type, object.name);
}

function objectId(type: string, name: string): C4Id {
  return camelCase(`${type} ${name}`) as C4Id;
}
