/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-function-type */

import ErrorStackParser from "error-stack-parser";

import {
  type C4ComponentParams,
  type C4ContainerParams,
  type C4SoftwareSystemParams,
} from "./C4ModelBuilder";
import { globalC4ModelBuilder } from "./globalC4ModelBuilder";

type Constructor<T = object> = new (...args: any[]) => T;

type System = Constructor;
type Container = Constructor;
type Component = Constructor;

export function C4SoftwareSystem<T extends System>(
  params?: C4SoftwareSystemParams,
) {
  return (system: T) => {
    globalC4ModelBuilder.addSoftwareSystem(system.name, { tags: params?.tags });
    return system;
  };
}

export function C4Container<T extends Container>({
  softwareSystem: system,
  tags,
}: C4ContainerParams) {
  return (container: T) => {
    globalC4ModelBuilder.addContainer(container.name, {
      softwareSystem: system,
      tags,
    });
    return container;
  };
}

export function C4Component<T extends Component>({
  container,
}: C4ComponentParams) {
  return (component: T) => {
    globalC4ModelBuilder.addComponent(component.name, { container });
    return component;
  };
}

export function C4Operation(): MethodDecorator {
  return function (...args: any[]): any {
    if (
      args.length === 2 &&
      args[1] &&
      typeof args[1] === "object" &&
      args[1].kind === "method"
    ) {
      // TC39 decorator
      const method = args[0];
      return c4OperationWrapper(method);
    } else {
      // Legacy experimental decorator
      const descriptor = args[2];
      if (descriptor && typeof descriptor.value === "function") {
        const originalMethod = descriptor.value;
        descriptor.value = c4OperationWrapper(originalMethod);
      }
      return descriptor;
    }
  };
}

function c4OperationWrapper(method: Function) {
  function wrapper(this: Function, ...args: unknown[]) {
    const calleeName = this.constructor.name;

    const caller = ErrorStackParser.parse(new Error())
      .filter((frame) => !frame.fileName?.match(/\/node_modules\//))
      .filter((frame) => !frame.fileName?.match(/^node:internal/))
      .filter((frame) => frame.functionName?.split(".").length === 2)
      .map((frame) => frame.functionName?.split(".") || [])
      .map(([className, method]) => ({ className, method }))
      .filter(({ className }) => className !== calleeName)[0];

    const callerName = caller?.className;

    if (callerName) {
      const dependencyName = method.name;
      globalC4ModelBuilder.addDependency(
        callerName,
        calleeName,
        dependencyName,
      );
    }

    return method.apply(this, args);
  }
  return wrapper;
}
